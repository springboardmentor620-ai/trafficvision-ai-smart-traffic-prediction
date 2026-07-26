from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class OperatorSummarySchema(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = "N/A"
    role: str = "OPERATOR"
    status: str = "ACTIVE"

class RoadSummarySchema(BaseModel):
    id: int
    road_name: str
    road_code: Optional[str] = None
    zone: Optional[str] = None

class CreateAssignmentSchema(BaseModel):
    operator_id: int = Field(..., description="ID of operator to assign")
    zone: Optional[str] = Field("Zone Alpha", description="Zone name")
    road_ids: List[int] = Field(default=[], description="List of road IDs assigned to operator")
    assigned_by: Optional[str] = Field(None, description="Admin name assigning operator")

class UpdateAssignmentSchema(BaseModel):
    zone: Optional[str] = None
    road_ids: List[int] = Field(default=[], description="List of road IDs assigned to operator")

class TransferRoadsSchema(BaseModel):
    source_operator_id: int = Field(..., description="ID of source operator")
    target_operator_id: int = Field(..., description="ID of target operator")
    road_ids: List[int] = Field(..., description="List of road IDs to transfer")

class BulkAssignmentSchema(BaseModel):
    operator_ids: List[int] = Field(..., description="List of operator IDs for bulk operation")
    zone: Optional[str] = Field("Zone Alpha", description="Zone name to assign")
    road_ids: List[int] = Field(default=[], description="List of road IDs to assign")
    action: str = Field("ASSIGN", description="Action: ASSIGN or UNASSIGN")

class AssignmentResponseSchema(BaseModel):
    id: int
    operator: OperatorSummarySchema
    assigned_zone: str
    assigned_roads: List[RoadSummarySchema] = []
    assigned_road_count: int = 0
    assignment_status: str = "ACTIVE"
    assigned_by: str = "Admin Chief Controller"
    assigned_at: Optional[datetime] = None

    class Config:
        from_attributes = True
