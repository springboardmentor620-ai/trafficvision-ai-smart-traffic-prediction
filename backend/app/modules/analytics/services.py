from collections import defaultdict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.modules.traffic_monitoring.models import CongestionLevel
from app.modules.traffic_monitoring.services import get_all_roads, get_latest_reading_per_road

LEVEL_RANK = {
    CongestionLevel.LOW: 0,
    CongestionLevel.MODERATE: 1,
    CongestionLevel.HIGH: 2,
    CongestionLevel.SEVERE: 3,
}


def get_zone_heatmap(db: Session) -> list[dict]:
    roads = get_all_roads(db)
    latest_readings = get_latest_reading_per_road(db)

    zone_groups = defaultdict(list)
    for road in roads:
        zone_name = road.zone or "Unzoned"
        reading = latest_readings.get(road.id)
        vehicle_count = reading.vehicle_count if reading else 0
        utilization = (vehicle_count / road.capacity * 100) if road.capacity else 0.0
        level = reading.congestion_level if reading else None
        zone_groups[zone_name].append(
            {"vehicle_count": vehicle_count, "utilization": utilization, "level": level}
        )

    results = []
    for zone, items in zone_groups.items():
        road_count = len(items)
        total_vehicles = sum(i["vehicle_count"] for i in items)
        avg_utilization = sum(i["utilization"] for i in items) / road_count if road_count else 0.0

        levels_present = [i["level"] for i in items if i["level"] is not None]
        dominant_level = max(levels_present, key=lambda lvl: LEVEL_RANK[lvl]) if levels_present else None

        results.append({
            "zone": zone,
            "road_count": road_count,
            "total_vehicles": total_vehicles,
            "avg_utilization_percent": round(avg_utilization, 1),
            "dominant_congestion_level": dominant_level,
        })

    results.sort(key=lambda z: z["avg_utilization_percent"], reverse=True)
    return results


def get_analytics_summary(db: Session) -> dict:
    zones = get_zone_heatmap(db)
    roads = get_all_roads(db)

    total_roads = len(roads)
    total_zones = len(zones)
    overall_avg = round(sum(z["avg_utilization_percent"] for z in zones) / total_zones, 1) if total_zones else 0.0
    busiest_zone = zones[0]["zone"] if zones else None

    return {
        "total_roads": total_roads,
        "total_zones": total_zones,
        "overall_avg_utilization_percent": overall_avg,
        "busiest_zone": busiest_zone,
        "zones": zones,
    }


# ---------------------------------------------------------------------------
# DASHBOARD SUMMARY CARDS (with real yesterday-vs-today comparisons)
# ---------------------------------------------------------------------------

def _day_bounds(days_ago: int = 0):
    """Returns (start, end) datetimes for a given day, in UTC, based on now."""
    now = datetime.utcnow()
    day_start = (now - timedelta(days=days_ago)).replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)
    return day_start, day_end


def _make_card(label: str, value: float, unit: str | None, yesterday_value: float | None, display_value: str | None = None) -> dict:
    """
    Builds a MetricCard dict. If yesterday_value is None (no data available
    for that period), change_percent and trend stay None rather than being
    faked as 0 — the frontend shows "no comparison data" in that case.
    """
    change_percent = None
    trend = None
    if yesterday_value is not None and yesterday_value != 0:
        change_percent = round(((value - yesterday_value) / yesterday_value) * 100, 1)
        trend = "up" if change_percent > 1 else "down" if change_percent < -1 else "flat"
    elif yesterday_value == 0 and value > 0:
        trend = "up"

    return {
        "label": label,
        "value": value,
        "unit": unit,
        "display_value": display_value,
        "yesterday_value": yesterday_value,
        "change_percent": change_percent,
        "trend": trend,
    }


