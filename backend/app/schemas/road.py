from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class OperatorSummarySchema(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class CreateRoadSchema(BaseModel):
    road_name: str = Field(..., description="Name of the road corridor")
    road_code: Optional[str] = Field(None, description="Custom identifier code e.g. RD-001")
    zone: str = Field(..., description="Zone name e.g. Zone Alpha")
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate (-90 to 90)")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate (-180 to 180)")
    length_km: Optional[float] = Field(2.5, description="Length of corridor in km")
    lanes: Optional[int] = Field(4, description="Number of traffic lanes")
    speed_limit: Optional[int] = Field(60, description="Speed limit in km/h")
    status: Optional[str] = Field("Active", description="Road status: Active, Closed, Maintenance, Archived")
    assigned_operator_id: Optional[int] = Field(None, description="ID of assigned operator")

class UpdateRoadSchema(BaseModel):
    road_name: Optional[str] = None
    road_code: Optional[str] = None
    zone: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    length_km: Optional[float] = None
    lanes: Optional[int] = None
    speed_limit: Optional[int] = None
    status: Optional[str] = None
    assigned_operator_id: Optional[int] = None

class RoadResponseSchema(BaseModel):
    id: int
    road_code: str
    road_name: str
    zone: str
    latitude: float
    longitude: float
    length_km: float = 2.5
    lanes: int = 4
    speed_limit: int = 60
    status: str
    assigned_operator_id: Optional[int] = None
    assigned_operator_name: Optional[str] = "Unassigned"
    assigned_operator: Optional[OperatorSummarySchema] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaginatedRoadsResponse(BaseModel):
    items: List[RoadResponseSchema]
    total: int
    page: int
    limit: int
    total_pages: int
