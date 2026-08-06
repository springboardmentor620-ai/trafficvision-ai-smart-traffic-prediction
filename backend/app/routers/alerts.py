from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from .. import models, schemas, security
from ..database import get_db

router = APIRouter(prefix="/alerts", tags=["Alerts & Notifications"])


def _to_out(alert: models.Alert) -> schemas.AlertOut:
    """Alerts store alert_type/status as enum columns; the API always returns
    their plain string value, and joins in the road's name for display."""
    return schemas.AlertOut(
        id=alert.id,
        road_id=alert.road_id,
        road_name=alert.road.name if alert.road else None,
        alert_type=alert.alert_type.value,
        severity=alert.severity,
        message=alert.message,
        status=alert.status.value,
        created_at=alert.created_at,
        acknowledged_at=alert.acknowledged_at,
        resolved_at=alert.resolved_at,
    )


@router.get("", response_model=List[schemas.AlertOut])
def list_alerts(
    status: Optional[str] = Query(None, description="Filter: active / acknowledged / resolved"),
    alert_type: Optional[str] = Query(None, description="Filter: congestion / accident / route_delay / emergency"),
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Congestion alerts, accident notifications, etc. — most recent first."""
    q = db.query(models.Alert)
    if status:
        q = q.filter(models.Alert.status == status)
    if alert_type:
        q = q.filter(models.Alert.alert_type == alert_type)
    alerts = q.order_by(desc(models.Alert.created_at)).limit(limit).all()
    return [_to_out(a) for a in alerts]


@router.get("/active-count")
def active_count(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Count of not-yet-resolved alerts — feeds the sidebar notification badge."""
    count = (
        db.query(models.Alert)
        .filter(models.Alert.status != models.AlertStatusEnum.resolved)
        .count()
    )
    return {"active_count": count}


@router.post("/accidents", response_model=schemas.AlertOut)
def report_accident(
    report_in: schemas.AccidentReport,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_roles("admin", "operator")),
):
    """Accident notifications: a Traffic Operator/Authority reports an accident
    on a monitored road, raising an alert for the dashboard."""
    road = db.query(models.Road).filter(models.Road.id == report_in.road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    description = report_in.description.strip()
    if not description:
        raise HTTPException(status_code=400, detail="Description is required")

    alert = models.Alert(
        road_id=road.id,
        alert_type=models.AlertTypeEnum.accident,
        severity=report_in.severity,
        message=f"Accident reported on {road.name}: {description}",
        status=models.AlertStatusEnum.active,
        created_by=current_user.id,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return _to_out(alert)


@router.post("/emergency", response_model=schemas.AlertOut)
def broadcast_emergency(
    emergency_in: schemas.EmergencyAlert,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_roles("admin", "operator")),
):
    """Emergency traffic alerts: road closures, natural disasters, VIP
    movement, evacuations, or anything else that needs to go out immediately
    and isn't a routine accident report. Optionally tied to a specific road;
    leave road_id unset for a citywide/general emergency."""
    road = None
    if emergency_in.road_id is not None:
        road = db.query(models.Road).filter(models.Road.id == emergency_in.road_id).first()
        if not road:
            raise HTTPException(status_code=404, detail="Road not found")

    message = emergency_in.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    alert = models.Alert(
        road_id=road.id if road else None,
        alert_type=models.AlertTypeEnum.emergency,
        severity=emergency_in.severity,
        message=f"EMERGENCY: {message}" + (f" ({road.name})" if road else " (citywide)"),
        status=models.AlertStatusEnum.active,
        created_by=current_user.id,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return _to_out(alert)


@router.put("/{alert_id}/acknowledge", response_model=schemas.AlertOut)
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_roles("admin", "operator")),
):
    """Mark an alert as seen/being-handled, without closing it out yet."""
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if alert.status == models.AlertStatusEnum.active:
        alert.status = models.AlertStatusEnum.acknowledged
        alert.acknowledged_at = datetime.utcnow()
        db.commit()
        db.refresh(alert)
    return _to_out(alert)


@router.put("/{alert_id}/resolve", response_model=schemas.AlertOut)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_roles("admin", "operator")),
):
    """Close out an alert (e.g. accident cleared, congestion eased)."""
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if alert.status != models.AlertStatusEnum.resolved:
        alert.status = models.AlertStatusEnum.resolved
        alert.resolved_at = datetime.utcnow()
        db.commit()
        db.refresh(alert)
    return _to_out(alert)
