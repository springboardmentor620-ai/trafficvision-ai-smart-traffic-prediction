from typing import Optional
from pydantic import BaseModel


class ReportSummary(BaseModel):
    roads: int
    vehicles: int
    average_speed: float
    heavy: int
    moderate: int
    normal: int


class ReportRoadItem(BaseModel):
    id: int
    road_id: Optional[int] = None
    road: str
    name: str
    city: str
    state: str
    status: str
    vehicles: int
    average_speed: int
    speed_limit: int
    latitude: float
    longitude: float


class TrafficReportResponse(BaseModel):
    generated_at: str
    summary: ReportSummary
    roads: list[ReportRoadItem]