def get_dashboard_summary(db: Session) -> dict:
    from app.modules.traffic_monitoring.models import Road, TrafficReading

    today_start, today_end = _day_bounds(0)
    yesterday_start, yesterday_end = _day_bounds(1)

    roads = get_all_roads(db)
    total_roads = len(roads)

    # --- Total vehicles today vs yesterday ---
    today_readings = db.query(TrafficReading).filter(TrafficReading.recorded_at >= today_start, TrafficReading.recorded_at < today_end).all()
    yesterday_readings = db.query(TrafficReading).filter(TrafficReading.recorded_at >= yesterday_start, TrafficReading.recorded_at < yesterday_end).all()

    total_vehicles_today = sum(r.vehicle_count for r in today_readings)
    total_vehicles_yesterday = sum(r.vehicle_count for r in yesterday_readings) if yesterday_readings else None

    # --- Average utilization today vs yesterday ---
    def _avg_utilization(readings: list) -> float | None:
        if not readings:
            return None
        road_by_id = {r.id: r for r in roads}
        percents = []
        for reading in readings:
            road = road_by_id.get(reading.road_id)
            if road and road.capacity:
                percents.append((reading.vehicle_count / road.capacity) * 100)
        return round(sum(percents) / len(percents), 1) if percents else None

    avg_utilization_today = _avg_utilization(today_readings) or 0.0
    avg_utilization_yesterday = _avg_utilization(yesterday_readings)

    # --- Avg speed today vs yesterday (ignoring readings with no speed recorded) ---
    def _avg_speed(readings: list) -> float | None:
        speeds = [r.avg_speed_kmph for r in readings if r.avg_speed_kmph is not None]
        return round(sum(speeds) / len(speeds), 1) if speeds else None

    avg_speed_today = _avg_speed(today_readings) or 0.0
    avg_speed_yesterday = _avg_speed(yesterday_readings)

    # --- Busiest / least congested zone (current snapshot, not day-based) ---
    zones = get_zone_heatmap(db)
    busiest_zone = zones[0]["zone"] if zones else None
    least_congested_zone = zones[-1]["zone"] if zones else None

    # --- Alerts today vs yesterday ---
    try:
        from app.modules.alerts.models import Alert
        alerts_today = db.query(Alert).filter(Alert.created_at >= today_start, Alert.created_at < today_end).count()
        alerts_yesterday_query = db.query(Alert).filter(Alert.created_at >= yesterday_start, Alert.created_at < yesterday_end)
        alerts_yesterday = alerts_yesterday_query.count() if db.query(Alert).filter(Alert.created_at < today_start).first() else None
    except ImportError:
        alerts_today, alerts_yesterday = 0, None

    # --- Prediction accuracy (average R² of forecasts generated today) ---
    try:
        from app.modules.traffic_prediction.models import PredictionLog
        today_predictions = db.query(PredictionLog).filter(PredictionLog.created_at >= today_start, PredictionLog.created_at < today_end, PredictionLog.model_r2_score.isnot(None)).all()
        yesterday_predictions = db.query(PredictionLog).filter(PredictionLog.created_at >= yesterday_start, PredictionLog.created_at < yesterday_end, PredictionLog.model_r2_score.isnot(None)).all()
        pred_accuracy_today = round(sum(p.model_r2_score for p in today_predictions) / len(today_predictions), 3) if today_predictions else 0.0
        pred_accuracy_yesterday = round(sum(p.model_r2_score for p in yesterday_predictions) / len(yesterday_predictions), 3) if yesterday_predictions else None
    except ImportError:
        pred_accuracy_today, pred_accuracy_yesterday = 0.0, None

    return {
        "total_roads_monitored": _make_card("Total roads monitored", total_roads, None, None),
        "total_vehicles_today": _make_card("Total vehicles today", total_vehicles_today, "vehicles", total_vehicles_yesterday),
        "avg_utilization": _make_card("Average traffic utilization", avg_utilization_today, "%", avg_utilization_yesterday),
        "busiest_zone": _make_card("Busiest zone", 0, None, None, display_value=busiest_zone or "No data"),
        "least_congested_zone": _make_card("Least congested zone", 0, None, None, display_value=least_congested_zone or "No data"),
        "total_alerts_today": _make_card("Alerts generated today", alerts_today, "alerts", alerts_yesterday),
        "avg_vehicle_speed": _make_card("Average vehicle speed", avg_speed_today, "km/h", avg_speed_yesterday),
        "prediction_accuracy": _make_card("Prediction accuracy (R\u00b2)", pred_accuracy_today, None, pred_accuracy_yesterday),
    }


