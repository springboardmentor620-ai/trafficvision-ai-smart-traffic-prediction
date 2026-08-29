import os
import random
import time
from datetime import datetime

import pandas as pd
from app.database.connection import SessionLocal
from app.models.road import Road
from app.models.traffic import Traffic
from app.services.alert_service import AlertService
from app.ml.predictor import predict
from app.services.prediction_history_service import save_prediction
from app.constants.traffic import (
    WEATHER_ENCODING,
    WEATHER_OPTIONS,
    get_traffic_category,
    CONGESTION_THRESHOLD_LOW,
    CONGESTION_THRESHOLD_MODERATE,
    PREDICTION_LEVEL_LOW,
    PREDICTION_LEVEL_MODERATE,
    PREDICTION_LEVEL_HIGH,
    TRAFFIC_STATUS_NORMAL,
    TRAFFIC_STATUS_MODERATE,
    TRAFFIC_STATUS_HEAVY,
)

SIMULATOR_INTERVAL_SECONDS = int(os.getenv("SIMULATOR_INTERVAL_SECONDS", "5"))
RETRY_DELAY_SECONDS = int(os.getenv("SIMULATOR_RETRY_DELAY_SECONDS", "3"))

# Profile categories for realistic corridor variance
HEAVY_CORRIDORS = {
    "Outer Ring Road",
    "Hosur Road",
    "Silk Board Flyover",
    "Marathahalli Bridge",
    "Whitefield Main Road",
    "ITPL Main Road",
}

FREEFLOW_CORRIDORS = {
    "Airport Road (KIA)",
    "Electronic City Flyover",
    "Hebbal Flyover",
    "Bellary Road",
    "Tumkur Road",
}


def get_status(speed: float) -> str:
    """
    Derive live-traffic status from average speed.
    """
    if speed < 25:
        return TRAFFIC_STATUS_HEAVY
    elif speed < 45:
        return TRAFFIC_STATUS_MODERATE
    return TRAFFIC_STATUS_NORMAL


def get_prediction_level(score: float) -> str:
    """
    Map continuous congestion score to prediction-level label.
    """
    if score < CONGESTION_THRESHOLD_LOW:
        return PREDICTION_LEVEL_LOW
    elif score < CONGESTION_THRESHOLD_MODERATE:
        return PREDICTION_LEVEL_MODERATE
    return PREDICTION_LEVEL_HIGH


def generate_corridor_params(road_name: str):
    """
    Generates realistic, physically-consistent feature inputs for the ML prediction model
    and the real-time telemetry tables across diverse congestion tiers.
    """
    is_heavy_prone = any(h in road_name for h in HEAVY_CORRIDORS)
    is_freeflow_prone = any(f in road_name for f in FREEFLOW_CORRIDORS)

    # Correlate volume, capacity utilization, and speeds realistically
    if is_heavy_prone:
        # High/Severe Congestion regime
        traffic_volume = random.randint(32000, 68000)
        speed = random.randint(12, 28)
        road_capacity_util = random.randint(78, 98)
        travel_time_index = round(random.uniform(2.0, 3.6), 2)
        incidents = 1 if random.random() < 0.4 else (2 if random.random() < 0.1 else 0)
        roadwork = 1 if random.random() < 0.2 else 0
        environmental_impact = random.randint(70, 95)
    elif is_freeflow_prone:
        # Low/Free Flow regime
        traffic_volume = random.randint(6000, 16000)
        speed = random.randint(52, 78)
        road_capacity_util = random.randint(28, 55)
        travel_time_index = round(random.uniform(1.0, 1.3), 2)
        incidents = 0
        roadwork = 1 if random.random() < 0.05 else 0
        environmental_impact = random.randint(20, 50)
    else:
        # Balanced / Moderate regime
        traffic_volume = random.randint(16000, 34000)
        speed = random.randint(28, 52)
        road_capacity_util = random.randint(50, 78)
        travel_time_index = round(random.uniform(1.3, 2.1), 2)
        incidents = 1 if random.random() < 0.15 else 0
        roadwork = 1 if random.random() < 0.08 else 0
        environmental_impact = random.randint(45, 75)

    weather = random.choice(WEATHER_OPTIONS)
    public_transport = random.randint(25, 70)
    signal_compliance = min(98, max(50, int(65 + speed * 0.4 + random.randint(-5, 5))))
    parking_usage = random.randint(40, 90)
    pedestrians = random.randint(50, 350)
    live_vehicles_count = int(traffic_volume / 80 + random.randint(-20, 20))

    return {
        "traffic_volume": traffic_volume,
        "speed": speed,
        "road_capacity_util": road_capacity_util,
        "travel_time_index": travel_time_index,
        "incidents": incidents,
        "roadwork": roadwork,
        "environmental_impact": environmental_impact,
        "weather": weather,
        "public_transport": public_transport,
        "signal_compliance": signal_compliance,
        "parking_usage": parking_usage,
        "pedestrians": pedestrians,
        "live_vehicles_count": live_vehicles_count,
    }


