"""
ML Service — Centralized Random Forest model wrapper.
Loaded once at startup and reused by all routers.
"""
import json
import numpy as np
import joblib
import warnings
from datetime import datetime
from pathlib import Path

warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml_models" / "traffic_prediction_model.pkl"
FEATURE_PATH = BASE_DIR / "ml_models" / "feature_columns.pkl"

# Load model and feature columns once
_model = joblib.load(MODEL_PATH)
_feature_columns: list = joblib.load(FEATURE_PATH)


def _build_input(junction: int, year: int, month: int, day: int,
                 hour: int, day_of_week: int) -> np.ndarray:
    """Map request fields to the exact feature vector expected by the model."""
    data = np.zeros(len(_feature_columns))

    mapping = {
        "Junction":   junction,
        "Year":       year,
        "Month":      month,
        "Day":        day,
        "Hour":       hour,
        "DayOfWeek":  day_of_week,
    }

    for col, val in mapping.items():
        if col in _feature_columns:
            data[_feature_columns.index(col)] = val

    return data


def predict_volume(junction: int, hour: int = None, day: int = None,
                   month: int = None, year: int = None,
                   day_of_week: int = None) -> int:
    """Predict vehicle count for given junction + time parameters."""
    now = datetime.now()
    input_vec = _build_input(
        junction=junction,
        year=year or now.year,
        month=month or now.month,
        day=day or now.day,
        hour=hour if hour is not None else now.hour,
        day_of_week=day_of_week if day_of_week is not None else now.weekday(),
    )
    pred = _model.predict([input_vec])
    return max(0, round(float(pred[0])))


def classify_congestion(vehicle_count: int) -> dict:
    """Translate predicted vehicle count into congestion metadata."""
    if vehicle_count >= 250:
        level = "High"
        color = "red"
        urgency = "Critical"
    elif vehicle_count >= 150:
        level = "High"
        color = "orange"
        urgency = "High"
    elif vehicle_count >= 80:
        level = "Medium"
        color = "yellow"
        urgency = "Medium"
    else:
        level = "Low"
        color = "green"
        urgency = "Low"

    return {"level": level, "color": color, "urgency": urgency, "vehicle_count": vehicle_count}


def get_recommendation(vehicle_count: int, junction: int, hour: int) -> str:
    """Generate AI recommendation text from prediction."""
    if vehicle_count >= 250:
        return (
            f"⛔ Junction {junction} is critically congested at hour {hour}:00 "
            f"({vehicle_count} vehicles predicted). Deploy traffic police immediately. "
            "Activate signal pre-emption. Enforce mandatory alternate route."
        )
    elif vehicle_count >= 150:
        return (
            f"🔴 Junction {junction} will experience high traffic at {hour}:00 "
            f"({vehicle_count} vehicles). Adjust signal timing. "
            "Advisory for alternate routes. Monitor for rapid deterioration."
        )
    elif vehicle_count >= 80:
        return (
            f"🟡 Junction {junction} expects moderate congestion at {hour}:00 "
            f"({vehicle_count} vehicles). Optimize signal cycle. "
            "Prepare alternate route advisories."
        )
    return (
        f"✅ Junction {junction} shows low traffic at {hour}:00 "
        f"({vehicle_count} vehicles). Normal signal timing. No action required."
    )


def get_signal_recommendation(vehicle_count: int) -> dict:
    """Recommend signal timing based on predicted volume."""
    if vehicle_count >= 200:
        return {
            "green_time": 90,
            "red_time": 30,
            "cycle_length": 120,
            "strategy": "Extended Green — High Volume Clearance",
        }
    elif vehicle_count >= 100:
        return {
            "green_time": 60,
            "red_time": 40,
            "cycle_length": 100,
            "strategy": "Balanced Cycle — Moderate Flow",
        }
    return {
        "green_time": 40,
        "red_time": 50,
        "cycle_length": 90,
        "strategy": "Standard Cycle — Low Flow",
    }


def needs_police_deployment(vehicle_count: int) -> bool:
    return vehicle_count >= 200
