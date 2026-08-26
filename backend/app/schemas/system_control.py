from datetime import datetime

from pydantic import BaseModel


class SystemControlResponse(BaseModel):

    id: int

    prediction_enabled: bool

    alerts_enabled: bool

    ai_processing_enabled: bool

    maintenance_mode: bool

    updated_at: datetime

    class Config:

        from_attributes = True


class SystemControlUpdate(BaseModel):

    prediction_enabled: bool | None = None

    alerts_enabled: bool | None = None

    ai_processing_enabled: bool | None = None

    maintenance_mode: bool | None = None