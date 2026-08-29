from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.traffic import Traffic
from app.models.road import Road


class HistoryService:

    @staticmethod
    def traffic_history(db: Session):

        roads = db.query(Traffic).join(Road).all()

        history = []

        for road in roads:
            road_name = road.road.name if road.road else f"Road #{road.road_id}"
            history.append({

                "road": road_name,
                "name": road_name,

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