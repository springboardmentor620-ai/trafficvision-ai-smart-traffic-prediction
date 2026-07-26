from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import logging

from app.database.session import get_db
from app.middleware.dependencies import require_roles
from app.repositories.video_repository import VideoRepository
from app.schemas.video import VideoResponseSchema
from app.services.video_processor import VideoProcessor
from app.config.settings import settings
from app.models.models import Road

logger = logging.getLogger("trafficvision.api")

router = APIRouter(
    prefix="/videos",
    tags=["Traffic Video Processing Pipeline"],
    dependencies=[Depends(require_roles(["Admin", "Operator"]))]
)

@router.post("/upload", response_model=VideoResponseSchema, status_code=status.HTTP_202_ACCEPTED)
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="The video file to upload (MP4, AVI, MOV)"),
    road_id: Optional[int] = Form(None, description="Optional ID of associated road corridor"),
    db: Session = Depends(get_db)
):
    """
    Upload a traffic video file. Saves file, registers metadata record as 'Processing',
    dispatches non-blocking background AI frame processing, and returns immediately (< 1s).
    """
    # 1. Validate file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename.")

    ext = file.filename.split(".")[-1].lower()
    if ext not in ["mp4", "avi", "mov"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only MP4, AVI, and MOV video formats are supported."
        )

    # 2. Validate road_id if provided
    road_name_val = None
    if road_id is not None:
        road = db.query(Road).filter(Road.id == road_id).first()
        if not road:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Road corridor with ID {road_id} not found."
            )
        road_name_val = road.road_name

    # 3. Create upload directory if missing
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
    filepath = os.path.join(settings.UPLOAD_FOLDER, file.filename)

    # 4. Stream upload file in chunks and validate size
    size_bytes = 0
    try:
        with open(filepath, "wb") as f:
            while True:
                chunk = await file.read(1024 * 1024)  # Read 1MB chunk
                if not chunk:
                    break
                size_bytes += len(chunk)
                if size_bytes > settings.MAX_UPLOAD_SIZE:
                    f.close()
                    if os.path.exists(filepath):
                        os.remove(filepath)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum upload size of {settings.MAX_UPLOAD_SIZE / (1024 * 1024):.0f}MB."
                    )
                f.write(chunk)
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise exc
        if os.path.exists(filepath):
            os.remove(filepath)
        logger.error("Error writing uploaded file to disk: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save video file to server."
        )

    # 5. Create initial UploadedVideo record with status "Processing"
    video_data = {
        "road_id": road_id,
        "road_name": road_name_val,
        "filename": file.filename,
        "filepath": filepath,
        "file_size_bytes": size_bytes,
        "mime_type": file.content_type,
        "total_frames": 0,
        "fps": 0.0,
        "duration_seconds": 0.0,
        "resolution": "Processing",
        "car_count": 0,
        "bus_count": 0,
        "truck_count": 0,
        "motorcycle_count": 0,
        "status": "Processing"
    }

    try:
        db_video = VideoRepository.create_video(db, video_data)
        logger.info("Video record registered with ID %d (Status: Processing).", db_video.id)
    except Exception as db_err:
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception:
                pass
        logger.error("Database save failed for video metadata: %s", str(db_err))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist video metadata in database."
        )

    # 6. Schedule non-blocking asynchronous AI video processing in background
    background_tasks.add_task(
        VideoProcessor.process_video_background,
        db_video.id,
        filepath,
        road_id
    )

    return db_video

@router.get("", response_model=List[VideoResponseSchema])
def get_videos(db: Session = Depends(get_db)):
    """Retrieve metadata of all uploaded videos."""
    return VideoRepository.get_all_videos(db)

@router.delete("/{video_id}")
def delete_video(video_id: int, db: Session = Depends(get_db)):
    """Delete video metadata from database and delete local physical video file."""
    db_video = VideoRepository.get_video_by_id(db, video_id)
    if not db_video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video metadata with ID {video_id} not found."
        )

    # Remove physical file
    if db_video.filepath and os.path.exists(db_video.filepath):
        try:
            os.remove(db_video.filepath)
            logger.info("Deleted physical video file: %s", db_video.filepath)
        except Exception as file_err:
            logger.error("Failed to delete physical video file: %s. Error: %s", db_video.filepath, str(file_err))

    # Remove DB record
    success = VideoRepository.delete_video(db, video_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove video metadata from database."
        )

    return {"message": f"Video {video_id} deleted successfully."}
