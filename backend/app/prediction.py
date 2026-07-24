"""
Traffic Prediction Module (Milestone 2, Week 3-4).

Trains a real scikit-learn regression model directly from the
`traffic_readings` table in the database (not from a CSV file) — for the
Kaggle-backed road this means training on ~48,000+ genuine historical
readings; for any other road it trains on whatever history has accumulated
so far, as long as there's enough of it.

Features used are purely time-based (hour of day, day of week, month,
weekend flag) since those are the only inputs we can know in advance for a
FUTURE prediction — we deliberately don't use same-hour weather, since at
prediction time we don't have next week's weather forecast either. This
supports exactly what the spec calls "Peak-hour forecasting": the model
learns recurring hourly/weekly traffic patterns (e.g. rush hour) and can
project them forward.

Model artifacts are cached to disk per-road under app/ml_models/, keyed by
road id, so training doesn't need to happen on every server restart.
"""
import os
from datetime import datetime, timedelta

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sqlalchemy.orm import Session

from . import models

MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml_models")
os.makedirs(MODEL_DIR, exist_ok=True)

MIN_READINGS_TO_TRAIN = 100


def _model_path(road_id: int) -> str:
    return os.path.join(MODEL_DIR, f"road_{road_id}_model.joblib")


def _extract_features(dt: datetime) -> list:
    """Time-based features only — the only inputs available for a future timestamp."""
    return [
        dt.hour,
        dt.weekday(),       # 0=Monday ... 6=Sunday
        dt.month,
        1 if dt.weekday() >= 5 else 0,  # is_weekend
    ]


def train_model(db: Session, road_id: int) -> dict:
    """Train (or retrain) a RandomForestRegressor for one road, using every
    historical reading currently stored in the database for that road.
    Returns training metrics. Raises ValueError if there isn't enough data.
    """
    readings = (
        db.query(models.TrafficReading)
        .filter(models.TrafficReading.road_id == road_id)
        .order_by(models.TrafficReading.recorded_at.asc())
        .all()
    )

    if len(readings) < MIN_READINGS_TO_TRAIN:
        raise ValueError(
            f"Not enough historical data to train a model for this road "
            f"({len(readings)} readings found, need at least {MIN_READINGS_TO_TRAIN}). "
            f"Keep the live feed running longer, or choose the Kaggle-backed road."
        )

    X = np.array([_extract_features(r.recorded_at) for r in readings])
    y = np.array([r.vehicle_count for r in readings])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=150, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    joblib.dump(model, _model_path(road_id))

    return {
        "road_id": road_id,
        "training_readings_used": len(readings),
        "mean_absolute_error": round(mae, 2),
        "r2_score": round(r2, 4),
        "trained_at": datetime.utcnow().isoformat(),
    }


def load_model(road_id: int):
    path = _model_path(road_id)
    if not os.path.exists(path):
        return None
    return joblib.load(path)


def predict_volume(road_id: int, target_dt: datetime) -> float:
    model = load_model(road_id)
    if model is None:
        raise ValueError("No trained model found for this road. Train one first via POST /prediction/train/{road_id}.")
    features = np.array([_extract_features(target_dt)])
    prediction = model.predict(features)[0]
    return max(0.0, float(prediction))


def forecast_next_hours(db: Session, road_id: int, hours: int = 24) -> list[dict]:
    """Congestion forecasting workflow + peak-hour forecasting: predicts
    vehicle volume and congestion level for each of the next N hours."""
    road = db.query(models.Road).filter(models.Road.id == road_id).first()
    if not road:
        raise ValueError("Road not found")

    from .routers.traffic import compute_congestion_level

    now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    forecast = []
    for h in range(1, hours + 1):
        target_dt = now + timedelta(hours=h)
        predicted_volume = predict_volume(road_id, target_dt)
        level = compute_congestion_level(int(round(predicted_volume)), road.lane_capacity)
        forecast.append(
            {
                "forecast_time": target_dt.isoformat(),
                "predicted_vehicle_count": round(predicted_volume, 1),
                "predicted_congestion_level": level,
            }
        )
    return forecast


def generate_report(db: Session, road_id: int, hours: int = 24) -> dict:
    """Traffic prediction report: forecast + peak-hour identification + model metrics."""
    road = db.query(models.Road).filter(models.Road.id == road_id).first()
    if not road:
        raise ValueError("Road not found")

    forecast = forecast_next_hours(db, road_id, hours)
    peak = max(forecast, key=lambda f: f["predicted_vehicle_count"])
    quietest = min(forecast, key=lambda f: f["predicted_vehicle_count"])

    high_congestion_hours = [f["forecast_time"] for f in forecast if f["predicted_congestion_level"] == "high"]

    return {
        "road_id": road.id,
        "road_name": road.name,
        "lane_capacity": road.lane_capacity,
        "generated_at": datetime.utcnow().isoformat(),
        "forecast_window_hours": hours,
        "peak_hour": peak,
        "quietest_hour": quietest,
        "predicted_high_congestion_hours": high_congestion_hours,
        "forecast": forecast,
    }
