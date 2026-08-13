"""Eager-loaded wrapper around the Random Forest traffic model."""

import json
import logging
import threading
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

# ── Warning suppression ───────────────────────────────────────────────────
# Must be registered before any sklearn import reaches sklearn.utils.parallel.
# Targets only this one module — no other warnings are affected.
warnings.filterwarnings(
    "ignore",
    category=UserWarning,
    module=r"sklearn\.utils\.parallel",
)
warnings.filterwarnings(
    "ignore",
    category=UserWarning,
    message=r".*sklearn\.utils\.parallel\.delayed.*",
)
# ─────────────────────────────────────────────────────────────────────────

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
ML_DIR = BASE_DIR / "ml_models"
MODEL_PATH = ML_DIR / "traffic_model.pkl"
ENCODERS_PATH = ML_DIR / "label_encoders.pkl"
FEATURE_PATH = ML_DIR / "feature_columns.json"

CATEGORICAL_COLS = [
    "weather",
    "road_name",
    "traffic_signal",
    "accident",
    "weekday",
    "time_slot",
    "congestion_level",
    "alternative_route",
]

_model = None
_label_encoders = None
_feature_columns = None
_load_error = None
_load_lock = threading.Lock()


def _load_model_artifacts() -> None:
    """
    Load all ML artifacts into module-level globals.

    - Called ONCE at server startup via lifespan() in main.py.
    - Thread-safe via double-checked locking.
    - Never called lazily inside a request handler.
    """
    global _model, _label_encoders, _feature_columns, _load_error

    # Fast path — already loaded
    if (
        _model is not None
        and _label_encoders is not None
        and _feature_columns is not None
    ):
        return

    with _load_lock:
        # Second check inside lock
        if (
            _model is not None
            and _label_encoders is not None
            and _feature_columns is not None
        ):
            return

        try:
            # ── Existence checks ──────────────────────────────────────────
            for path in (MODEL_PATH, ENCODERS_PATH, FEATURE_PATH):
                if not path.exists():
                    raise FileNotFoundError(
                        f"Required ML artifact not found: {path}"
                    )

            # ── Load artifacts ────────────────────────────────────────────
            logger.info(f"  Loading model      → {MODEL_PATH.name}")
            model = joblib.load(MODEL_PATH)

            # Single-threaded inference — eliminates worker pool + warning
            if hasattr(model, "n_jobs"):
                model.n_jobs = 1

            logger.info(f"  Loading encoders   → {ENCODERS_PATH.name}")
            encoders = joblib.load(ENCODERS_PATH)

            logger.info(f"  Loading features   → {FEATURE_PATH.name}")
            with FEATURE_PATH.open("r", encoding="utf-8") as fh:
                feature_columns = json.load(fh)

            # ── Validate ──────────────────────────────────────────────────
            if not isinstance(feature_columns, list) or not feature_columns:
                raise ValueError(
                    "feature_columns.json must contain a non-empty list"
                )
            if not isinstance(encoders, dict):
                raise ValueError(
                    "label_encoders.pkl must contain a dictionary"
                )

            missing_encoders = [
                c for c in CATEGORICAL_COLS if c not in encoders
            ]
            if missing_encoders:
                raise ValueError(
                    "Missing label encoders for: "
                    + ", ".join(missing_encoders)
                )

            expected = getattr(model, "n_features_in_", None)
            if expected is not None and expected != len(feature_columns):
                raise ValueError(
                    f"Model expects {expected} features but "
                    f"feature_columns.json has {len(feature_columns)}"
                )

            # ── Commit to globals atomically ──────────────────────────────
            _model = model
            _label_encoders = encoders
            _feature_columns = feature_columns
            _load_error = None

            logger.info(
                f"✓ ML artifacts ready — "
                f"{len(feature_columns)} features | "
                f"{len(encoders)} encoders | "
                f"n_estimators={getattr(model, 'n_estimators', 'N/A')} | "
                f"n_jobs={getattr(model, 'n_jobs', 'N/A')}"
            )

        except Exception as exc:
            _load_error = str(exc)
            logger.error(f"✗ ML model load failed: {exc}")
            raise RuntimeError(
                f"Traffic ML model could not be loaded: {exc}"
            ) from exc


