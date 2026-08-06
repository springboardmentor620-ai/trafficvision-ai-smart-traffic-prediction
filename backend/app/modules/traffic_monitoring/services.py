import random
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.modules.traffic_monitoring.models import Road, TrafficReading, CongestionLevel


def calculate_congestion_level(vehicle_count: int, capacity: int) -> CongestionLevel:
    """
    Converts a vehicle count into a congestion level based on how full
    the road is relative to its capacity.
    < 40%  -> low
    40-70% -> moderate
    70-90% -> high
    > 90%  -> severe
    """
    if capacity <= 0:
        return CongestionLevel.LOW

    ratio = vehicle_count / capacity
    if ratio < 0.4:
        return CongestionLevel.LOW
    elif ratio < 0.7:
        return CongestionLevel.MODERATE
    elif ratio < 0.9:
        return CongestionLevel.HIGH
    else:
        return CongestionLevel.SEVERE


def create_road(db: Session, name: str, zone: str | None, latitude: float | None,
                 longitude: float | None, capacity: int) -> Road:
    road = Road(name=name, zone=zone, latitude=latitude, longitude=longitude, capacity=capacity)
    db.add(road)
    db.commit()
    db.refresh(road)
    return road


def get_all_roads(db: Session) -> list[Road]:
    return db.query(Road).all()


def get_road_by_id(db: Session, road_id: int) -> Road | None:
    return db.query(Road).filter(Road.id == road_id).first()


def record_traffic_reading(db: Session, road_id: int, vehicle_count: int, avg_speed_kmph=None) -> TrafficReading:
    road = get_road_by_id(db, road_id)
    if not road:
        raise ValueError("Road not found")
    level = calculate_congestion_level(vehicle_count, road.capacity)
    reading = TrafficReading(road_id=road_id, vehicle_count=vehicle_count, avg_speed_kmph=avg_speed_kmph, congestion_level=level)
    db.add(reading)
    db.commit()
    db.refresh(reading)

    # Auto-raise a congestion alert if this reading is severe.
    from app.modules.alerts.services import maybe_create_congestion_alert
    maybe_create_congestion_alert(db, road, reading)

    return reading


def get_latest_reading_per_road(db: Session) -> dict[int, TrafficReading]:
    """
    Returns the most recent TrafficReading for each road, keyed by road_id.
    Used to build the live monitoring snapshot.
    """
    # Subquery: latest recorded_at timestamp per road
    latest_ids_subq = (
        db.query(
            TrafficReading.road_id,
            func.max(TrafficReading.recorded_at).label("max_recorded_at"),
        )
        .group_by(TrafficReading.road_id)
        .subquery()
    )

    latest_readings = (
        db.query(TrafficReading)
        .join(
            latest_ids_subq,
            (TrafficReading.road_id == latest_ids_subq.c.road_id)
            & (TrafficReading.recorded_at == latest_ids_subq.c.max_recorded_at),
        )
        .all()
    )

    return {r.road_id: r for r in latest_readings}


def get_reading_history(db: Session, road_id: int, limit: int = 50) -> list[TrafficReading]:
    return (
        db.query(TrafficReading)
        .filter(TrafficReading.road_id == road_id)
        .order_by(TrafficReading.recorded_at.desc())
        .limit(limit)
        .all()
    )


def simulate_readings_for_all_roads(db: Session) -> list[TrafficReading]:
    """
    Development helper: generates a random-but-plausible vehicle count for
    every road, so the dashboard has live data to show before real
    sensors/CCTV feeds are integrated.
    """
    roads = get_all_roads(db)
    readings = []
    for road in roads:
        # Random vehicle count somewhere between 5% and 110% of capacity,
        # so we occasionally see "severe" congestion too.
        vehicle_count = int(random.uniform(0.05, 1.1) * road.capacity)
        avg_speed = round(random.uniform(8, 60), 1)
        readings.append(record_traffic_reading(db, road.id, vehicle_count, avg_speed))
    return readings
def get_road_utilization(db: Session) -> list[dict]:
    """
    Road utilization analysis: how full each road is relative to its
    capacity, based on its most recent reading. Ranked highest-utilization
    first, so the most strained roads surface at the top.
    """
    roads = get_all_roads(db)
    latest_by_road = get_latest_reading_per_road(db)

    utilization = []
    for road in roads:
        reading = latest_by_road.get(road.id)
        vehicle_count = reading.vehicle_count if reading else 0
        utilization_percent = round((vehicle_count / road.capacity) * 100, 1) if road.capacity else 0.0

        utilization.append({
            "road_id": road.id,
            "road_name": road.name,
            "zone": road.zone,
            "capacity": road.capacity,
            "vehicle_count": vehicle_count,
            "utilization_percent": utilization_percent,
            "congestion_level": reading.congestion_level if reading else None,
        })

    utilization.sort(key=lambda r: r["utilization_percent"], reverse=True)
    return utilization