from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationService:

    @staticmethod
    def get_all(db: Session):

        return (
            db.query(Notification)
            .order_by(Notification.id.desc())
            .all()
        )


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