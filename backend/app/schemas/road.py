from typing import Optional
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

    name: Optional[str] = None

    city: Optional[str] = None

    state: Optional[str] = None

    status: Optional[str] = None

    speed_limit: Optional[int] = None

    latitude: Optional[float] = None

    longitude: Optional[float] = None


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