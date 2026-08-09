from fastapi import APIRouter

from app.schemas.route import RouteRequest
from app.services.route_service import RouteService


router = APIRouter(
    prefix="/routes",
    tags=["Routes"]
)


@router.post("/")
async def get_routes(
    request: RouteRequest
):

    result = await RouteService.get_routes(

        source_lng=request.source_lng,

        source_lat=request.source_lat,

        destination_lng=request.destination_lng,

        destination_lat=request.destination_lat

    )

    return result