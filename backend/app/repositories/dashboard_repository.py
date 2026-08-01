from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.accident import Accident
from app.models.traffic_alert import TrafficAlert


class DashboardRepository:

    @staticmethod
    def get_summary(db: Session):

        total_accidents = db.query(Accident).count()

        active_alerts = (
            db.query(TrafficAlert)
            .filter(TrafficAlert.is_active == True)
            .count()
        )

        avg_risk = db.query(
            func.avg(Accident.risk_score)
        ).scalar()

        cities = (
            db.query(Accident.city)
            .distinct()
            .count()
        )

        states = (
            db.query(Accident.state)
            .distinct()
            .count()
        )

        return {
            "total_accidents": total_accidents,
            "active_alerts": active_alerts,
            "average_risk_score": round(avg_risk, 2),
            "total_cities": cities,
            "total_states": states
        }

    @staticmethod
    def monthly_trend(db: Session):

        result = (
            db.query(
                func.extract(
                    "month",
                    Accident.date
                ).label("month"),

                func.count(
                    Accident.accident_id
                )
            )
            .group_by("month")
            .order_by("month")
            .all()
        )

        return [
            {
                "month": int(row[0]),
                "total_accidents": row[1]
            }
            for row in result
        ]

    @staticmethod
    def severity_distribution(db: Session):

        result = (
            db.query(
                Accident.accident_severity,
                func.count(Accident.accident_id)
            )
            .group_by(
                Accident.accident_severity
            )
            .all()
        )

        return [
            {
                "accident_severity": row[0],
                "total": row[1]
            }
            for row in result
        ]

    @staticmethod
    def weather_distribution(db: Session):

        result = (
            db.query(
                Accident.weather,
                func.count(Accident.accident_id)
            )
            .group_by(
                Accident.weather
            )
            .all()
        )

        return [
            {
                "weather": row[0],
                "total": row[1]
            }
            for row in result
        ]

    @staticmethod
    def road_type_distribution(db: Session):

        result = (
            db.query(
                Accident.road_type,
                func.count(Accident.accident_id)
            )
            .group_by(
                Accident.road_type
            )
            .all()
        )

        return [
            {
                "road_type": row[0],
                "total": row[1]
            }
            for row in result
        ]

    @staticmethod
    def dangerous_cities(db: Session):

        result = (
            db.query(
                Accident.city,
                func.count(Accident.accident_id),
                func.avg(Accident.risk_score)
            )
            .group_by(
                Accident.city
            )
            .order_by(
                func.avg(
                    Accident.risk_score
                ).desc()
            )
            .limit(10)
            .all()
        )

        return [
            {
                "city": row[0],
                "total_accidents": row[1],
                "average_risk_score": round(row[2], 2)
            }
            for row in result
        ]

    @staticmethod
    def heatmap_data(db: Session):

        result = (
            db.query(
                Accident.latitude,
                Accident.longitude,
                Accident.city,
                Accident.state,
                Accident.risk_score,
                Accident.accident_severity
            )
            .limit(1000)
            .all()
        )

        return [
            {
                "latitude": row[0],
                "longitude": row[1],
                "city": row[2],
                "state": row[3],
                "risk_score": row[4],
                "accident_severity": row[5]
            }
            for row in result
        ]