def initialize(db):
    roads = db.query(Road).all()
    for road in roads:
        exists = db.query(Traffic).filter(Traffic.road_id == road.id).first()
        if exists:
            continue

        params = generate_corridor_params(road.name)
        status = get_status(params["speed"])
        db.add(
            Traffic(
                road_id=road.id,
                vehicles=params["live_vehicles_count"],
                average_speed=params["speed"],
                status=status,
            )
        )
    db.commit()


ROAD_TO_AREA_MAP = {
    "100 Feet Road": "Indiranagar",
    "CMH Road": "Indiranagar",
    "Indiranagar": "Indiranagar",
    "Marathahalli": "Whitefield",
    "Whitefield": "Whitefield",
    "ITPL": "Whitefield",
    "Outer Ring Road": "Koramangala",
    "Silk Board": "Koramangala",
    "Sony World": "Koramangala",
    "Koramangala": "Koramangala",
    "Sarjapur": "Koramangala",
    "Hosur Road": "Electronic City",
    "Electronic City": "Electronic City",
    "M.G. Road": "M.G. Road",
    "Brigade Road": "M.G. Road",
    "Trinity Circle": "M.G. Road",
    "Anil Kumble": "M.G. Road",
    "Hebbal": "Hebbal",
    "Airport Road": "Hebbal",
    "Ballari Road": "Hebbal",
    "Bellary Road": "Hebbal",
    "Yeshwanthpur": "Yeshwanthpur",
    "Tumkur Road": "Yeshwanthpur",
    "Jayanagar": "Jayanagar",
    "South End Circle": "Jayanagar",
    "Bannerghatta": "Jayanagar",
}


def infer_area_name(road_name: str, fallback: str = "Whitefield") -> str:
    r_lower = (road_name or "").lower()
    for key, area in ROAD_TO_AREA_MAP.items():
        if key.lower() in r_lower:
            return area
    return fallback


def update_traffic(db):
    initialize(db)
    rows = db.query(Traffic).all()
    today = datetime.now()

    for row in rows:
        road_name = row.road.name if row.road else f"Road #{row.road_id}"
        area_name = infer_area_name(road_name)

        params = generate_corridor_params(road_name)
        traffic_category = get_traffic_category(params["traffic_volume"])

        df = pd.DataFrame([
            {
                "Area Name": area_name,
                "Road/Intersection Name": road_name,
                "Traffic Category": traffic_category,
                "Traffic Volume": params["traffic_volume"],
                "Average Speed": params["speed"],
                "Travel Time Index": params["travel_time_index"],
                "Road Capacity Utilization": params["road_capacity_util"],
                "Incident Reports": params["incidents"],
                "Environmental Impact": params["environmental_impact"],
                "Public Transport Usage": params["public_transport"],
                "Traffic Signal Compliance": params["signal_compliance"],
                "Parking Usage": params["parking_usage"],
                "Pedestrian and Cyclist Count": params["pedestrians"],
                "Year": today.year,
                "Month": today.month,
                "Day": today.day,
                "DayOfWeek": today.weekday(),
                "Weather": WEATHER_ENCODING[params["weather"]],
                "Roadwork": params["roadwork"],
            }
        ])

        try:
            prediction = float(predict(df))
        except Exception:
            prediction = float(params["road_capacity_util"] * 0.9 + (80 - params["speed"]) * 0.3)

        prediction_level = get_prediction_level(prediction)
        status = get_status(params["speed"])

        # Update live traffic telemetry table
        row.vehicles = params["live_vehicles_count"]
        row.average_speed = params["speed"]
        row.status = status

        # Save to historical records table
        recommendation = (
            "Traffic flowing smoothly. Maintain signal cycle."
            if prediction < CONGESTION_THRESHOLD_LOW
            else "Increase green signal timing by 15% and monitor volume."
            if prediction < CONGESTION_THRESHOLD_MODERATE
            else f"CRITICAL CONGESTION SURGE on {road_name}. Deploy traffic police & activate dynamic bypass detour."
        )

        save_prediction(
            db,
            area_name=area_name,
            road_name=road_name,
            traffic_volume=params["traffic_volume"],
            average_speed=params["speed"],
            weather=params["weather"],
            roadwork=bool(params["roadwork"]),
            prediction=prediction,
            level=prediction_level,
            recommendation=recommendation,
        )

        # Trigger live active alert and SMTP email dispatch when High / Critical congestion or incidents detected
        if prediction >= CONGESTION_THRESHOLD_MODERATE or params["incidents"] > 0 or params["roadwork"] > 0:
            alert_type = (
                "Incident"
                if params["incidents"] > 0
                else ("Roadwork" if params["roadwork"] > 0 else "Congestion")
            )
            AlertService.create_alert(
                db=db,
                road=road_name,
                congestion=prediction,
                recommendation=recommendation,
                alert_type=alert_type,
            )

    db.commit()


def simulate():
    print("Traffic simulator started with dynamic multi-tier risk distributions...")
    while True:
        db = SessionLocal()
        try:
            update_traffic(db)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Live traffic telemetry & ML predictions synchronized.")
            time.sleep(SIMULATOR_INTERVAL_SECONDS)
        except Exception as exc:
            print(f"[Simulator Warning] {exc}")
            time.sleep(RETRY_DELAY_SECONDS)
        finally:
            db.close()


if __name__ == "__main__":
    simulate()
