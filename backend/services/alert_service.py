"""
TrafficVisionAI
Alert Service

Responsibilities:
- Generate alerts dynamically from traffic_data
- Prevent duplicate active alerts
- Calculate severity
- Support multiple alert types
- Manage alert lifecycle

IMPORTANT:
This service must use only fields that exist in the
existing MySQL `alerts` table.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from models.traffic import Traffic
from models.alert import Alert


# ============================================================
# THRESHOLDS
# ============================================================

CONGESTION_THRESHOLDS = {
    "Critical": 250,
    "High": 150,
    "Medium": 80,
}

SPEED_DELAY_THRESHOLD = 25
SPEED_CRITICAL_THRESHOLD = 10

TRAFFIC_SPIKE_THRESHOLD = 200


# ============================================================
# VALID VALUES
# ============================================================

ALERT_TYPES = {
    "Congestion",
    "Accident",
    "Emergency",
    "Road Blockage",
    "Speed Anomaly",
    "Traffic Spike",
    "Predicted Congestion",
    "Signal Failure",
}

ALERT_STATUSES = {
    "Active",
    "Assigned",
    "Acknowledged",
    "In Progress",
    "Resolved",
}

SEVERITIES = {
    "Critical",
    "High",
    "Medium",
    "Low",
}


# ============================================================
# SEVERITY HELPERS
# ============================================================

def _congestion_severity(vehicle_count: int) -> str:
    """
    Determine congestion severity from vehicle count.
    """

    vehicle_count = vehicle_count or 0

    if vehicle_count >= CONGESTION_THRESHOLDS["Critical"]:
        return "Critical"

    if vehicle_count >= CONGESTION_THRESHOLDS["High"]:
        return "High"

    if vehicle_count >= CONGESTION_THRESHOLDS["Medium"]:
        return "Medium"

    return "Low"


def _delay_severity(speed: float) -> str:
    """
    Determine speed anomaly severity.
    """

    speed = speed or 0

    if speed <= SPEED_CRITICAL_THRESHOLD:
        return "Critical"

    if speed <= SPEED_DELAY_THRESHOLD:
        return "High"

    return "Medium"


# ============================================================
# RECOMMENDATIONS
# ============================================================

def _congestion_recommendation(
    severity: str,
    vehicle_count: int,
    location: str,
) -> str:

    if severity == "Critical":
        return (
            f"CRITICAL: {location} has severe congestion "
            f"with {vehicle_count} vehicles. "
            "Deploy traffic police immediately, activate "
            "alternate route diversion and consider signal "
            "pre-emption."
        )

    if severity == "High":
        return (
            f"HIGH ALERT: {location} has heavy traffic "
            f"with {vehicle_count} vehicles. "
            "Adjust signal timing and notify the traffic "
            "control centre."
        )

    if severity == "Medium":
        return (
            f"MODERATE: {location} is experiencing moderate "
            f"traffic with {vehicle_count} vehicles. "
            "Continue monitoring and prepare alternate-route "
            "advisory."
        )

    return (
        f"Traffic at {location} is normal. "
        "No immediate action required."
    )


def _delay_recommendation(
    severity: str,
    location: str,
    speed: float,
) -> str:

    if severity == "Critical":
        return (
            f"CRITICAL SPEED ANOMALY at {location}: "
            f"average speed is {speed:.1f} km/h. "
            "Possible road blockage. Divert traffic and "
            "prioritize emergency vehicle clearance."
        )

    if severity == "High":
        return (
            f"HIGH SPEED ANOMALY at {location}: "
            f"speed has dropped to {speed:.1f} km/h. "
            "Recommend an alternate route."
        )

    return (
        f"Minor speed reduction at {location}: "
        f"{speed:.1f} km/h. Monitor traffic conditions."
    )


def _accident_recommendation(
    location: str,
    road_status: str,
) -> str:

    return (
        f"ACCIDENT detected at {location}. "
        f"Road status: {road_status}. "
        "Activate incident management, divert traffic "
        "and coordinate emergency response."
    )


def _emergency_recommendation(
    location: str,
    emergency_type: str,
) -> str:

    return (
        f"EMERGENCY at {location}: {emergency_type}. "
        "Clear affected lanes and coordinate with "
        "emergency services."
    )


def _traffic_spike_recommendation(
    location: str,
    vehicle_count: int,
) -> str:

    return (
        f"Traffic spike detected at {location} with "
        f"{vehicle_count} vehicles. "
        "Monitor the junction and optimize signal timing."
    )


# ============================================================
# DUPLICATE CHECK
# ============================================================

def _active_alert_exists(
    db: Session,
    traffic_id: int,
    alert_type: str,
) -> bool:
    """
    Prevent duplicate unresolved alerts for the same
    traffic record and alert type.

    Resolved alerts are ignored so that a future incident
    can generate a new alert.
    """

    existing = (
        db.query(Alert)
        .filter(
            Alert.traffic_id == traffic_id,
            Alert.alert_type == alert_type,
            Alert.status != "Resolved",
        )
        .first()
    )

    return existing is not None


# ============================================================
# CREATE ALERT
# ============================================================

def _create_alert(
    db: Session,
    *,
    record: Traffic,
    alert_type: str,
    severity: str,
    description: str,
    recommendation: str,
) -> Optional[Alert]:
    """
    Create an alert only when a matching unresolved alert
    does not already exist.
    """

    if _active_alert_exists(
        db,
        record.id,
        alert_type,
    ):
        return None

    alert = Alert(
        alert_type=alert_type,

        location=(
            record.location
            or "Unknown Location"
        ),

        latitude=(
            str(record.latitude)
            if record.latitude is not None
            else None
        ),

        longitude=(
            str(record.longitude)
            if record.longitude is not None
            else None
        ),

        severity=severity,

        description=description,

        recommendation=recommendation,

        status="Active",

        traffic_id=record.id,
    )

    db.add(alert)

    return alert


# ============================================================
# GENERATE ALERTS
# ============================================================

def generate_alerts(
    db: Session,
) -> List[dict]:
    """
    Scan traffic_data and dynamically generate alerts.
    """

    records: List[Traffic] = (
        db.query(Traffic)
        .order_by(Traffic.id.desc())
        .all()
    )

    new_alerts: List[Alert] = []

    for record in records:

        vehicle_count = record.vehicle_count or 0

        speed = record.average_speed

        location = (
            record.location
            or "Unknown Location"
        )

        # ====================================================
        # 1. CONGESTION
        # ====================================================

        congestion_severity = _congestion_severity(
            vehicle_count
        )

        if congestion_severity in {
            "Critical",
            "High",
            "Medium",
        }:

            alert = _create_alert(
                db,
                record=record,
                alert_type="Congestion",
                severity=congestion_severity,

                description=(
                    f"Vehicle count at {location} is "
                    f"{vehicle_count}. "
                    f"Congestion level: "
                    f"{record.congestion_level or 'Unknown'}."
                ),

                recommendation=_congestion_recommendation(
                    congestion_severity,
                    vehicle_count,
                    location,
                ),
            )

            if alert:
                new_alerts.append(alert)

        # ====================================================
        # 2. ACCIDENT
        # ====================================================

        accident_value = str(
            record.accident_status or ""
        ).strip().lower()

        if accident_value in {
            "yes",
            "true",
            "1",
            "y",
        }:

            alert = _create_alert(
                db,
                record=record,
                alert_type="Accident",
                severity="Critical",

                description=(
                    f"Accident detected at {location}. "
                    f"Road status: "
                    f"{record.road_status or 'Unknown'}."
                ),

                recommendation=_accident_recommendation(
                    location,
                    record.road_status or "Unknown",
                ),
            )

            if alert:
                new_alerts.append(alert)

        # ====================================================
        # 3. SPEED ANOMALY
        # ====================================================

        if (
            speed is not None
            and speed < SPEED_DELAY_THRESHOLD
        ):

            delay_severity = _delay_severity(speed)

            alert = _create_alert(
                db,
                record=record,
                alert_type="Speed Anomaly",
                severity=delay_severity,

                description=(
                    f"Average speed at {location} "
                    f"is {speed:.1f} km/h, "
                    f"below the normal threshold of "
                    f"{SPEED_DELAY_THRESHOLD} km/h."
                ),

                recommendation=_delay_recommendation(
                    delay_severity,
                    location,
                    speed,
                ),
            )

            if alert:
                new_alerts.append(alert)

        # ====================================================
        # 4. EMERGENCY
        # ====================================================

        emergency_status = str(
            record.emergency_status or ""
        ).strip().lower()

        if emergency_status not in {
            "",
            "normal",
            "none",
        }:

            alert = _create_alert(
                db,
                record=record,
                alert_type="Emergency",
                severity="Critical",

                description=(
                    f"Emergency situation detected at "
                    f"{location}: "
                    f"{record.emergency_status}."
                ),

                recommendation=_emergency_recommendation(
                    location,
                    record.emergency_status,
                ),
            )

            if alert:
                new_alerts.append(alert)

        # ====================================================
        # 5. TRAFFIC SPIKE
        # ====================================================

        if vehicle_count >= TRAFFIC_SPIKE_THRESHOLD:

            alert = _create_alert(
                db,
                record=record,
                alert_type="Traffic Spike",
                severity="High",

                description=(
                    f"Traffic spike detected at {location}. "
                    f"Vehicle count reached {vehicle_count}."
                ),

                recommendation=_traffic_spike_recommendation(
                    location,
                    vehicle_count,
                ),
            )

            if alert:
                new_alerts.append(alert)

    # ========================================================
    # COMMIT
    # ========================================================

    db.commit()

    # ========================================================
    # REFRESH
    # ========================================================

    for alert in new_alerts:
        db.refresh(alert)

    return [
        _alert_to_dict(alert)
        for alert in new_alerts
    ]


# ============================================================
# GET ALL ALERTS
# ============================================================

def get_all_alerts(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> List[dict]:

    alerts = (
        db.query(Alert)
        .order_by(
            Alert.created_at.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        _alert_to_dict(alert)
        for alert in alerts
    ]


# ============================================================
# SUMMARY
# ============================================================

def get_alert_summary(
    db: Session,
) -> dict:

    alerts = db.query(Alert).all()

    summary = {
        "total": len(alerts),

        "by_severity": {
            "Critical": 0,
            "High": 0,
            "Medium": 0,
            "Low": 0,
        },

        "by_type": {
            "Congestion": 0,
            "Accident": 0,
            "Emergency": 0,
            "Road Blockage": 0,
            "Speed Anomaly": 0,
            "Traffic Spike": 0,
            "Predicted Congestion": 0,
            "Signal Failure": 0,
        },

        "by_status": {
            "Active": 0,
            "Assigned": 0,
            "Acknowledged": 0,
            "In Progress": 0,
            "Resolved": 0,
        },
    }

    for alert in alerts:

        if alert.severity in summary["by_severity"]:
            summary["by_severity"][alert.severity] += 1

        if alert.alert_type in summary["by_type"]:
            summary["by_type"][alert.alert_type] += 1

        if alert.status in summary["by_status"]:
            summary["by_status"][alert.status] += 1

    return summary


# ============================================================
# GET SINGLE ALERT
# ============================================================

def get_alert(
    db: Session,
    alert_id: int,
) -> Optional[dict]:

    alert = (
        db.query(Alert)
        .filter(
            Alert.id == alert_id
        )
        .first()
    )

    if not alert:
        return None

    return _alert_to_dict(alert)


# ============================================================
# ASSIGN ALERT
# ============================================================

def assign_alert(
    db: Session,
    alert_id: int,
) -> Optional[dict]:
    """
    Move an alert to Assigned status.

    Note:
    The existing database has no assigned_to or
    assigned_at columns, so only status is updated.
    """

    alert = (
        db.query(Alert)
        .filter(
            Alert.id == alert_id
        )
        .first()
    )

    if not alert:
        return None

    if alert.status == "Resolved":
        return None

    alert.status = "Assigned"

    db.commit()
    db.refresh(alert)

    return _alert_to_dict(alert)


# ============================================================
# ACKNOWLEDGE ALERT
# ============================================================

def acknowledge_alert(
    db: Session,
    alert_id: int,
) -> Optional[dict]:

    alert = (
        db.query(Alert)
        .filter(
            Alert.id == alert_id
        )
        .first()
    )

    if not alert:
        return None

    if alert.status == "Resolved":
        return None

    alert.status = "Acknowledged"

    db.commit()
    db.refresh(alert)

    return _alert_to_dict(alert)


# ============================================================
# START ALERT
# ============================================================

def start_alert(
    db: Session,
    alert_id: int,
) -> Optional[dict]:

    alert = (
        db.query(Alert)
        .filter(
            Alert.id == alert_id
        )
        .first()
    )

    if not alert:
        return None

    if alert.status == "Resolved":
        return None

    alert.status = "In Progress"

    db.commit()
    db.refresh(alert)

    return _alert_to_dict(alert)


# ============================================================
# RESOLVE ALERT
# ============================================================

def resolve_alert(
    db: Session,
    alert_id: int,
) -> Optional[dict]:

    alert = (
        db.query(Alert)
        .filter(
            Alert.id == alert_id
        )
        .first()
    )

    if not alert:
        return None

    if alert.status == "Resolved":
        return _alert_to_dict(alert)

    alert.status = "Resolved"

    alert.resolved_at = (
        __import__("datetime")
        .datetime.utcnow()
    )

    db.commit()
    db.refresh(alert)

    return _alert_to_dict(alert)


# ============================================================
# SERIALIZATION
# ============================================================

def _alert_to_dict(
    alert: Alert,
) -> dict:

    return {
        "id": alert.id,

        "alert_type": alert.alert_type,

        "location": alert.location,

        "latitude": alert.latitude,

        "longitude": alert.longitude,

        "severity": alert.severity,

        "description": alert.description,

        "recommendation": alert.recommendation,

        "status": alert.status,

        "traffic_id": alert.traffic_id,

        "created_at": (
            alert.created_at.isoformat()
            if alert.created_at
            else None
        ),

        "resolved_at": (
            alert.resolved_at.isoformat()
            if alert.resolved_at
            else None
        ),
    }
