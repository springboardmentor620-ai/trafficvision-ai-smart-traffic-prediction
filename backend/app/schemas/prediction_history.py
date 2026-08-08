from datetime import datetime
from pydantic import BaseModel


class PredictionHistoryResponse(BaseModel):

    id: int

    timestamp: datetime

    area_name: str

    road_name: str

    traffic_volume: int

    average_speed: float

    weather: str

    roadwork: str

    predicted_congestion: float

    prediction_level: str

    recommended_action: str

    class Config:
        from_attributes = True