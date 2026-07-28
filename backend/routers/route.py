from fastapi import APIRouter
from pydantic import BaseModel, Field

from models.route import RouteRecommendationResponse
from services.route_service import recommend_route

router = APIRouter(
    prefix="/route",
    tags=["Route Recommendation"]
)


class RouteRequest(BaseModel):
    source_area: str = Field(min_length=2, max_length=100)
    source_road: str = Field(min_length=2, max_length=120)
    destination_area: str = Field(min_length=2, max_length=100)
    destination_road: str = Field(min_length=2, max_length=120)
    vehicle_type: str = Field(min_length=2, max_length=40)


@router.post("/recommend", response_model=RouteRecommendationResponse)
def recommend(request: RouteRequest):

    return recommend_route(
        request.source_area,
        request.source_road,
        request.destination_area,
        request.destination_road,
        request.vehicle_type
    )
