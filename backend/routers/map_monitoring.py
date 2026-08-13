from fastapi import APIRouter, HTTPException, Query, Depends
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from sqlalchemy.orm import Session

import json

from database import get_db
from models.traffic import Traffic


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/map-monitoring",
    tags=["Map Monitoring"],
)


# ============================================================
# HELPERS
# ============================================================

def _is_valid_coordinate(latitude, longitude):
    """
    Validate latitude and longitude.
    """

    try:
        lat = float(latitude)
        lon = float(longitude)
    except (TypeError, ValueError):
        return False

    return (
        -90 <= lat <= 90
        and -180 <= lon <= 180
    )


def _traffic_to_location(record: Traffic):
    """
    Convert a Traffic database record into a map-friendly
    location object.
    """

    if not record:
        return None

    latitude = record.latitude
    longitude = record.longitude

    if not _is_valid_coordinate(latitude, longitude):
        return None

    return {
        "id": record.id,

        "latitude": float(latitude),
        "longitude": float(longitude),

        "lat": float(latitude),
        "lon": float(longitude),

        "road_name": record.road_name,
        "location": record.road_name,

        "vehicle_count": record.vehicle_count,
        "speed": record.speed,

        "congestion_level": record.congestion_level,

        "weather": record.weather,

        "traffic_signal": record.traffic_signal,

        "accident": record.accident,

        "accident_status": record.accident_status,

        "emergency_status": record.emergency_status,
    }


# ============================================================
# SEARCH PLACE / GEOCODING
# ============================================================

@router.get("/search-location")
def search_location(
    query: str = Query(..., min_length=2),
):
    """
    Convert a place name into latitude and longitude.

    Examples:
        Hitech City
        Charminar Hyderabad
        Secunderabad
        Tanuku
    """

    query = query.strip()

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Location cannot be empty",
        )

    # --------------------------------------------------------
    # Restrict search to India
    # --------------------------------------------------------

    search_query = f"{query}, India"

    encoded_query = search_query.replace(" ", "+")

    url = (
        "https://nominatim.openstreetmap.org/search"
        f"?q={encoded_query}"
        "&format=json"
        "&limit=5"
        "&addressdetails=1"
    )

    request = Request(
        url,
        headers={
            "User-Agent": "TrafficVisionAI/1.0"
        },
    )

    # --------------------------------------------------------
    # Call Nominatim
    # --------------------------------------------------------

    try:

        with urlopen(
            request,
            timeout=15,
        ) as response:

            response_data = response.read().decode(
                "utf-8"
            )

    except HTTPError as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                f"Location service returned HTTP "
                f"{exc.code}"
            ),
        )

    except URLError as exc:

        raise HTTPException(
            status_code=503,
            detail=(
                f"Location service unavailable: "
                f"{exc.reason}"
            ),
        )

    except TimeoutError:

        raise HTTPException(
            status_code=504,
            detail="Location service timed out",
        )

    except Exception as exc:

        raise HTTPException(
            status_code=503,
            detail=(
                f"Unable to search location: {exc}"
            ),
        )

    # --------------------------------------------------------
    # Parse response
    # --------------------------------------------------------

    try:

        results = json.loads(response_data)

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=502,
            detail=(
                "Invalid response from location service"
            ),
        )

    # --------------------------------------------------------
    # Build locations
    # --------------------------------------------------------

    locations = []

    for item in results:

        try:

            latitude = float(item["lat"])
            longitude = float(item["lon"])

        except (
            KeyError,
            TypeError,
            ValueError,
        ):

            continue

        if not _is_valid_coordinate(
            latitude,
            longitude,
        ):
            continue

        locations.append(
            {
                "display_name": item.get(
                    "display_name",
                    query,
                ),

                "latitude": latitude,
                "longitude": longitude,

                # Aliases for frontend compatibility
                "lat": latitude,
                "lon": longitude,
            }
        )

    # --------------------------------------------------------
    # No result
    # --------------------------------------------------------

    if not locations:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Location '{query}' was not found."
            ),
        )

    return {
        "status": "success",
        "query": query,
        "locations": locations,
        "count": len(locations),
    }


