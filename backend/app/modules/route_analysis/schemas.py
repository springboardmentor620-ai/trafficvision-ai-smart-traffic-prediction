from pydantic import BaseModel
from typing import Optional
from app.modules.traffic_monitoring.models import CongestionLevel


class RouteLeg(BaseModel):
    from_road_id: int
    from_road_name: str
    to_road_id: int
    to_road_name: str
    distance_km: float
    congestion_level: Optional[CongestionLevel]
    estimated_speed_kmph: float
    estimated_time_minutes: float


class RouteOption(BaseModel):
    label: str
    legs: list[RouteLeg]
    total_distance_km: float
    total_time_minutes: float


class RouteRecommendationResponse(BaseModel):
    origin_road_id: int
    origin_road_name: str
    destination_road_id: int
    destination_road_name: str
    direct: RouteOption
    alternates: list[RouteOption]
    recommended_label: str
    reason: str