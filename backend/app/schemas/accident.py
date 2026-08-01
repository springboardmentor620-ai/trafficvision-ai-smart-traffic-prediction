from datetime import date
from datetime import time

from pydantic import BaseModel


class AccidentResponse(BaseModel):
    accident_id: int
    city: str
    state: str
    latitude: float
    longitude: float
    date: date
    time: time
    hour: int
    day_of_week: str
    is_weekend: bool
    road_type: str
    lanes: int
    traffic_signal: bool
    weather: str
    visibility: str
    temperature: float
    traffic_density: str
    cause: str
    accident_severity: str
    vehicles_involved: int
    casualties: int
    is_peak_hour: bool
    festival: str
    risk_score: float

    class Config:
        from_attributes = True


class AccidentListResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: list[AccidentResponse]