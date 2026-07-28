from typing import Literal

from pydantic import BaseModel, Field


class Coordinate(BaseModel):
    lat: float
    lng: float


class RouteOption(BaseModel):
    id: str
    route_name: str
    distance: str
    estimated_time: str
    traffic: str
    average_speed: str
    congestion: str
    weather: str
    road_condition: str
    status: Literal["Recommended", "Alternative", "Backup"]
    color: str
    geometry: list[list[float]] = Field(description="[latitude, longitude] coordinates")
    score: float


class RouteRecommendationResponse(BaseModel):
    source_area: str
    source_road: str
    destination_area: str
    destination_road: str
    vehicle_type: str
    source_location: Coordinate
    destination_location: Coordinate
    routes: list[RouteOption]
    best_route: RouteOption
    alternate_route: RouteOption | None = None
    warnings: list[str] = []
