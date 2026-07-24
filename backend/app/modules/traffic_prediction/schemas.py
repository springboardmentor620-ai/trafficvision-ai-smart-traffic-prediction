from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

from app.modules.traffic_monitoring.models import CongestionLevel


class ForecastResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    road_id: int
    road_name: str
    hours_ahead: float
    predicted_for: datetime
    predicted_vehicle_count: int
    predicted_congestion_level: CongestionLevel
    model_r2_score: Optional[float] = None
    data_points_used: int
    generated_at: datetime


class InsufficientDataResponse(BaseModel):
    road_id: int
    road_name: str
    message: str
    data_points_available: int
    data_points_required: int


class PredictionReportItem(BaseModel):
    road_id: int
    road_name: str
    zone: Optional[str]
    current_vehicle_count: Optional[int]
    current_congestion_level: Optional[CongestionLevel]
    predicted_vehicle_count: Optional[int]
    predicted_congestion_level: Optional[CongestionLevel]
    predicted_for: Optional[datetime]
    trend: Optional[str] = None


class ForecastRequest(BaseModel):
    hours_ahead: float = Field(1.0, gt=0, le=48, description="How many hours into the future to forecast")