# ============================================================
# ROAD NAMES
# ============================================================

@router.get("/roads")
def get_map_monitoring_roads(
    db: Session = Depends(get_db),
):
    """
    Return unique road names from traffic_data.
    """

    roads = (
        db.query(Traffic.road_name)
        .filter(
            Traffic.road_name.isnot(None),
            Traffic.road_name != "",
        )
        .distinct()
        .order_by(
            Traffic.road_name.asc()
        )
        .all()
    )

    road_names = [
        row[0]
        for row in roads
        if row[0]
    ]

    return {
        "status": "success",
        "roads": road_names,
        "data": road_names,
        "count": len(road_names),
    }


# ============================================================
# GET TRAFFIC / INCIDENT LOCATION BY ID
# ============================================================

@router.get("/location/{traffic_id}")
def get_traffic_location(
    traffic_id: int,
    db: Session = Depends(get_db),
):
    """
    Return the exact map location of a traffic record.

    This endpoint is used when the user clicks:

        View Incident
        Navigate
        View Location

    from the notification center.
    """

    record = (
        db.query(Traffic)
        .filter(
            Traffic.id == traffic_id
        )
        .first()
    )

    if not record:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Traffic record "
                f"{traffic_id} not found"
            ),
        )

    location = _traffic_to_location(
        record
    )

    if not location:

        raise HTTPException(
            status_code=404,
            detail=(
                "Traffic record exists but "
                "latitude/longitude are invalid."
            ),
        )

    return {
        "status": "success",
        "location": location,
    }


# ============================================================
# GET TRAFFIC RECORDS WITH VALID LOCATIONS
# ============================================================

