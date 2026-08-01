from sqlalchemy import asc
from sqlalchemy import desc
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.accident import Accident


class AccidentRepository:

    @staticmethod
    def get_all(
        db: Session,
        page: int,
        limit: int,
        search: str | None = None,
        weather: str | None = None,
        severity: str | None = None,
        traffic_density: str | None = None,
        road_type: str | None = None,
        sort_by: str = "accident_id",
        order: str = "asc",
    ):

        query = db.query(Accident)

        if search:
            query = query.filter(
                or_(
                    Accident.city.ilike(f"%{search}%"),
                    Accident.state.ilike(f"%{search}%"),
                    Accident.cause.ilike(f"%{search}%")
                )
            )

        if weather:
            query = query.filter(
                Accident.weather == weather
            )

        if severity:
            query = query.filter(
                Accident.accident_severity == severity
            )

        if traffic_density:
            query = query.filter(
                Accident.traffic_density == traffic_density
            )

        if road_type:
            query = query.filter(
                Accident.road_type == road_type
            )

        total = query.count()

        column = getattr(
            Accident,
            sort_by,
            Accident.accident_id
        )

        if order.lower() == "desc":
            query = query.order_by(desc(column))
        else:
            query = query.order_by(asc(column))

        records = (
            query
            .offset((page - 1) * limit)
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
        accident_id: int
    ):
        return (
            db.query(Accident)
            .filter(
                Accident.accident_id == accident_id
            )
            .first()
        )