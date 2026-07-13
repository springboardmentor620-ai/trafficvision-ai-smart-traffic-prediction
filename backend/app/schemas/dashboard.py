from pydantic import BaseModel

class DashboardSummary(BaseModel):
    total_records: int
    high_congestion: int
    medium_congestion: int
    low_congestion: int
    average_speed: float
    average_vehicle_count: float


class TopRoad(BaseModel):
    road_name: str
    avg_vehicle_count: float


class TopLocation(BaseModel):
    location: str
    records: int


class CongestionChart(BaseModel):
    congestion_level: str
    count: int


class SpeedAnalysis(BaseModel):
    road_name: str
    average_speed: float