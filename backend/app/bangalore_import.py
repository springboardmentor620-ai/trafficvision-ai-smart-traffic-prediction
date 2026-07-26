"""
Real-world multi-road dataset integration: "Bangalore's Traffic Pulse" (Kaggle).

Source: https://www.kaggle.com/datasets/preethamgouda/banglore-city-traffic-dataset

Replaces the earlier single-location Minneapolis dataset. This one tracks
16 real, named roads/intersections across 8 areas of Bangalore
(Indiranagar, Koramangala, Whitefield, Jayanagar, etc.), with ~275-860 real
daily readings per road from January 2022 to August 2024 (8,936 rows total).

This directly fixes the "only one road has real data" limitation of the
previous dataset — every monitored road here is real, not simulated.

Note on granularity: this dataset is DAILY (one reading per road per day),
not hourly like the previous one. That means the Traffic Prediction Module's
"hour of day" feature has no real signal here (every row is midnight) — the
model instead learns from day-of-week and month/seasonal patterns, which are
real and present in the data. Hour-by-hour forecasts will look like flat
blocks that change at day boundaries rather than smooth hourly curves; this
is an honest property of the data, not a bug in the prediction code.

Each road's `lane_capacity` is set to its own historical maximum traffic
volume (rounded up slightly), so congestion_level is computed the same way
as everywhere else in the app: vehicle_count / lane_capacity.
"""
import csv
import os
from datetime import datetime
from math import ceil

from sqlalchemy.orm import Session

from . import models

CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "Banglore_traffic_Dataset.csv")

# Real approximate coordinates for each named road/intersection (used for
# the Live Map and Route Analysis modules). Sourced from well-known public
# locations in Bangalore; approximate to the intersection/stretch, not
# survey-precise.
ROAD_COORDS = {
    "100 Feet Road":        (12.9716, 77.6412),
    "CMH Road":             (12.9789, 77.6408),
    "Trinity Circle":       (12.9738, 77.6181),
    "Anil Kumble Circle":   (12.9789, 77.5993),
    "Silk Board Junction":  (12.9172, 77.6228),
    "Marathahalli Bridge":  (12.9569, 77.6961),
    "Sarjapur Road":        (12.9008, 77.6844),
    "Hosur Road":           (12.9086, 77.6146),
    "Hebbal Flyover":       (13.0355, 77.5970),
    "Ballari Road":         (13.0500, 77.5900),
    "Tumkur Road":          (13.0280, 77.5310),
    "Yeshwanthpur Circle":  (13.0284, 77.5540),
    "Jayanagar 4th Block":  (12.9250, 77.5938),
    "South End Circle":     (12.9350, 77.5800),
    "ITPL Main Road":       (12.9860, 77.7370),
    "Sony World Junction":  (12.9350, 77.6140),
}


def _congestion_level(vehicle_count: float, lane_capacity: int) -> str:
    ratio = vehicle_count / max(lane_capacity, 1)
    if ratio < 0.5:
        return "low"
    elif ratio < 0.85:
        return "medium"
    return "high"


def load_dataset_rows() -> dict:
    """Read the CSV once, grouped by road name. Returns
    { road_name: { "area": str, "rows": [ {recorded_at, vehicle_count, avg_speed}, ... ] } }
    sorted chronologically per road. Used for both the one-time bulk import
    and the live replay loop.
    """
    grouped: dict[str, dict] = {}
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                road_name = row["Road/Intersection Name"].strip()
                area = row["Area Name"].strip()
                dt = datetime.strptime(row["Date"].strip(), "%Y-%m-%d")
                vehicle_count = float(row["Traffic Volume"])
                avg_speed = float(row["Average Speed"])
            except (ValueError, KeyError):
                continue

            if road_name not in grouped:
                grouped[road_name] = {"area": area, "rows": []}
            grouped[road_name]["rows"].append(
                {"recorded_at": dt, "vehicle_count": vehicle_count, "avg_speed": avg_speed}
            )

    for road_name, data in grouped.items():
        data["rows"].sort(key=lambda r: r["recorded_at"])

    return grouped


def get_or_create_roads(db: Session, grouped_data: dict) -> dict:
    """Ensure every road in the dataset exists as a Road row. Returns
    { road_name: Road } for use by the importer and the live replay loop.
    """
    roads_by_name = {}
    for road_name, data in grouped_data.items():
        road = db.query(models.Road).filter(models.Road.name == road_name).first()
        max_volume = max(r["vehicle_count"] for r in data["rows"])
        lane_capacity = ceil(max_volume * 1.05)
        lat, lon = ROAD_COORDS.get(road_name, (None, None))

        if not road:
            road = models.Road(
                name=road_name,
                location=data["area"],
                lane_capacity=lane_capacity,
                latitude=lat,
                longitude=lon,
            )
            db.add(road)
            db.commit()
            db.refresh(road)
        elif road.latitude is None and lat is not None:
            road.latitude = lat
            road.longitude = lon
            db.commit()

        roads_by_name[road_name] = road
    return roads_by_name


def bulk_import_if_needed(db: Session, grouped_data: dict, roads_by_name: dict) -> int:
    """One-time (idempotent) import: store the full real historical dataset,
    per road, into traffic_readings. Returns rows inserted (0 if already done)."""
    total_inserted = 0
    for road_name, data in grouped_data.items():
        road = roads_by_name[road_name]
        existing_count = (
            db.query(models.TrafficReading)
            .filter(models.TrafficReading.road_id == road.id)
            .count()
        )
        if existing_count >= len(data["rows"]):
            continue  # already imported

        objects = []
        for row in data["rows"]:
            objects.append(
                models.TrafficReading(
                    road_id=road.id,
                    vehicle_count=int(round(row["vehicle_count"])),
                    avg_speed_kmph=round(row["avg_speed"], 1),
                    congestion_level=_congestion_level(row["vehicle_count"], road.lane_capacity),
                    recorded_at=row["recorded_at"],
                )
            )
        db.bulk_save_objects(objects)
        db.commit()
        total_inserted += len(objects)

    return total_inserted


def cleanup_old_single_road_dataset(db: Session) -> bool:
    """One-time cleanup: removes the previous single-road Minneapolis dataset
    (superseded by this multi-road Bangalore dataset), if it's still present
    from an earlier version of this project. Idempotent — a no-op if already
    removed. Returns True if anything was deleted."""
    old_name = "I-94 Interstate (Minneapolis–St Paul, MN)"
    road = db.query(models.Road).filter(models.Road.name == old_name).first()
    if not road:
        return False
    db.query(models.TrafficReading).filter(models.TrafficReading.road_id == road.id).delete()
    db.delete(road)
    db.commit()
    return True
