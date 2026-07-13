from pydantic import BaseModel

class PredictionRequest(BaseModel):
    vehicle_count: int
    average_speed: float

class PredictionResponse(BaseModel):
    predicted_congestion: str
    confidence: float