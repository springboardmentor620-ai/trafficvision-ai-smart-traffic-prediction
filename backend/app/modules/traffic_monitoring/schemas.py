from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from app.modules.traffic_monitoring.models import CongestionLevel


# ---------- Road schemas ----------

class RoadCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: int = Field(1000, gt=0)


class RoadResponse(BaseModel):
    id: int
    name: str
    zone: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    capacity: int

    class Config:
        from_attributes = True


# ---------- Traffic reading schemas ----------

class TrafficReadingCreate(BaseModel):
    road_id: int
    vehicle_count: int = Field(..., ge=0)
    avg_speed_kmph: Optional[float] = Field(None, ge=0)


class TrafficReadingResponse(BaseModel):
    id: int
    road_id: int
    vehicle_count: int
    avg_speed_kmph: Optional[float]
    congestion_level: CongestionLevel
    recorded_at: datetime

    class Config:
        from_attributes = True


# ---------- Live monitoring (dashboard) schemas ----------

class LiveRoadStatus(BaseModel):
    """
    One row in the live monitoring view: a road + its most recent reading.
    This is what powers the dashboard's live map / road list.
    """
    road_id: int
    road_name: str
    zone: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    vehicle_count: Optional[int] = None
    avg_speed_kmph: Optional[float] = None
    congestion_level: Optional[CongestionLevel] = None
    recorded_at: Optional[datetime] = None


class LiveMonitoringSummary(BaseModel):
    """
    Aggregated stats for the dashboard's top stat cards.
    """
    total_roads: int
    total_vehicles: int
    roads_by_level: dict  # e.g. {"low": 3, "moderate": 5, "high": 1, "severe": 0}
    roads: List[LiveRoadStatus]
