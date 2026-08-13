from fastapi import APIRouter, HTTPException
from sqlalchemy import text

from database import engine

router = APIRouter(prefix="/traffic-trends", tags=["Traffic Trends"])

# The existing traffic_data table has no estimated_delay column. Calculate the
# same delay bands used by the prediction service from stored congestion level.
DELAY_SQL = """
    CASE LOWER(COALESCE(congestion_level, ''))
        WHEN 'low' THEN CASE WHEN vehicle_count < 50 THEN 2 ELSE 4 END
        WHEN 'moderate' THEN CASE WHEN vehicle_count < 180 THEN 7 ELSE 10 END
        WHEN 'medium' THEN CASE WHEN vehicle_count < 180 THEN 7 ELSE 10 END
        WHEN 'high' THEN CASE WHEN vehicle_count < 350 THEN 15 ELSE 20 END
        WHEN 'severe' THEN CASE WHEN vehicle_count < 550 THEN 28 ELSE 35 END
        ELSE 0
    END
"""


def _run_trend_query(query: str, params: dict | None = None):
    try:
        with engine.connect() as connection:
            result = connection.execute(text(query), params or {})
            return [dict(row._mapping) for row in result]
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch traffic trend data.",
        ) from exc


@router.get("/daily")
def get_daily_trend():
    rows = _run_trend_query(
        f"""
        SELECT
            DATE(datetime) AS date,
            ROUND(AVG(vehicle_count), 2) AS avg_vehicle_count,
            ROUND(AVG(speed), 2) AS avg_speed,
            ROUND(AVG(({DELAY_SQL})), 2) AS avg_delay,
            COUNT(*) AS total_records,
            SUM(CASE WHEN LOWER(congestion_level) IN ('high', 'severe') THEN 1 ELSE 0 END)
                AS high_congestion_count
        FROM traffic_data
        WHERE datetime IS NOT NULL
        GROUP BY DATE(datetime)
        ORDER BY DATE(datetime)
        """
    )

    data = [
        {
            "date": str(row["date"]),
            "avg_vehicle_count": float(row["avg_vehicle_count"] or 0),
            "avg_speed": float(row["avg_speed"] or 0),
            "avg_delay": float(row["avg_delay"] or 0),
            "total_records": int(row["total_records"] or 0),
            "high_congestion_count": int(row["high_congestion_count"] or 0),
        }
        for row in rows
    ]
    return {"status": "success", "count": len(data), "data": data}


@router.get("/monthly")
def get_monthly_trend():
    rows = _run_trend_query(
        f"""
        SELECT
            YEAR(`datetime`) AS year,
            MONTH(`datetime`) AS month,

            DATE_FORMAT(
                MIN(`datetime`),
                '%Y-%m'
            ) AS month_label,

            MONTHNAME(
                MIN(`datetime`)
            ) AS month_name,

            ROUND(
                AVG(vehicle_count),
                2
            ) AS avg_vehicle_count,

            ROUND(
                AVG(speed),
                2
            ) AS avg_speed,

            ROUND(
                AVG(({DELAY_SQL})),
                2
            ) AS avg_delay,

            COUNT(*) AS total_records,

            SUM(
                CASE
                    WHEN LOWER(congestion_level)
                    IN ('high', 'severe')
                    THEN 1
                    ELSE 0
                END
            ) AS high_congestion_count

        FROM traffic_data

        WHERE `datetime` IS NOT NULL

        GROUP BY
            YEAR(`datetime`),
            MONTH(`datetime`)

        ORDER BY
            YEAR(`datetime`),
            MONTH(`datetime`)
        """
    )

    data = [
        {
            "year": int(row["year"]),
            "month": int(row["month"]),
            "month_label": str(row["month_label"]),
            "month_name": str(row["month_name"]),
            "avg_vehicle_count": float(
                row["avg_vehicle_count"] or 0
            ),
            "avg_speed": float(
                row["avg_speed"] or 0
            ),
            "avg_delay": float(
                row["avg_delay"] or 0
            ),
            "total_records": int(
                row["total_records"] or 0
            ),
            "high_congestion_count": int(
                row["high_congestion_count"] or 0
            ),
        }
        for row in rows
    ]

    return {
        "status": "success",
        "count": len(data),
        "data": data,
    }


