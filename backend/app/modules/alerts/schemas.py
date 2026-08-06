from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.modules.alerts.models import AlertType, AlertSeverity


class AlertCreate(BaseModel):
    road_id: Optional[int] = None
    type: AlertType
    severity: AlertSeverity = AlertSeverity.WARNING
    message: str = Field(..., min_length=3, max_length=500)


class AlertResponse(BaseModel):
    id: int
    road_id: Optional[int]
    road_name: Optional[str] = None
    type: AlertType
    severity: AlertSeverity
    message: str
    is_resolved: bool
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True