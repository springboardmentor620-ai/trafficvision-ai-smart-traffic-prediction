from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.traffic import TrafficRecord


def get_travel_time(
    db: Session,
    traffic_id: int,
    user_id: int
):
    record = (
        db.query(TrafficRecord)
        .filter(
            TrafficRecord.id == traffic_id,
            TrafficRecord.user_id == user_id
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Traffic record not found"
        )

    # Assume every road segment is 10 km
    distance = 10

    if record.average_speed <= 0:
        estimated_time = 0
    else:
        estimated_time = (distance / record.average_speed) * 60

    return {
        "road_name": record.road_name,
        "average_speed": record.average_speed,
        "estimated_time_minutes": round(estimated_time, 2)
    }

def get_alternate_routes(
    db: Session,
    user_id: int
):
    routes = (
        db.query(TrafficRecord)
        .filter(
            TrafficRecord.user_id == user_id,
            TrafficRecord.congestion_level != "High"
        )
        .order_by(TrafficRecord.vehicle_count.asc())
        .limit(5)
        .all()
    )

    return [
        {
            "road_name": route.road_name,
            "location": route.location,
            "congestion_level": route.congestion_level,
            "vehicle_count": route.vehicle_count
        }
        for route in routes
    ]

def get_road_conditions(
    db: Session,
    user_id: int
):
    roads = (
        db.query(TrafficRecord)
        .filter(
            TrafficRecord.user_id == user_id
        )
        .all()
    )

    result = []

    for road in roads:

        if (
            road.average_speed > 60
            and road.congestion_level == "Low"
        ):
            condition = "Good"

        elif (
            road.average_speed >= 30
            and road.congestion_level == "Medium"
        ):
            condition = "Moderate"

        else:
            condition = "Poor"

        result.append(
            {
                "road_name": road.road_name,
                "location": road.location,
                "average_speed": road.average_speed,
                "congestion_level": road.congestion_level,
                "road_condition": condition
            }
        )

    return result