def get_model_status() -> dict:
    """Return load status without triggering a load."""
    if (
        _model is not None
        and _label_encoders is not None
        and _feature_columns is not None
    ):
        return {
            "available": True,
            "model_file": MODEL_PATH.name,
            "feature_count": len(_feature_columns),
            "encoder_columns": list(_label_encoders.keys()),
            "n_estimators": getattr(_model, "n_estimators", None),
            "n_jobs": getattr(_model, "n_jobs", None),
        }
    return {
        "available": False,
        "model_file": MODEL_PATH.name,
        "error": _load_error or "Model not yet loaded",
    }


def _normalize_feature_keys(features: dict) -> dict:
    """Accept PascalCase legacy payloads and normalize to model keys."""
    aliases = {
        "Latitude":          "latitude",
        "Longitude":         "longitude",
        "Speed":             "speed",
        "Hour":              "hour",
        "Day":               "day",
        "Month":             "month",
        "Year":              "year",
        "DayOfWeek":         "day_of_week",
        "IsWeekend":         "is_weekend",
        "PeakHour":          "peak_hour",
        "Minute":            "minute",
        "Weather":           "weather",
        "Road_Name":         "road_name",
        "Traffic_Signal":    "traffic_signal",
        "Accident":          "accident",
        "Weekday":           "weekday",
        "TimeSlot":          "time_slot",
        "Congestion_Level":  "congestion_level",
        "Alternative_Route": "alternative_route",
    }
    return {aliases.get(k, k): v for k, v in features.items()}


def _encode_features(features: dict) -> dict:
    """Label-encode all categorical columns using loaded encoders."""
    encoded = features.copy()
    for col in CATEGORICAL_COLS:
        value = str(encoded[col]).strip()
        encoder = _label_encoders[col]
        classes = [str(c).strip() for c in encoder.classes_]
        if value not in classes:
            raise ValueError(
                f"Unknown value for '{col}': '{value}'. "
                f"Valid values: {classes}"
            )
        encoded[col] = int(encoder.transform([value])[0])
    return encoded


def predict_from_features(features: dict) -> dict:
    """
    Run a single-row prediction.
    Raises RuntimeError if model was not loaded at startup.
    """
    if _model is None:
        raise RuntimeError(
            "ML model is not loaded. Check server startup logs."
        )

    normalized = _normalize_feature_keys(features)

    missing = [c for c in _feature_columns if c not in normalized]
    if missing:
        raise ValueError("Missing required features: " + ", ".join(missing))

    encoded = _encode_features(normalized)
    frame = pd.DataFrame([encoded])[_feature_columns]
    prediction = float(_model.predict(frame)[0])

    return {
        "prediction":      max(0, int(round(prediction))),
        "confidence":      None,  # RandomForestRegressor has no predict_proba
        "model_version":   MODEL_PATH.name,
        "feature_columns": list(_feature_columns),
    }


# ── Domain helpers ────────────────────────────────────────────────────────

JUNCTION_ROADS = {
    1: "HITEC City Road",
    2: "Gachibowli-Miyapur Road",
    3: "Banjara Hills Road No. 12",
    4: "Madhapur Road",
}

WEEKDAY_NAMES = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday",
]


def _time_slot(hour: int) -> str:
    if 7 <= hour <= 9:
        return "Morning Peak"
    if 10 <= hour < 14:
        return "Morning"
    if 14 <= hour < 17:
        return "Afternoon"
    if 17 <= hour <= 19:
        return "Evening Peak"
    if 19 < hour < 22:
        return "Evening"
    return "Night"


