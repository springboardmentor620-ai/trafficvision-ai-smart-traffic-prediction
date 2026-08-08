from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    return AnalyticsService.dashboard_summary(db)


@router.get("/congestion")
def congestion(db: Session = Depends(get_db)):
    return AnalyticsService.congestion_distribution(db)


@router.get("/busiest")
def busiest(db: Session = Depends(get_db)):
    return AnalyticsService.busiest_roads(db)


@router.get("/fastest")
def fastest(db: Session = Depends(get_db)):
    return AnalyticsService.fastest_roads(db)


@router.get("/trend")
def traffic_trend(db: Session = Depends(get_db)):
    return AnalyticsService.traffic_trend(db)


@router.get("/insights")
def insights(db: Session = Depends(get_db)):
    return AnalyticsService.ai_insights(db)