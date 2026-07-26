from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class VideoResponseSchema(BaseModel):
    id: int
    road_id: Optional[int] = Field(None, description="Optional ID of associated road")
    filename: str = Field(..., description="Uploaded video filename")
    filepath: str = Field(..., description="Local filepath of the saved video")
    file_size_bytes: int = Field(..., description="File size in bytes")
    mime_type: Optional[str] = Field(None, description="Mime type of the video")
    total_frames: Optional[int] = Field(None, description="Total extracted frames")
    fps: Optional[float] = Field(None, description="Frames per second")
    duration_seconds: Optional[float] = Field(None, description="Video duration in seconds")
    resolution: Optional[str] = Field(None, description="Resolution string, e.g. 1920x1080")
    status: str = Field(..., description="Upload/processing status: Uploaded, Processing, Processed, Failed")
    uploaded_at: datetime = Field(..., description="Timestamp of video upload")

    class Config:
        from_attributes = True
