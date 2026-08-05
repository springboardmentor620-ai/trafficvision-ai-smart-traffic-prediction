from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.traffic_alert import TrafficAlertResponse
from app.services import traffic_alert_service

router = APIRouter(
    prefix="/alerts",
    tags=["Traffic Alerts"]
)


@router.get("/", response_model=List[TrafficAlertResponse])
def get_alerts(
    severity: Optional[str] = Query(
        None, description="Filter by severity: Low, Medium, High, Critical"
    ),
    category: Optional[str] = Query(
        None,
        description="Filter by category: Congestion, Accident, Weather, Road Work, Event",
    ),
    search: Optional[str] = Query(
        None, description="Search source, destination, title or message"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Alerts are generated automatically whenever a prediction is made
    (see /prediction/predict). This endpoint only reads them."""

    return traffic_alert_service.list_alerts(
        db,
        user_id=current_user.id,
        severity=severity,
        category=category,
        search=search,
    )


@router.get("/unread", response_model=List[TrafficAlertResponse])
def get_unread_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Backs the notification panel's auto-refresh (polled every 30s by
    the frontend - no WebSocket). Newest first, same ordering as the
    main alerts list. The frontend derives the unread count from the
    length of this response rather than a separate endpoint."""

    return traffic_alert_service.list_alerts(
        db,
        user_id=current_user.id,
        unread_only=True,
    )


@router.post("/mark-read/{alert_id}", response_model=TrafficAlertResponse)
def mark_alert_read(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = traffic_alert_service.mark_alert_read(
        db, alert_id, current_user.id
    )

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    return alert


@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted = traffic_alert_service.delete_alert(
        db, alert_id, current_user.id
    )

    if not deleted:
        raise HTTPException(status_code=404, detail="Alert not found")

    return {
        "message": "Alert deleted successfully"
    }
