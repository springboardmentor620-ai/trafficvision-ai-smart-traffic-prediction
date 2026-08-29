from typing import Optional
from pydantic import BaseModel


class ZoneCreate(BaseModel):

    name: str

    city: str

    state: str

    status: str

    roads: int


class ZoneUpdate(BaseModel):

    name: Optional[str] = None

    city: Optional[str] = None

    state: Optional[str] = None

    status: Optional[str] = None

    roads: Optional[int] = None


class ZoneResponse(BaseModel):

    id: int

    name: str

    city: str

    state: str

    status: str

    roads: int

    class Config:
        from_attributes = True