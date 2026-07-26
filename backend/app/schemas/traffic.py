from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class JunctionNodeBase(BaseModel):
    code: str = Field(..., example="NODE-NE-01")
    name: str = Field(..., example="5th Ave & 42nd St")
    latitude: float = Field(..., example=40.7527)
    longitude: float = Field(..., example=-73.9772)
    status: Optional[str] = "OPERATIONAL"

class JunctionNodeCreate(JunctionNodeBase):
    pass

class JunctionNodeResponse(JunctionNodeBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TrafficTelemetryBase(BaseModel):
    junction_id: int
    vehicle_count: int = Field(0, ge=0)
    average_speed: float = Field(0.0, ge=0.0)
    congestion_score: float = Field(0.0, ge=0.0, le=100.0)
    congestion_level: str = Field("LOW")

class TrafficTelemetryResponse(TrafficTelemetryBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class SystemHealthResponse(BaseModel):
    status: str = "Healthy"
    version: str = "1.0.0"
    environment: str
    active_junctions: int = 24
    prediction_engine: str = "Ready"
