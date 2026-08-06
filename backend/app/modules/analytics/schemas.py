from pydantic import BaseModel
from typing import Optional
from app.modules.traffic_monitoring.models import CongestionLevel


class ZoneHeatmapItem(BaseModel):
    zone: str
    road_count: int
    total_vehicles: int
    avg_utilization_percent: float
    dominant_congestion_level: Optional[CongestionLevel]


class AnalyticsSummary(BaseModel):
    total_roads: int
    total_zones: int
    overall_avg_utilization_percent: float
    busiest_zone: Optional[str]
    zones: list[ZoneHeatmapItem]


# ---------- Dashboard summary cards ----------

class MetricCard(BaseModel):
    label: str
    value: float
    unit: Optional[str] = None
    display_value: Optional[str] = None
    yesterday_value: Optional[float] = None
    change_percent: Optional[float] = None
    trend: Optional[str] = None


class DashboardSummary(BaseModel):
    total_roads_monitored: MetricCard
    total_vehicles_today: MetricCard
    avg_utilization: MetricCard
    busiest_zone: MetricCard
    least_congested_zone: MetricCard
    total_alerts_today: MetricCard
    avg_vehicle_speed: MetricCard
    prediction_accuracy: MetricCard


# ---------- Historical trend ----------

class HistoryPoint(BaseModel):
    label: str
    total_vehicles: int
    avg_utilization_percent: float
    roads_reporting: int


# ---------- Zone analytics ----------

class ZoneAnalyticsItem(BaseModel):
    zone: str
    avg_utilization_percent: float
    avg_speed_kmph: Optional[float]
    total_roads: int
    total_vehicles: int
    highest_congestion_road: Optional[str]
    lowest_congestion_road: Optional[str]


# ---------- Road performance table ----------

class RoadPerformanceItem(BaseModel):
    road_id: int
    road_name: str
    zone: Optional[str]
    current_vehicles: Optional[int]
    capacity: int
    utilization_percent: float
    avg_speed_kmph: Optional[float]
    congestion_level: Optional[CongestionLevel]
    trend: Optional[str] = None
    status: str


# ---------- AI insights ----------

class InsightItem(BaseModel):
    message: str
    category: str