"""
Route Analysis Module (Milestone 2, Week 3-4).

Uses free, no-API-key OpenStreetMap services — per your explicit choice to
use OpenStreetMap rather than the paid Google Maps API:

- Nominatim (https://nominatim.openstreetmap.org) for geocoding — turning a
  place name/address into latitude/longitude.
- OSRM (http://router.project-osrm.org) — the OpenStreetMap Routing Machine's
  public demo server — for actual driving routes: distance, duration, turn
  geometry, and alternate routes.

Both are free public demo services with no signup required. They are rate
limited and intended for evaluation/demo use, not production traffic — for a
production deployment you'd run your own OSRM instance (this is a normal,
well-known tradeoff, not a bug).

IMPORTANT — please read before assuming this "just works": this module makes
outbound network calls to the two domains above. The development sandbox
this project was built in has a restricted network allowlist that does NOT
include these OSM domains, so unlike everything else in this project, the
actual live network calls here could NOT be integration-tested end-to-end.
The request/response handling matches OSRM's and Nominatim's stable,
documented public APIs, and there is defensive error handling for
timeouts/failures (confirmed: a blocked/unreachable service returns a clean
error, not a crash) — but you must do a real smoke test yourself once running
with actual internet access. See the README for the exact command to try.

Route Optimization / travel time estimation with congestion awareness:
OSRM gives a baseline "free-flow" duration. We scale that estimate using
whichever of our OWN monitored roads (if any) sit near the origin/destination,
using their current live congestion_level — this is the part that makes the
estimate "smart" rather than just forwarding OSRM's raw number.
"""
from datetime import datetime, timedelta

import requests
from sqlalchemy.orm import Session

from . import models

NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
OSRM_BASE = "http://router.project-osrm.org"
REQUEST_TIMEOUT_SECONDS = 8

# Multiplier applied to OSRM's free-flow duration based on nearby congestion.
CONGESTION_TIME_MULTIPLIER = {
    "low": 1.0,
    "medium": 1.3,
    "high": 1.8,
}

# A road counts as "near" a route endpoint within this distance (degrees,
# roughly ~5-6 km at these latitudes) for congestion-aware time estimation.
NEARBY_THRESHOLD_DEGREES = 0.05


