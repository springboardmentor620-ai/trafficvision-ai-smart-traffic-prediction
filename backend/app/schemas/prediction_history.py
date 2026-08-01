from datetime import datetime

from pydantic import BaseModel


class PredictionHistoryResponse(BaseModel):

    id: int

    city: str

    state: str

    predicted_severity: str

    predicted_risk_score: float

    traffic_alert: str

    emergency_level: str

    recommendation: str

    created_at: datetime

    class Config:

        from_attributes = True


class PredictionHistoryListResponse(BaseModel):

    total: int

    page: int

    limit: int

    data: list[PredictionHistoryResponse]