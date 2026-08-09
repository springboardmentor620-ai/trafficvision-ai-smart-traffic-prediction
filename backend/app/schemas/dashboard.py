from typing import Optional

from pydantic import BaseModel


class DashboardSummary(BaseModel):

    total_accidents: int

    active_alerts: int

    average_risk_score: Optional[float] = None

    total_cities: int

    total_states: int


class MonthlyTrend(BaseModel):

    month: int

    total_accidents: int


class SeverityDistribution(BaseModel):

    accident_severity: str

    total: int


class WeatherDistribution(BaseModel):

    weather: str

    total: int


class RoadTypeDistribution(BaseModel):

    road_type: str

    total: int


class DangerousCity(BaseModel):

    city: str

    total_accidents: int

    average_risk_score: Optional[float] = None