def geocode(query: str) -> list[dict]:
    """Turn a place name / address into coordinates using Nominatim."""
    try:
        resp = requests.get(
            f"{NOMINATIM_BASE}/search",
            params={"q": query, "format": "json", "limit": 3},
            headers={"User-Agent": "TrafficVisionAI/1.0 (student project)"},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        resp.raise_for_status()
        results = resp.json()
    except requests.RequestException as e:
        raise ValueError(f"Geocoding service unavailable: {e}")

    if not results:
        raise ValueError(f"No location found for '{query}'")

    return [
        {"display_name": r["display_name"], "latitude": float(r["lat"]), "longitude": float(r["lon"])}
        for r in results
    ]


def _nearest_road_with_congestion(db: Session, lat: float, lon: float):
    """Find whichever monitored road is closest to a point (within threshold)
    and return (road, congestion_level), so route time estimates reflect OUR
    live data, not just OSRM's static routing graph. Returns (None, None) if
    no monitored road is nearby."""
    roads = (
        db.query(models.Road)
        .filter(models.Road.latitude.isnot(None), models.Road.longitude.isnot(None))
        .all()
    )
    best_road = None
    best_dist = NEARBY_THRESHOLD_DEGREES
    for road in roads:
        dist = ((road.latitude - lat) ** 2 + (road.longitude - lon) ** 2) ** 0.5
        if dist < best_dist:
            best_dist = dist
            best_road = road

    if not best_road:
        return None, None

    latest = (
        db.query(models.TrafficReading)
        .filter(models.TrafficReading.road_id == best_road.id)
        .order_by(models.TrafficReading.recorded_at.desc())
        .first()
    )
    return best_road, (latest.congestion_level if latest else None)


# Route-delay alerts are only worth raising for medium/high congestion, and
# only once per road within this cooldown window, so that repeatedly
# planning routes through the same jam doesn't spam duplicate alerts.
ROUTE_DELAY_ALERT_COOLDOWN_MINUTES = 15


def _raise_route_delay_alert_if_needed(db: Session, road, level: str, extra_minutes: float) -> None:
    """Route delay warnings: when a planned route passes near one of our own
    monitored roads that's currently medium/high congestion, raise a
    route_delay alert for it — unless one was already raised recently."""
    if level not in ("medium", "high") or road is None:
        return

    cooldown_cutoff = datetime.utcnow() - timedelta(minutes=ROUTE_DELAY_ALERT_COOLDOWN_MINUTES)
    recent = (
        db.query(models.Alert)
        .filter(
            models.Alert.road_id == road.id,
            models.Alert.alert_type == models.AlertTypeEnum.route_delay,
            models.Alert.status != models.AlertStatusEnum.resolved,
            models.Alert.created_at >= cooldown_cutoff,
        )
        .first()
    )
    if recent:
        return

    db.add(
        models.Alert(
            road_id=road.id,
            alert_type=models.AlertTypeEnum.route_delay,
            severity=level,
            message=(
                f"Route delay warning: routes near {road.name} are running "
                f"~{round(extra_minutes)} min slower than free-flow due to "
                f"{level} congestion."
            ),
            status=models.AlertStatusEnum.active,
        )
    )
    db.commit()


def plan_route(
    db: Session,
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float,
) -> dict:
    """Route optimization + alternate route suggestions + travel time estimation.
    Queries OSRM for the route(s), then adjusts the duration estimate using our
    own live congestion data for whichever monitored road is nearest the route.
    """
    coords = f"{origin_lon},{origin_lat};{dest_lon},{dest_lat}"
    try:
        resp = requests.get(
            f"{OSRM_BASE}/route/v1/driving/{coords}",
            params={"alternatives": "true", "overview": "full", "geometries": "geojson"},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as e:
        raise ValueError(f"Routing service unavailable: {e}")

    if data.get("code") != "Ok" or not data.get("routes"):
        raise ValueError(f"No route found between the given points (OSRM response: {data.get('code')})")

    # Congestion near either endpoint informs the travel-time adjustment.
    origin_road, origin_level = _nearest_road_with_congestion(db, origin_lat, origin_lon)
    dest_road, dest_level = _nearest_road_with_congestion(db, dest_lat, dest_lon)

    # Pick whichever endpoint is worse to drive both the time-multiplier and
    # (if applicable) the route_delay alert attribution.
    worst_level = "low"
    worst_road = None
    for road, level in ((origin_road, origin_level), (dest_road, dest_level)):
        if not level:
            continue
        if level == "high" and worst_level != "high":
            worst_level, worst_road = "high", road
        elif level == "medium" and worst_level == "low":
            worst_level, worst_road = "medium", road
    multiplier = CONGESTION_TIME_MULTIPLIER[worst_level]

    routes = []
    for i, route in enumerate(data["routes"]):
        base_duration_min = route["duration"] / 60
        routes.append(
            {
                "route_index": i,
                "label": "Primary route" if i == 0 else f"Alternate route {i}",
                "distance_km": round(route["distance"] / 1000, 2),
                "base_duration_minutes": round(base_duration_min, 1),
                "congestion_adjusted_duration_minutes": round(base_duration_min * multiplier, 1),
                "congestion_factor_applied": worst_level,
                "geometry": route["geometry"],  # GeoJSON LineString, for map display
            }
        )

    recommended_index = min(
        range(len(routes)), key=lambda i: routes[i]["congestion_adjusted_duration_minutes"]
    )
    recommended = routes[recommended_index]
    extra_minutes = recommended["congestion_adjusted_duration_minutes"] - recommended["base_duration_minutes"]
    _raise_route_delay_alert_if_needed(db, worst_road, worst_level, extra_minutes)

    return {
        "origin": {"latitude": origin_lat, "longitude": origin_lon},
        "destination": {"latitude": dest_lat, "longitude": dest_lon},
        "routes": routes,
        "recommended_route_index": recommended_index,
    }
