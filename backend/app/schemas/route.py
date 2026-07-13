from pydantic import BaseModel
from typing import List

class TravelTimeResponse(BaseModel):
    road_name: str
    average_speed: float
    estimated_time_minutes: float

class AlternateRoute(BaseModel):
    road_name: str
    location: str
    congestion_level: str
    vehicle_count: int

class RoadCondition(BaseModel):
    road_name: str
    location: str
    average_speed: float
    congestion_level: str
    road_condition: str