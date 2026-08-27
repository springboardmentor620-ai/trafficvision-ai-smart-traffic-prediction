from datetime import datetime
from pydantic import BaseModel


class PredictionHistoryResponse(BaseModel):

    id: int

    timestamp: datetime

    area_name: str

    road_name: str

    traffic_volume: int

    average_speed: float

    # Original weather string as submitted (e.g. "Clear", "Rain")
    weather: str

    # Boolean: True = roadwork present, False = no roadwork
    # Changed from str → bool to match the Boolean database column.
    roadwork: bool

    predicted_congestion: float

    # Vocabulary: Low | Moderate | High
    prediction_level: str

    recommended_action: str

    class Config:
        from_attributes = True