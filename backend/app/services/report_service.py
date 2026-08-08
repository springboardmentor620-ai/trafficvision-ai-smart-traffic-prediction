from datetime import datetime

from sqlalchemy.orm import Session

from app.models.traffic import Traffic


class ReportService:

    @staticmethod
    def generate_report(db: Session):

        roads = db.query(Traffic).all()

        total_roads = len(roads)

        total_vehicles = sum(r.vehicles for r in roads)

        avg_speed = (
            sum(r.average_speed for r in roads) / total_roads
            if total_roads
            else 0
        )

        heavy = len(
            [r for r in roads if r.status == "Heavy"]
        )

        moderate = len(
            [r for r in roads if r.status == "Moderate"]
        )

        normal = len(
            [r for r in roads if r.status == "Normal"]
        )

        return {

            "generated_at": datetime.now(),

            "summary": {

                "roads": total_roads,

                "vehicles": total_vehicles,

                "average_speed": round(avg_speed, 2),

                "heavy": heavy,

                "moderate": moderate,

                "normal": normal,

            },

            "roads": roads,

        }