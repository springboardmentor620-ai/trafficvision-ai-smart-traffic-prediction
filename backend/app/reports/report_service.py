from sqlalchemy.orm import Session

from app.models.accident import Accident
from app.models.prediction_history import PredictionHistory
from app.models.traffic_alert import TrafficAlert


class ReportService:

    @staticmethod
    def dashboard_summary(db: Session):

        return {

            "total_accidents": db.query(
                Accident
            ).count(),

            "total_predictions": db.query(
                PredictionHistory
            ).count(),

            "total_alerts": db.query(
                TrafficAlert
            ).count(),

            "active_alerts": db.query(
                TrafficAlert
            ).filter(
                TrafficAlert.is_active == True
            ).count()

        }

    @staticmethod
    def accident_data(db: Session):

        return (

            db.query(Accident)

            .order_by(
                Accident.accident_id
            )

            .all()

        )

    @staticmethod
    def prediction_history(db: Session):

        return (

            db.query(PredictionHistory)

            .order_by(
                PredictionHistory.created_at.desc()
            )

            .all()

        )

    @staticmethod
    def traffic_alerts(db: Session):

        return (

            db.query(TrafficAlert)

            .order_by(
                TrafficAlert.created_at.desc()
            )

            .all()

        )