def predict_volume(
    junction: int,
    hour: int,
    year: int,
    month: int,
    day: int,
    day_of_week: int,
) -> int:
    road_name = JUNCTION_ROADS.get(junction, JUNCTION_ROADS[1])
    features = {
        "latitude":          17.385044,
        "longitude":         78.486671,
        "speed":             30.0 if hour in {8, 9, 17, 18} else 42.0,
        "hour":              hour,
        "day":               day,
        "month":             month,
        "year":              year,
        "day_of_week":       day_of_week,
        "is_weekend":        1 if day_of_week >= 5 else 0,
        "peak_hour":         1 if hour in {8, 9, 10, 17, 18, 19} else 0,
        "minute":            0,
        "weather":           "Clear",
        "road_name":         road_name,
        "traffic_signal":    "Adaptive",
        "accident":          "No",
        "weekday":           WEEKDAY_NAMES[day_of_week],
        "time_slot":         _time_slot(hour),
        "congestion_level":  "Moderate",
        "alternative_route": "No Alternate Route",
    }
    return predict_from_features(features)["prediction"]


def classify_congestion(vehicle_count: int) -> dict:
    if vehicle_count >= 250:
        level, color, urgency = "Severe",   "red",    "Critical"
    elif vehicle_count >= 150:
        level, color, urgency = "High",     "orange", "High"
    elif vehicle_count >= 80:
        level, color, urgency = "Moderate", "yellow", "Medium"
    else:
        level, color, urgency = "Low",      "green",  "Low"
    return {
        "level":         level,
        "color":         color,
        "urgency":       urgency,
        "vehicle_count": vehicle_count,
    }


def get_recommendation(vehicle_count: int, road_name: str, hour: int) -> str:
    if vehicle_count >= 250:
        return (
            f"CRITICAL: {road_name} predicted severely congested at "
            f"{hour:02d}:00 ({vehicle_count} vehicles). Deploy traffic "
            f"police and activate alternate-route advisory."
        )
    if vehicle_count >= 150:
        return (
            f"HIGH: {road_name} will experience high traffic at {hour:02d}:00 "
            f"({vehicle_count} vehicles). Adjust signal timing and monitor "
            f"alternate routes."
        )
    if vehicle_count >= 80:
        return (
            f"MODERATE: {road_name} expects moderate congestion at "
            f"{hour:02d}:00 ({vehicle_count} vehicles). Optimize signal "
            f"timing if needed."
        )
    return (
        f"LOW: {road_name} shows low traffic at {hour:02d}:00 "
        f"({vehicle_count} vehicles). Normal signal timing is appropriate."
    )


def get_signal_recommendation(vehicle_count: int) -> dict:
    if vehicle_count >= 200:
        return {
            "green_time": 90, "red_time": 30, "cycle_length": 120,
            "strategy": "Extended Green — High Volume Clearance",
        }
    if vehicle_count >= 100:
        return {
            "green_time": 60, "red_time": 40, "cycle_length": 100,
            "strategy": "Balanced Cycle — Moderate Flow",
        }
    return {
        "green_time": 40, "red_time": 50, "cycle_length": 90,
        "strategy": "Standard Cycle — Low Flow",
    }


def needs_police_deployment(vehicle_count: int) -> bool:
    return vehicle_count >= 200


def get_feature_columns() -> list:
    if _feature_columns is None:
        raise RuntimeError("ML model not loaded. Check startup logs.")
    return list(_feature_columns)


def get_categorical_columns() -> list:
    return list(CATEGORICAL_COLS)


def get_available_categories(column: str) -> list:
    if _label_encoders is None:
        raise RuntimeError("ML model not loaded. Check startup logs.")
    if column not in _label_encoders:
        raise ValueError(
            f"'{column}' is not a categorical column or has no encoder"
        )
    return list(_label_encoders[column].classes_)
