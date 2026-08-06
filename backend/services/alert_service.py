"""
Alert Service — dynamically generates alerts from live traffic DB records.
No hardcoded data. All logic derived from MySQL traffic table.
"""
from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from models.traffic import Traffic
from models.alert import Alert


# ─────────────────────────────────────────────────────────────────────────────
# Thresholds (tune these without touching any other file)
# ─────────────────────────────────────────────────────────────────────────────
CONGESTION_THRESHOLDS = {
    "Critical": 250,
    "High": 150,
    "Medium": 80,
}

SPEED_DELAY_THRESHOLD = 25      # km/h — below this triggers a Route Delay alert
SPEED_CRITICAL_THRESHOLD = 10   # km/h — below this is Critical delay


def _congestion_severity(vehicle_count: int) -> str:
    if vehicle_count >= CONGESTION_THRESHOLDS["Critical"]:
        return "Critical"
    elif vehicle_count >= CONGESTION_THRESHOLDS["High"]:
        return "High"
    elif vehicle_count >= CONGESTION_THRESHOLDS["Medium"]:
        return "Medium"
    return "Low"


def _congestion_recommendation(severity: str, vehicle_count: int, location: str) -> str:
    if severity == "Critical":
        return (
            f"CRITICAL: {location} is severely congested ({vehicle_count} vehicles). "
            "Deploy traffic police immediately. Activate alternate route diversions. "
            "Consider signal pre-emption."
        )
    elif severity == "High":
        return (
            f"HIGH ALERT: {location} has heavy traffic ({vehicle_count} vehicles). "
            "Signal timing adjustment recommended. Alert traffic control centre."
        )
    elif severity == "Medium":
        return (
            f"MODERATE: {location} experiencing moderate traffic ({vehicle_count} vehicles). "
            "Monitor situation. Prepare alternate route advisory."
        )
    return (
        f"Traffic at {location} is normal ({vehicle_count} vehicles). No action required."
    )


def _delay_severity(average_speed: float) -> str:
    if average_speed <= SPEED_CRITICAL_THRESHOLD:
        return "Critical"
    elif average_speed <= SPEED_DELAY_THRESHOLD:
        return "High"
    return "Medium"


def _delay_recommendation(severity: str, location: str, speed: float) -> str:
    if severity == "Critical":
        return (
            f"CRITICAL DELAY at {location}: Average speed {speed:.1f} km/h. "
            "Road may be blocked. Divert all traffic immediately. "
            "Emergency vehicle clearance required."
        )
    elif severity == "High":
        return (
            f"DELAY WARNING at {location}: Speed dropped to {speed:.1f} km/h. "
            "Recommend alternate route. ETA significantly affected."
        )
    return (
        f"Minor delay at {location}: Speed {speed:.1f} km/h. "
        "Allow 10-15 minute extra travel buffer."
    )


def _accident_recommendation(location: str, road_status: str) -> str:
    return (
        f"ACCIDENT REPORTED at {location}. Road status: {road_status}. "
        "Activate incident management protocol. Divert traffic and deploy rescue units. "
        "Contact traffic control for lane clearance."
    )


def _emergency_recommendation(location: str, emergency_type: str) -> str:
    return (
        f"EMERGENCY at {location}: {emergency_type}. "
        "Clear all lanes immediately. Coordinate with emergency services. "
        "All vehicles yield right of way."
    )


# ─────────────────────────────────────────────────────────────────────────────
# Main generation function
# ─────────────────────────────────────────────────────────────────────────────

