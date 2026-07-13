from pydantic import BaseModel


class AlertResponse(BaseModel):
    road_name: str
    location: str
    congestion_level: str
    alert: str
    severity: str