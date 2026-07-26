from sqlalchemy.orm import Session, joinedload
from app.models.models import Alert, Road

class AlertRepository:
    @staticmethod
    def get_alerts(db: Session, severity: str = "ALL", status: str = "ALL"):
        query = db.query(Alert).options(joinedload(Alert.road))

        if severity and severity != "ALL":
            query = query.filter(Alert.severity.ilike(f"%{severity}%"))
        
        if status and status != "ALL":
            query = query.filter(Alert.status.ilike(f"%{status}%"))

        alerts_raw = query.order_by(Alert.created_at.desc()).all()
        result = []
        for a in alerts_raw:
            result.append({
                "id": a.id,
                "road_id": a.road_id,
                "road_name": a.road.road_name if a.road else "Unknown Corridor",
                "zone": a.road.zone if a.road else "N/A",
                "alert_type": a.alert_type,
                "severity": a.severity,
                "status": a.status,
                "created_at": a.created_at.isoformat() if a.created_at else None
            })
        return result

    @staticmethod
    def resolve_alert(db: Session, alert_id: int):
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return None
        alert.status = "RESOLVED"
        db.commit()
        db.refresh(alert)
        return {
            "id": alert.id,
            "status": alert.status,
            "message": f"Alert #{alert.id} resolved successfully"
        }
