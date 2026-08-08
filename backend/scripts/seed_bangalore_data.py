import os
import sys
import pandas as pd
from datetime import datetime

# Add backend folder to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal
from app.modules.traffic_monitoring.models import (
    Road,
    TrafficReading,
    CongestionLevel,
)


# -----------------------------
# Convert congestion text
# -----------------------------
def map_congestion(value):
    if pd.isna(value):
        return CongestionLevel.MODERATE

    value = str(value).strip().lower()

    if value in ["low", "light"]:
        return CongestionLevel.LOW

    elif value in ["moderate", "medium"]:
        return CongestionLevel.MODERATE

    elif value == "high":
        return CongestionLevel.HIGH

    elif value == "severe":
        return CongestionLevel.SEVERE

    # If congestion is stored as percentage
    try:
        percent = float(value)

        if percent < 40:
            return CongestionLevel.LOW
        elif percent < 70:
            return CongestionLevel.MODERATE
        elif percent < 90:
            return CongestionLevel.HIGH
        else:
            return CongestionLevel.SEVERE

    except:
        return CongestionLevel.MODERATE


# -----------------------------
# Estimate road capacity
# -----------------------------
def estimate_capacity(volume):
    volume = int(volume)

    if volume < 5000:
        return 6000
    elif volume < 10000:
        return 12000
    elif volume < 20000:
        return 25000
    elif volume < 40000:
        return 45000
    else:
        return int(volume * 1.2)


# -----------------------------
# Read dataset
# -----------------------------
csv_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    "data",
    "Banglore_traffic_Dataset.csv",
)

df = pd.read_csv(csv_path)


print(f"Dataset Loaded : {len(df)} rows")


db = SessionLocal()

road_cache = {}

# -----------------------------
# Insert Roads
# -----------------------------
for _, row in df.iterrows():

    road_name = str(row["Road/Intersection Name"]).strip()
    area = str(row["Area Name"]).strip()

    key = (road_name, area)

    if key not in road_cache:

        existing = (
            db.query(Road)
            .filter(Road.name == road_name, Road.zone == area)
            .first()
        )

        if existing:
            road_cache[key] = existing

        else:

            capacity = estimate_capacity(row["Traffic Volume"])

            road = Road(
                name=road_name,
                zone=area,
                latitude=None,
                longitude=None,
                capacity=capacity,
            )

            db.add(road)
            db.commit()
            db.refresh(road)

            road_cache[key] = road


print(f"Roads Created : {len(road_cache)}")


# -----------------------------
# Insert Traffic Readings
# -----------------------------
count = 0

for _, row in df.iterrows():

    road = road_cache[
        (
            str(row["Road/Intersection Name"]).strip(),
            str(row["Area Name"]).strip(),
        )
    ]

    try:
        recorded_at = pd.to_datetime(row["Date"])
    except:
        recorded_at = datetime.now()

    reading = TrafficReading(
    road_id=road.id,
    vehicle_count=int(row["Traffic Volume"]),
    avg_speed_kmph=float(row["Average Speed"]),
    congestion_level=map_congestion(row["Congestion Level"]),
    recorded_at=recorded_at,

    travel_time_index=float(row["Travel Time Index"]),
    road_capacity_utilization=float(row["Road Capacity Utilization"]),
    incident_reports=int(row["Incident Reports"]),
    environmental_impact=float(row["Environmental Impact"]),
    public_transport_usage=float(row["Public Transport Usage"]),
    traffic_signal_compliance=float(row["Traffic Signal Compliance"]),
    parking_usage=float(row["Parking Usage"]),
    pedestrian_count=int(row["Pedestrian and Cyclist Count"]),
    weather_condition=str(row["Weather Conditions"]),
    roadwork=str(row["Roadwork and Construction Activity"]).strip().lower() == "yes",
    )

    db.add(reading)
    count += 1

    if count % 500 == 0:
        db.commit()
        print(f"{count} readings inserted...")


db.commit()

print("------------------------------------")
print("Import Completed Successfully")
print("------------------------------------")
print(f"Total Roads      : {len(road_cache)}")
print(f"Traffic Readings : {count}")

db.close()