@router.get("/locations")
def get_traffic_locations(
    limit: int = Query(
        500,
        ge=1,
        le=5000,
    ),
    congestion: str | None = None,
    accident_only: bool = False,
    road: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Return traffic records that have valid coordinates.

    Useful for displaying traffic/incident markers
    directly on the Map Monitoring page.
    """

    query = db.query(Traffic).filter(
        Traffic.latitude.isnot(None),
        Traffic.longitude.isnot(None),
    )

    # --------------------------------------------------------
    # Congestion filter
    # --------------------------------------------------------

    if congestion:

        query = query.filter(
            Traffic.congestion_level.ilike(
                congestion.strip()
            )
        )

    # --------------------------------------------------------
    # Accident filter
    # --------------------------------------------------------

    if accident_only:

        query = query.filter(
            Traffic.accident_status.in_(
                [
                    "yes",
                    "Yes",
                    "YES",
                    "true",
                    "True",
                    "TRUE",
                    "1",
                    "y",
                    "Y",
                ]
            )
        )

    # --------------------------------------------------------
    # Road filter
    # --------------------------------------------------------

    if road:

        query = query.filter(
            Traffic.road_name.ilike(
                f"%{road.strip()}%"
            )
        )

    records = (
        query
        .order_by(
            Traffic.datetime.desc()
        )
        .limit(limit)
        .all()
    )

    locations = []

    for record in records:

        location = _traffic_to_location(
            record
        )

        if location:

            locations.append(
                location
            )

    return {
        "status": "success",
        "locations": locations,
        "count": len(locations),
    }


# ============================================================
# ROUTE
# ============================================================

@router.get("/route")
def get_route(
    source_lat: float,
    source_lon: float,
    dest_lat: float,
    dest_lon: float,
):
    """
    Get a driving route between source and destination.

    Uses OSRM routing service.
    """

    # --------------------------------------------------------
    # Validate source
    # --------------------------------------------------------

    if not -90 <= source_lat <= 90:

        raise HTTPException(
            status_code=400,
            detail="Invalid source latitude",
        )

    if not -180 <= source_lon <= 180:

        raise HTTPException(
            status_code=400,
            detail="Invalid source longitude",
        )

    # --------------------------------------------------------
    # Validate destination
    # --------------------------------------------------------

    if not -90 <= dest_lat <= 90:

        raise HTTPException(
            status_code=400,
            detail="Invalid destination latitude",
        )

    if not -180 <= dest_lon <= 180:

        raise HTTPException(
            status_code=400,
            detail="Invalid destination longitude",
        )

    # --------------------------------------------------------
    # Prevent identical locations
    # --------------------------------------------------------

    if (
        abs(source_lat - dest_lat) < 0.000001
        and
        abs(source_lon - dest_lon) < 0.000001
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Source and destination "
                "cannot be the same location."
            ),
        )

    # --------------------------------------------------------
    # OSRM URL
    # --------------------------------------------------------

    url = (
        "https://router.project-osrm.org/"
        "route/v1/driving/"
        f"{source_lon},{source_lat};"
        f"{dest_lon},{dest_lat}"
        "?overview=full&geometries=geojson"
    )

    request = Request(
        url,
        headers={
            "User-Agent": "TrafficVisionAI/1.0"
        },
    )

    # --------------------------------------------------------
    # Call OSRM
    # --------------------------------------------------------

    try:

        with urlopen(
            request,
            timeout=15,
        ) as response:

            response_data = response.read().decode(
                "utf-8"
            )

    except HTTPError as exc:

        raise HTTPException(
            status_code=502,
            detail=(
                f"Routing service returned HTTP "
                f"{exc.code}"
            ),
        )

    except URLError as exc:

        raise HTTPException(
            status_code=503,
            detail=(
                f"Routing service unavailable: "
                f"{exc.reason}"
            ),
        )

    except TimeoutError:

        raise HTTPException(
            status_code=504,
            detail="Routing service timed out",
        )

    except Exception as exc:

        raise HTTPException(
            status_code=503,
            detail=(
                f"Unable to connect to "
                f"routing service: {exc}"
            ),
        )

    # --------------------------------------------------------
    # Parse OSRM response
    # --------------------------------------------------------

    try:

        data = json.loads(
            response_data
        )

    except json.JSONDecodeError:

        raise HTTPException(
            status_code=502,
            detail=(
                "Invalid response from "
                "routing service"
            ),
        )

    # --------------------------------------------------------
    # Validate OSRM response
    # --------------------------------------------------------

    if data.get("code") != "Ok":

        raise HTTPException(
            status_code=404,
            detail=(
                "No route found between "
                "the selected locations"
            ),
        )

    routes = data.get(
        "routes",
        []
    )

    if not routes:

        raise HTTPException(
            status_code=404,
            detail="No route available",
        )

    route = routes[0]

    geometry = route.get(
        "geometry"
    )

    if not geometry:

        raise HTTPException(
            status_code=502,
            detail=(
                "Route geometry was not "
                "returned"
            ),
        )

    # --------------------------------------------------------
    # Distance
    # --------------------------------------------------------

    distance_meters = float(
        route.get(
            "distance",
            0,
        )
    )

    distance_km = round(
        distance_meters / 1000,
        2,
    )

    # --------------------------------------------------------
    # Duration
    # --------------------------------------------------------

    duration_seconds = float(
        route.get(
            "duration",
            0,
        )
    )

    estimated_time_minutes = round(
        duration_seconds / 60,
        2,
    )

    # --------------------------------------------------------
    # Return
    # --------------------------------------------------------

    return {
        "status": "Route Found",

        "source": {
            "latitude": source_lat,
            "longitude": source_lon,
            "lat": source_lat,
            "lon": source_lon,
        },

        "destination": {
            "latitude": dest_lat,
            "longitude": dest_lon,
            "lat": dest_lat,
            "lon": dest_lon,
        },

        "distance_km": distance_km,

        "estimated_time_minutes":
            estimated_time_minutes,

        "geometry": geometry,
    }
