from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class RoadInfoSchema(BaseModel):
    id: int
    road_name: str
    zone: Optional[str] = None

class CreateOperatorSchema(BaseModel):
    name: str = Field(..., description="Operator full name")
    email: EmailStr = Field(..., description="Unique email address")
    phone: Optional[str] = Field(None, description="Contact phone number")
    zone: Optional[str] = Field("Zone Alpha", description="Primary assigned zone")
    status: Optional[str] = Field("ACTIVE", description="Account status: ACTIVE or INACTIVE")
    assigned_roads: Optional[List[int]] = Field(default=[], description="List of road IDs to assign")

class UpdateOperatorSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    zone: Optional[str] = None
    status: Optional[str] = None

class UpdateOperatorStatusSchema(BaseModel):
    status: str = Field(..., description="New status: ACTIVE or INACTIVE")

class OperatorResponseSchema(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = "N/A"
    role: str = "OPERATOR"
    status: str = "ACTIVE"
    zone: str = "Unassigned"
    shift: Optional[str] = "Day Shift (08:00 - 16:00)"
    designation: Optional[str] = "Senior Traffic Controller"
    avatar_url: Optional[str] = None
    last_login: Optional[str] = None
    assigned_road_count: int = 0
    assigned_roads: List[RoadInfoSchema] = []
    performance: Optional[Dict[str, Any]] = None
    recent_alerts: List[Dict[str, Any]] = []
    activity_history: List[Dict[str, Any]] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CreateOperatorResponseSchema(BaseModel):
    message: str
    operator: OperatorResponseSchema
    temporary_password: str

class ResetPasswordResponseSchema(BaseModel):
    message: str
    temporary_password: str
    operator: OperatorResponseSchema