@router.get("/yearly")
def get_yearly_trend():
    rows = _run_trend_query(
        f"""
        SELECT
            YEAR(datetime) AS year,
            ROUND(AVG(vehicle_count), 2) AS avg_vehicle_count,
            ROUND(AVG(speed), 2) AS avg_speed,
            ROUND(AVG(({DELAY_SQL})), 2) AS avg_delay,
            COUNT(*) AS total_records,
            SUM(CASE WHEN LOWER(congestion_level) IN ('high', 'severe') THEN 1 ELSE 0 END)
                AS high_congestion_count
        FROM traffic_data
        WHERE datetime IS NOT NULL
        GROUP BY YEAR(datetime)
        ORDER BY YEAR(datetime)
        """
    )

    data = [
        {
            "year": int(row["year"]),
            "avg_vehicle_count": float(row["avg_vehicle_count"] or 0),
            "avg_speed": float(row["avg_speed"] or 0),
            "avg_delay": float(row["avg_delay"] or 0),
            "total_records": int(row["total_records"] or 0),
            "high_congestion_count": int(row["high_congestion_count"] or 0),
        }
        for row in rows
    ]
    return {"status": "success", "count": len(data), "data": data}
# ============================================================
# PEAK TRAFFIC ANALYSIS
# ============================================================


@router.get("/peak")
def get_peak_traffic():
    rows = _run_trend_query(
        f"""
        SELECT
            HOUR(`datetime`) AS hour,

            ROUND(AVG(vehicle_count), 2)
                AS avg_vehicle_count,

            MAX(vehicle_count)
                AS max_vehicle_count,

            ROUND(AVG(speed), 2)
                AS avg_speed,

            ROUND(
                AVG(({DELAY_SQL})),
                2
            ) AS avg_delay,

            COUNT(*) AS total_records,

            SUM(
                CASE
                    WHEN LOWER(congestion_level)
                    IN ('high', 'severe')
                    THEN 1
                    ELSE 0
                END
            ) AS high_congestion_count

        FROM traffic_data

        WHERE `datetime` IS NOT NULL

        GROUP BY HOUR(`datetime`)

        ORDER BY avg_vehicle_count DESC
        """
    )

    if not rows:
        return {
            "status": "success",
            "count": 0,
            "data": []
        }

    peak = rows[0]

    return {
        "status": "success",
        "data": {
            "peak_hour": int(peak["hour"]),
            "peak_hour_label": (
                f"{int(peak['hour']):02d}:00"
            ),
            "avg_vehicle_count": float(
                peak["avg_vehicle_count"] or 0
            ),
            "max_vehicle_count": int(
                peak["max_vehicle_count"] or 0
            ),
            "avg_speed": float(
                peak["avg_speed"] or 0
            ),
            "avg_delay": float(
                peak["avg_delay"] or 0
            ),
            "total_records": int(
                peak["total_records"] or 0
            ),
            "high_congestion_count": int(
                peak["high_congestion_count"] or 0
            )
        }
    }


# ============================================================
# AVAILABLE ROADS
# ============================================================

@router.get("/roads")
def get_available_roads():
    rows = _run_trend_query(
        """
        SELECT DISTINCT
            road_name
        FROM traffic_data
        WHERE road_name IS NOT NULL
          AND TRIM(road_name) <> ''
        ORDER BY road_name
        """
    )

    roads = [
        str(row["road_name"])
        for row in rows
        if row["road_name"]
    ]

    return {
        "status": "success",
        "count": len(roads),
        "data": roads
    }


# ============================================================
# ROAD-WISE TRAFFIC ANALYSIS
# ============================================================

@router.get("/road/{road_name}")
def get_road_traffic(road_name: str):
    rows = _run_trend_query(
        f"""
        SELECT
            road_name,

            ROUND(
                AVG(vehicle_count),
                2
            ) AS avg_vehicle_count,

            MAX(vehicle_count)
                AS max_vehicle_count,

            ROUND(
                AVG(speed),
                2
            ) AS avg_speed,

            ROUND(
                AVG(({DELAY_SQL})),
                2
            ) AS avg_delay,

            COUNT(*) AS total_records,

            SUM(
                CASE
                    WHEN LOWER(congestion_level)
                    IN ('high', 'severe')
                    THEN 1
                    ELSE 0
                END
            ) AS high_congestion_count

        FROM traffic_data

        WHERE road_name = :road_name

        GROUP BY road_name
        """,
        {
            "road_name": road_name
        }
    )

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Road not found."
        )

    row = rows[0]

    total_records = int(
        row["total_records"] or 0
    )

    high_congestion_count = int(
        row["high_congestion_count"] or 0
    )

    high_congestion_percentage = (
        (high_congestion_count / total_records) * 100
        if total_records > 0
        else 0
    )

    return {
        "status": "success",
        "data": {
            "road_name": str(row["road_name"]),
            "avg_vehicle_count": float(
                row["avg_vehicle_count"] or 0
            ),
            "max_vehicle_count": int(
                row["max_vehicle_count"] or 0
            ),
            "avg_speed": float(
                row["avg_speed"] or 0
            ),
            "avg_delay": float(
                row["avg_delay"] or 0
            ),
            "total_records": total_records,
            "high_congestion_count":
                high_congestion_count,
            "high_congestion_percentage":
                round(
                    high_congestion_percentage,
                    2
            )
        }
    }
