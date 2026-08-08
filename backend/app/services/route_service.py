from sqlalchemy.orm import Session

from app.models.traffic import Traffic


class RouteService:

    @staticmethod
    def optimize_route(
        db: Session,
        source: str,
        destination: str,
    ):

        roads = (
            db.query(Traffic)
            .order_by(
                Traffic.average_speed.desc(),
                Traffic.vehicles.asc(),
            )
            .limit(5)
            .all()
        )

        return {
            "source": source,
            "destination": destination,
            "recommended_route": [
                road.road for road in roads
            ],
            "estimated_time": "18 mins",
            "distance": "9.4 km",
        }