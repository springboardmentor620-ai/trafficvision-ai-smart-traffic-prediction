from sqlalchemy.orm import Session

from app.models.traffic import Traffic
from app.models.road import Road


class TrafficService:

    @staticmethod
    def get_all(db: Session):

        rows = (

            db.query(Traffic)

            .join(Road)

            .all()

        )

        result = []

        for item in rows:

            result.append({

                "id": item.id,

                "road": item.road.name if item.road else f"Road #{item.road_id}",

                "city": item.road.city if item.road else "Bengaluru",

                "state": item.road.state if item.road else "Karnataka",

                "latitude": item.road.latitude if (item.road and item.road.latitude is not None) else 12.9716,

                "longitude": item.road.longitude if (item.road and item.road.longitude is not None) else 77.5946,

                "status": item.status,

                "vehicles": item.vehicles,

                "average_speed": item.average_speed,

                "speed_limit": (item.road.speed_limit if item.road else None) or 60,

            })

        return result


    @staticmethod
    def get_by_id(db: Session, traffic_id: int):
        return (
            db.query(Traffic)
            .filter(Traffic.id == traffic_id)
            .first()
        )

    @staticmethod
    def create(db: Session, traffic):

        db.add(traffic)

        db.commit()

        db.refresh(traffic)

        return traffic

    @staticmethod
    def delete(db: Session, traffic_id: int):

        road = (
            db.query(Traffic)
            .filter(Traffic.id == traffic_id)
            .first()
        )

        if road:

            db.delete(road)

            db.commit()

        return road

    @staticmethod
    def get_congested(db: Session):

        return (
            db.query(Traffic)
            .filter(Traffic.status == "Heavy")
            .all()
        )

    @staticmethod
    def total_vehicles(db: Session):

        roads = db.query(Traffic).all()

        return sum(r.vehicles for r in roads)

    @staticmethod
    def average_speed(db: Session):

        roads = db.query(Traffic).all()

        if not roads:
            return 0

        return round(
            sum(r.average_speed for r in roads) / len(roads),
            2,
        )