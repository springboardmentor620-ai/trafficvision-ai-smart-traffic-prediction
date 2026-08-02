from pydantic import BaseModel
from datetime import datetime


class TrafficAlertCreate(BaseModel):

    source: str

    destination: str

    congestion: str

    delay: str

    recommended_route: str

    severity: str

    message: str


class TrafficAlertResponse(TrafficAlertCreate):

    id: int

    created_at: datetime

    class Config:

        from_attributes = True