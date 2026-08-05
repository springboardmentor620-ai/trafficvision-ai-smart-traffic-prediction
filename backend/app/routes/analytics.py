from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

from app.schemas.traffic_analytics import (
    KPISummary,
    DistributionItem,
    TrendPoint,
    RouteTraffic,
    RouteStatistic,
    HeatmapPoint,
    PredictionHistorySummary,
    DashboardSummaryResponse,
    HourlyTrafficPoint,
    TrendsSummary
)

from app.services import traffic_analytics_service

router = APIRouter(
    prefix="/analytics",
    tags=["Traffic Analytics"]
)


# --------------------------------------------------------------------------
@router.get("/heatmap")
def get_heatmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Congestion heatmap for the current user's predictions. Response
    keeps the original {lat, lng, intensity} shape (used by TrafficMap.jsx
    and Heatmap.jsx) and adds `congestion` (0-100) and `prediction_count`
    on top, computed via SQLAlchemy aggregation instead of looping in
    Python."""

    return traffic_analytics_service.get_heatmap_points(db, current_user.id)


# --------------------------------------------------------------------------
# Prediction/alert-based analytics dashboard (Milestone 3).
# --------------------------------------------------------------------------

@router.get("/kpis", response_model=KPISummary)
def kpis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_kpis(db, current_user.id)


@router.get("/congestion-distribution", response_model=List[DistributionItem])
def congestion_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_congestion_distribution(
        db, current_user.id
    )


@router.get("/weather-distribution", response_model=List[DistributionItem])
def weather_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_weather_distribution(
        db, current_user.id
    )


@router.get("/trend/daily", response_model=List[TrendPoint])
def daily_trend(
    days: int = Query(30, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_daily_trend(
        db, current_user.id, days=days
    )


@router.get("/trend/weekly", response_model=List[TrendPoint])
def weekly_trend(
    weeks: int = Query(12, ge=1, le=52),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_weekly_trend(
        db, current_user.id, weeks=weeks
    )


@router.get("/trend/monthly", response_model=List[TrendPoint])
def monthly_trend(
    months: int = Query(12, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_monthly_trend(
        db, current_user.id, months=months
    )


@router.get("/routes/source-wise", response_model=List[RouteTraffic])
def source_wise_traffic(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_source_wise_traffic(
        db, current_user.id
    )


@router.get("/routes/destination-wise", response_model=List[RouteTraffic])
def destination_wise_traffic(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_destination_wise_traffic(
        db, current_user.id
    )


@router.get("/routes/statistics", response_model=List[RouteStatistic])
def route_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_route_statistics(db, current_user.id)


@router.get("/routes/top-congested", response_model=List[RouteStatistic])
def top_congested_routes(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_top_congested_routes(
        db, current_user.id, limit=limit
    )


@router.get("/history-summary", response_model=PredictionHistorySummary)
def history_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_prediction_history_summary(
        db, current_user.id
    )


@router.get("/heatmap-data", response_model=List[HeatmapPoint])
def heatmap_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Same aggregation as /analytics/heatmap, returned in the typed
    {lat, lng, intensity, congestion, prediction_count} shape for the new
    Analytics/Heatmap dashboard pages."""

    return traffic_analytics_service.get_heatmap_points(db, current_user.id)


@router.get("/dashboard-summary", response_model=DashboardSummaryResponse)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """One-shot payload (KPIs + distributions + top routes) for the
    Analytics page to minimize round trips on initial load."""

    return traffic_analytics_service.get_dashboard_summary(db, current_user.id)


# --------------------------------------------------------------------------
# Traffic Trends sub-module. daily/monthly/congestion are thin wrappers
# around the exact same service functions used above (get_daily_trend,
# get_monthly_trend, get_congestion_distribution) - no logic duplication,
# just an additional path for the Trends page. peak-hour and summary are
# genuinely new aggregations.
# --------------------------------------------------------------------------

@router.get("/trends/daily", response_model=List[TrendPoint])
def trends_daily(
    days: int = Query(30, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_daily_trend(
        db, current_user.id, days=days
    )


@router.get("/trends/monthly", response_model=List[TrendPoint])
def trends_monthly(
    months: int = Query(12, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_monthly_trend(
        db, current_user.id, months=months
    )


@router.get("/trends/congestion", response_model=List[DistributionItem])
def trends_congestion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_congestion_distribution(
        db, current_user.id
    )


@router.get("/trends/peak-hour", response_model=List[HourlyTrafficPoint])
def trends_peak_hour(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return traffic_analytics_service.get_hourly_traffic_breakdown(
        db, current_user.id
    )


@router.get("/trends/summary", response_model=TrendsSummary)
def trends_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return traffic_analytics_service.get_trends_summary(db, current_user.id)
    except Exception:
        import traceback
        traceback.print_exc()
        raise