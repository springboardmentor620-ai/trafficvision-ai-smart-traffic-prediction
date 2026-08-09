from pydantic import BaseModel


class RouteRequest(BaseModel):

    source_lat: float

    source_lng: float

    destination_lat: float

    destination_lng: float