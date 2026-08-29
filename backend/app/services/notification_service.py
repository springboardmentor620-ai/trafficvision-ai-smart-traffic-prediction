from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationService:

    @staticmethod
    def get_all(db: Session):
        notifications = (
            db.query(Notification)
            .order_by(Notification.id.desc())
            .all()
        )

        if len(notifications) == 0:
            sample_notifications = [
                Notification(
                    title="🚨 Critical Incident: Multi-Vehicle Collision on ORR",
                    message="Two lanes blocked near Marathahalli Bridge. Emergency units dispatched. Detours enabled.",
                    type="warning",
                    is_read=False,
                ),
                Notification(
                    title="⚡ AI Model Retrained: Accuracy Reached 94.8%",
                    message="RandomForest Ensemble model retrained with latest 24-hour sensor telemetry streams.",
                    type="info",
                    is_read=False,
                ),
                Notification(
                    title="🚧 Active Roadwork: Metro Construction at Whitefield",
                    message="Lane 1 closed near ITPL Gate 2 for utility shifting over next 48 hours.",
                    type="warning",
                    is_read=False,
                ),
                Notification(
                    title="🟢 Incident Cleared: Bannerghatta Road Restored",
                    message="Drainage clearance complete at Dairy Circle; corridor returned to normal speed limit.",
                    type="success",
                    is_read=True,
                ),
                Notification(
                    title="📊 Automated Traffic Report Ready",
                    message="24-Hour urban mobility and congestion audit summary has been compiled and is ready for download.",
                    type="info",
                    is_read=True,
                ),
            ]

            for n in sample_notifications:
                db.add(n)
            db.commit()

            notifications = (
                db.query(Notification)
                .order_by(Notification.id.desc())
                .all()
            )

        return notifications


    @staticmethod
    def create(db: Session, notification):

        new_notification = Notification(**notification.dict())

        db.add(new_notification)

        db.commit()

        db.refresh(new_notification)

        return new_notification


    @staticmethod
    def create_system_notification(

        db: Session,

        title: str,

        message: str,

        notification_type: str = "warning",

    ):

        notification = Notification(

            title=title,

            message=message,

            type=notification_type,

        )

        db.add(notification)

        db.commit()

        db.refresh(notification)

        return notification


    @staticmethod
    def mark_read(db: Session, notification_id):

        notification = (
            db.query(Notification)
            .filter(Notification.id == notification_id)
            .first()
        )

        if notification:

            notification.is_read = True

            db.commit()

            db.refresh(notification)

        return notification


    @staticmethod
    def delete(db: Session, notification_id):

        notification = (
            db.query(Notification)
            .filter(Notification.id == notification_id)
            .first()
        )

        if notification:

            db.delete(notification)

            db.commit()

            return True

        return False