from datetime import datetime

from pydantic import BaseModel


class AlertResponse(BaseModel):

    id: int

    title: str

    message: str

    severity: str

    road: str

    status: str

    created_at: datetime

    class Config:
        from_attributes = True