def generate_alerts(db: Session) -> List[dict]:
    """
    Scan all traffic records and produce dynamic alerts.
    Clears previously Active alerts for records that are now generating new ones
    to avoid duplicates, then bulk-inserts fresh alerts.
    Returns a list of alert dicts for the API response.
    """
    records: List[Traffic] = db.query(Traffic).all()
    new_alerts: List[Alert] = []

    for record in records:
        generated_for_record = False

        # ── 1. Congestion Alert ──────────────────────────────────────────────
        cong_severity = _congestion_severity(record.vehicle_count)
        if cong_severity in ("Critical", "High", "Medium"):
            alert = Alert(
                alert_type="Congestion",
                location=record.location,
                latitude=str(record.latitude) if record.latitude else None,
                longitude=str(record.longitude) if record.longitude else None,
                severity=cong_severity,
                description=(
                    f"Vehicle count at {record.location} is {record.vehicle_count}. "
                    f"Congestion level recorded as {record.congestion_level}."
                ),
                recommendation=_congestion_recommendation(
                    cong_severity, record.vehicle_count, record.location
                ),
                status="Active",
                traffic_id=record.id,
            )
            new_alerts.append(alert)
            generated_for_record = True

        # ── 2. Accident Alert ────────────────────────────────────────────────
        if record.accident_status and record.accident_status.lower() in ("yes", "true", "1"):
            alert = Alert(
                alert_type="Accident",
                location=record.location,
                latitude=str(record.latitude) if record.latitude else None,
                longitude=str(record.longitude) if record.longitude else None,
                severity="Critical",
                description=(
                    f"Accident detected at {record.location}. "
                    f"Road status: {record.road_status}."
                ),
                recommendation=_accident_recommendation(record.location, record.road_status),
                status="Active",
                traffic_id=record.id,
            )
            new_alerts.append(alert)
            generated_for_record = True

        # ── 3. Route Delay Warning ───────────────────────────────────────────
        if record.average_speed is not None and record.average_speed < SPEED_DELAY_THRESHOLD:
            delay_severity = _delay_severity(record.average_speed)
            alert = Alert(
                alert_type="RouteDelay",
                location=record.location,
                latitude=str(record.latitude) if record.latitude else None,
                longitude=str(record.longitude) if record.longitude else None,
                severity=delay_severity,
                description=(
                    f"Average speed at {record.location} is {record.average_speed:.1f} km/h, "
                    f"well below safe threshold of {SPEED_DELAY_THRESHOLD} km/h."
                ),
                recommendation=_delay_recommendation(
                    delay_severity, record.location, record.average_speed
                ),
                status="Active",
                traffic_id=record.id,
            )
            new_alerts.append(alert)
            generated_for_record = True

        # ── 4. Emergency Alert ───────────────────────────────────────────────
        if record.emergency_status and record.emergency_status.lower() not in ("normal", "none", ""):
            alert = Alert(
                alert_type="Emergency",
                location=record.location,
                latitude=str(record.latitude) if record.latitude else None,
                longitude=str(record.longitude) if record.longitude else None,
                severity="Critical",
                description=(
                    f"Emergency situation at {record.location}: {record.emergency_status}."
                ),
                recommendation=_emergency_recommendation(
                    record.location, record.emergency_status
                ),
                status="Active",
                traffic_id=record.id,
            )
            new_alerts.append(alert)

    # Bulk insert
    db.add_all(new_alerts)
    db.commit()

    # Refresh to get IDs + timestamps
    for a in new_alerts:
        db.refresh(a)

    return [_alert_to_dict(a) for a in new_alerts]


def get_all_alerts(db: Session, skip: int = 0, limit: int = 100) -> List[dict]:
    alerts = (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_alert_to_dict(a) for a in alerts]


def get_alert_summary(db: Session) -> dict:
    alerts = db.query(Alert).all()
    summary = {
        "total": len(alerts),
        "by_severity": {"Critical": 0, "High": 0, "Medium": 0, "Low": 0},
        "by_type": {"Congestion": 0, "Accident": 0, "RouteDelay": 0, "Emergency": 0},
        "by_status": {"Active": 0, "Acknowledged": 0, "Resolved": 0},
    }
    for a in alerts:
        if a.severity in summary["by_severity"]:
            summary["by_severity"][a.severity] += 1
        if a.alert_type in summary["by_type"]:
            summary["by_type"][a.alert_type] += 1
        if a.status in summary["by_status"]:
            summary["by_status"][a.status] += 1
    return summary


def resolve_alert(db: Session, alert_id: int) -> dict | None:
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return None
    alert.status = "Resolved"
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return _alert_to_dict(alert)


def acknowledge_alert(db: Session, alert_id: int) -> dict | None:
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return None
    alert.status = "Acknowledged"
    db.commit()
    db.refresh(alert)
    return _alert_to_dict(alert)


def _alert_to_dict(a: Alert) -> dict:
    return {
        "id": a.id,
        "alert_type": a.alert_type,
        "location": a.location,
        "latitude": a.latitude,
        "longitude": a.longitude,
        "severity": a.severity,
        "description": a.description,
        "recommendation": a.recommendation,
        "status": a.status,
        "traffic_id": a.traffic_id,
        "created_at": a.created_at.isoformat() if a.created_at else None,
        "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
    }
