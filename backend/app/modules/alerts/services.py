from datetime import datetime
from sqlalchemy.orm import Session

from app.modules.alerts.models import Alert, AlertType, AlertSeverity
from app.modules.traffic_monitoring.models import Road, TrafficReading, CongestionLevel


def create_alert(db: Session, road_id, type_, severity, message, created_by_id=None) -> Alert:
    alert = Alert(road_id=road_id, type=type_, severity=severity, message=message, created_by_id=created_by_id)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def get_alerts(db: Session, resolved: bool | None = None, limit: int = 100) -> list[Alert]:
    query = db.query(Alert)
    if resolved is not None:
        query = query.filter(Alert.is_resolved == resolved)
    return query.order_by(Alert.created_at.desc()).limit(limit).all()


def get_alert_by_id(db: Session, alert_id: int) -> Alert | None:
    return db.query(Alert).filter(Alert.id == alert_id).first()


def resolve_alert(db: Session, alert_id: int) -> Alert | None:
    alert = get_alert_by_id(db, alert_id)
    if not alert:
        return None
    alert.is_resolved = True
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert


def delete_alert(db: Session, alert_id: int) -> bool:
    alert = get_alert_by_id(db, alert_id)
    if not alert:
        return False
    db.delete(alert)
    db.commit()
    return True


def maybe_create_congestion_alert(db: Session, road: Road, reading: TrafficReading):

    if reading.congestion_level != CongestionLevel.SEVERE:
        return None

    existing = (
        db.query(Alert)
        .filter(
            Alert.road_id == road.id,
            Alert.type == AlertType.CONGESTION,
            Alert.is_resolved == False
        )
        .first()
    )

    if existing:
        return existing

    message = (
        f"🚨 Severe congestion detected on {road.name}. "
        f"Current vehicles: {reading.vehicle_count}"
    )

    return create_alert(
        db=db,
        road_id=road.id,
        type_=AlertType.CONGESTION,
        severity=AlertSeverity.CRITICAL,
        message=message,
    )