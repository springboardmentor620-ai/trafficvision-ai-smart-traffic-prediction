import json
import logging
import time
from functools import lru_cache
from threading import Lock
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException

from core.config import settings
from services.location_service import locations
from services.traffic_service import traffic_data

logger = logging.getLogger(__name__)
_geocoding_lock = Lock()
_last_geocoding_request = 0.0


def _request_json(url, headers=None):
    try:
        with urlopen(Request(url, headers=headers or {}), timeout=settings.request_timeout_seconds) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
        logger.warning("Routing provider request failed: %s", error)
        raise HTTPException(status_code=503, detail="Routing service is temporarily unavailable.") from error


def _throttle_geocoding():
    global _last_geocoding_request
    with _geocoding_lock:
        wait_time = 1 - (time.monotonic() - _last_geocoding_request)
        if wait_time > 0:
            time.sleep(wait_time)
        _last_geocoding_request = time.monotonic()


@lru_cache(maxsize=256)
def _geocode(road, area):
    _throttle_geocoding()
    query = urlencode({"q": f"{road}, {area}, Bengaluru, India", "format": "jsonv2", "limit": 1})
    data = _request_json(f"{settings.geocoding_url}/search?{query}", {"User-Agent": settings.geocoding_user_agent})
    return {"lat": float(data[0]["lat"]), "lng": float(data[0]["lon"])} if data else None


def _resolve_location(area, road):
    try:
        location = _geocode(road, area)
        if location:
            return location, None
    except HTTPException as error:
        logger.info("Geocoding unavailable for %s, %s; using area fallback: %s", road, area, error.detail)
    if area in locations:
        return locations[area], f"Exact road geocoding for {road} was unavailable; routing from the {area} area centre."
    raise HTTPException(status_code=422, detail=f"Unable to locate '{road}, {area}'.")


@lru_cache(maxsize=256)
def _fetch_osrm_routes(source_lat, source_lng, destination_lat, destination_lng):
    coordinates = f"{source_lng},{source_lat};{destination_lng},{destination_lat}"
    query = urlencode({"alternatives": 2, "steps": "true", "geometries": "geojson", "overview": "full", "annotations": "speed"})
    data = _request_json(f"{settings.routing_url}/route/v1/driving/{coordinates}?{query}")
    if data.get("code") != "Ok" or not data.get("routes"):
        raise HTTPException(status_code=422, detail="No drivable route was found for these locations.")
    return data["routes"][:3]


def _area_conditions(area):
    unknown = {"traffic": "Unknown", "congestion": "Unknown", "weather": "Unknown", "road_condition": "Unknown"}
    if traffic_data.empty or "Area Name" not in traffic_data.columns:
        return unknown
    records = traffic_data[traffic_data["Area Name"] == area]
    if records.empty:
        return unknown

    def mode(column):
        values = records[column].mode() if column in records else []
        return str(values.iat[0]) if len(values) else "Unknown"

    congestion = mode("Traffic_Condition")
    return {"traffic": "High" if congestion not in {"Unknown", "Low"} else congestion, "congestion": congestion, "weather": mode("Weather_Condition"), "road_condition": mode("Roadwork and Construction Activity")}


def _route_option(route, index, conditions):
    distance_km = route["distance"] / 1000
    duration_minutes = route["duration"] / 60
    speed = distance_km / (duration_minutes / 60) if duration_minutes else 0
    penalty = 12 if conditions["traffic"] == "High" else 5 if conditions["traffic"] not in {"Low", "Unknown"} else 0
    score = round(duration_minutes + penalty, 2)
    return {"id": f"route-{index + 1}", "route_name": "", "distance": f"{distance_km:.1f} km", "estimated_time": f"{round(duration_minutes)} mins", "traffic": conditions["traffic"], "average_speed": f"{speed:.0f} km/h", "congestion": conditions["congestion"], "weather": conditions["weather"], "road_condition": conditions["road_condition"], "status": "Alternative", "color": "#f59e0b", "geometry": [[lat, lng] for lng, lat in route["geometry"]["coordinates"]], "score": score}


def recommend_route(source_area, source_road, destination_area, destination_road, vehicle_type):
    if source_area == destination_area and source_road == destination_road:
        raise HTTPException(status_code=422, detail="Source and destination cannot be the same.")
    source_location, source_warning = _resolve_location(source_area, source_road)
    destination_location, destination_warning = _resolve_location(destination_area, destination_road)
    raw_routes = _fetch_osrm_routes(round(source_location["lat"], 6), round(source_location["lng"], 6), round(destination_location["lat"], 6), round(destination_location["lng"], 6))
    options = [_route_option(route, index, _area_conditions(source_area)) for index, route in enumerate(raw_routes)]
    options.sort(key=lambda route: route["score"])
    labels = [("Recommended Route", "Recommended", "#22c55e"), ("Alternate Route 1", "Alternative", "#f59e0b"), ("Alternate Route 2", "Backup", "#94a3b8")]
    for index, option in enumerate(options):
        option.update(zip(("route_name", "status", "color"), labels[index]))
    warnings = [warning for warning in (source_warning, destination_warning) if warning]
    if len(options) == 1:
        warnings.append("OSRM did not return alternative routes for this journey. Showing the best available route.")
    return {"source_area": source_area, "source_road": source_road, "destination_area": destination_area, "destination_road": destination_road, "vehicle_type": vehicle_type, "source_location": source_location, "destination_location": destination_location, "routes": options, "best_route": options[0], "alternate_route": options[1] if len(options) > 1 else None, "warnings": warnings}
