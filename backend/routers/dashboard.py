"""
TrafficVisionAI
Optimized Dashboard Router

Purpose:
    Fast Dashboard KPI endpoint.

Performance design:

    MySQL
       ↓
    COUNT / SUM / AVG / COUNT DISTINCT
       ↓
    ONE SMALL RESULT
       ↓
    FastAPI
       ↓
    JSON

IMPORTANT:
    This router does NOT load the complete traffic table
    into Python.

    It does NOT use:
        .all()
        for every traffic record

    All heavy aggregation is performed by MySQL.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, distinct
from sqlalchemy.orm import Session

from database import get_db
from models.traffic import Traffic


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


# ================================================================
# HELPERS
# ================================================================

def normalize_road(value):
    """
    Normalize road name for API response.
    """

    if value is None:
        return "Unknown"

    value = str(value).strip()

    if not value:
        return "Unknown"

    return value


# ================================================================
# DASHBOARD ANALYTICS
# ================================================================

@router.get("/analytics")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
):
    """
    Return all Dashboard KPI information using SQL aggregation.

    Only ONE aggregate query is used for the main dashboard data.

    This is intentionally kept separate from:
        /analytics/overview

    because Dashboard and Analytics are different pages.
    """

    # ------------------------------------------------------------
    # Normalize values inside SQL
    # ------------------------------------------------------------

    normalized_congestion = func.lower(
        func.trim(
            Traffic.congestion_level
        )
    )

    normalized_accident = func.lower(
        func.trim(
            Traffic.accident
        )
    )

    # ------------------------------------------------------------
    # Congestion counters
    # ------------------------------------------------------------

    high_case = case(
        (
            normalized_congestion.in_(
                [
                    "high",
                    "heavy",
                    "severe",
                ]
            ),
            1,
        ),
        else_=0,
    )

    medium_case = case(
        (
            normalized_congestion.in_(
                [
                    "medium",
                    "moderate",
                ]
            ),
            1,
        ),
        else_=0,
    )

    low_case = case(
        (
            normalized_congestion == "low",
            1,
        ),
        else_=0,
    )

    # ------------------------------------------------------------
    # Accident counter
    # ------------------------------------------------------------

    accident_case = case(
        (
            normalized_accident.in_(
                [
                    "yes",
                    "true",
                    "1",
                    "y",
                ]
            ),
            1,
        ),
        else_=0,
    )

    # ------------------------------------------------------------
    # MAIN AGGREGATE QUERY
    #
    # MySQL performs:
    #     COUNT
    #     SUM
    #     AVG
    #     COUNT DISTINCT
    #
    # Python receives ONE row.
    # ------------------------------------------------------------

    row = (
        db.query(

            # Total database records
            func.count(
                Traffic.id
            ).label(
                "total_records"
            ),

            # Total vehicles
            func.coalesce(
                func.sum(
                    Traffic.vehicle_count
                ),
                0,
            ).label(
                "total_vehicles"
            ),

            # Average vehicle count
            func.coalesce(
                func.avg(
                    Traffic.vehicle_count
                ),
                0,
            ).label(
                "avg_vehicle_count"
            ),

            # Average speed
            func.coalesce(
                func.avg(
                    Traffic.speed
                ),
                0,
            ).label(
                "avg_speed"
            ),

            # Number of unique roads/junctions
            func.count(
                distinct(
                    Traffic.road_name
                )
            ).label(
                "total_junctions"
            ),

            # High congestion
            func.coalesce(
                func.sum(
                    high_case
                ),
                0,
            ).label(
                "high_congestion"
            ),

            # Medium congestion
            func.coalesce(
                func.sum(
                    medium_case
                ),
                0,
            ).label(
                "medium_congestion"
            ),

            # Low congestion
            func.coalesce(
                func.sum(
                    low_case
                ),
                0,
            ).label(
                "low_congestion"
            ),

            # Accidents
            func.coalesce(
                func.sum(
                    accident_case
                ),
                0,
            ).label(
                "accident_locations"
            ),
        )
        .first()
    )

    # ============================================================
    # EMPTY DATABASE
    # ============================================================

    if not row or not row.total_records:

        return {
            "total_records": 0,

            "total_vehicles": 0,

            "avg_vehicle_count": 0,

            "avg_speed_kmh": 0,

            "total_junctions": 0,

            "high_congestion": 0,

            "medium_congestion": 0,

            "low_congestion": 0,

            "accident_locations": 0,

            "accidents": 0,

            "emergencies": 0,

            "most_congested_location": "Unknown",

            "most_congested_vehicles": 0,

            "least_congested_location": "Unknown",

            "least_congested_vehicles": 0,
        }

    # ============================================================
    # MOST CONGESTED ROAD
    #
    # Aggregate by road.
    #
    # IMPORTANT:
    # We do NOT fetch all traffic records.
    # ============================================================

    most_congested = (
        db.query(

            Traffic.road_name.label(
                "road_name"
            ),

            func.avg(
                Traffic.vehicle_count
            ).label(
                "avg_vehicles"
            ),
        )
        .filter(
            Traffic.road_name.isnot(None)
        )
        .group_by(
            Traffic.road_name
        )
        .order_by(
            func.avg(
                Traffic.vehicle_count
            ).desc()
        )
        .limit(1)
        .first()
    )

    # ============================================================
    # LEAST CONGESTED ROAD
    # ============================================================

    least_congested = (
        db.query(

            Traffic.road_name.label(
                "road_name"
            ),

            func.avg(
                Traffic.vehicle_count
            ).label(
                "avg_vehicles"
            ),
        )
        .filter(
            Traffic.road_name.isnot(None)
        )
        .group_by(
            Traffic.road_name
        )
        .order_by(
            func.avg(
                Traffic.vehicle_count
            ).asc()
        )
        .limit(1)
        .first()
    )

    # ============================================================
    # FINAL RESPONSE
    # ============================================================

    return {

        "total_records": int(
            row.total_records or 0
        ),

        "total_vehicles": int(
            row.total_vehicles or 0
        ),

        "avg_vehicle_count": round(
            float(
                row.avg_vehicle_count or 0
            ),
            1,
        ),

        "avg_speed_kmh": round(
            float(
                row.avg_speed or 0
            ),
            1,
        ),

        "total_junctions": int(
            row.total_junctions or 0
        ),

        "high_congestion": int(
            row.high_congestion or 0
        ),

        "medium_congestion": int(
            row.medium_congestion or 0
        ),

        "low_congestion": int(
            row.low_congestion or 0
        ),

        "accident_locations": int(
            row.accident_locations or 0
        ),

        # Compatibility fields for existing Dashboard
        "accidents": int(
            row.accident_locations or 0
        ),

        # Your current Traffic table does not show
        # a separate emergency column.
        "emergencies": 0,

        "most_congested_location": (
            normalize_road(
                most_congested.road_name
            )
            if most_congested
            else "Unknown"
        ),

        "most_congested_vehicles": round(
            float(
                most_congested.avg_vehicles
                or 0
            ),
            1,
        ) if most_congested else 0,

        "least_congested_location": (
            normalize_road(
                least_congested.road_name
            )
            if least_congested
            else "Unknown"
        ),

        "least_congested_vehicles": round(
            float(
                least_congested.avg_vehicles
                or 0
            ),
            1,
        ) if least_congested else 0,
    }
