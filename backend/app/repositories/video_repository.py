from sqlalchemy.orm import Session
from app.models.models import UploadedVideo
from typing import List, Optional

class VideoRepository:
    @staticmethod
    def create_video(db: Session, video_data: dict) -> UploadedVideo:
        db_video = UploadedVideo(
            road_id=video_data.get("road_id"),
            road_name=video_data.get("road_name"),
            filename=video_data.get("filename"),
            filepath=video_data.get("filepath"),
            file_size_bytes=video_data.get("file_size_bytes"),
            mime_type=video_data.get("mime_type"),
            total_frames=video_data.get("total_frames"),
            fps=video_data.get("fps"),
            duration_seconds=video_data.get("duration_seconds"),
            resolution=video_data.get("resolution"),
            car_count=video_data.get("car_count", 0),
            bus_count=video_data.get("bus_count", 0),
            truck_count=video_data.get("truck_count", 0),
            motorcycle_count=video_data.get("motorcycle_count", 0),
            status=video_data.get("status", "Uploaded")
        )
        db.add(db_video)
        db.commit()
        db.refresh(db_video)
        return db_video

    @staticmethod
    def get_video_by_id(db: Session, video_id: int) -> Optional[UploadedVideo]:
        return db.query(UploadedVideo).filter(UploadedVideo.id == video_id).first()

    @staticmethod
    def get_all_videos(db: Session) -> List[UploadedVideo]:
        return db.query(UploadedVideo).order_by(UploadedVideo.uploaded_at.desc()).all()

    @staticmethod
    def delete_video(db: Session, video_id: int) -> bool:
        db_video = db.query(UploadedVideo).filter(UploadedVideo.id == video_id).first()
        if not db_video:
            return False
        db.delete(db_video)
        db.commit()
        return True
