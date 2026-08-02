from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.traffic_alert import TrafficAlert
from app.schemas.traffic_alert import (
    TrafficAlertCreate,
    TrafficAlertResponse
)
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/alerts",
    tags=["Traffic Alerts"]
)


@router.post("/", response_model=TrafficAlertResponse)
def create_alert(
    alert: TrafficAlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_alert = TrafficAlert(**alert.model_dump())

    db.add(new_alert)

    db.commit()

    db.refresh(new_alert)

    return new_alert


@router.get("/", response_model=list[TrafficAlertResponse])
def get_alerts(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ):

    return (
        db.query(TrafficAlert)
        .order_by(TrafficAlert.created_at.desc())
        .all()
    )


@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    alert = (
        db.query(TrafficAlert)
        .filter(TrafficAlert.id == alert_id)
        .first()
    )

    if alert:

        db.delete(alert)

        db.commit()

    return {
        "message": "Alert deleted successfully"
    }