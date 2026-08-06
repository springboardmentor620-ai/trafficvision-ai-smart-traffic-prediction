from datetime import datetime

from pydantic import BaseModel, Field


class Alert(BaseModel):
    """A dataset-derived traffic alert returned by the alerts API."""

    id: str = Field(description="Stable identifier for the generated alert")
    alert_type: str
    severity: str
    reason: str
    recommendation: str
    status: str
    timestamp: datetime