# ---------------------------------------------------------------------------
# HISTORICAL TREND
# ---------------------------------------------------------------------------

def get_history(db: Session, period: str) -> list[dict]:
    """
    Buckets real TrafficReading rows into time buckets for charting.
    period: "24h" (hourly buckets), "7d" or "30d" (daily buckets).
    Bucketing is done in Python (not DB-specific SQL functions) so this
    works identically on SQLite (dev) and PostgreSQL (production).
    """
    from app.modules.traffic_monitoring.models import Road, TrafficReading

    now = datetime.utcnow()
    if period == "24h":
        cutoff = now - timedelta(hours=24)
        bucket_fn = lambda dt: dt.strftime("%H:00")
        bucket_order_fn = lambda dt: dt.replace(minute=0, second=0, microsecond=0)
    else:
        days = 7 if period == "7d" else 30
        cutoff = now - timedelta(days=days)
        bucket_fn = lambda dt: dt.strftime("%Y-%m-%d")
        bucket_order_fn = lambda dt: dt.replace(hour=0, minute=0, second=0, microsecond=0)

    readings = db.query(TrafficReading).filter(TrafficReading.recorded_at >= cutoff).all()
    roads = {r.id: r for r in get_all_roads(db)}

    buckets: dict = defaultdict(lambda: {"vehicles": 0, "utilizations": [], "road_ids": set(), "sort_key": None})
    for reading in readings:
        key = bucket_fn(reading.recorded_at)
        b = buckets[key]
        b["vehicles"] += reading.vehicle_count
        road = roads.get(reading.road_id)
        if road and road.capacity:
            b["utilizations"].append((reading.vehicle_count / road.capacity) * 100)
        b["road_ids"].add(reading.road_id)
        b["sort_key"] = bucket_order_fn(reading.recorded_at)

    result = []
    for label, b in buckets.items():
        avg_util = round(sum(b["utilizations"]) / len(b["utilizations"]), 1) if b["utilizations"] else 0.0
        result.append({
            "label": label,
            "total_vehicles": b["vehicles"],
            "avg_utilization_percent": avg_util,
            "roads_reporting": len(b["road_ids"]),
            "_sort_key": b["sort_key"],
        })

    result.sort(key=lambda x: x["_sort_key"])
    for r in result:
        del r["_sort_key"]
    return result


# ---------------------------------------------------------------------------
# ZONE ANALYTICS (richer per-zone breakdown)
# ---------------------------------------------------------------------------

def get_zone_analytics(db: Session) -> list[dict]:
    roads = get_all_roads(db)
    latest_readings = get_latest_reading_per_road(db)

    zone_groups = defaultdict(list)
    for road in roads:
        zone_name = road.zone or "Unzoned"
        reading = latest_readings.get(road.id)
        vehicle_count = reading.vehicle_count if reading else 0
        utilization = (vehicle_count / road.capacity * 100) if road.capacity else 0.0
        speed = reading.avg_speed_kmph if reading else None
        zone_groups[zone_name].append({
            "road_name": road.name, "vehicle_count": vehicle_count,
            "utilization": utilization, "speed": speed,
        })

    results = []
    for zone, items in zone_groups.items():
        road_count = len(items)
        total_vehicles = sum(i["vehicle_count"] for i in items)
        avg_utilization = sum(i["utilization"] for i in items) / road_count if road_count else 0.0
        speeds = [i["speed"] for i in items if i["speed"] is not None]
        avg_speed = round(sum(speeds) / len(speeds), 1) if speeds else None

        sorted_by_util = sorted(items, key=lambda i: i["utilization"], reverse=True)
        highest = sorted_by_util[0]["road_name"] if sorted_by_util else None
        lowest = sorted_by_util[-1]["road_name"] if sorted_by_util else None

        results.append({
            "zone": zone,
            "avg_utilization_percent": round(avg_utilization, 1),
            "avg_speed_kmph": avg_speed,
            "total_roads": road_count,
            "total_vehicles": total_vehicles,
            "highest_congestion_road": highest,
            "lowest_congestion_road": lowest,
        })

    results.sort(key=lambda z: z["avg_utilization_percent"], reverse=True)
    return results


