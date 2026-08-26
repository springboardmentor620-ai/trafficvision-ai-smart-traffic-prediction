from sqlalchemy.orm import Session

from app.models.traffic_alert import TrafficAlert


class TrafficAlertRepository:

    @staticmethod
    def create(
        db: Session,
        data: dict
    ):

        alert = TrafficAlert(
            **data
        )

        db.add(alert)

        db.commit()

        db.refresh(alert)

        return alert


    @staticmethod
    def get_all(
        db: Session
    ):

        return (

            db.query(
                TrafficAlert
            )

            .order_by(
                TrafficAlert.created_at.desc()
            )

            .all()

        )


    @staticmethod
    def get_active(
        db: Session
    ):

        return (

            db.query(
                TrafficAlert
            )

            .filter(
                TrafficAlert.is_active == True
            )

            .order_by(
                TrafficAlert.created_at.desc()
            )

            .all()

        )


    @staticmethod
    def get_by_id(
        db: Session,
        alert_id: int
    ):

        return (

            db.query(
                TrafficAlert
            )

            .filter(
                TrafficAlert.id == alert_id
            )

            .first()

        )


    @staticmethod
    def deactivate(
        db: Session,
        alert_id: int
    ):

        alert = (

            db.query(
                TrafficAlert
            )

            .filter(
                TrafficAlert.id == alert_id
            )

            .first()

        )


        if alert:

            alert.is_active = False

            db.commit()

            db.refresh(alert)


        return alert


    @staticmethod
    def delete(
        db: Session,
        alert_id: int
    ):

        alert = (

            db.query(
                TrafficAlert
            )

            .filter(
                TrafficAlert.id == alert_id
            )

            .first()

        )


        if alert is None:
            return None


        db.delete(alert)

        db.commit()

        return alert