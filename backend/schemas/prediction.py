from pydantic import BaseModel


class PredictionResponse(BaseModel):
    Date: str
    Hour: int
    Junction: int
    Predicted_Vehicles: float
    Congestion: str
    Recommendation: str
