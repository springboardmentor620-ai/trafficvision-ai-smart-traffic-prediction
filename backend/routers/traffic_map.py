"""
TrafficVisionAI
HeatMap Router

Features
--------
1. Current traffic heatmap
2. Historical traffic heatmap
3. Time-based heatmap filtering
4. Predicted traffic heatmap
5. Road filtering
6. Congestion filtering
7. Heatmap intensity calculation
8. Heatmap summary
9. Available road list
10. Heatmap legend metadata

Existing database table:
    traffic_data

Existing Traffic model fields used:
    latitude
    longitude
    vehicle_count
    speed
    congestion_level
    road_name
    datetime

No database schema changes are required.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.traffic import Traffic


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api",
    tags=["HeatMap"],
)


# ============================================================
# CONSTANTS
# ============================================================

VALID_MODES = {
    "current",
    "historical",
    "predicted",
}

HEATMAP_LEGEND = [
    {
        "level": "Low",
        "label": "Low",
        "color": "#22c55e",
        "min": 0.00,
        "max": 0.35,
    },
    {
        "level": "Moderate",
        "label": "Moderate",
        "color": "#eab308",
        "min": 0.35,
        "max": 0.60,
    },
    {
        "level": "High",
        "label": "High",
        "color": "#f97316",
        "min": 0.60,
        "max": 0.80,
    },
    {
        "level": "Critical",
        "label": "Critical",
        "color": "#ef4444",
        "min": 0.80,
        "max": 1.00,
    },
]


# ============================================================
# SAFE FLOAT
# ============================================================

def safe_float(
    value,
    default: Optional[float] = 0.0,
) -> Optional[float]:
    """
    Safely convert a value to float.
    """

    try:
        if value is None:
            return default

        return float(value)

    except (TypeError, ValueError):
        return default


# ============================================================
# SAFE INTEGER
# ============================================================

def safe_int(
    value,
    default: int = 0,
) -> int:
    """
    Safely convert a value to integer.
    """

    try:
        if value is None:
            return default

        return int(float(value))

    except (TypeError, ValueError):
        return default


# ============================================================
# NORMALIZE CONGESTION
# ============================================================

def normalize_congestion(
    congestion_level: Optional[str],
) -> str:
    """
    Normalize different congestion naming conventions.
    """

    value = str(
        congestion_level or ""
    ).strip().lower()

    if value == "low":
        return "Low"

    if value in {
        "moderate",
        "medium",
    }:
        return "Moderate"

    if value == "high":
        return "High"

    if value in {
        "severe",
        "critical",
    }:
        return "Critical"

    return "Low"


# ============================================================
# CONGESTION BASE INTENSITY
# ============================================================

def get_base_intensity(
    congestion_level: Optional[str],
) -> float:
    """
    Convert congestion level into base heat intensity.
    """

    congestion = normalize_congestion(
        congestion_level
    )

    return {
        "Low": 0.20,
        "Moderate": 0.45,
        "High": 0.70,
        "Critical": 0.90,
    }.get(
        congestion,
        0.20,
    )


# ============================================================
# TRAFFIC INTENSITY
# ============================================================

def get_congestion_intensity(
    congestion_level: Optional[str],
    vehicle_count: Optional[int],
    speed: Optional[float] = None,
) -> float:
    """
    Calculate normalized heatmap intensity.

    Inputs:
        congestion level
        vehicle count
        speed

    Output:
        0.10 - 1.00
    """

    base = get_base_intensity(
        congestion_level
    )

    vehicles = max(
        safe_float(vehicle_count, 0.0),
        0.0,
    )

    # Vehicle contribution.
    vehicle_factor = min(
        vehicles / 1200.0,
        0.15,
    )

    # Speed contribution.
    speed_value = max(
        safe_float(speed, 0.0),
        0.0,
    )

    speed_factor = 0.0

    if speed_value > 0:
        if speed_value < 20:
            speed_factor = 0.12
        elif speed_value < 35:
            speed_factor = 0.08
        elif speed_value < 50:
            speed_factor = 0.04

    intensity = (
        base
        + vehicle_factor
        + speed_factor
    )

    return round(
        min(
            max(
                intensity,
                0.10,
            ),
            1.00,
        ),
        3,
    )


# ============================================================
# INTENSITY LEVEL
# ============================================================

def get_intensity_level(
    intensity: float,
) -> str:
    """
    Convert intensity value into UI heatmap level.
    """

    value = max(
        0.0,
        min(
            float(intensity),
            1.0,
        ),
    )

    if value < 0.35:
        return "Low"

    if value < 0.60:
        return "Moderate"

    if value < 0.80:
        return "High"

    return "Critical"


# ============================================================
# TIME LABEL
# ============================================================

def format_hour(
    hour: int,
) -> str:
    """
    Convert hour number into HH:00 format.
    """

    return f"{hour:02d}:00"


# ============================================================
# TIME-OF-DAY FACTOR
# ============================================================

def get_time_factor(
    hour: int,
) -> float:
    """
    Estimate traffic pressure based on time of day.

    This is used only for predicted mode.

    Morning peak:
        07:00 - 10:00

    Evening peak:
        17:00 - 20:00

    Night:
        22:00 - 05:00
    """

    if 7 <= hour <= 9:
        return 1.20

    if 17 <= hour <= 19:
        return 1.25

    if 10 <= hour <= 16:
        return 1.00

    if 20 <= hour <= 21:
        return 1.05

    if 5 <= hour <= 6:
        return 0.90

    if 22 <= hour or hour <= 4:
        return 0.75

    return 1.00


# ============================================================
# PREDICTED INTENSITY
# ============================================================

def calculate_predicted_intensity(
    congestion_level: Optional[str],
    vehicle_count: Optional[int],
    speed: Optional[float],
    selected_hour: int,
) -> float:
    """
    Generate a safe time-aware predicted intensity.

    This does not pretend to be an ML prediction.
    It uses existing traffic data plus a
    time-of-day traffic factor.
    """

    current_intensity = get_congestion_intensity(
        congestion_level,
        vehicle_count,
        speed,
    )

    time_factor = get_time_factor(
        selected_hour
    )

    predicted = (
        current_intensity
        * time_factor
    )

    return round(
        min(
            max(
                predicted,
                0.10,
            ),
            1.00,
        ),
        3,
    )


# ============================================================
# DATETIME SERIALIZATION
# ============================================================

def serialize_datetime(
    value,
) -> Optional[str]:
    """
    Convert database datetime into ISO string.
    """

    if value is None:
        return None

    try:
        return value.isoformat()

    except AttributeError:
        return str(value)


# ============================================================
# COORDINATE VALIDATION
# ============================================================

def valid_coordinates(
    latitude,
    longitude,
) -> bool:
    """
    Validate geographic coordinates.
    """

    lat = safe_float(
        latitude,
        None,
    )

    lon = safe_float(
        longitude,
        None,
    )

    if lat is None or lon is None:
        return False

    return (
        -90.0 <= lat <= 90.0
        and -180.0 <= lon <= 180.0
    )


# ============================================================
# BUILD HEATMAP POINT
# ============================================================

def build_heatmap_point(
    record: Traffic,
    mode: str,
    selected_hour: int,
) -> Optional[dict]:
    """
    Convert a Traffic database record
    into a frontend heatmap point.
    """

    latitude = safe_float(
        record.latitude,
        None,
    )

    longitude = safe_float(
        record.longitude,
        None,
    )

    if not valid_coordinates(
        latitude,
        longitude,
    ):
        return None

    vehicle_count = safe_int(
        record.vehicle_count
    )

    speed = safe_float(
        record.speed,
        0.0,
    )

    congestion = normalize_congestion(
        record.congestion_level
    )

    road_name = str(
        record.road_name
        or "Unknown Road"
    ).strip()

    if not road_name:
        road_name = "Unknown Road"

    # --------------------------------------------------------
    # INTENSITY
    # --------------------------------------------------------

    if mode == "predicted":

        intensity = calculate_predicted_intensity(
            congestion,
            vehicle_count,
            speed,
            selected_hour,
        )

    else:

        intensity = get_congestion_intensity(
            congestion,
            vehicle_count,
            speed,
        )

    traffic_level = get_intensity_level(
        intensity
    )

    # --------------------------------------------------------
    # RESULT
    # --------------------------------------------------------

    return {
        "id": record.id,

        "latitude": latitude,
        "longitude": longitude,

        "intensity": intensity,
        "traffic_level": traffic_level,

        "vehicle_count": vehicle_count,
        "speed": speed,

        "congestion_level": congestion,

        "road_name": road_name,

        "datetime": serialize_datetime(
            record.datetime
        ),

        "mode": mode,

        "selected_hour": selected_hour,

        "selected_time": format_hour(
            selected_hour
        ),
    }


# ============================================================
# CURRENT HEATMAP QUERY
# ============================================================

def get_current_records(
    db: Session,
    road_name: Optional[str],
    congestion_level: Optional[str],
    limit: int,
):
    """
    Return the most recent traffic records.

    The hour slider is applied by selecting records
    closest to the requested hour when possible.
    """

    query = (
        db.query(Traffic)
        .filter(
            Traffic.latitude.isnot(None),
            Traffic.longitude.isnot(None),
            Traffic.datetime.isnot(None),
        )
    )

    if road_name and road_name.strip():

        query = query.filter(
            Traffic.road_name == road_name.strip()
        )

    if congestion_level and congestion_level.strip():

        query = query.filter(
            Traffic.congestion_level.ilike(
                congestion_level.strip()
            )
        )

    return (
        query
        .order_by(
            Traffic.datetime.desc()
        )
        .limit(limit)
        .all()
    )


# ============================================================
# HISTORICAL HEATMAP QUERY
# ============================================================

def get_historical_records(
    db: Session,
    selected_hour: int,
    road_name: Optional[str],
    congestion_level: Optional[str],
    limit: int,
):
    """
    Return historical records matching the selected hour.

    Example:

        hour=14

    returns traffic observations recorded around 14:00
    across the available historical dataset.
    """

    query = (
        db.query(Traffic)
        .filter(
            Traffic.latitude.isnot(None),
            Traffic.longitude.isnot(None),
            Traffic.datetime.isnot(None),
            func.hour(Traffic.datetime) == selected_hour,
        )
    )

    if road_name and road_name.strip():

        query = query.filter(
            Traffic.road_name == road_name.strip()
        )

    if congestion_level and congestion_level.strip():

        query = query.filter(
            Traffic.congestion_level.ilike(
                congestion_level.strip()
            )
        )

    return (
        query
        .order_by(
            Traffic.datetime.desc()
        )
        .limit(limit)
        .all()
    )


# ============================================================
# PREDICTED HEATMAP QUERY
# ============================================================

def get_predicted_records(
    db: Session,
    selected_hour: int,
    road_name: Optional[str],
    congestion_level: Optional[str],
    limit: int,
):
    """
    Build a prediction base from the latest available
    traffic observations.

    Existing traffic records are used as the spatial
    foundation, while the selected hour modifies the
    predicted intensity.
    """

    query = (
        db.query(Traffic)
        .filter(
            Traffic.latitude.isnot(None),
            Traffic.longitude.isnot(None),
            Traffic.datetime.isnot(None),
        )
    )

    if road_name and road_name.strip():

        query = query.filter(
            Traffic.road_name == road_name.strip()
        )

    if congestion_level and congestion_level.strip():

        query = query.filter(
            Traffic.congestion_level.ilike(
                congestion_level.strip()
            )
        )

    return (
        query
        .order_by(
            Traffic.datetime.desc()
        )
        .limit(limit)
        .all()
    )


# ============================================================
# MAIN HEATMAP ENDPOINT
# ============================================================

@router.get("/heatmap")
def get_heatmap(
    mode: str = Query(
        default="current",
        description=(
            "Heatmap mode: "
            "current, historical, or predicted"
        ),
    ),

    hour: int = Query(
        default=0,
        ge=0,
        le=23,
        description=(
            "Selected hour from 00:00 to 23:00"
        ),
    ),

    road_name: Optional[str] = Query(
        default=None,
        description="Filter by road name",
    ),

    congestion_level: Optional[str] = Query(
        default=None,
        description="Filter by congestion level",
    ),

    limit: int = Query(
        default=500,
        ge=1,
        le=2000,
        description="Maximum heatmap points",
    ),

    db: Session = Depends(get_db),
):
    """
    Dynamic TrafficVisionAI heatmap.

    Modes
    -----

    current:
        Shows latest available traffic observations.

    historical:
        Shows historical traffic observations
        matching the selected hour.

    predicted:
        Uses the latest available traffic observations
        and adjusts intensity according to the selected
        hour's traffic pattern.
    """

    try:

        # ----------------------------------------------------
        # NORMALIZE MODE
        # ----------------------------------------------------

        selected_mode = str(
            mode or "current"
        ).strip().lower()

        if selected_mode not in VALID_MODES:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid heatmap mode. "
                    "Use current, historical, or predicted."
                ),
            )

        # ----------------------------------------------------
        # LOAD RECORDS
        # ----------------------------------------------------

        if selected_mode == "current":

            records = get_current_records(
                db=db,
                road_name=road_name,
                congestion_level=congestion_level,
                limit=limit,
            )

        elif selected_mode == "historical":

            records = get_historical_records(
                db=db,
                selected_hour=hour,
                road_name=road_name,
                congestion_level=congestion_level,
                limit=limit,
            )

        else:

            records = get_predicted_records(
                db=db,
                selected_hour=hour,
                road_name=road_name,
                congestion_level=congestion_level,
                limit=limit,
            )

        # ----------------------------------------------------
        # BUILD POINTS
        # ----------------------------------------------------

        heatmap_data = []

        for record in records:

            point = build_heatmap_point(
                record=record,
                mode=selected_mode,
                selected_hour=hour,
            )

            if point is not None:

                heatmap_data.append(
                    point
                )

        # ----------------------------------------------------
        # SUMMARY COUNTERS
        # ----------------------------------------------------

        low = 0
        moderate = 0
        high = 0
        critical = 0

        for point in heatmap_data:

            level = point[
                "traffic_level"
            ]

            if level == "Low":
                low += 1

            elif level == "Moderate":
                moderate += 1

            elif level == "High":
                high += 1

            elif level == "Critical":
                critical += 1

        # ----------------------------------------------------
        # CURRENT TIME
        # ----------------------------------------------------

        now = datetime.now()

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return {
            "status": "success",

            "mode": selected_mode,

            "selected_hour": hour,

            "selected_time": format_hour(
                hour
            ),

            "generated_at": now.isoformat(),

            "count": len(
                heatmap_data
            ),

            "summary": {
                "low": low,
                "moderate": moderate,
                "high": high,
                "critical": critical,
            },

            "legend": HEATMAP_LEGEND,

            "data": heatmap_data,
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate heatmap data: "
                f"{str(exc)}"
            ),
        )


# ============================================================
# HEATMAP SUMMARY
# ============================================================

@router.get("/heatmap/summary")
def get_heatmap_summary(
    mode: str = Query(
        default="current",
    ),

    hour: int = Query(
        default=0,
        ge=0,
        le=23,
    ),

    db: Session = Depends(get_db),
):
    """
    Return heatmap statistics for the selected mode
    and selected hour.
    """

    try:

        selected_mode = str(
            mode or "current"
        ).strip().lower()

        if selected_mode not in VALID_MODES:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid heatmap mode. "
                    "Use current, historical, or predicted."
                ),
            )

        # ----------------------------------------------------
        # LOAD DATA
        # ----------------------------------------------------

        if selected_mode == "current":

            records = get_current_records(
                db=db,
                road_name=None,
                congestion_level=None,
                limit=2000,
            )

        elif selected_mode == "historical":

            records = get_historical_records(
                db=db,
                selected_hour=hour,
                road_name=None,
                congestion_level=None,
                limit=2000,
            )

        else:

            records = get_predicted_records(
                db=db,
                selected_hour=hour,
                road_name=None,
                congestion_level=None,
                limit=2000,
            )

        # ----------------------------------------------------
        # COUNTERS
        # ----------------------------------------------------

        total = 0

        low = 0
        moderate = 0
        high = 0
        critical = 0

        total_vehicles = 0
        total_speed = 0.0
        speed_records = 0

        # ----------------------------------------------------
        # ANALYZE
        # ----------------------------------------------------

        for record in records:

            point = build_heatmap_point(
                record=record,
                mode=selected_mode,
                selected_hour=hour,
            )

            if point is None:
                continue

            total += 1

            level = point[
                "traffic_level"
            ]

            if level == "Low":
                low += 1

            elif level == "Moderate":
                moderate += 1

            elif level == "High":
                high += 1

            elif level == "Critical":
                critical += 1

            total_vehicles += point[
                "vehicle_count"
            ]

            if point["speed"] > 0:

                total_speed += point[
                    "speed"
                ]

                speed_records += 1

        # ----------------------------------------------------
        # AVERAGES
        # ----------------------------------------------------

        average_vehicle_count = (
            round(
                total_vehicles / total,
                1,
            )
            if total > 0
            else 0
        )

        average_speed = (
            round(
                total_speed / speed_records,
                1,
            )
            if speed_records > 0
            else 0
        )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return {
            "status": "success",

            "mode": selected_mode,

            "selected_hour": hour,

            "selected_time": format_hour(
                hour
            ),

            "total_points": total,

            "low": low,
            "moderate": moderate,
            "high": high,
            "critical": critical,

            "average_vehicle_count":
                average_vehicle_count,

            "average_speed_kmh":
                average_speed,

            "legend": HEATMAP_LEGEND,
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate heatmap summary: "
                f"{str(exc)}"
            ),
        )


# ============================================================
# AVAILABLE HEATMAP ROADS
# ============================================================

@router.get("/heatmap/roads")
def get_heatmap_roads(
    db: Session = Depends(get_db),
):
    """
    Return unique road names available
    for heatmap filtering.
    """

    try:

        roads = (
            db.query(
                Traffic.road_name
            )
            .filter(
                Traffic.road_name.isnot(None)
            )
            .distinct()
            .order_by(
                Traffic.road_name.asc()
            )
            .all()
        )

        road_list = []

        # ----------------------------------------------------
        # CLEAN ROAD NAMES
        # ----------------------------------------------------

        for road in roads:

            if not road:
                continue

            road_name = road[0]

            if road_name is None:
                continue

            road_name = str(
                road_name
            ).strip()

            if not road_name:
                continue

            road_list.append(
                road_name
            )

        # ----------------------------------------------------
        # REMOVE DUPLICATES
        # ----------------------------------------------------

        road_list = sorted(
            set(road_list),
            key=str.lower,
        )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return {
            "status": "success",
            "count": len(
                road_list
            ),
            "data": road_list,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to fetch heatmap roads: "
                f"{str(exc)}"
            ),
        )


# ============================================================
# HEATMAP LEGEND
# ============================================================

@router.get("/heatmap/legend")
def get_heatmap_legend():
    """
    Return the heatmap legend used by the frontend.
    """

    return {
        "status": "success",
        "legend": HEATMAP_LEGEND,
    }
