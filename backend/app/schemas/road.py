from pydantic import BaseModel


class RoadCreate(BaseModel):

    name: str

    city: str

    state: str

    status: str

    speed_limit: int

    latitude: float

    longitude: float


class RoadUpdate(BaseModel):

    name: str

    city: str

    state: str

    status: str

    speed_limit: int

    latitude: float

    longitude: float


class RoadResponse(BaseModel):

    id: int

    name: str

    city: str

    state: str

    status: str

    speed_limit: int

    latitude: float

    longitude: float

    class Config:
        from_attributes = True