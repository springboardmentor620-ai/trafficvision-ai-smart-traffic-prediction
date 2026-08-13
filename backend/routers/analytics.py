"""
TrafficVisionAI
Optimized Analytics Router

Performance Design
------------------

Raw traffic records should NOT be downloaded to React for analytics.

OLD:
    MySQL
      ↓
    thousands of records
      ↓
    FastAPI
      ↓
    React
      ↓
    JavaScript grouping/calculation

NEW:
    MySQL
      ↓
    SQL aggregation
      ↓
    FastAPI
      ↓
    small JSON responses
      ↓
    React rendering

This reduces:

- database → Python transfer
- SQLAlchemy ORM object creation
- Python loops
- browser processing
- network payload
- analytics page loading time

Endpoints
---------

GET /analytics/overview
GET /analytics/hourly
GET /analytics/daily
GET /analytics/weekly
GET /analytics/peak-hours
GET /analytics/congestion-distribution
GET /analytics/top-congested
GET /analytics/speed-distribution
GET /analytics/weather
GET /analytics/road-performance
GET /analytics/alerts
GET /analytics/insights
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from database import get_db
from models.traffic import Traffic


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


# ============================================================
# CONSTANTS
# ============================================================

HIGH_CONGESTION = [
    "high",
    "heavy",
    "severe",
]

MEDIUM_CONGESTION = [
    "medium",
    "moderate",
]

LOW_CONGESTION = [
    "low",
]

ACCIDENT_VALUES = [
    "yes",
    "true",
    "1",
    "y",
    "accident",
]


# ============================================================
# HELPERS
# ============================================================

def normalize_weather(value):
    """
    Normalize weather value for API response.
    """

    if value is None:
        return "Unknown"

    value = str(value).strip()

    if not value:
        return "Unknown"

    return value


def normalize_congestion(value):
    """
    Normalize congestion labels.

    Supported output:
        Low
        Medium
        High
    """

    if value is None:
        return "Medium"

    value = str(value).strip().lower()

    if value in LOW_CONGESTION:
        return "Low"

    if value in MEDIUM_CONGESTION:
        return "Medium"

    if value in HIGH_CONGESTION:
        return "High"

    return "Medium"


def congestion_sql_expression():
    """
    SQL expression for normalized congestion.

    Important:
    This normalization happens inside MySQL rather than
    downloading records to Python.
    """

    normalized = func.lower(
        func.trim(
            Traffic.congestion_level
        )
    )

    return case(
        (
            normalized.in_(HIGH_CONGESTION),
            "High",
        ),
        (
            normalized.in_(MEDIUM_CONGESTION),
            "Medium",
        ),
        (
            normalized.in_(LOW_CONGESTION),
            "Low",
        ),
        else_="Medium",
    )


def accident_sql_expression():
    """
    SQL boolean-style accident expression.
    """

    normalized = func.lower(
        func.trim(
            Traffic.accident
        )
    )

    return case(
        (
            normalized.in_(ACCIDENT_VALUES),
            1,
        ),
        else_=0,
    )


def congestion_from_average(value):
    """
    Convert average vehicle count into a simple
    analytical congestion status.
    """

    value = float(value or 0)

    if value >= 150:
        return "High"

    if value >= 80:
        return "Medium"

    return "Low"


def empty_overview():
    """
    Consistent empty response.
    """

    return {
        "total_records": 0,
        "total_vehicles": 0,
        "avg_vehicle_count": 0,
        "avg_speed_kmh": 0,
        "high_congestion": 0,
        "medium_congestion": 0,
        "low_congestion": 0,
        "accident_locations": 0,
        "most_congested_location": "N/A",
        "most_congested_vehicles": 0,
        "least_congested_location": "N/A",
        "least_congested_vehicles": 0,
    }


# ============================================================
# OVERVIEW
# ============================================================

@router.get("/overview")
def get_analytics_overview(
    db: Session = Depends(get_db),
):
    """
    Main dashboard KPI endpoint.

    MySQL performs all aggregation.
    """

    congestion_expression = (
        congestion_sql_expression()
    )

    high_case = case(
        (
            congestion_expression == "High",
            1,
        ),
        else_=0,
    )

    medium_case = case(
        (
            congestion_expression == "Medium",
            1,
        ),
        else_=0,
    )

    low_case = case(
        (
            congestion_expression == "Low",
            1,
        ),
        else_=0,
    )

    accident_case = accident_sql_expression()

    row = (
        db.query(
            func.count(
                Traffic.id
            ).label(
                "total_records"
            ),

            func.coalesce(
                func.sum(
                    Traffic.vehicle_count
                ),
                0,
            ).label(
                "total_vehicles"
            ),

            func.coalesce(
                func.avg(
                    Traffic.vehicle_count
                ),
                0,
            ).label(
                "avg_vehicle_count"
            ),

            func.coalesce(
                func.avg(
                    Traffic.speed
                ),
                0,
            ).label(
                "avg_speed"
            ),

            func.coalesce(
                func.sum(
                    high_case
                ),
                0,
            ).label(
                "high_congestion"
            ),

            func.coalesce(
                func.sum(
                    medium_case
                ),
                0,
            ).label(
                "medium_congestion"
            ),

            func.coalesce(
                func.sum(
                    low_case
                ),
                0,
            ).label(
                "low_congestion"
            ),

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

    if not row or not row.total_records:
        return empty_overview()

    most_congested = (
        db.query(
            Traffic.road_name,
            Traffic.vehicle_count,
        )
        .filter(
            Traffic.road_name.isnot(None)
        )
        .order_by(
            Traffic.vehicle_count.desc()
        )
        .limit(1)
        .first()
    )

    least_congested = (
        db.query(
            Traffic.road_name,
            Traffic.vehicle_count,
        )
        .filter(
            Traffic.road_name.isnot(None)
        )
        .order_by(
            Traffic.vehicle_count.asc()
        )
        .limit(1)
        .first()
    )

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

        "most_congested_location": (
            most_congested.road_name
            if most_congested
            and most_congested.road_name
            else "Unknown"
        ),

        "most_congested_vehicles": (
            int(
                most_congested.vehicle_count
                or 0
            )
            if most_congested
            else 0
        ),

        "least_congested_location": (
            least_congested.road_name
            if least_congested
            and least_congested.road_name
            else "Unknown"
        ),

        "least_congested_vehicles": (
            int(
                least_congested.vehicle_count
                or 0
            )
            if least_congested
            else 0
        ),
    }


# ============================================================
# HOURLY TRAFFIC
# ============================================================

@router.get("/hourly")
def get_hourly_trend(
    db: Session = Depends(get_db),
):
    """
    Aggregate traffic by hour.

    Maximum 24 rows.
    """

    hour_expression = func.hour(
        Traffic.datetime
    )

    rows = (
        db.query(
            hour_expression.label(
                "hour"
            ),

            func.avg(
                Traffic.vehicle_count
            ).label(
                "avg_vehicle_count"
            ),

            func.sum(
                Traffic.vehicle_count
            ).label(
                "total_vehicles"
            ),

            func.count(
                Traffic.id
            ).label(
                "record_count"
            ),
        )
        .filter(
            Traffic.datetime.isnot(None)
        )
        .group_by(
            hour_expression
        )
        .order_by(
            hour_expression
        )
        .all()
    )

    values = {
        int(row.hour): row
        for row in rows
        if row.hour is not None
    }

    result = []

    for hour in range(24):

        row = values.get(hour)

        if row:

            average = round(
                float(
                    row.avg_vehicle_count
                    or 0
                ),
                1,
            )

            total = int(
                row.total_vehicles
                or 0
            )

            count = int(
                row.record_count
                or 0
            )

        else:

            average = 0
            total = 0
            count = 0

        congestion = (
            congestion_from_average(
                average
            )
        )

        result.append(
            {
                "hour": hour,

                "hour_label":
                    f"{hour:02d}:00",

                "avg_vehicle_count":
                    average,

                "total_vehicles":
                    total,

                "record_count":
                    count,

                "congestion":
                    congestion,
            }
        )

    return result


# ============================================================
# DAILY TRAFFIC
# ============================================================

@router.get("/daily")
def get_daily_trend(
    db: Session = Depends(get_db),
):
    """
    Aggregate traffic by calendar date.
    """

    date_expression = func.date(
        Traffic.datetime
    )

    rows = (
        db.query(
            date_expression.label(
                "date"
            ),

            func.avg(
                Traffic.vehicle_count
            ).label(
                "avg_vehicle_count"
            ),

            func.sum(
                Traffic.vehicle_count
            ).label(
                "total_vehicles"
            ),

            func.count(
                Traffic.id
            ).label(
                "record_count"
            ),
        )
        .filter(
            Traffic.datetime.isnot(None)
        )
        .group_by(
            date_expression
        )
        .order_by(
            date_expression
        )
        .all()
    )

    return [
        {
            "date": str(row.date),

            "avg_vehicle_count":
                round(
                    float(
                        row.avg_vehicle_count
                        or 0
                    ),
                    1,
            ),

            "total_vehicles":
                int(
                    row.total_vehicles
                    or 0
            ),

            "record_count":
                int(
                    row.record_count
                    or 0
            ),
        }

        for row in rows
    ]


# ============================================================
# WEEKLY TRAFFIC
# ============================================================

@router.get("/weekly")
def get_weekly_trend(
    db: Session = Depends(get_db),
):
    """
    Aggregate traffic by ISO year/week.
    """

    week_expression = func.yearweek(
        Traffic.datetime,
        3,
    )

    rows = (
        db.query(
            week_expression.label(
                "week"
            ),

            func.avg(
                Traffic.vehicle_count
            ).label(
                "avg_vehicle_count"
            ),

            func.sum(
                Traffic.vehicle_count
            ).label(
                "total_vehicles"
            ),

            func.count(
                Traffic.id
            ).label(
                "record_count"
            ),
        )
        .filter(
            Traffic.datetime.isnot(None)
        )
        .group_by(
            week_expression
        )
        .order_by(
            week_expression
        )
        .all()
    )

    result = []

    for row in rows:

        week_value = int(
            row.week or 0
        )

        year = week_value // 100
        week = week_value % 100

        result.append(
            {
                "week":
                    f"{year}-W{week:02d}",

                "avg_vehicle_count":
                    round(
                        float(
                            row.avg_vehicle_count
                            or 0
                        ),
                        1,
                    ),

                "total_vehicles":
                    int(
                        row.total_vehicles
                        or 0
                    ),

                "record_count":
                    int(
                        row.record_count
                        or 0
                    ),
            }
        )

    return result


# ============================================================
# PEAK HOURS
# ============================================================

@router.get("/peak-hours")
def get_peak_hours(
    db: Session = Depends(get_db),
):
    """
    Return top 5 peak traffic hours.
    """

    hour_expression = func.hour(
        Traffic.datetime
    )

    average_expression = func.avg(
        Traffic.vehicle_count
    )

    rows = (
        db.query(
            hour_expression.label(
                "hour"
            ),

            average_expression.label(
                "avg_vehicle_count"
            ),

            func.sum(
                Traffic.vehicle_count
            ).label(
                "total_vehicles"
            ),

            func.count(
                Traffic.id
            ).label(
                "record_count"
            ),
        )
        .filter(
            Traffic.datetime.isnot(None)
        )
        .group_by(
            hour_expression
        )
        .order_by(
            average_expression.desc()
        )
        .limit(5)
        .all()
    )

    result = []

    for row in rows:

        hour = int(
            row.hour
        )

        average = round(
            float(
                row.avg_vehicle_count
                or 0
            ),
            1,
        )

        result.append(
            {
                "hour": hour,

                "hour_label":
                    f"{hour:02d}:00",

                "avg_vehicle_count":
                    average,

                "total_vehicles":
                    int(
                        row.total_vehicles
                        or 0
                    ),

                "record_count":
                    int(
                        row.record_count
                        or 0
                    ),

                "congestion":
                    congestion_from_average(
                        average
                    ),
            }
        )

    return result


# ============================================================
# CONGESTION DISTRIBUTION
# ============================================================

@router.get("/congestion-distribution")
def get_congestion_distribution(
    db: Session = Depends(get_db),
):
    """
    Return normalized congestion distribution.

    MySQL performs GROUP BY.
    """

    congestion_expression = (
        congestion_sql_expression()
    )

    rows = (
        db.query(
            congestion_expression.label(
                "level"
            ),

            func.count(
                Traffic.id
            ).label(
                "count"
            ),
        )
        .group_by(
            congestion_expression
        )
        .all()
    )

    counts = {
        "High": 0,
        "Medium": 0,
        "Low": 0,
    }

    for row in rows:

        level = normalize_congestion(
            row.level
        )

        counts[level] += int(
            row.count or 0
        )

    total = sum(
        counts.values()
    )

    if total == 0:

        return {
            "total": 0,

            "high": {
                "count": 0,
                "percentage": 0,
            },

            "medium": {
                "count": 0,
                "percentage": 0,
            },

            "low": {
                "count": 0,
                "percentage": 0,
            },

            "chart_labels": [
                "High",
                "Medium",
                "Low",
            ],

            "chart_data": [
                0,
                0,
                0,
            ],
        }

    return {
        "total": total,

        "high": {
            "count":
                counts["High"],

            "percentage":
                round(
                    counts["High"]
                    / total
                    * 100,
                    1,
                ),
        },

        "medium": {
            "count":
                counts["Medium"],

            "percentage":
                round(
                    counts["Medium"]
                    / total
                    * 100,
                    1,
                ),
        },

        "low": {
            "count":
                counts["Low"],

            "percentage":
                round(
                    counts["Low"]
                    / total
                    * 100,
                    1,
                ),
        },

        "chart_labels": [
            "High",
            "Medium",
            "Low",
        ],

        "chart_data": [
            counts["High"],
            counts["Medium"],
            counts["Low"],
        ],
    }


# ============================================================
# TOP CONGESTED
# ============================================================

@router.get("/top-congested")
def get_top_congested_locations(
    db: Session = Depends(get_db),

    limit: int = Query(
        10,
        ge=1,
        le=100,
    ),
):
    """
    Return top roads by vehicle count.

    This endpoint is intentionally lightweight.
    """

    rows = (
        db.query(
            Traffic.road_name,
            Traffic.vehicle_count,
            Traffic.congestion_level,
            Traffic.speed,
        )
        .filter(
            Traffic.road_name.isnot(None)
        )
        .order_by(
            Traffic.vehicle_count.desc()
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "rank": index + 1,

            "location":
                row.road_name
                or "Unknown",

            "road":
                row.road_name
                or "Unknown",

            "vehicle_count":
                int(
                    row.vehicle_count
                    or 0
                ),

            "congestion_level":
                normalize_congestion(
                    row.congestion_level
                ),

            "average_speed":
                round(
                    float(
                        row.speed or 0
                    ),
                    1,
                ),

            "road_status":
                normalize_congestion(
                    row.congestion_level
                ),
        }

        for index, row
        in enumerate(rows)
    ]


# ============================================================
# ROAD PERFORMANCE
# ============================================================

@router.get("/road-performance")
def get_road_performance(
    db: Session = Depends(get_db),

    limit: int = Query(
        10,
        ge=1,
        le=100,
    ),
):
    """
    SQL-powered road analytics.

    IMPORTANT:

    The frontend does NOT need to download raw
    traffic records anymore.

    MySQL calculates:

    - average vehicles
    - total vehicles
    - average speed
    - record count
    - accidents
    - high congestion
    - medium congestion
    - low congestion

    Python receives only one row per road.
    """

    road_name_expression = func.coalesce(
        func.nullif(
            func.trim(
                Traffic.road_name
            ),
            "",
        ),
        "Unknown Road",
    )

    congestion_expression = (
        congestion_sql_expression()
    )

    accident_expression = (
        accident_sql_expression()
    )

    rows = (
        db.query(
            road_name_expression.label(
                "road"
            ),

            func.avg(
                Traffic.vehicle_count
            ).label(
                "avg_vehicle_count"
            ),

            func.sum(
                Traffic.vehicle_count
            ).label(
                "total_vehicles"
            ),

            func.avg(
                Traffic.speed
            ).label(
                "avg_speed"
            ),

            func.count(
                Traffic.id
            ).label(
                "record_count"
            ),

            func.sum(
                accident_expression
            ).label(
                "accident_count"
            ),

            func.sum(
                case(
                    (
                        congestion_expression
                        == "High",
                        1,
                    ),
                    else_=0,
                )
            ).label(
                "high_count"
            ),

            func.sum(
                case(
                    (
                        congestion_expression
                        == "Medium",
                        1,
                    ),
                    else_=0,
                )
            ).label(
                "medium_count"
            ),

            func.sum(
                case(
                    (
                        congestion_expression
                        == "Low",
                        1,
                    ),
                    else_=0,
                )
            ).label(
                "low_count"
            ),
        )
        .group_by(
            road_name_expression
        )
        .order_by(
            func.avg(
                Traffic.vehicle_count
            ).desc()
        )
        .limit(limit)
        .all()
    )

    result = []

    for row in rows:

        high_count = int(
            row.high_count or 0
        )

        medium_count = int(
            row.medium_count or 0
        )

        low_count = int(
            row.low_count or 0
        )

        if high_count >= max(
            medium_count,
            low_count,
        ):
            congestion = "High"

        elif medium_count >= low_count:
            congestion = "Medium"

        else:
            congestion = "Low"

        average_speed = round(
            float(
                row.avg_speed or 0
            ),
            1,
        )

        average_vehicles = round(
            float(
                row.avg_vehicle_count
                or 0
            ),
            1,
        )

        accident_count = int(
            row.accident_count or 0
        )

        # ----------------------------------------------------
        # Risk score
        # ----------------------------------------------------

        risk_score = 0

        if congestion == "High":
            risk_score += 60

        elif congestion == "Medium":
            risk_score += 30

        if average_speed < 20:
            risk_score += 25

        elif average_speed < 40:
            risk_score += 15

        if accident_count > 0:
            risk_score += 15

        risk_score = min(
            risk_score,
            100,
        )

        if risk_score >= 70:
            risk_level = "Critical"

        elif risk_score >= 45:
            risk_level = "High"

        elif risk_score >= 25:
            risk_level = "Medium"

        else:
            risk_level = "Low"

        result.append(
            {
                "road": row.road,

                "vehicles":
                    int(
                        round(
                            float(
                                row.total_vehicles
                                or 0
                            )
                        )
                    ),

                "avg_vehicle_count":
                    average_vehicles,

                "speed":
                    round(
                        average_speed
                    ),

                "average_speed":
                    average_speed,

                "record_count":
                    int(
                        row.record_count
                        or 0
                    ),

                "congestion":
                    congestion,

                "congestion_level":
                    congestion,

                "accident":
                    accident_count > 0,

                "accident_count":
                    accident_count,

                "risk_score":
                    risk_score,

                "risk_level":
                    risk_level,
            }
        )

    return result


# ============================================================
# SPEED DISTRIBUTION
# ============================================================

@router.get("/speed-distribution")
def get_speed_distribution(
    db: Session = Depends(get_db),
):
    """
    Speed distribution using SQL CASE.

    Python receives at most 5 rows.
    """

    speed_bucket = case(
        (
            Traffic.speed < 20,
            "0-20 km/h",
        ),
        (
            Traffic.speed < 40,
            "20-40 km/h",
        ),
        (
            Traffic.speed < 60,
            "40-60 km/h",
        ),
        (
            Traffic.speed < 80,
            "60-80 km/h",
        ),
        else_="80+ km/h",
    )

    rows = (
        db.query(
            speed_bucket.label(
                "speed_range"
            ),

            func.count(
                Traffic.id
            ).label(
                "count"
            ),
        )
        .filter(
            Traffic.speed.isnot(None)
        )
        .group_by(
            speed_bucket
        )
        .all()
    )

    counts = {
        "0-20 km/h": 0,
        "20-40 km/h": 0,
        "40-60 km/h": 0,
        "60-80 km/h": 0,
        "80+ km/h": 0,
    }

    for row in rows:

        if row.speed_range in counts:

            counts[
                row.speed_range
            ] = int(
                row.count or 0
            )

    return [
        {
            "range": "0-20 km/h",
            "label": "Standstill",
            "count":
                counts["0-20 km/h"],
        },

        {
            "range": "20-40 km/h",
            "label": "Slow",
            "count":
                counts["20-40 km/h"],
        },

        {
            "range": "40-60 km/h",
            "label": "Moderate",
            "count":
                counts["40-60 km/h"],
        },

        {
            "range": "60-80 km/h",
            "label": "Normal",
            "count":
                counts["60-80 km/h"],
        },

        {
            "range": "80+ km/h",
            "label": "Fast",
            "count":
                counts["80+ km/h"],
        },
    ]


# ============================================================
# WEATHER ANALYSIS
# ============================================================

@router.get("/weather")
def get_weather_analysis(
    db: Session = Depends(get_db),
):
    """
    Aggregate traffic analytics by weather.
    """

    weather_expression = func.coalesce(
        func.nullif(
            func.trim(
                Traffic.weather
            ),
            "",
        ),
        "Unknown",
    )

    rows = (
        db.query(
            weather_expression.label(
                "weather"
            ),

            func.avg(
                Traffic.vehicle_count
            ).label(
                "avg_vehicle_count"
            ),

            func.avg(
                Traffic.speed
            ).label(
                "avg_speed"
            ),

            func.sum(
                Traffic.vehicle_count
            ).label(
                "total_vehicles"
            ),

            func.count(
                Traffic.id
            ).label(
                "record_count"
            ),
        )
        .group_by(
            weather_expression
        )
        .order_by(
            weather_expression
        )
        .all()
    )

    return [
        {
            "weather":
                normalize_weather(
                    row.weather
                ),

            "avg_vehicle_count":
                round(
                    float(
                        row.avg_vehicle_count
                        or 0
                    ),
                    1,
                ),

            "avg_speed":
                round(
                    float(
                        row.avg_speed
                        or 0
                    ),
                    1,
                ),

            # Kept for frontend compatibility.
            "speed":
                round(
                    float(
                        row.avg_speed
                        or 0
                    ),
                    1,
                ),

            "total_vehicles":
                int(
                    row.total_vehicles
                    or 0
                ),

            "record_count":
                int(
                    row.record_count
                    or 0
                ),
        }

        for row in rows
    ]


# ============================================================
# ALERT SUMMARY
# ============================================================

@router.get("/alerts")
def get_analytics_alerts(
    db: Session = Depends(get_db),
):
    """
    Lightweight alert summary.

    This endpoint does not return all traffic records.
    """

    congestion_expression = (
        congestion_sql_expression()
    )

    accident_expression = (
        accident_sql_expression()
    )

    row = (
        db.query(
            func.coalesce(
                func.sum(
                    case(
                        (
                            congestion_expression
                            == "High",
                            1,
                        ),
                        else_=0,
                    )
                ),
                0,
            ).label(
                "high_congestion"
            ),

            func.coalesce(
                func.sum(
                    accident_expression
                ),
                0,
            ).label(
                "accidents"
            ),
        )
        .first()
    )

    high_congestion = int(
        row.high_congestion or 0
    )

    accidents = int(
        row.accidents or 0
    )

    total_alerts = (
        high_congestion +
        accidents
    )

    return {
        "total_alerts":
            total_alerts,

        "high_congestion":
            high_congestion,

        "accidents":
            accidents,

        "status":
            (
                "Critical"
                if accidents > 0
                else "Warning"
                if high_congestion > 0
                else "Normal"
            ),
    }


# ============================================================
# ANALYTICS INSIGHTS
# ============================================================

@router.get("/insights")
def get_analytics_insights(
    db: Session = Depends(get_db),
):
    """
    Lightweight analytical summary.

    Designed for the AI Traffic Intelligence section.

    No raw traffic records are returned.
    """

    # --------------------------------------------------------
    # Overall congestion
    # --------------------------------------------------------

    overview = get_analytics_overview(
        db
    )

    high = int(
        overview.get(
            "high_congestion",
            0,
        )
    )

    medium = int(
        overview.get(
            "medium_congestion",
            0,
        )
    )

    low = int(
        overview.get(
            "low_congestion",
            0,
        )
    )

    total = (
        high +
        medium +
        low
    )

    if total == 0:

        overall_status = "Unknown"
        high_percentage = 0

    else:

        high_percentage = (
            high / total * 100
        )

        if high_percentage >= 50:
            overall_status = "High"

        elif (
            high_percentage >= 25
            or medium / total >= 0.50
        ):
            overall_status = "Medium"

        else:
            overall_status = "Low"

    # --------------------------------------------------------
    # Peak hour
    # --------------------------------------------------------

    peak_hours = get_peak_hours(
        db
    )

    peak_hour = (
        peak_hours[0]
        if peak_hours
        else None
    )

    # --------------------------------------------------------
    # Road
    # --------------------------------------------------------

    roads = get_road_performance(
        db,
        limit=3,
    )

    critical_road = (
        roads[0]
        if roads
        else None
    )

    # --------------------------------------------------------
    # Recommendation
    # --------------------------------------------------------

    if critical_road:

        road_name = (
            critical_road["road"]
        )

        risk_level = (
            critical_road["risk_level"]
        )

        if (
            risk_level
            == "Critical"
        ):

            recommendation = (
                f"Immediate attention is "
                f"recommended for {road_name}. "
                f"Traffic conditions indicate "
                f"critical congestion or safety risk."
            )

        elif (
            risk_level
            == "High"
        ):

            recommendation = (
                f"Monitor {road_name} closely "
                f"and consider alternate routes "
                f"during peak traffic periods."
            )

        else:

            recommendation = (
                "Traffic conditions are "
                "currently manageable. "
                "Continue monitoring peak hours."
            )

    else:

        recommendation = (
            "Insufficient road-level data "
            "to generate a specific recommendation."
        )

    return {
        "status":
            overall_status,

        "high_congestion_percentage":
            round(
                high_percentage,
                1,
            ),

        "peak_hour":
            (
                peak_hour["hour_label"]
                if peak_hour
                else "N/A"
            ),

        "peak_hour_vehicles":
            (
                peak_hour[
                    "avg_vehicle_count"
                ]
                if peak_hour
                else 0
            ),

        "most_critical_road":
            (
                critical_road["road"]
                if critical_road
                else "N/A"
            ),

        "risk_level":
            (
                critical_road["risk_level"]
                if critical_road
                else "Unknown"
            ),

        "recommendation":
            recommendation,
    }
