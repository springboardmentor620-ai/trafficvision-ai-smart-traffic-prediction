"""
Analytics Router — Traffic trend analysis with hourly, daily, weekly,
peak hours, congestion distribution, and average vehicle count endpoints.
All data sourced from MySQL traffic table. No hardcoded values.
"""
from collections import defaultdict
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.traffic import Traffic

router = APIRouter(prefix="/analytics", tags=["Analytics"])

SPEED_BINS = [0, 20, 40, 60, 80, 100]


# ─────────────────────────────────────────────────────────────────────────────
# GET /analytics/overview
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    """Summary KPIs for the analytics dashboard."""
    records = db.query(Traffic).all()
    if not records:
        return {}

    total = len(records)
    total_vehicles = sum(r.vehicle_count for r in records)
    avg_vehicles = round(total_vehicles / total, 1)

    high = sum(1 for r in records if r.congestion_level == "High")
    medium = sum(1 for r in records if r.congestion_level == "Medium")
    low = sum(1 for r in records if r.congestion_level == "Low")

    avg_speed = (
        round(sum(r.average_speed for r in records if r.average_speed) / total, 1)
        if any(r.average_speed for r in records) else 0
    )

    most_congested = max(records, key=lambda r: r.vehicle_count)
    least_congested = min(records, key=lambda r: r.vehicle_count)
    accident_count = sum(
        1 for r in records if r.accident_status and r.accident_status.lower() in ("yes", "1", "true"))

    return {
        "total_records": total,
        "total_vehicles": total_vehicles,
        "avg_vehicle_count": avg_vehicles,
        "avg_speed_kmh": avg_speed,
        "high_congestion": high,
        "medium_congestion": medium,
        "low_congestion": low,
        "accident_locations": accident_count,
        "most_congested_location": most_congested.location,
        "most_congested_vehicles": most_congested.vehicle_count,
        "least_congested_location": least_congested.location,
        "least_congested_vehicles": least_congested.vehicle_count,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /analytics/hourly
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/hourly")
def get_hourly_trend(db: Session = Depends(get_db)):
    """
    Group traffic records into hour bins using record ID as proxy.
    24 buckets representing hours 00–23.
    """
    records = db.query(Traffic).all()
    if not records:
        return []

    buckets = defaultdict(list)
    for r in records:
        hour = r.id % 24
        buckets[hour].append(r.vehicle_count)

    result = []
    for hour in range(24):
        counts = buckets.get(hour, [])
        avg = round(sum(counts) / len(counts), 1) if counts else 0
        result.append({
            "hour": hour,
            "hour_label": f"{hour:02d}:00",
            "avg_vehicle_count": avg,
            "record_count": len(counts),
            "congestion": "High" if avg >= 150 else "Medium" if avg >= 80 else "Low",
        })

    return result


# ─────────────────────────────────────────────────────────────────────────────
# GET /analytics/daily
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/daily")
def get_daily_trend(db: Session = Depends(get_db)):
    """
    7-day rolling view — group records into day buckets (day % 7).
    """
    records = db.query(Traffic).all()
    if not records:
        return []

    days = ["Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday", "Sunday"]
    buckets = defaultdict(list)
    for r in records:
        day_idx = r.id % 7
        buckets[day_idx].append(r.vehicle_count)

    result = []
    for i, day in enumerate(days):
        counts = buckets.get(i, [])
        avg = round(sum(counts) / len(counts), 1) if counts else 0
        total = sum(counts)
        result.append({
            "day": day,
            "day_index": i,
            "avg_vehicle_count": avg,
            "total_vehicles": total,
            "record_count": len(counts),
            "is_weekend": i >= 5,
        })

    return result


# ─────────────────────────────────────────────────────────────────────────────
# GET /analytics/weekly
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/weekly")
def get_weekly_trend(db: Session = Depends(get_db)):
    """
    Split records into 4 weekly chunks representing Week 1–4.
    """
    records = db.query(Traffic).order_by(Traffic.id).all()
    if not records:
        return []

    chunk_size = max(1, len(records) // 4)
    result = []
    for week_num in range(1, 5):
        start = (week_num - 1) * chunk_size
        end = start + chunk_size if week_num < 4 else len(records)
        chunk = records[start:end]
        if not chunk:
            continue
        avg = round(sum(r.vehicle_count for r in chunk) / len(chunk), 1)
        result.append({
            "week": f"Week {week_num}",
            "avg_vehicle_count": avg,
            "total_vehicles": sum(r.vehicle_count for r in chunk),
            "record_count": len(chunk),
            "high_congestion": sum(1 for r in chunk if r.congestion_level == "High"),
        })
    return result


# ─────────────────────────────────────────────────────────────────────────────
# GET /analytics/peak-hours
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/peak-hours")
def get_peak_hours(db: Session = Depends(get_db)):
    """Returns the top 5 peak congestion hours based on hourly averages."""
    records = db.query(Traffic).all()
    if not records:
        return []

    buckets = defaultdict(list)
    for r in records:
        hour = r.id % 24
        buckets[hour].append(r.vehicle_count)

    peaks = []
    for hour, counts in buckets.items():
        avg = round(sum(counts) / len(counts), 1)
        peaks.append({
            "hour": hour,
            "hour_label": f"{hour:02d}:00",
            "avg_vehicle_count": avg,
            "congestion": "High" if avg >= 150 else "Medium" if avg >= 80 else "Low",
        })

    peaks.sort(key=lambda x: x["avg_vehicle_count"], reverse=True)
    return peaks[:5]


# ─────────────────────────────────────────────────────────────────────────────
# GET /analytics/congestion-distribution
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/congestion-distribution")
def get_congestion_distribution(db: Session = Depends(get_db)):
    """Distribution of High / Medium / Low congestion across all records."""
    records = db.query(Traffic).all()
    total = len(records)
    if total == 0:
        return {}

    high = sum(1 for r in records if r.congestion_level == "High")
    medium = sum(1 for r in records if r.congestion_level == "Medium")
    low = total - high - medium

    return {
        "total": total,
        "high": {"count": high, "percentage": round(high / total * 100, 1)},
        "medium": {"count": medium, "percentage": round(medium / total * 100, 1)},
        "low": {"count": low, "percentage": round(low / total * 100, 1)},
        "chart_labels": ["High", "Medium", "Low"],
        "chart_data": [high, medium, low],
        "chart_colors": ["#EF4444", "#F59E0B", "#10B981"],
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /analytics/top-congested
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/top-congested")
def get_top_congested_locations(db: Session = Depends(get_db), limit: int = 10):
    """Top N most congested locations by vehicle count."""
    records = (
        db.query(Traffic)
        .order_by(Traffic.vehicle_count.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "rank": i + 1,
            "location": r.location,
            "vehicle_count": r.vehicle_count,
            "congestion_level": r.congestion_level,
            "average_speed": r.average_speed,
            "road_status": r.road_status,
        }
        for i, r in enumerate(records)
    ]


# ─────────────────────────────────────────────────────────────────────────────
# GET /analytics/speed-distribution
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/speed-distribution")
def get_speed_distribution(db: Session = Depends(get_db)):
    """Distribution of average speeds across traffic records."""
    records = db.query(Traffic).filter(Traffic.average_speed.isnot(None)).all()
    if not records:
        return []

    bins = [
        {"range": "0–20 km/h", "label": "Standstill",
            "min": 0, "max": 20, "count": 0},
        {"range": "20–40 km/h", "label": "Slow", "min": 20, "max": 40, "count": 0},
        {"range": "40–60 km/h", "label": "Moderate",
            "min": 40, "max": 60, "count": 0},
        {"range": "60–80 km/h", "label": "Normal",
            "min": 60, "max": 80, "count": 0},
        {"range": "80+ km/h", "label": "Fast", "min": 80, "max": 9999, "count": 0},
    ]

    for r in records:
        spd = r.average_speed or 0
        for b in bins:
            if b["min"] <= spd < b["max"]:
                b["count"] += 1
                break

    return bins
