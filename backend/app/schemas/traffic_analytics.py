from typing import List, Optional
from datetime import datetime

from pydantic import BaseModel


class KPISummary(BaseModel):
    total_predictions: int
    active_alerts: int
    high_congestion_count: int
    avg_congestion: float          # 0-100 percentage
    avg_delay: float               # minutes
    avg_confidence: float          # 0-100 percentage
    peak_hour: Optional[int] = None


class DistributionItem(BaseModel):
    label: str
    count: int


class TrendPoint(BaseModel):
    period: str
    predictions: int
    avg_congestion: float


class RouteTraffic(BaseModel):
    name: str
    predictions: int
    avg_congestion: float


class RouteStatistic(BaseModel):
    source: str
    destination: str
    predictions: int
    avg_congestion: float
    avg_delay: float
    max_congestion: float


class HeatmapPoint(BaseModel):
    lat: float
    lng: float
    intensity: float          # 0-1, kept for existing map layers
    congestion: float         # 0-100
    prediction_count: int


class PredictionHistorySummary(BaseModel):
    total_predictions: int
    first_prediction_at: Optional[datetime] = None
    last_prediction_at: Optional[datetime] = None
    most_common_congestion: Optional[str] = None
    most_common_weather: Optional[str] = None
    average_distance_km: float


class HourlyTrafficPoint(BaseModel):
    hour: int
    avg_traffic: float


class TrendsSummary(BaseModel):
    average_daily_traffic: float
    highest_traffic_day: Optional[str] = None
    lowest_traffic_day: Optional[str] = None
    peak_hour: Optional[int] = None
    most_common_congestion: Optional[str] = None


class DashboardSummaryResponse(BaseModel):
    kpis: KPISummary
    congestion_distribution: List[DistributionItem]
    weather_distribution: List[DistributionItem]
    top_congested_routes: List[RouteStatistic]
