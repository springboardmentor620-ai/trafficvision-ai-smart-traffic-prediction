from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Operator"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --- ROAD SCHEMAS ---
class RoadBase(BaseModel):
    road_name: str
    zone: str
    latitude: float
    longitude: float
    assigned_operator_id: Optional[int] = None

class RoadCreate(RoadBase):
    pass

class RoadResponse(RoadBase):
    id: int

    class Config:
        from_attributes = True

# --- TRAFFIC DATA SCHEMAS ---
class TrafficDataBase(BaseModel):
    road_id: int
    vehicle_count: int
    average_speed: float
    congestion_level: str

class TrafficDataCreate(TrafficDataBase):
    pass

class TrafficDataResponse(TrafficDataBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# --- ALERT SCHEMAS ---
class AlertBase(BaseModel):
    road_id: int
    alert_type: str
    severity: str = "Medium"
    status: str = "Active"

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- PREDICTION SCHEMAS ---
class PredictionBase(BaseModel):
    road_id: int
    prediction: str
    confidence: float
    prediction_time: datetime

class PredictionCreate(PredictionBase):
    pass

class PredictionResponse(PredictionBase):
    id: int

    class Config:
        from_attributes = True
