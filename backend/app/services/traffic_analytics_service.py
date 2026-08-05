"""Analytics service backing the Analytics & Heatmap dashboards.

Everything here is driven by real user data - PredictionHistory and
TrafficAlert - using SQLAlchemy aggregation (func.count/avg/max, GROUP BY)
so we never pull full tables into Python. All functions are safe to call
against an empty database and return zeroed/empty results rather than
raising.
"""

from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.prediction_history import PredictionHistory
from app.models.traffic_alert import TrafficAlert
from app.services.traffic_alert_service import CONGESTION_SCALE_MAX


def _to_percentage(avg_traffic: Optional[float]) -> float:
    """Converts a raw average predicted-traffic value into a 0-100
    congestion percentage, using the same scale the alert system uses."""
    if not avg_traffic:
        return 0.0
    return round(min(float(avg_traffic) / CONGESTION_SCALE_MAX * 100, 100), 1)


def _hourly_traffic_rows(db: Session, user_id: int):
    """Rows of (hour, avg_traffic) grouped by PredictionHistory.hour - the
    hour-of-day the prediction scenario itself represents, not when the
    API call happened. Shared by get_kpis, get_hourly_traffic_breakdown
    and get_trends_summary so the "peak hour" definition never drifts."""
    return (
        db.query(
            PredictionHistory.hour.label("hour"),
            func.avg(PredictionHistory.predicted_traffic).label("avg_traffic"),
        )
        .filter(PredictionHistory.user_id == user_id)
        .group_by(PredictionHistory.hour)
        .all()
    )


def _peak_hour(rows) -> Optional[int]:
    if not rows:
        return None
    top = max(rows, key=lambda r: r.avg_traffic or 0)
    return int(top.hour)


def _congestion_mode_row(db: Session, user_id: int):
    """The single most frequent congestion level for a user. Shared by
    get_prediction_history_summary and get_trends_summary."""
    return (
        db.query(
            PredictionHistory.congestion,
            func.count(PredictionHistory.id).label("count"),
        )
        .filter(PredictionHistory.user_id == user_id)
        .group_by(PredictionHistory.congestion)
        .order_by(func.count(PredictionHistory.id).desc())
        .first()
    )


# --------------------------------------------------------------------------
# KPI cards
# --------------------------------------------------------------------------

def get_kpis(db: Session, user_id: int) -> dict:
    total_predictions = (
        db.query(func.count(PredictionHistory.id))
        .filter(PredictionHistory.user_id == user_id)
        .scalar() or 0
    )

    active_alerts = (
        db.query(func.count(TrafficAlert.id))
        .filter(TrafficAlert.user_id == user_id)
        .scalar() or 0
    )

    high_congestion_count = (
        db.query(func.count(PredictionHistory.id))
        .filter(
            PredictionHistory.user_id == user_id,
            PredictionHistory.congestion == "High",
        )
        .scalar() or 0
    )

    avg_traffic = (
        db.query(func.avg(PredictionHistory.predicted_traffic))
        .filter(PredictionHistory.user_id == user_id)
        .scalar()
    )

    avg_delay = (
        db.query(func.avg(TrafficAlert.expected_delay))
        .filter(TrafficAlert.user_id == user_id)
        .scalar()
    )

    avg_confidence = (
        db.query(func.avg(PredictionHistory.confidence))
        .filter(PredictionHistory.user_id == user_id)
        .scalar()
    )

    # Peak hour = the hour-of-day (from the prediction scenario itself,
    # i.e. PredictionHistory.hour) with the highest average predicted
    # traffic - not the hour the API call happened to be made.
    peak_hour = _peak_hour(_hourly_traffic_rows(db, user_id))

    return {
        "total_predictions": total_predictions,
        "active_alerts": active_alerts,
        "high_congestion_count": high_congestion_count,
        "avg_congestion": _to_percentage(avg_traffic),
        "avg_delay": round(avg_delay or 0, 1),
        "avg_confidence": round(avg_confidence or 0, 1),
        "peak_hour": peak_hour,
    }


# --------------------------------------------------------------------------
# Distributions
# --------------------------------------------------------------------------

def get_congestion_distribution(db: Session, user_id: int) -> list:
    rows = (
        db.query(
            PredictionHistory.congestion,
            func.count(PredictionHistory.id).label("count"),
        )
        .filter(PredictionHistory.user_id == user_id)
        .group_by(PredictionHistory.congestion)
        .all()
    )

    return [
        {"label": r.congestion or "Unknown", "count": r.count} for r in rows
    ]


