from fastapi import APIRouter

from app.services.traffic_service import (
    get_all_areas,
    get_area_details
)

router = APIRouter(
    prefix="/traffic",
    tags=["Traffic"]
)


@router.get("/areas")
async def areas():

    return await get_all_areas()


@router.get("/details/{area_name}")
async def details(area_name: str):

    data = await get_area_details(area_name)

    if not data:
        return {
            "message": "Area not found"
        }

    return data