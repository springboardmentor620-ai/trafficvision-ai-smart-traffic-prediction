from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_service import DashboardService

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


@router.get("/severity")
def severity(db: Session = Depends(get_db)):
    return DashboardService.severity(db)


@router.get("/weather")
def weather(db: Session = Depends(get_db)):
    return DashboardService.weather(db)


@router.get("/traffic-density")
def traffic_density(db: Session = Depends(get_db)):
    return DashboardService.traffic(db)


@router.get("/cities")
def cities(db: Session = Depends(get_db)):
    return DashboardService.cities(db)