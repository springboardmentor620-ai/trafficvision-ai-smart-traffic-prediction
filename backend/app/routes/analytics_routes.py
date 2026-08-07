from fastapi import APIRouter

from app.services.analytics_service import (
    get_dashboard_summary,
    get_severity_distribution,
    get_weather_distribution,
    get_top_congested_areas,
    get_monthly_trend,
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/summary")
async def dashboard_summary():

    return await get_dashboard_summary()


@router.get("/severity")
async def severity_distribution():

    return await get_severity_distribution()


@router.get("/weather")
async def weather_distribution():

    return await get_weather_distribution()


@router.get("/top-areas")
async def top_congested_areas():

    return await get_top_congested_areas()


@router.get("/monthly")
async def monthly_trend():

    return await get_monthly_trend()