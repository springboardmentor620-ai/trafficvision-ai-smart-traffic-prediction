from sqlalchemy.orm import Session

from app.models.traffic import TrafficRecord


def get_alerts(
    db: Session,
    user_id: int
):
    records = (
        db.query(TrafficRecord)
        .filter(
            TrafficRecord.user_id == user_id
        )
        .all()
    )

    alerts = []

    for record in records:

        if record.congestion_level == "High":
            alert = "Heavy Traffic"
            severity = "High"

        elif record.congestion_level == "Medium":
            alert = "Moderate Traffic"
            severity = "Medium"

        else:
            alert = "Traffic Flow Normal"
            severity = "Low"

        alerts.append(
            {
                "road_name": record.road_name,
                "location": record.location,
                "congestion_level": record.congestion_level,
                "alert": alert,
                "severity": severity
            }
        )

    return alerts