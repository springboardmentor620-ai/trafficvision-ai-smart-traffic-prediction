from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

from app.schemas.dashboard import (
    DashboardSummary,
    WeatherDistribution,
    HourlyTraffic,
    WeatherTraffic,
    DayTraffic
)

from app.services.dashboard_service import (
    get_dashboard_summary,
    get_weather_distribution,
    get_hourly_traffic,
    get_weather_traffic,
    get_daywise_traffic
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_dashboard_summary(db)


@router.get(
    "/weather-distribution",
    response_model=List[WeatherDistribution]
)
def weather_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_weather_distribution(db)


@router.get(
    "/hourly-traffic",
    response_model=List[HourlyTraffic]
)
def hourly_traffic(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_hourly_traffic(db)


@router.get(
    "/weather-traffic",
    response_model=List[WeatherTraffic]
)
def weather_traffic(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_weather_traffic(db)

@router.get(
    "/daywise-traffic",
    response_model=List[DayTraffic]
)
def daywise_traffic(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_daywise_traffic(db)