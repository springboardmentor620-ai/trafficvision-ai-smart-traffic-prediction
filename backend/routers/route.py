import math
import random
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.traffic import Traffic

try:
    import requests as req
except Exception:
    import json
    import urllib.parse
    import urllib.request
    from urllib.error import HTTPError, URLError

    class _CompatResponse:
        def __init__(self, status_code, body, headers=None):
            self.status_code = status_code
            self._body = body
            self.headers = headers or {}

        def json(self):
            return json.loads(self._body)

        @property
        def text(self):
            return self._body

    class _CompatRequests:
        @staticmethod
        def get(url, params=None, headers=None, timeout=10, **kwargs):
            if params:
                query = urllib.parse.urlencode(params)
                separator = "&" if "?" in url else "?"
                url = f"{url}{separator}{query}"
            request = urllib.request.Request(url, headers=headers or {})
            try:
                with urllib.request.urlopen(request, timeout=timeout) as response:
                    body = response.read().decode("utf-8", errors="replace")
                    return _CompatResponse(response.status, body, dict(response.headers))
            except HTTPError as exc:
                body = exc.read().decode("utf-8", errors="replace")
                return _CompatResponse(exc.code, body, dict(exc.headers))
            except URLError as exc:
                raise RuntimeError(str(exc.reason)) from exc

    req = _CompatRequests()


router = APIRouter(
    prefix="/route",
    tags=["Route Optimization"]
)

# ============================================================
# Schemas
# ============================================================


class RouteRequest(BaseModel):
    source: str
    destination: str


class DelayWarningRequest(BaseModel):
    location: str
    vehicle_count: int
    average_speed: float
    congestion_level: str  # Low | Medium | High


# ============================================================
# Helpers / Utilities
# ============================================================

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OSRM_BASE = "https://router.project-osrm.org/route/v1/driving"
HEADERS = {"User-Agent": "TrafficVisionAI/1.0 (contact@trafficvisionai.local)"}


def geocode(place: str) -> Optional[dict]:
    """Geocode a place name → {lat, lon, display_name} using Nominatim."""
    try:
        resp = req.get(
            NOMINATIM_URL,
            params={"q": place, "format": "json", "limit": 1},
            headers=HEADERS,
            timeout=10,
        )
        data = resp.json()
        if not data:
            return None
        return {
            "lat": float(data[0]["lat"]),
            "lon": float(data[0]["lon"]),
            "display_name": data[0]["display_name"],
        }
    except Exception:
        return None


def decode_polyline(encoded: str):
    """Decode OSRM-encoded polyline into [[lat, lng], ...] list."""
    points, index, lat, lng = [], 0, 0, 0
    while index < len(encoded):
        shift = result = 0
        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        lat += ~(result >> 1) if (result & 1) else (result >> 1)

        shift = result = 0
        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1F) << shift
            shift += 5
            if b < 0x20:
                break
        lng += ~(result >> 1) if (result & 1) else (result >> 1)
        points.append([lat / 1e5, lng / 1e5])
    return points


def score_congestion(vehicle_count: int) -> dict:
    """Translate vehicle count into congestion metadata."""
    if vehicle_count < 80:
        return {"level": "Low",    "color": "green"}
    elif vehicle_count < 200:
        return {"level": "Medium", "color": "amber"}
    else:
        return {"level": "High",   "color": "red"}


def build_traffic_prediction(congestion_level: str, duration_min: int) -> str:
    hour = datetime.now().hour
    if 7 <= hour <= 9:
        ctx = "Morning rush hour is active."
    elif 17 <= hour <= 19:
        ctx = "Evening rush hour is in effect."
    elif hour >= 22 or hour <= 5:
        ctx = "Late-night — low traffic expected."
    else:
        ctx = "Off-peak hours."

    msgs = {
        "Low":    f"✅ Clear roads ahead. {ctx} Your {duration_min}-min journey is reliable.",
        "Medium": f"🟡 Moderate congestion detected. {ctx} Allow 10–15 min extra buffer.",
        "High":   f"🔴 Heavy traffic corridor. {ctx} Consider departing in 30–60 min.",
    }
    return msgs.get(congestion_level, msgs["Medium"])


