from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.traffic import Traffic
from app.models.road import Road
from app.models.prediction_history import PredictionHistory


class HistoryService:

    @staticmethod
    def traffic_history(db: Session, limit: int = 100):
        # Query true historical telemetry and prediction time-series records
        history_rows = (
            db.query(PredictionHistory)
            .order_by(PredictionHistory.timestamp.desc())
            .limit(limit)
            .all()
        )

        if history_rows:
            return [
                {
                    "id": h.id,
                    "timestamp": h.timestamp.isoformat() if h.timestamp else None,
                    "road": h.road_name,
                    "name": h.road_name,
                    "area_name": h.area_name,
                    "vehicles": h.traffic_volume,
                    "average_speed": h.average_speed,
                    "weather": h.weather,
                    "roadwork": h.roadwork,
                    "predicted_congestion": h.predicted_congestion,
                    "prediction_level": h.prediction_level,
                    "status": (
                        "Heavy" if (h.average_speed and h.average_speed < 25)
                        else ("Moderate" if (h.average_speed and h.average_speed < 45) else "Normal")
                    ),
                    "recommended_action": h.recommended_action,
                }
                for h in history_rows
            ]

        # Fallback to current traffic snapshot if no historical records exist yet
        roads = db.query(Traffic).join(Road).all()
        return [
            {
                "road": road.road.name if road.road else f"Road #{road.road_id}",
                "name": road.road.name if road.road else f"Road #{road.road_id}",
                "vehicles": road.vehicles,
                "average_speed": road.average_speed,
                "status": road.status,
            }
            for road in roads
        ]


    @staticmethod
    def summary(db: Session):

        roads = db.query(Traffic).all()

        total = len(roads)

        if total == 0:

            return {

                "average_speed": 0,

                "average_vehicles": 0,

            }

        return {

            "average_speed":

                round(

                    sum(

                        road.average_speed

                        for road in roads

                    ) / total,

                    2,

                ),

            "average_vehicles":

                round(

                    sum(

                        road.vehicles

                        for road in roads

                    ) / total,

                    2,

                ),

        }

    @staticmethod
    def status_distribution(db: Session):

        results = (
            db.query(
                Traffic.status,
                func.count(Traffic.id)
            )
            .group_by(Traffic.status)
            .all()
        )

        return [
            {
                "status": status,
                "count": count,
            }
            for status, count in results
        ]