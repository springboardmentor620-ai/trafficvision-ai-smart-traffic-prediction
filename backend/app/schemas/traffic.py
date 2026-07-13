from pydantic import BaseModel


class TrafficCreate(BaseModel):
    location: str
    road_name: str
    vehicle_count: int
    average_speed: float
    congestion_level: str


class TrafficResponse(BaseModel):
    id: int
    location: str
    road_name: str
    vehicle_count: int
    average_speed: float
    congestion_level: str

    class Config:
        from_attributes = True