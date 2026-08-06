from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from .. import models, security
from ..database import get_db

router = APIRouter(prefix="/analytics", tags=["Analytics Dashboard"])

# Numeric weight for averaging congestion level in heatmaps / performance scoring.
CONGESTION_SCORE = {"low": 0, "medium": 1, "high": 2}


@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Traffic analytics report: a platform-wide snapshot for the Analytics
    Dashboard (historical traffic insights + current state)."""
    roads = db.query(models.Road).all()
    total_readings = db.query(models.TrafficReading).count()

    counts = {"low": 0, "medium": 0, "high": 0}
    speeds = []
    for road in roads:
        latest = (
            db.query(models.TrafficReading)
            .filter(models.TrafficReading.road_id == road.id)
            .order_by(desc(models.TrafficReading.recorded_at))
            .first()
        )
        if latest:
            counts[latest.congestion_level] = counts.get(latest.congestion_level, 0) + 1
            speeds.append(latest.avg_speed_kmph)

    active_alerts = (
        db.query(models.Alert)
        .filter(models.Alert.status != models.AlertStatusEnum.resolved)
        .count()
    )
    active_accidents = (
        db.query(models.Alert)
        .filter(
            models.Alert.alert_type == models.AlertTypeEnum.accident,
            models.Alert.status != models.AlertStatusEnum.resolved,
        )
        .count()
    )

    oldest = db.query(models.TrafficReading).order_by(models.TrafficReading.recorded_at.asc()).first()

    return {
        "total_roads": len(roads),
        "total_readings_analyzed": total_readings,
        "monitoring_since": oldest.recorded_at if oldest else None,
        "congestion_breakdown": counts,
        "avg_speed_kmph": round(sum(speeds) / len(speeds), 1) if speeds else 0,
        "active_alerts": active_alerts,
        "active_accident_alerts": active_accidents,
    }


@router.get("/road-performance")
def road_performance(
    sample_size: int = Query(300, ge=10, le=2000, description="How many of each road's most recent readings to analyze"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Road performance tracking: per-road averages over its recent history,
    plus a simple 0-100 performance score (higher = freer-flowing)."""
    roads = db.query(models.Road).all()
    results = []
    for road in roads:
        readings = (
            db.query(models.TrafficReading)
            .filter(models.TrafficReading.road_id == road.id)
            .order_by(desc(models.TrafficReading.recorded_at))
            .limit(sample_size)
            .all()
        )
        if not readings:
            results.append(
                {
                    "road_id": road.id,
                    "road_name": road.name,
                    "location": road.location,
                    "readings_analyzed": 0,
                    "avg_vehicle_count": None,
                    "avg_speed_kmph": None,
                    "pct_high_congestion": None,
                    "performance_score": None,
                }
            )
            continue

        n = len(readings)
        avg_vehicles = sum(r.vehicle_count for r in readings) / n
        avg_speed = sum(r.avg_speed_kmph for r in readings) / n
        pct_high = 100 * sum(1 for r in readings if r.congestion_level == "high") / n
        avg_score = sum(CONGESTION_SCORE[r.congestion_level] for r in readings) / n  # 0 (low) .. 2 (high)

        # Performance score: starts at 100, docked for average congestion level
        # and for how often the road actually hits "high".
        performance_score = round(max(0.0, 100 - (avg_score / 2 * 70) - (pct_high * 0.3)), 1)

        results.append(
            {
                "road_id": road.id,
                "road_name": road.name,
                "location": road.location,
                "readings_analyzed": n,
                "avg_vehicle_count": round(avg_vehicles, 1),
                "avg_speed_kmph": round(avg_speed, 1),
                "pct_high_congestion": round(pct_high, 1),
                "performance_score": performance_score,
            }
        )

    results.sort(key=lambda r: (r["performance_score"] is None, r["performance_score"] or 0))
    return results