def get_weather_distribution(db: Session, user_id: int) -> list:
    rows = (
        db.query(
            PredictionHistory.weather_main,
            func.count(PredictionHistory.id).label("count"),
        )
        .filter(PredictionHistory.user_id == user_id)
        .group_by(PredictionHistory.weather_main)
        .all()
    )

    return [
        {"label": r.weather_main or "Unknown", "count": r.count} for r in rows
    ]


# --------------------------------------------------------------------------
# Trends (daily / weekly / monthly) - gap-filled so charts always render a
# full axis even for periods with zero predictions.
# --------------------------------------------------------------------------

def get_daily_trend(db: Session, user_id: int, days: int = 30) -> list:
    since = (datetime.utcnow() - timedelta(days=days - 1)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    rows = (
        db.query(
            func.date_trunc("day", PredictionHistory.created_at).label("bucket"),
            func.count(PredictionHistory.id).label("count"),
            func.avg(PredictionHistory.predicted_traffic).label("avg_traffic"),
        )
        .filter(
            PredictionHistory.user_id == user_id,
            PredictionHistory.created_at >= since,
        )
        .group_by(
            func.date_trunc(
                "day",
                PredictionHistory.created_at
            )
        )
        .all()
    )
    by_day = {r.bucket.date(): r for r in rows}

    result = []
    for i in range(days):
        day = (since + timedelta(days=i)).date()
        row = by_day.get(day)
        result.append({
            "period": day.isoformat(),
            "predictions": row.count if row else 0,
            "avg_congestion": _to_percentage(row.avg_traffic if row else None),
        })

    return result


def get_weekly_trend(db: Session, user_id: int, weeks: int = 12) -> list:
    today = datetime.utcnow()
    this_monday = (today - timedelta(days=today.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    since = this_monday - timedelta(weeks=weeks - 1)

    rows = (
        db.query(
            func.date_trunc("week", PredictionHistory.created_at).label("bucket"),
            func.count(PredictionHistory.id).label("count"),
            func.avg(PredictionHistory.predicted_traffic).label("avg_traffic"),
        )
        .filter(
            PredictionHistory.user_id == user_id,
            PredictionHistory.created_at >= since,
        )
        .group_by(
            func.date_trunc(
                "week",
                PredictionHistory.created_at
            )
        )
        .all()
    )
    by_week = {r.bucket.date(): r for r in rows}

    result = []
    for i in range(weeks):
        week_start = (since + timedelta(weeks=i)).date()
        row = by_week.get(week_start)
        result.append({
            "period": f"Week of {week_start.isoformat()}",
            "predictions": row.count if row else 0,
            "avg_congestion": _to_percentage(row.avg_traffic if row else None),
        })

    return result


def get_monthly_trend(db: Session, user_id: int, months: int = 12) -> list:
    today = datetime.utcnow()
    cursor = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    month_starts = []
    for _ in range(months):
        month_starts.append(cursor)
        prev_month = cursor.month - 1 or 12
        prev_year = cursor.year - 1 if cursor.month == 1 else cursor.year
        cursor = cursor.replace(year=prev_year, month=prev_month)
    month_starts.reverse()

    since = month_starts[0]

    rows = (
        db.query(
            func.date_trunc("month", PredictionHistory.created_at).label("bucket"),
            func.count(PredictionHistory.id).label("count"),
            func.avg(PredictionHistory.predicted_traffic).label("avg_traffic"),
        )
        .filter(
            PredictionHistory.user_id == user_id,
            PredictionHistory.created_at >= since,
        )
        .group_by(
            func.date_trunc(
                "month",
                PredictionHistory.created_at
            )
        )
        .all()
    )
    by_month = {r.bucket.date(): r for r in rows}

    result = []
    for month_start in month_starts:
        row = by_month.get(month_start.date())
        result.append({
            "period": month_start.strftime("%b %Y"),
            "predictions": row.count if row else 0,
            "avg_congestion": _to_percentage(row.avg_traffic if row else None),
        })

    return result


# --------------------------------------------------------------------------
# Source / destination / route breakdowns
# --------------------------------------------------------------------------

def get_source_wise_traffic(db: Session, user_id: int) -> list:
    rows = (
        db.query(
            PredictionHistory.source,
            func.count(PredictionHistory.id).label("count"),
            func.avg(PredictionHistory.predicted_traffic).label("avg_traffic"),
        )
        .filter(PredictionHistory.user_id == user_id)
        .group_by(PredictionHistory.source)
        .order_by(func.count(PredictionHistory.id).desc())
        .all()
    )

    return [
        {
            "name": r.source,
            "predictions": r.count,
            "avg_congestion": _to_percentage(r.avg_traffic),
        }
        for r in rows
    ]


def get_destination_wise_traffic(db: Session, user_id: int) -> list:
    rows = (
        db.query(
            PredictionHistory.destination,
            func.count(PredictionHistory.id).label("count"),
            func.avg(PredictionHistory.predicted_traffic).label("avg_traffic"),
        )
        .filter(PredictionHistory.user_id == user_id)
        .group_by(PredictionHistory.destination)
        .order_by(func.count(PredictionHistory.id).desc())
        .all()
    )

    return [
        {
            "name": r.destination,
            "predictions": r.count,
            "avg_congestion": _to_percentage(r.avg_traffic),
        }
        for r in rows
    ]


def _route_delay_lookup(db: Session, user_id: int) -> dict:
    """avg expected_delay per (source, destination), sourced from alerts."""
    rows = (
        db.query(
            TrafficAlert.source,
            TrafficAlert.destination,
            func.avg(TrafficAlert.expected_delay).label("avg_delay"),
        )
        .filter(TrafficAlert.user_id == user_id)
        .group_by(TrafficAlert.source, TrafficAlert.destination)
        .all()
    )

    return {(r.source, r.destination): float(r.avg_delay or 0) for r in rows}


def get_route_statistics(
    db: Session,
    user_id: int,
    limit: Optional[int] = None,
    order_by_congestion: bool = False,
) -> list:
    rows = (
        db.query(
            PredictionHistory.source,
            PredictionHistory.destination,
            func.count(PredictionHistory.id).label("count"),
            func.avg(PredictionHistory.predicted_traffic).label("avg_traffic"),
            func.max(PredictionHistory.predicted_traffic).label("max_traffic"),
        )
        .filter(PredictionHistory.user_id == user_id)
        .group_by(PredictionHistory.source, PredictionHistory.destination)
        .all()
    )

    delay_lookup = _route_delay_lookup(db, user_id)

    routes = [
        {
            "source": r.source,
            "destination": r.destination,
            "predictions": r.count,
            "avg_congestion": _to_percentage(r.avg_traffic),
            "avg_delay": round(
                delay_lookup.get((r.source, r.destination), 0.0), 1
            ),
            "max_congestion": _to_percentage(r.max_traffic),
        }
        for r in rows
    ]

    routes.sort(
        key=lambda x: x["avg_congestion"] if order_by_congestion else x["predictions"],
        reverse=True,
    )

    return routes[:limit] if limit else routes


def get_top_congested_routes(db: Session, user_id: int, limit: int = 10) -> list:
    return get_route_statistics(db, user_id, limit=limit, order_by_congestion=True)


# --------------------------------------------------------------------------
# Prediction history summary
# --------------------------------------------------------------------------

def get_prediction_history_summary(db: Session, user_id: int) -> dict:
    total = (
        db.query(func.count(PredictionHistory.id))
        .filter(PredictionHistory.user_id == user_id)
        .scalar() or 0
    )

    if total == 0:
        return {
            "total_predictions": 0,
            "first_prediction_at": None,
            "last_prediction_at": None,
            "most_common_congestion": None,
            "most_common_weather": None,
            "average_distance_km": 0.0,
        }

    first_at, last_at = (
        db.query(
            func.min(PredictionHistory.created_at),
            func.max(PredictionHistory.created_at),
        )
        .filter(PredictionHistory.user_id == user_id)
        .first()
    )

    congestion_mode = _congestion_mode_row(db, user_id)

    weather_mode = (
        db.query(
            PredictionHistory.weather_main,
            func.count(PredictionHistory.id).label("count"),
        )
        .filter(PredictionHistory.user_id == user_id)
        .group_by(PredictionHistory.weather_main)
        .order_by(func.count(PredictionHistory.id).desc())
        .first()
    )

    avg_distance = (
        db.query(func.avg(PredictionHistory.distance))
        .filter(PredictionHistory.user_id == user_id)
        .scalar()
    )

    return {
        "total_predictions": total,
        "first_prediction_at": first_at,
        "last_prediction_at": last_at,
        "most_common_congestion": congestion_mode.congestion if congestion_mode else None,
        "most_common_weather": weather_mode.weather_main if weather_mode else None,
        "average_distance_km": round(avg_distance or 0, 2),
    }


# --------------------------------------------------------------------------
# Heatmap
# --------------------------------------------------------------------------

def get_heatmap_points(db: Session, user_id: int):
    rows = (
        db.query(
            PredictionHistory.source,
            PredictionHistory.destination,
            PredictionHistory.source_lat,
            PredictionHistory.source_lng,
            func.count(PredictionHistory.id).label("count"),
            func.avg(PredictionHistory.predicted_traffic).label("avg_traffic"),
            func.max(PredictionHistory.predicted_traffic).label("max_traffic"),
        )
        .filter(
            PredictionHistory.user_id == user_id,
            PredictionHistory.source_lat.isnot(None),
            PredictionHistory.source_lng.isnot(None),
        )
        .group_by(
            PredictionHistory.source,
            PredictionHistory.destination,
            PredictionHistory.source_lat,
            PredictionHistory.source_lng,
        )
        .all()
    )

    points = []

    for row in rows:

        congestion = _to_percentage(row.avg_traffic)

        points.append({
            "lat": row.source_lat,
            "lng": row.source_lng,

            # heat intensity
            "intensity": min(1, congestion / 100),

            # information
            "source": row.source,
            "destination": row.destination,

            "prediction_count": row.count,
            "avg_traffic": round(row.avg_traffic or 0),
            "max_traffic": round(row.max_traffic or 0),
            "congestion": congestion
        })

    return points

# --------------------------------------------------------------------------
# Traffic Trends sub-module (/analytics/trends/*)
#
# daily/monthly/congestion below intentionally reuse get_daily_trend,
# get_monthly_trend and get_congestion_distribution directly from the
# routes layer - no separate implementation needed here. Only the two
# genuinely new aggregations (hourly breakdown, combined summary) live in
# this section, built on the shared helpers above.
# --------------------------------------------------------------------------

def get_hourly_traffic_breakdown(db: Session, user_id: int) -> list:
    """Average predicted traffic for every hour of the day (0-23),
    gap-filled so hours with no predictions still show up as 0."""
    rows = _hourly_traffic_rows(db, user_id)
    by_hour = {int(r.hour): float(r.avg_traffic or 0) for r in rows}

    return [
        {"hour": hour, "avg_traffic": round(by_hour.get(hour, 0.0), 1)}
        for hour in range(24)
    ]


def get_trends_summary(db: Session, user_id: int) -> dict:
    daily_rows = (
        db.query(
            func.date_trunc("day", PredictionHistory.created_at).label("day"),
            func.avg(PredictionHistory.predicted_traffic).label("avg_traffic"),
        )
        .filter(PredictionHistory.user_id == user_id)
        .group_by(
            func.date_trunc("day", PredictionHistory.created_at)
        )
        .all()
    )

    if not daily_rows:
        return {
            "average_daily_traffic": 0.0,
            "highest_traffic_day": None,
            "lowest_traffic_day": None,
            "peak_hour": None,
            "most_common_congestion": None,
        }

    day_averages = [float(r.avg_traffic or 0) for r in daily_rows]
    average_daily_traffic = round(sum(day_averages) / len(day_averages), 1)

    highest_day = max(daily_rows, key=lambda r: r.avg_traffic or 0)
    lowest_day = min(daily_rows, key=lambda r: r.avg_traffic or 0)

    peak_hour = _peak_hour(_hourly_traffic_rows(db, user_id))
    congestion_mode = _congestion_mode_row(db, user_id)

    return {
        "average_daily_traffic": average_daily_traffic,
        "highest_traffic_day": highest_day.day.date().isoformat(),
        "lowest_traffic_day": lowest_day.day.date().isoformat(),
        "peak_hour": peak_hour,
        "most_common_congestion": (
            congestion_mode.congestion if congestion_mode else None
        ),
    }


# --------------------------------------------------------------------------
# Combined dashboard summary (single round trip for the Analytics page)
# --------------------------------------------------------------------------

def get_dashboard_summary(db: Session, user_id: int) -> dict:
    return {
        "kpis": get_kpis(db, user_id),
        "congestion_distribution": get_congestion_distribution(db, user_id),
        "weather_distribution": get_weather_distribution(db, user_id),
        "top_congested_routes": get_top_congested_routes(db, user_id, limit=5),
    }
