"""
Real-world dataset integration: Metro Interstate Traffic Volume (Kaggle).

Source: https://www.kaggle.com/datasets/anshtanwar/metro-interstate-traffic-volume
~48,200 hourly readings of I-94 westbound traffic volume near Minneapolis-St
Paul, MN (Oct 2012 - Sep 2018), alongside weather conditions and holidays.

This replaces the earlier "randomly generated" approach: instead of inventing
fake vehicle counts, we (1) permanently store the *entire real historical
dataset* in the traffic_readings table on first startup, and (2) "replay"
that same real data — in real chronological order — as the live 5-second feed,
rather than generating random numbers. So both the historical data AND the
live feed are grounded in the actual Kaggle dataset.

Note: the dataset does not include a speed column (only vehicle volume +
weather). We derive an estimated average speed from volume using a simple,
clearly-documented free-flow-speed model, since our schema tracks both
vehicle_count and avg_speed_kmph. Everything else (volume, timestamps) is the
real dataset value, unmodified.
"""
import csv
import os
from datetime import datetime

from sqlalchemy.orm import Session

from . import models

CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "Metro_Interstate_Traffic_Volume.csv")
KAGGLE_ROAD_NAME = "I-94 Interstate (Minneapolis–St Paul, MN)"
KAGGLE_ROAD_LOCATION = "Real dataset: Kaggle Metro Interstate Traffic Volume"
KAGGLE_LANE_CAPACITY = 7500  # dataset max observed volume is 7280; round up

# Free-flow speed model used only because the dataset has no speed column:
# 0% of capacity -> ~95 km/h (free flow), 100%+ of capacity -> ~15 km/h (jam).
FREE_FLOW_SPEED = 95.0
JAM_SPEED = 15.0


def _estimate_speed(vehicle_count: int, lane_capacity: int) -> float:
    ratio = min(vehicle_count / max(lane_capacity, 1), 1.2)
    speed = FREE_FLOW_SPEED - ratio * (FREE_FLOW_SPEED - JAM_SPEED)
    return round(max(speed, JAM_SPEED), 1)


def _congestion_level(vehicle_count: int, lane_capacity: int) -> str:
    ratio = vehicle_count / max(lane_capacity, 1)
    if ratio < 0.5:
        return "low"
    elif ratio < 0.85:
        return "medium"
    return "high"


def load_dataset_rows() -> list[dict]:
    """Read the CSV into memory once. Used both for the one-time bulk import
    and for the live 5-second replay loop."""
    rows = []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                dt = datetime.strptime(row["date_time"], "%Y-%m-%d %H:%M:%S")
                vehicle_count = int(row["traffic_volume"])
            except (ValueError, KeyError):
                continue
            rows.append({"recorded_at": dt, "vehicle_count": vehicle_count})
    return rows


def get_or_create_kaggle_road(db: Session) -> models.Road:
    road = db.query(models.Road).filter(models.Road.name == KAGGLE_ROAD_NAME).first()
    if not road:
        road = models.Road(
            name=KAGGLE_ROAD_NAME,
            location=KAGGLE_ROAD_LOCATION,
            lane_capacity=KAGGLE_LANE_CAPACITY,
            latitude=44.9778,   # real approximate location: I-94 near downtown Minneapolis, MN
            longitude=-93.2650,
        )
        db.add(road)
        db.commit()
        db.refresh(road)
    elif road.latitude is None:
        road.latitude = 44.9778
        road.longitude = -93.2650
        db.commit()
    return road


def bulk_import_if_needed(db: Session, rows: list[dict]) -> int:
    """One-time import: store the full real historical dataset as rows in
    traffic_readings. Safe to call on every startup — skips if already done.
    Returns the number of rows inserted (0 if already imported).
    """
    road = get_or_create_kaggle_road(db)

    existing_count = (
        db.query(models.TrafficReading)
        .filter(models.TrafficReading.road_id == road.id)
        .count()
    )
    if existing_count >= len(rows):
        return 0  # already imported

    objects = []
    for row in rows:
        vehicle_count = row["vehicle_count"]
        objects.append(
            models.TrafficReading(
                road_id=road.id,
                vehicle_count=vehicle_count,
                avg_speed_kmph=_estimate_speed(vehicle_count, road.lane_capacity),
                congestion_level=_congestion_level(vehicle_count, road.lane_capacity),
                recorded_at=row["recorded_at"],
            )
        )
    db.bulk_save_objects(objects)
    db.commit()
    return len(objects)