@router.get("/heatmap")
def congestion_heatmap(
    buckets: int = Query(12, ge=4, le=48, description="Number of sequential time-windows per road"),
    sample_size: int = Query(240, ge=12, le=2000, description="How many of each road's most recent readings to spread across the buckets"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Congestion heatmap: for each road, splits its most recent readings into
    `buckets` sequential windows (oldest -> newest) and averages the
    congestion score (0=low, 1=medium, 2=high) in each — darker/redder cells
    show sustained congestion, read left (older) to right (most recent)."""
    roads = db.query(models.Road).all()
    rows = []
    for road in roads:
        readings = (
            db.query(models.TrafficReading)
            .filter(models.TrafficReading.road_id == road.id)
            .order_by(desc(models.TrafficReading.recorded_at))
            .limit(sample_size)
            .all()
        )
        readings.reverse()  # oldest -> newest, so buckets read chronologically

        if not readings:
            rows.append({"road_id": road.id, "road_name": road.name, "cells": [None] * buckets})
            continue

        chunk_size = max(1, len(readings) // buckets)
        cells = []
        for i in range(buckets):
            start = i * chunk_size
            end = (i + 1) * chunk_size if i < buckets - 1 else len(readings)
            chunk = readings[start:end]
            if not chunk:
                cells.append(None)
                continue
            avg_score = sum(CONGESTION_SCORE[r.congestion_level] for r in chunk) / len(chunk)
            cells.append(round(avg_score, 2))
        rows.append({"road_id": road.id, "road_name": road.name, "cells": cells})

    return {"buckets": buckets, "rows": rows}


DOW_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@router.get("/trends")
def traffic_trends(
    sample_size: int = Query(500, ge=20, le=5000, description="How many of each road's most recent readings to analyze"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Traffic trend analysis workflow: aggregates day-of-week and
    month-of-year congestion patterns across all roads (historical traffic
    insights), plus a per-road recent-vs-prior trend so operators can see
    which roads are improving or worsening."""
    roads = db.query(models.Road).all()

    dow_scores = {d: [] for d in range(7)}  # 0 = Monday
    month_scores = {m: [] for m in range(1, 13)}  # 1 = Jan
    road_trends = []

    earliest_reading = None
    latest_reading = None

    for road in roads:
        readings = (
            db.query(models.TrafficReading)
            .filter(models.TrafficReading.road_id == road.id)
            .order_by(desc(models.TrafficReading.recorded_at))
            .limit(sample_size)
            .all()
        )
        if not readings:
            continue

        for r in readings:
            score = CONGESTION_SCORE[r.congestion_level]
            dow_scores[r.recorded_at.weekday()].append(score)
            month_scores[r.recorded_at.month].append(score)
            if earliest_reading is None or r.recorded_at < earliest_reading:
                earliest_reading = r.recorded_at
            if latest_reading is None or r.recorded_at > latest_reading:
                latest_reading = r.recorded_at

        readings.reverse()  # oldest -> newest
        half = len(readings) // 2
        if half >= 5:
            prior, recent = readings[:half], readings[half:]
            prior_avg = sum(CONGESTION_SCORE[r.congestion_level] for r in prior) / len(prior)
            recent_avg = sum(CONGESTION_SCORE[r.congestion_level] for r in recent) / len(recent)
            delta = recent_avg - prior_avg

            # Classify by RELATIVE change, not raw score delta. Congestion
            # scores here mostly cluster in the 0.4-0.7 band (well below the
            # 0-2 max), so a fixed absolute threshold like 0.15 masks large
            # percentage swings (e.g. 0.49 -> 0.59 is +21% but only +0.10
            # absolute). Percentage change is also what's shown in the UI,
            # so the label now matches the number next to it.
            pct_change = round((delta / prior_avg) * 100, 1) if prior_avg > 0 else (0.0 if delta == 0 else 100.0)

            if pct_change > 5:
                direction = "worsening"
            elif pct_change < -5:
                direction = "improving"
            else:
                direction = "stable"

            road_trends.append(
                {
                    "road_id": road.id,
                    "road_name": road.name,
                    "prior_avg_score": round(prior_avg, 2),
                    "recent_avg_score": round(recent_avg, 2),
                    "pct_change": pct_change,
                    "direction": direction,
                }
            )

    daily_pattern = [
        {"day": DOW_NAMES[d], "avg_congestion_score": round(sum(v) / len(v), 2) if v else None, "sample_size": len(v)}
        for d, v in dow_scores.items()
    ]
    monthly_pattern = [
        {"month": MONTH_NAMES[m - 1], "avg_congestion_score": round(sum(v) / len(v), 2) if v else None, "sample_size": len(v)}
        for m, v in month_scores.items()
    ]

    valid_days = [p for p in daily_pattern if p["avg_congestion_score"] is not None]
    busiest_day = max(valid_days, key=lambda p: p["avg_congestion_score"]) if valid_days else None
    quietest_day = min(valid_days, key=lambda p: p["avg_congestion_score"]) if valid_days else None

    road_trends.sort(key=lambda r: r["pct_change"], reverse=True)

    return {
        "daily_pattern": daily_pattern,
        "monthly_pattern": monthly_pattern,
        "busiest_day": busiest_day,
        "quietest_day": quietest_day,
        "data_start": earliest_reading,
        "data_end": latest_reading,
        "road_trends": road_trends,
    }
