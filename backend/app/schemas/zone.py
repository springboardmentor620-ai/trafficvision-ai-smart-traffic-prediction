from pydantic import BaseModel


class ZoneCreate(BaseModel):

    name: str

    city: str

    state: str

    status: str

    roads: int


class ZoneUpdate(BaseModel):

    name: str

    city: str

    state: str

    status: str

    roads: int


class ZoneResponse(BaseModel):

    id: int

    name: str

    city: str

    state: str

    status: str

    roads: int

    class Config:
        from_attributes = True