from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth / Users ----------
class UserCreate(BaseModel):
    username: str
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str
    role: Literal["admin", "operator", "viewer"] = "viewer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    full_name: Optional[str]
    email: Optional[str]
    role: str
    is_active: int
    created_at: datetime


class UserUpdate(BaseModel):
    """Admin-only edit: change a user's role, active status, name, or email."""
    full_name: Optional[str] = None
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
