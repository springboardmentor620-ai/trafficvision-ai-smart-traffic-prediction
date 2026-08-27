from datetime import datetime

from sqlalchemy.orm import Session

from app.models.traffic import Traffic
from app.models.road import Road


class ReportService:

    @staticmethod
    def generate_report(db: Session):

        rows = (
            db.query(Traffic)
            .join(Road)
            .order_by(Traffic.id)
            .all()
        )

        total_roads = len(rows)

        total_vehicles = sum(r.vehicles for r in rows)

        avg_speed = (
            sum(r.average_speed for r in rows) / total_roads
            if total_roads
            else 0
        )

        heavy = len(
            [r for r in rows if r.status == "Heavy"]
        )

        moderate = len(
            [r for r in rows if r.status == "Moderate"]
        )

        normal = len(
            [r for r in rows if r.status == "Normal"]
        )

        roads_data = []
        for r in rows:
            road_name = r.road.name if r.road else f"Corridor #{r.road_id}"
            city = r.road.city if r.road else "Bengaluru"
            state = r.road.state if r.road else "Karnataka"
            speed_limit = r.road.speed_limit if (r.road and r.road.speed_limit) else 60
            lat = r.road.latitude if (r.road and r.road.latitude) else 12.9716
            lng = r.road.longitude if (r.road and r.road.longitude) else 77.5946

            roads_data.append({
                "id": r.id,
                "road_id": r.road_id,
                "road": road_name,
                "name": road_name,
                "city": city,
                "state": state,
                "status": r.status,
                "vehicles": r.vehicles,
                "average_speed": r.average_speed,
                "speed_limit": speed_limit,
                "latitude": lat,
                "longitude": lng,
            })

        return {

            "generated_at": datetime.now().isoformat(),

            "summary": {

                "roads": total_roads,

                "vehicles": total_vehicles,

                "average_speed": round(avg_speed, 2),

                "heavy": heavy,

                "moderate": moderate,

                "normal": normal,

            },

            "roads": roads_data,

        }