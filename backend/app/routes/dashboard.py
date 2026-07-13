from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

from typing import List

from app.schemas.dashboard import (
    DashboardSummary,
    TopRoad,
    TopLocation,
    CongestionChart,
    SpeedAnalysis
)
from app.services.dashboard_service import (
    get_dashboard_summary,
    get_top_roads,
    get_congestion_chart,
    get_speed_analysis,
    get_top_locations
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
    return get_dashboard_summary(db, current_user.id)

@router.get("/top-roads", response_model=List[TopRoad])
def top_roads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_top_roads(
        db,
        current_user.id
    )

@router.get("/congestion-chart", response_model=List[CongestionChart])
def congestion_chart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_congestion_chart(db, current_user.id)

@router.get("/speed-analysis", response_model=List[SpeedAnalysis])
def speed_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_speed_analysis(db, current_user.id)

@router.get("/top-locations", response_model=List[TopLocation])
def top_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_top_locations(db, current_user.id)