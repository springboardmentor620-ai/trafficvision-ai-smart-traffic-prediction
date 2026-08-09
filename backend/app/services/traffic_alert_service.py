from sqlalchemy.orm import Session

from app.repositories.traffic_alert_repository import (
    TrafficAlertRepository
)


class TrafficAlertService:

    @staticmethod
    def create(
        db: Session,
        data: dict
    ):

        return TrafficAlertRepository.create(
            db,
            data
        )


    @staticmethod
    def get_all(
        db: Session
    ):

        return TrafficAlertRepository.get_all(
            db
        )


    @staticmethod
    def get_active(
        db: Session
    ):

        return TrafficAlertRepository.get_active(
            db
        )


    @staticmethod
    def deactivate(
        db: Session,
        alert_id: int
    ):

        return TrafficAlertRepository.deactivate(
            db,
            alert_id
        )