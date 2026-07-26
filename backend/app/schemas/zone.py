from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class RoadSummarySchema(BaseModel):
    id: int
    road_name: str
    road_code: Optional[str] = None
    zone: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = "Active"
    assigned_operator_name: Optional[str] = "Unassigned"

class CreateZoneSchema(BaseModel):
    zone_name: str = Field(..., description="Unique zone name e.g. North Zone")
    zone_code: Optional[str] = Field(None, description="Unique code e.g. Z-001")
    description: Optional[str] = Field(None, description="Perimeter description")
    status: Optional[str] = Field("Active", description="Zone status: Active, Maintenance, Inactive, Archived")
    center_latitude: Optional[float] = Field(12.9716, ge=-90, le=90)
    center_longitude: Optional[float] = Field(77.5946, ge=-180, le=180)
    road_ids: Optional[List[int]] = Field(default=[], description="List of road IDs to link to zone")

class UpdateZoneSchema(BaseModel):
    zone_name: Optional[str] = None
    zone_code: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    center_latitude: Optional[float] = Field(None, ge=-90, le=90)
    center_longitude: Optional[float] = Field(None, ge=-180, le=180)
    road_ids: Optional[List[int]] = None

class AssignRoadsSchema(BaseModel):
    road_ids: List[int] = Field(..., description="List of road IDs to assign to zone")

class ZoneResponseSchema(BaseModel):
    id: int
    zone_name: str
    zone_code: Optional[str] = None
    description: Optional[str] = None
    status: str = "Active"
    center_latitude: float = 12.9716
    center_longitude: float = 77.5946
    road_count: int = 0
    operator_count: int = 0
    traffic_status: str = "Optimal"
    average_congestion: str = "Low"
    total_vehicles: int = 0
    average_speed: float = 0.0
    roads: List[RoadSummarySchema] = []
    operators: List[Dict[str, Any]] = []
    alerts: List[Dict[str, Any]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
