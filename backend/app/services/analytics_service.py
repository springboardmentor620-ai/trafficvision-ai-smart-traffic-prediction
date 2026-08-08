from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.traffic import Traffic


class AnalyticsService:

    @staticmethod
    def dashboard_summary(db: Session):

        roads = db.query(Traffic).all()

        total_roads = len(roads)

        total_vehicles = sum(r.vehicles for r in roads)

        average_speed = (
            sum(r.average_speed for r in roads) / total_roads
            if total_roads
            else 0
        )

        heavy = len([r for r in roads if r.status == "Heavy"])
        moderate = len([r for r in roads if r.status == "Moderate"])
        normal = len([r for r in roads if r.status == "Normal"])

        return {
            "total_roads": total_roads,
            "total_vehicles": total_vehicles,
            "average_speed": round(average_speed, 2),
            "heavy_congestion": heavy,
            "moderate_congestion": moderate,
            "normal_traffic": normal,
        }

    @staticmethod
    def congestion_distribution(db: Session):

        rows = (
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
                "count": count
            }
            for status, count in rows
        ]

    @staticmethod
    def busiest_roads(db: Session):

        return (
            db.query(Traffic)
            .order_by(Traffic.vehicles.desc())
            .limit(10)
            .all()
        )

    @staticmethod
    def fastest_roads(db: Session):

        return (
            db.query(Traffic)
            .order_by(Traffic.average_speed.desc())
            .limit(10)
            .all()
        )

    @staticmethod
    def traffic_trend(db: Session):

        roads = (
            db.query(Traffic)
            .order_by(Traffic.id)
            .all()
        )

        trend = []

        for index, road in enumerate(roads, start=1):
            trend.append({
                "label": f"Road {index}",
                "vehicles": road.vehicles,
            })

        return trend

    @staticmethod
    def ai_insights(db: Session):

        roads = db.query(Traffic).all()

        insights = []

        heavy = [r for r in roads if r.status == "Heavy"]

        if heavy:
            insights.append(
                f"{len(heavy)} roads are experiencing heavy congestion."
            )

        busiest = max(roads, key=lambda x: x.vehicles)

        insights.append(
            f"{busiest.road} is currently the busiest road with {busiest.vehicles} vehicles."
        )

        fastest = max(roads, key=lambda x: x.average_speed)

        insights.append(
            f"{fastest.road} has the highest average speed of {fastest.average_speed} km/h."
        )

        avg = sum(r.average_speed for r in roads) / len(roads)

        if avg < 30:
            insights.append(
                "Overall traffic flow is slow. Consider rerouting vehicles."
            )
        else:
            insights.append(
                "Traffic conditions are generally stable."
            )

        return insights