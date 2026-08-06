from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth / Users ----------
class UserCreate(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    password: str
    role: Literal["admin", "operator", "viewer"] = "viewer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: Optional[str]
    role: str
    is_active: int
    created_at: datetime


class UserUpdate(BaseModel):
    """Admin-only edit: change a user's role, active status, or email."""
    email: Optional[EmailStr] = None
    role: Optional[Literal["admin", "operator", "viewer"]] = None
    is_active: Optional[bool] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str


# ---------- Roads / Traffic ----------
class RoadCreate(BaseModel):
    name: str
    location: Optional[str] = None
    lane_capacity: int = 100
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RoadUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    lane_capacity: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RoadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    location: Optional[str]
    lane_capacity: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ReadingCreate(BaseModel):
    road_id: int
    vehicle_count: int
    avg_speed_kmph: float


class ReadingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    road_id: int
    vehicle_count: int
    avg_speed_kmph: float
    congestion_level: str
    recorded_at: datetime


class LiveRoadStatus(BaseModel):
    road_id: int
    road_name: str
    location: Optional[str]
    vehicle_count: int
    avg_speed_kmph: float
    congestion_level: str
    recorded_at: datetime


# ---------- Alerts & Notifications ----------
class AccidentReport(BaseModel):
    road_id: int
    description: str
    severity: Literal["low", "medium", "high"] = "high"


class EmergencyAlert(BaseModel):
    """Emergency traffic alert: road closures, natural disasters, VIP
    movement, evacuations, or any other emergency that isn't a routine
    accident. road_id is optional — leave it unset for a citywide/general
    emergency not tied to a single monitored road."""
    message: str
    severity: Literal["low", "medium", "high"] = "high"
    road_id: Optional[int] = None


class AlertOut(BaseModel):
    id: int
    road_id: Optional[int] = None
    road_name: Optional[str] = None
    alert_type: str
    severity: str
    message: str
    status: str
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