def fetch_osrm_routes(src: dict, dst: dict):
    """Call OSRM and return raw routes list, or raise HTTPException."""
    coords = f"{src['lon']},{src['lat']};{dst['lon']},{dst['lat']}"
    try:
        resp = req.get(
            f"{OSRM_BASE}/{coords}",
            params={"alternatives": "3", "overview": "full",
                    "geometries": "polyline", "steps": "false"},
            headers=HEADERS,
            timeout=15,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OSRM unreachable: {e}")

    if resp.status_code != 200:
        raise HTTPException(
            status_code=502, detail="OSRM service returned an error.")

    data = resp.json()
    if data.get("code") != "Ok" or not data.get("routes"):
        raise HTTPException(
            status_code=404, detail="No routes found between these locations.")

    return data["routes"]


# ============================================================
# POST /route/calculate  — raw route data
# ============================================================

@router.post("/calculate")
def calculate_route(request: RouteRequest):
    """
    Geocode source & destination via OSM Nominatim, then fetch up to 3
    route alternatives from OSRM. Returns raw geometry + distance/time.
    """
    src = geocode(request.source)
    dst = geocode(request.destination)

    if not src:
        raise HTTPException(
            status_code=404, detail=f"Could not geocode source: '{request.source}'")
    if not dst:
        raise HTTPException(
            status_code=404, detail=f"Could not geocode destination: '{request.destination}'")

    raw_routes = fetch_osrm_routes(src, dst)

    routes = [
        {
            "route_index": i,
            "distance_km":  round(r["distance"] / 1000, 2),
            "duration_min": round(r["duration"] / 60),
            "geometry":     decode_polyline(r["geometry"]),
            "waypoints":    [[src["lat"], src["lon"]], [dst["lat"], dst["lon"]]],
        }
        for i, r in enumerate(raw_routes)
    ]

    return {
        "source":      {"query": request.source,      **src},
        "destination": {"query": request.destination, **dst},
        "routes":      routes,
        "total_routes_found": len(routes),
    }


# ============================================================
# POST /route/traffic-recommendation  — AI-scored recommendation
# ============================================================

@router.post("/traffic-recommendation")
def traffic_recommendation(request: RouteRequest, db: Session = Depends(get_db)):
    """
    Traffic-aware route recommendation. Fetches OSRM routes, scores them
    against live congestion data from the Traffic DB, and returns the best
    route with full AI intelligence: prediction, congestion level, ETA.
    """
    # 1. Geocode
    src = geocode(request.source)
    dst = geocode(request.destination)

    if not src:
        raise HTTPException(
            status_code=404, detail=f"Could not geocode source: '{request.source}'")
    if not dst:
        raise HTTPException(
            status_code=404, detail=f"Could not geocode destination: '{request.destination}'")

    # 2. Fetch raw OSRM routes
    raw_routes = fetch_osrm_routes(src, dst)

    # 3. Load traffic DB for congestion context
    traffic_records = db.query(Traffic).all()
    avg_vehicles = (
        sum(r.vehicle_count for r in traffic_records) / len(traffic_records)
        if traffic_records else 150
    )
    high_pct = (
        sum(1 for r in traffic_records if r.congestion_level ==
            "High") / len(traffic_records)
        if traffic_records else 0.3
    )

    # 4. Score & annotate each route
    scored = []
    for i, r in enumerate(raw_routes):
        distance_km = round(r["distance"] / 1000, 2)
        duration_min = round(r["duration"] / 60)
        geometry = decode_polyline(r["geometry"])

        # Alternatives penalised progressively vs best route
        effective_vehicles = avg_vehicles * (1 + i * 0.25)
        penalty = (distance_km * 0.4) + (duration_min * 0.25) + \
            effective_vehicles * high_pct * 0.08
        score = max(10, min(100, 100 - penalty + random.uniform(-3, 3)))

        cong = score_congestion(int(effective_vehicles))
        arrival_str = (datetime.now() +
                       timedelta(minutes=duration_min)).strftime("%H:%M")

        scored.append({
            "route_index":      i,
            "distance_km":      distance_km,
            "duration_min":     duration_min,
            "geometry":         geometry,
            "waypoints":        [[src["lat"], src["lon"]], [dst["lat"], dst["lon"]]],
            "congestion_level": cong["level"],
            "congestion_color": cong["color"],
            "traffic_score":    round(score, 1),
            "estimated_arrival": arrival_str,
        })

    # 5. Best route = highest score
    scored.sort(key=lambda x: x["traffic_score"], reverse=True)
    best = scored[0]
    alternatives = scored[1:]

    return {
        "source":      {"query": request.source,      **src},
        "destination": {"query": request.destination, **dst},
        "recommended_route":   best,
        "alternative_routes":  alternatives,
        "traffic_prediction":  build_traffic_prediction(best["congestion_level"], best["duration_min"]),
        "congestion_level":    best["congestion_level"],
        "congestion_color":    best["congestion_color"],
        "estimated_arrival":   best["estimated_arrival"],
        "traffic_score":       best["traffic_score"],
        "db_junctions_analyzed": len(traffic_records),
    }


# ============================================================
# POST /route/delay-warning  — Route Delay Warning System
# ============================================================

@router.post("/delay-warning")
def calculate_delay_warning(
    request: DelayWarningRequest,
    db: Session = Depends(get_db),
):
    """
    Calculate estimated travel delay based on:
    - Vehicle Count
    - Average Speed
    - Congestion Level
    Returns: expected_delay, suggested_route, time_saved.
    """
    vc = max(1, request.vehicle_count)
    spd = max(1.0, request.average_speed)
    cong_mult = {"Low": 1.0, "Medium": 1.5, "High": 2.5}.get(request.congestion_level, 1.5)

    # Delay formula: base delay scaled by speed deficit and congestion
    speed_deficit = max(0, 60 - spd)  # km/h below free-flow 60 km/h
    delay_minutes = round((speed_deficit * 0.5 + vc * 0.02) * cong_mult, 1)
    delay_minutes = max(0, delay_minutes)

    # Find the best alternate route from DB
    all_records = db.query(Traffic).all()
    best = None
    if all_records:
        # Best = lowest vehicle count and not the same location
        candidates = [r for r in all_records if r.location != request.location]
        if candidates:
            best = min(candidates, key=lambda r: r.vehicle_count)

    alternate_route = best.location if best else "No alternate route available"
    alternate_vehicles = best.vehicle_count if best else 0

    # Estimate time saved on alternate route
    alt_delay = round(max(0, (60 - (best.average_speed or 40)) * 0.5 + alternate_vehicles * 0.02), 1) if best else 0
    time_saved = round(max(0, delay_minutes - alt_delay), 1)

    if delay_minutes == 0:
        severity = "None"
        message = f"No delay expected at {request.location}. Road is clear."
    elif delay_minutes < 10:
        severity = "Minor"
        message = f"Minor delay of {delay_minutes} min at {request.location}. Allow extra buffer."
    elif delay_minutes < 25:
        severity = "Moderate"
        message = f"Moderate delay of {delay_minutes} min. Consider alternate route via {alternate_route}."
    else:
        severity = "Severe"
        message = f"Severe delay of {delay_minutes} min at {request.location}. Strongly recommend {alternate_route}."

    return {
        "location": request.location,
        "vehicle_count": vc,
        "average_speed_kmh": spd,
        "congestion_level": request.congestion_level,
        "expected_delay_minutes": delay_minutes,
        "delay_severity": severity,
        "delay_message": message,
        "suggested_alternate_route": alternate_route,
        "alternate_route_vehicles": alternate_vehicles,
        "estimated_time_saved_minutes": time_saved,
    }


# ============================================================
# Legacy endpoints (backward compatibility)
# ============================================================

@router.get("/best-route")
def best_route(db: Session = Depends(get_db)):
    records = db.query(Traffic).all()
    if not records:
        raise HTTPException(status_code=404, detail="No traffic records found")
    best = min(records, key=lambda x: x.vehicle_count)
    return {
        "best_route":  best.location,
        "traffic":     best.vehicle_count,
        "congestion":  best.congestion_level,
        "road_status": best.road_status,
        "message":     "Best route found successfully",
    }


@router.get("/map")
def get_map_data(db: Session = Depends(get_db)):
    return [
        {
            "id":               r.id,
            "location":         r.location,
            "vehicle_count":    r.vehicle_count,
            "congestion_level": r.congestion_level,
            "road_status":      r.road_status,
            "latitude":         r.latitude,
            "longitude":        r.longitude,
        }
        for r in db.query(Traffic).all()
    ]
