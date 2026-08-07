from pydantic import BaseModel
from typing import List


class AlertCreate(BaseModel):
    area_name: str
    road_name: str
    congestion: float
    severity: str
    delay: str
    alerts: List[str]
    recommendations: List[str]