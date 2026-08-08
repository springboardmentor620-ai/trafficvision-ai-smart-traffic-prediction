from pydantic import BaseModel


class TrafficResponse(BaseModel):

    id: int

    road: str

    city: str

    state: str

    latitude: float

    longitude: float

    status: str

    vehicles: int

    average_speed: int

    class Config:

        from_attributes = True