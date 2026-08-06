from pydantic import BaseModel


class TrafficCreate(BaseModel):
    location: str
    vehicle_count: int
    congestion_level: str
    road_status: str


class TrafficResponse(BaseModel):
    id: int
    location: str
    vehicle_count: int
    congestion_level: str
    road_status: str

    class Config:
        from_attributes = True
