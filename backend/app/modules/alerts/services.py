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
def create_alerts_for_latest_severe_readings(db: Session) -> int:
    """
    Check the latest traffic reading for every road.
    Automatically create a critical alert when the latest
    congestion level is severe.
    """
    from app.modules.traffic_monitoring.services import get_all_roads

    roads = get_all_roads(db)
    created_count = 0

    for road in roads:
        latest_reading = (
            db.query(TrafficReading)
            .filter(TrafficReading.road_id == road.id)
            .order_by(TrafficReading.recorded_at.desc())
            .first()
        )

        if not latest_reading:
            continue

        if latest_reading.congestion_level != CongestionLevel.SEVERE:
            continue

        existing = (
            db.query(Alert)
            .filter(
                Alert.road_id == road.id,
                Alert.type == AlertType.CONGESTION,
                Alert.is_resolved == False,
            )
            .first()
        )

        if existing:
            continue

        message = (
            f"🚨 Severe congestion detected on {road.name}. "
            f"Current vehicles: {latest_reading.vehicle_count}. "
            f"Average speed: "
            f"{latest_reading.avg_speed_kmph:.1f} km/h."
        )

        create_alert(
            db=db,
            road_id=road.id,
            type_=AlertType.CONGESTION,
            severity=AlertSeverity.CRITICAL,
            message=message,
        )

        created_count += 1

    return created_count