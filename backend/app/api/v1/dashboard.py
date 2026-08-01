from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_service import DashboardService
from app.schemas.heatmap import HeatmapPoint


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/summary",
    response_model=DashboardSummary
)
def dashboard_summary(
    db: Session = Depends(get_db)
):
    return DashboardService.get_summary(db)


@router.get("/monthly-trend")
def monthly_trend(
    db: Session = Depends(get_db)
):
    return DashboardService.monthly_trend(db)


@router.get("/severity-distribution")
def severity_distribution(
    db: Session = Depends(get_db)
):
    return DashboardService.severity_distribution(db)


@router.get("/weather-distribution")
def weather_distribution(
    db: Session = Depends(get_db)
):
    return DashboardService.weather_distribution(db)


@router.get("/road-type-distribution")
def road_type_distribution(
    db: Session = Depends(get_db)
):
    return DashboardService.road_type_distribution(db)


@router.get("/dangerous-cities")
def dangerous_cities(
    db: Session = Depends(get_db)
):
    return DashboardService.dangerous_cities(db)

@router.get(
    "/heatmap",
    response_model=list[HeatmapPoint]
)
def heatmap(
    db: Session = Depends(get_db)
):

    return DashboardService.heatmap_data(db)