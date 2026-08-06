from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.user_management.dependencies import get_current_user, require_role
from app.modules.user_management.models import User
from app.modules.alerts import services
from app.modules.alerts.schemas import AlertCreate, AlertResponse
from app.modules.traffic_monitoring.services import get_road_by_id

router = APIRouter()


def _to_response_dict(alert) -> dict:
    return {
        "id": alert.id,
        "road_id": alert.road_id,
        "road_name": alert.road.name if alert.road else None,
        "type": alert.type,
        "severity": alert.severity,
        "message": alert.message,
        "is_resolved": alert.is_resolved,
        "created_at": alert.created_at,
        "resolved_at": alert.resolved_at,
    }


@router.get("/alerts", response_model=list[AlertResponse])
def list_alerts(
    resolved: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alerts = services.get_alerts(db, resolved=resolved)
    return [_to_response_dict(a) for a in alerts]


@router.post("/alerts", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    payload: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "traffic_operator"])),
):
    if payload.road_id is not None:
        road = get_road_by_id(db, payload.road_id)
        if not road:
            raise HTTPException(404, "Road not found")

    alert = services.create_alert(db, payload.road_id, payload.type, payload.severity, payload.message, created_by_id=current_user.id)
    return _to_response_dict(alert)


@router.put("/alerts/{alert_id}/resolve", response_model=AlertResponse)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "traffic_operator"])),
):
    alert = services.resolve_alert(db, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    return _to_response_dict(alert)


@router.delete("/alerts/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"])),
):
    deleted = services.delete_alert(db, alert_id)
    if not deleted:
        raise HTTPException(404, "Alert not found")
    return None