# ---------------------------------------------------------------------------
# ROAD PERFORMANCE TABLE
# ---------------------------------------------------------------------------

def get_road_performance(db: Session) -> list[dict]:
    from app.modules.traffic_monitoring.services import get_reading_history

    roads = get_all_roads(db)
    latest_readings = get_latest_reading_per_road(db)

    items = []
    for road in roads:
        reading = latest_readings.get(road.id)
        vehicle_count = reading.vehicle_count if reading else None
        utilization = (vehicle_count / road.capacity * 100) if reading and road.capacity else 0.0

        # Trend: compare the two most recent readings for this road.
        history = get_reading_history(db, road.id, limit=2)
        trend = None
        if len(history) == 2:
            latest, previous = history[0], history[1]
            if latest.vehicle_count > previous.vehicle_count * 1.05:
                trend = "increasing"
            elif latest.vehicle_count < previous.vehicle_count * 0.95:
                trend = "decreasing"
            else:
                trend = "stable"

        items.append({
            "road_id": road.id,
            "road_name": road.name,
            "zone": road.zone,
            "current_vehicles": vehicle_count,
            "capacity": road.capacity,
            "utilization_percent": round(utilization, 1),
            "avg_speed_kmph": reading.avg_speed_kmph if reading else None,
            "congestion_level": reading.congestion_level if reading else None,
            "trend": trend,
            "status": "normal",  # overwritten below for the extremes
        })

    items.sort(key=lambda i: i["utilization_percent"], reverse=True)

    # Flag the best/worst performers so the frontend can highlight them,
    # only when there are enough roads for the distinction to mean anything.
    if len(items) >= 3:
        for i in items[:1]:
            i["status"] = "worst"
        for i in items[-1:]:
            i["status"] = "best"

    return items


# ---------------------------------------------------------------------------
# AI-GENERATED INSIGHTS
# ---------------------------------------------------------------------------

def generate_insights(db: Session) -> list[dict]:
    """
    Generates plain-English insights from real, current data — no
    templated filler. Each insight is only included if the underlying
    data genuinely supports it.
    """
    insights = []

    zones = get_zone_heatmap(db)
    summary = get_analytics_summary(db)

    for zone in zones:
        if zone["dominant_congestion_level"] and zone["dominant_congestion_level"].value in ("severe", "high"):
            insights.append({
                "message": f"{zone['zone']} is experiencing {zone['dominant_congestion_level'].value} congestion.",
                "category": "congestion",
            })

    performance = get_road_performance(db)
    if performance:
        worst = performance[0]
        insights.append({
            "message": f"{worst['road_name']} has the highest congestion at {worst['utilization_percent']}% utilization.",
            "category": "ranking",
        })

        increasing = [p for p in performance if p["trend"] == "increasing"]
        decreasing = [p for p in performance if p["trend"] == "decreasing"]
        for p in increasing[:2]:
            insights.append({"message": f"{p['road_name']} traffic is trending upward.", "category": "trend"})
        for p in decreasing[:2]:
            insights.append({"message": f"{p['road_name']} traffic is trending downward.", "category": "trend"})

    dashboard = get_dashboard_summary(db)
    util_card = dashboard["avg_utilization"]
    if util_card["change_percent"] is not None:
        direction = "increased" if util_card["change_percent"] > 0 else "decreased"
        insights.append({
            "message": f"Traffic utilization {direction} by {abs(util_card['change_percent'])}% compared to yesterday.",
            "category": "trend",
        })

    insights.append({
        "message": f"Average city-wide utilization is {summary['overall_avg_utilization_percent']}%.",
        "category": "summary",
    })

    return insights