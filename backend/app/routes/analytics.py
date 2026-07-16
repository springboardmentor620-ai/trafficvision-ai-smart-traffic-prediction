from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

from app.schemas.analytics import (
    AnalyticsSummary,
    WeatherTraffic,
    HolidayTraffic,
    HourlyTraffic
)

from app.services.analytics_service import (
    get_summary,
    weather_analysis,
    holiday_analysis,
    hourly_analysis
)

router = APIRouter(
    prefix="/analytics",
    tags=["Traffic Analytics"]
)


@router.get("/summary", response_model=AnalyticsSummary)
def summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_summary(db)


@router.get("/weather", response_model=List[WeatherTraffic])
def weather(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return weather_analysis(db)


@router.get("/holiday", response_model=List[HolidayTraffic])
def holiday(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return holiday_analysis(db)


@router.get("/hourly", response_model=List[HourlyTraffic])
def hourly(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return hourly_analysis(db)