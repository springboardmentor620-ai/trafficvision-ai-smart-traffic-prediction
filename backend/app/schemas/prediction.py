from typing import List, Optional
from datetime import datetime

from pydantic import BaseModel

from app.schemas.traffic_alert import AlertSummary


class PredictionRequest(BaseModel):

    source: str
    destination: str

    holiday: str
    temp: float
    rain_1h: float
    snow_1h: float
    clouds_all: int

    weather_main: str
    weather_description: str

    hour: int
    day: int
    month: int
    weekday: int

    distance: float

    source_lat: float
    source_lng: float

    destination_lat: float
    destination_lng: float


class AIRecommendation(BaseModel):
    """Rule-based recommendation shown alongside the prediction result
    and included in the PDF report's AI Insights section."""

    traffic_status: str
    congestion_level: str
    recommended_route: str
    reason: str
    estimated_delay: float
    suggested_departure: str
    fuel_tips: List[str]
    safety_tips: List[str]
    confidence: Optional[float] = None


class PredictionResponse(BaseModel):
    predicted_traffic: int
    congestion: str
    recommended_route: str
    confidence: Optional[float] = None

    # The alert that was automatically generated for this prediction, so
    # the frontend can show a toast notification without a second call.
    alert: Optional[AlertSummary] = None

    ai_recommendation: Optional[AIRecommendation] = None


class PredictionHistoryItem(BaseModel):
    """Read schema for GET /prediction/history. Previously this endpoint
    had no response_model and returned raw SQLAlchemy ORM rows directly,
    which risks leaking internal ORM state and isn't guaranteed to
    serialize cleanly."""

    id: int
    created_at: datetime

    source: Optional[str] = None
    destination: Optional[str] = None
    distance: Optional[float] = None

    holiday: Optional[str] = None
    weather_main: Optional[str] = None

    predicted_traffic: int
    confidence: Optional[float] = None
    congestion: str
    recommended_route: str

    class Config:
        from_attributes = True
