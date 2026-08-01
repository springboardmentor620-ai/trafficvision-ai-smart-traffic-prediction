from sqlalchemy import desc
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.accident import Accident


class DashboardRepository:

    @staticmethod
    def get_summary(db: Session):

        return {

            "total_accidents":
                db.query(Accident).count(),

            "total_states":
                db.query(
                    func.count(
                        func.distinct(
                            Accident.state
                        )
                    )
                ).scalar(),

            "total_cities":
                db.query(
                    func.count(
                        func.distinct(
                            Accident.city
                        )
                    )
                ).scalar(),

            "average_risk_score":
                round(
                    db.query(
                        func.avg(
                            Accident.risk_score
                        )
                    ).scalar(),
                    2
                )

        }

    @staticmethod
    def severity_distribution(db: Session):

        result = (

            db.query(

                Accident.accident_severity,

                func.count()

            )

            .group_by(
                Accident.accident_severity
            )

            .all()

        )

        return [

            {

                "label": row[0],

                "value": row[1]

            }

            for row in result

        ]

    @staticmethod
    def weather_distribution(db: Session):

        result = (

            db.query(

                Accident.weather,

                func.count()

            )

            .group_by(

                Accident.weather

            )

            .all()

        )

        return [

            {

                "label": row[0],

                "value": row[1]

            }

            for row in result

        ]

    @staticmethod
    def traffic_distribution(db: Session):

        result = (

            db.query(

                Accident.traffic_density,

                func.count()

            )

            .group_by(

                Accident.traffic_density

            )

            .all()

        )

        return [

            {

                "label": row[0],

                "value": row[1]

            }

            for row in result

        ]

    @staticmethod
    def top_cities(db: Session):

        result = (

            db.query(

                Accident.city,

                func.count()

            )

            .group_by(

                Accident.city

            )

            .order_by(

                desc(

                    func.count()

                )

            )

            .limit(10)

            .all()

        )

        return [

            {

                "city": row[0],

                "accidents": row[1]

            }

            for row in result

        ]