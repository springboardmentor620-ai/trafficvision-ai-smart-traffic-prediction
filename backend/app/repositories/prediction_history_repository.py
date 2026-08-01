from datetime import date
from typing import Optional

from sqlalchemy.orm import Session

from app.models.prediction_history import PredictionHistory


class PredictionHistoryRepository:

    @staticmethod
    def create(
        db: Session,
        data: dict
    ):

        history = PredictionHistory(**data)

        db.add(history)

        db.commit()

        db.refresh(history)

        return history

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

        query = db.query(PredictionHistory)

        if city:

            query = query.filter(
                PredictionHistory.city.ilike(f"%{city}%")
            )

        if severity:

            query = query.filter(
                PredictionHistory.predicted_severity == severity
            )

        if from_date:

            query = query.filter(
                PredictionHistory.created_at >= from_date
            )

        if to_date:

            query = query.filter(
                PredictionHistory.created_at <= to_date
            )

        total = query.count()

        records = (

            query

            .order_by(
                PredictionHistory.created_at.desc()
            )

            .offset(
                (page - 1) * limit
            )

            .limit(limit)

            .all()

        )

        return {

            "total": total,

            "page": page,

            "limit": limit,

            "data": records

        }

    @staticmethod
    def get_by_id(
        db: Session,
        history_id: int
    ):

        return (

            db.query(PredictionHistory)

            .filter(
                PredictionHistory.id == history_id
            )

            .first()

        )

    @staticmethod
    def delete(
        db: Session,
        history_id: int
    ):

        history = PredictionHistoryRepository.get_by_id(
            db,
            history_id
        )

        if history:

            db.delete(history)

            db.commit()

        return history

    @staticmethod
    def delete_all(
        db: Session
    ):

        deleted = db.query(
            PredictionHistory
        ).delete()

        db.commit()

        return deleted