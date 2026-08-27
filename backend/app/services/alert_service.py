from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.services.notification_service import NotificationService
from app.services.email_service import EmailService

class AlertService:

    @staticmethod
    def get_alerts(db: Session):
        alerts = (
            db.query(Alert)
            .order_by(Alert.created_at.desc())
            .all()
        )

        if len(alerts) == 0:
            sample_alerts = [
                Alert(
                    title="Multi-Vehicle Collision on Outer Ring Road",
                    message="Two-vehicle collision blocking center lanes near Marathahalli flyover. Emergency response active. Detour recommended via Old Airport Road.",
                    severity="Critical",
                    road="Outer Ring Road",
                    alert_type="Incident",
                    status="Active",
                ),
                Alert(
                    title="Severe Peak Surge & Bottleneck at Silk Board",
                    message="High traffic congestion on Hosur Road heading towards Electronic City. Delay ~25 mins. Dynamic signal green cycle extended by 30s.",
                    severity="High",
                    road="Hosur Road",
                    alert_type="Congestion",
                    status="Active",
                ),
                Alert(
                    title="Metro Rail Phase 3 Construction Lane Restriction",
                    message="Left carriage lane closed for foundation drilling near ITPL Gate 2. Max corridor speed restricted to 25 km/h.",
                    severity="Medium",
                    road="Whitefield Main Road",
                    alert_type="Roadwork",
                    status="Active",
                ),
                Alert(
                    title="Commercial Density Surge on 100 Feet Road",
                    message="High pedestrian and customer vehicle density around 12th Main junction. Use CMH Road for faster cross-town transit.",
                    severity="High",
                    road="100 Feet Road",
                    alert_type="Congestion",
                    status="Active",
                ),
                Alert(
                    title="VIP Transit Protocol Active on Bellary Road",
                    message="Rolling priority movement en route to KIA Airport. Temporary lane priority active between Hebbal and Yelahanka.",
                    severity="Critical",
                    road="Bellary Road (Airport Link)",
                    alert_type="Emergency",
                    status="Active",
                ),
                Alert(
                    title="Waterlogging Clearance Completed on Bannerghatta Road",
                    message="Storm drainage maintenance successfully completed near Dairy Circle. Normal multi-lane vehicular flow fully restored.",
                    severity="Low",
                    road="Bannerghatta Road",
                    alert_type="Congestion",
                    status="Resolved",
                ),
            ]

            for a in sample_alerts:
                db.add(a)
            db.commit()

            alerts = (
                db.query(Alert)
                .order_by(Alert.created_at.desc())
                .all()
            )

        return alerts


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
        alert_type: str = "Congestion",
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
            title=f"AI {alert_type} Alert",
            message=recommendation,
            severity=severity,
            road=road,
            alert_type=alert_type,
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

        # Asynchronously dispatch email alert for Critical & High severity events
        if severity in ("Critical", "High"):
            EmailService.send_alert_email_async(
                title=alert.title,
                message=alert.message,
                severity=alert.severity,
                road=alert.road,
                alert_type=alert.alert_type,
            )

        return alert