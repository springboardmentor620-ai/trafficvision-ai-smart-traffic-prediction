import math
from sqlalchemy.orm import Session

from app.modules.traffic_monitoring.models import Road, CongestionLevel
from app.modules.traffic_monitoring.services import get_road_by_id, get_all_roads, get_latest_reading_per_road

SPEED_BY_LEVEL = {
    CongestionLevel.LOW: 45.0,
    CongestionLevel.MODERATE: 30.0,
    CongestionLevel.HIGH: 15.0,
    CongestionLevel.SEVERE: 8.0,
}
DEFAULT_SPEED_KMPH = 25.0

LEVEL_RANK = {
    CongestionLevel.LOW: 0,
    CongestionLevel.MODERATE: 1,
    CongestionLevel.HIGH: 2,
    CongestionLevel.SEVERE: 3,
}


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def _bottleneck_level(level_a, level_b):
    if level_a is None:
        return level_b
    if level_b is None:
        return level_a
    return level_a if LEVEL_RANK[level_a] >= LEVEL_RANK[level_b] else level_b


def _speed_for_level(level) -> float:
    return SPEED_BY_LEVEL[level] if level else DEFAULT_SPEED_KMPH


def _build_leg(from_road: Road, to_road: Road, latest_readings: dict) -> dict:
    distance_km = haversine_km(from_road.latitude, from_road.longitude, to_road.latitude, to_road.longitude)

    from_reading = latest_readings.get(from_road.id)
    to_reading = latest_readings.get(to_road.id)
    from_level = from_reading.congestion_level if from_reading else None
    to_level = to_reading.congestion_level if to_reading else None

    speed = round((_speed_for_level(from_level) + _speed_for_level(to_level)) / 2, 1)
    level = _bottleneck_level(from_level, to_level)
    time_minutes = (distance_km / speed) * 60 if speed > 0 else 0.0

    return {
        "from_road_id": from_road.id,
        "from_road_name": from_road.name,
        "to_road_id": to_road.id,
        "to_road_name": to_road.name,
        "distance_km": round(distance_km, 2),
        "congestion_level": level,
        "estimated_speed_kmph": speed,
        "estimated_time_minutes": round(time_minutes, 1),
    }


def _build_route(label: str, legs: list[dict]) -> dict:
    return {
        "label": label,
        "legs": legs,
        "total_distance_km": round(sum(l["distance_km"] for l in legs), 2),
        "total_time_minutes": round(sum(l["estimated_time_minutes"] for l in legs), 1),
    }


def get_route_recommendation(db: Session, origin_id: int, destination_id: int, max_alternates: int = 2) -> dict | None:
    origin = get_road_by_id(db, origin_id)
    destination = get_road_by_id(db, destination_id)
    if not origin or not destination:
        return None
    if origin.latitude is None or origin.longitude is None:
        return {"error": f"'{origin.name}' has no coordinates set yet."}
    if destination.latitude is None or destination.longitude is None:
        return {"error": f"'{destination.name}' has no coordinates set yet."}

    latest_readings = get_latest_reading_per_road(db)
    all_roads = [r for r in get_all_roads(db) if r.id not in (origin_id, destination_id) and r.latitude is not None]

    direct_leg = _build_leg(origin, destination, latest_readings)
    direct_route = _build_route("Direct", [direct_leg])

    candidates = []
    for via in all_roads:
        leg1 = _build_leg(origin, via, latest_readings)
        leg2 = _build_leg(via, destination, latest_readings)
        candidates.append(_build_route(f"Via {via.name}", [leg1, leg2]))

    candidates.sort(key=lambda r: r["total_time_minutes"])
    alternates = candidates[:max_alternates]

    all_options = [direct_route] + alternates
    best = min(all_options, key=lambda r: r["total_time_minutes"])

    if best["label"] == "Direct":
        reason = f"Direct route is fastest at {best['total_time_minutes']} min."
    else:
        saved = round(direct_route["total_time_minutes"] - best["total_time_minutes"], 1)
        reason = (
            f"Direct route is congested ({direct_leg['congestion_level'].value if direct_leg['congestion_level'] else 'unknown'} "
            f"congestion) — routing {best['label'].lower()} saves an estimated {saved} min."
        )

    return {
        "origin_road_id": origin.id,
        "origin_road_name": origin.name,
        "destination_road_id": destination.id,
        "destination_road_name": destination.name,
        "direct": direct_route,
        "alternates": alternates,
        "recommended_label": best["label"],
        "reason": reason,
    }