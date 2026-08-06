from fastapi import APIRouter, Depends, Query
from typing import Literal
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.user_management.dependencies import get_current_user
from app.modules.user_management.models import User
from app.modules.analytics import services
from app.modules.analytics.schemas import (
    ZoneHeatmapItem,
    AnalyticsSummary,
    DashboardSummary,
    HistoryPoint,
    ZoneAnalyticsItem,
    RoadPerformanceItem,
    InsightItem,
)

router = APIRouter()


@router.get("/analytics/heatmap", response_model=list[ZoneHeatmapItem])
def get_heatmap(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return services.get_zone_heatmap(db)


@router.get("/analytics/summary", response_model=AnalyticsSummary)
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return services.get_analytics_summary(db)


@router.get("/analytics/dashboard", response_model=DashboardSummary)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    The 8 summary cards for the redesigned Analytics dashboard, each with
    a real today-vs-yesterday comparison where enough history exists.
    """
    return services.get_dashboard_summary(db)


@router.get("/analytics/history", response_model=list[HistoryPoint])
def get_history(
    period: Literal["24h", "7d", "30d"] = Query("24h"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Time-bucketed traffic volume and utilization, for the historical
    trend charts. 24h = hourly buckets, 7d/30d = daily buckets.
    """
    return services.get_history(db, period)


@router.get("/analytics/zones", response_model=list[ZoneAnalyticsItem])
def get_zones(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Richer per-zone analytics cards: avg utilization, avg speed, and
    each zone's highest/lowest congestion road.
    """
    return services.get_zone_analytics(db)


@router.get("/analytics/performance", response_model=list[RoadPerformanceItem])
def get_performance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Road performance table, sorted by utilization descending, with a
    trend per road and best/worst performer flags.
    """
    return services.get_road_performance(db)


@router.get("/analytics/insights", response_model=list[InsightItem])
def get_insights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    AI-generated plain-English insights, derived from real current data
    (congestion, trends, rankings) — not templated filler.
    """
    return services.generate_insights(db)