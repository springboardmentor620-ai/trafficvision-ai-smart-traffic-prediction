from pydantic import BaseModel


class TrafficResponse(BaseModel):
    id: int
    road: str
    status: str
    vehicles: int
    average_speed: int

    class Config:
        from_attributes = True