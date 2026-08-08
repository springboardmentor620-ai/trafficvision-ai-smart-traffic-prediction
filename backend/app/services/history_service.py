from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.traffic import Traffic


class HistoryService:

    @staticmethod
    def traffic_history(db: Session):

        roads = db.query(Traffic).all()

        history = []

        for road in roads:

            history.append({

                "road": road.road,

                "vehicles": road.vehicles,

                "average_speed": road.average_speed,

                "status": road.status,

            })

        return history

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