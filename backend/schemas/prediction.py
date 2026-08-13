from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class PredictionRequest(BaseModel):
    """Input schema for traffic prediction — all 18 features required."""
    Latitude: float
    Longitude: float
    Speed: float
    Congestion_Level: int
    Weather: str
    Road_Name: str
    Traffic_Signal: int
    Accident: int
    Hour: int
    Day: int
    Month: int
    Year: int
    DayOfWeek: int
    Weekday: int
    IsWeekend: int
    PeakHour: int
    Minute: int
    TimeSlot: str


class CongestionMetadata(BaseModel):
    """Congestion classification metadata."""
    level: str
    color: str
    urgency: str
    vehicle_count: int


class SignalRecommendation(BaseModel):
    """Signal timing recommendation."""
    green_time: int
    red_time: int
    cycle_length: int
    strategy: str


class PredictionResponse(BaseModel):
    """Complete prediction response with recommendations."""
    prediction: int
    confidence: float
    model_version: str
    congestion: CongestionMetadata
    recommendation: str
    signal_timing: SignalRecommendation
    police_deployment_needed: bool


class PredictionHistoryItem(BaseModel):
    """Schema for prediction history."""
    id: int
    input_features: dict
    prediction: int
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True
