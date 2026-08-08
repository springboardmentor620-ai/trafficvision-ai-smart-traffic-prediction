from sqlalchemy.orm import Session

from app.models.alert import Alert

from app.services.notification_service import NotificationService

class AlertService:

    @staticmethod
    def get_alerts(db: Session):
        return (
            db.query(Alert)
            .order_by(Alert.created_at.desc())
            .all()
        )


    @staticmethod
    def resolve_alert(db: Session, alert_id: int):

        alert = db.query(Alert).filter(Alert.id == alert_id).first()

        if not alert:
            return None

        alert.status = "Resolved"

        db.commit()

        db.refresh(alert)

        return alert


    @staticmethod
    def create_alert(

        db: Session,

        road: str,

        congestion: float,

        recommendation: str,

    ):

        severity = (

            "Critical"

            if congestion >= 90

            else "High"

            if congestion >= 70

            else "Medium"

        )

        existing = (

            db.query(Alert)

            .filter(

                Alert.road == road,

                Alert.status == "Active"

            )

            .first()

        )

        if existing:

            return existing

        alert = Alert(

            title="AI Congestion Alert",

            message=recommendation,

            severity=severity,

            road=road,

        )

        db.add(alert)

        db.commit()

        db.refresh(alert)

        NotificationService.create_system_notification(

            db=db,

            title=alert.title,

            message=alert.message,

            notification_type="warning",

        )

        return alert