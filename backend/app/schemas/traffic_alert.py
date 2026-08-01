from datetime import datetime

from pydantic import BaseModel


class TrafficAlertResponse(BaseModel):

    id: int

    city: str

    state: str

    predicted_severity: str

    predicted_risk_score: float

    traffic_alert: str

    emergency_level: str

    recommendation: str

    is_active: bool

    created_at: datetime

    class Config:

        from_attributes = True