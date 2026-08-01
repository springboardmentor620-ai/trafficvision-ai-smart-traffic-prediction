from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.repositories.prediction_history_repository import (
    PredictionHistoryRepository,
)


class PredictionHistoryService:

    @staticmethod
    def create(
        db: Session,
        data: dict
    ):

        return PredictionHistoryRepository.create(
            db,
            data
        )

    @staticmethod
    def get_all(
        db: Session,
        page: int = 1,
        limit: int = 10,
        city: Optional[str] = None,
        severity: Optional[str] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ):

        return PredictionHistoryRepository.get_all(
            db=db,
            page=page,
            limit=limit,
            city=city,
            severity=severity,
            from_date=from_date,
            to_date=to_date,
        )

    @staticmethod
    def get_by_id(
        db: Session,
        history_id: int
    ):

        return PredictionHistoryRepository.get_by_id(
            db,
            history_id
        )

    @staticmethod
    def delete(
        db: Session,
        history_id: int
    ):

        return PredictionHistoryRepository.delete(
            db,
            history_id
        )

    @staticmethod
    def delete_all(
        db: Session
    ):

        return PredictionHistoryRepository.delete_all(
            db
        )