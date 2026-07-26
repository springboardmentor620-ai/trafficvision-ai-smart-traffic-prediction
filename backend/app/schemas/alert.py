from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class AlertRoadSchema(BaseModel):
    id: int
    road_name: str
    road_code: Optional[str] = None
    zone: Optional[str] = None

class AlertOperatorSchema(BaseModel):
    id: int
    name: str
    email: str

class CreateAlertSchema(BaseModel):
    road_id: int
    alert_type: str = Field(..., description="Type of alert: Heavy Traffic, Accident, Road Block, Construction, Weather, Emergency")
    severity: Optional[str] = Field("Medium", description="Low, Medium, High, Critical")
    status: Optional[str] = Field("Active", description="Active, In Progress, Resolved, Dismissed")
    notes: Optional[str] = None
    attachment_url: Optional[str] = None
    assigned_operator_id: Optional[int] = None

class UpdateAlertStatusSchema(BaseModel):
    status: str = Field(..., description="New status e.g. Active, In Progress, Resolved, Dismissed")

class AssignAlertSchema(BaseModel):
    operator_id: Optional[int] = Field(None, description="ID of operator assigned to alert")

class UpdateAlertNotesSchema(BaseModel):
    notes: str = Field(..., description="Operational resolution notes")
    attachment_url: Optional[str] = None

class AlertResponseSchema(BaseModel):
    id: int
    alert_type: str
    severity: str
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    notes: Optional[str] = None
    attachment_url: Optional[str] = None
    road: Optional[AlertRoadSchema] = None
    assigned_operator: Optional[AlertOperatorSchema] = None

    class Config:
        from_attributes = True
