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

# ---------------------------------------------------------------------------
# Hourly disaggregation profile (for roads whose real historical data is
# daily-only, e.g. the Bangalore Kaggle dataset — see _detect_granularity).
#
# The trained model genuinely learns day-level patterns (day-of-week, month,
# weekend) from real data — that part is not synthetic. But it has no hourly
# signal to learn from (every historical row is midnight), so it cannot
# honestly predict "how does this specific hour compare to other hours of
# the same day" from data alone.
#
# To still answer "what will traffic look like at 5 PM vs 3 AM" (which any
# real traffic app needs to do), we redistribute the model's predicted DAILY
# TOTAL across the 24 hours using a standard, well-known urban-road diurnal
# traffic curve (two rush-hour peaks: ~8-9 AM and ~6-7 PM, a midday plateau,
# and a night-time trough) — the same kind of "typical day" curve traffic
# engineers use (e.g. FHWA/ITE style diurnal profiles) when only aggregate
# counts are available and no per-hour sensor data exists.
#
# This is a modeled assumption, not something learned from THIS dataset —
# it's disclosed as such via the "hourly_profile_applied" flag in every
# response that uses it. It's the standard, honest way to turn a
# daily-resolution prediction into an hour-of-day estimate.
# ---------------------------------------------------------------------------
_HOURLY_PROFILE_RAW = [
    0.010, 0.006, 0.004, 0.004, 0.005, 0.010,  # 00:00–05:00  (overnight trough)
    0.025, 0.055, 0.075, 0.070, 0.055, 0.050,  # 06:00–11:00  (morning rush ~08:00)
    0.050, 0.050, 0.050, 0.055, 0.060, 0.075,  # 12:00–17:00  (midday plateau, rush building)
    0.080, 0.065, 0.045, 0.030, 0.020, 0.015,  # 18:00–23:00  (evening rush ~18:00, tapering off)
]
_HOURLY_PROFILE_TOTAL = sum(_HOURLY_PROFILE_RAW)
HOURLY_PROFILE = [w / _HOURLY_PROFILE_TOTAL for w in _HOURLY_PROFILE_RAW]  # normalized, sums to 1.0


def _hourly_share(hour: int) -> float:
    """Fraction of a day's total traffic expected in a given hour (0-23)."""
    return HOURLY_PROFILE[hour % 24]


def _model_path(road_id: int) -> str:
    return os.path.join(MODEL_DIR, f"road_{road_id}_model.joblib")


def _detect_granularity(readings) -> str:
    """Inspect the training data's timestamps to see whether hour-of-day is
    a genuine, well-sampled predictive signal.

    Some imported datasets (e.g. the Bangalore Kaggle CSV) only have one
    reading per road per day, always at midnight — the model has no real
    hourly signal there, and forecasting hour-by-hour would be misleading
    (every hour collapsing to the same, or near-same, prediction).

    It's not enough to check for *any* hour-of-day variation, though:
    main.py's `_replay_bangalore_feed` background thread continuously
    inserts new readings timestamped `datetime.utcnow()` (real wall-clock
    hour) while copying the vehicle_count from the historical daily
    dataset — i.e. an unrelated value gets a real, varying hour stamped on
    it. A handful of these trickling in is enough to make an otherwise
    daily-only road show 2-3 distinct hours, which would wrongly flip the
    classification to "hourly" and reintroduce blocky, semi-random
    per-hour predictions driven by noise rather than a real pattern.

    So we require the data to cover a substantial majority of the day, with
    a minimum number of samples per covered hour, before trusting hour as
    a real feature.
    """
    HOURS_REQUIRED = 12              # at least half the day must be covered
    MIN_READINGS_PER_HOUR = 3        # and not just a stray reading or two

    hour_counts: dict[int, int] = {}
    for r in readings:
        h = r.recorded_at.hour
        hour_counts[h] = hour_counts.get(h, 0) + 1

    well_covered_hours = sum(1 for c in hour_counts.values() if c >= MIN_READINGS_PER_HOUR)
    return "hourly" if well_covered_hours >= HOURS_REQUIRED else "daily"


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
            f"Keep the live feed running longer, or choose one of the 16 Bangalore roads."
        )

    X = np.array([_extract_features(r.recorded_at) for r in readings])
    y = np.array([r.vehicle_count for r in readings])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=150, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    granularity = _detect_granularity(readings)

    joblib.dump({"model": model, "granularity": granularity}, _model_path(road_id))

    return {
        "road_id": road_id,
        "training_readings_used": len(readings),
        "mean_absolute_error": round(mae, 2),
        "r2_score": round(r2, 4),
        "trained_at": datetime.utcnow().isoformat(),
        "granularity": granularity,
    }


def load_model(road_id: int):
    path = _model_path(road_id)
    if not os.path.exists(path):
        return None
    bundle = joblib.load(path)
    # Backwards compatibility with model files saved before granularity
    # detection was added (bare estimator instead of a dict bundle).
    if not isinstance(bundle, dict):
        return {"model": bundle, "granularity": "hourly"}
    return bundle


def predict_volume(road_id: int, target_dt: datetime) -> float:
    bundle = load_model(road_id)
    if bundle is None:
        raise ValueError("No trained model found for this road. Train one first via POST /prediction/train/{road_id}.")
    model = bundle["model"]
    features = np.array([_extract_features(target_dt)])
    prediction = model.predict(features)[0]
    return max(0.0, float(prediction))


def forecast_next_hours(db: Session, road_id: int, hours: int = 24) -> dict:
    """Congestion forecasting workflow + peak-hour forecasting: predicts
    vehicle volume and congestion level going forward, one point per hour.

    For roads whose real historical data only has daily granularity (the
    Bangalore Kaggle roads), the model itself predicts one total per DAY
    (that part is genuinely learned from data); each day's total is then
    split across its 24 hours using the standard urban diurnal traffic
    profile (see HOURLY_PROFILE) so the forecast still varies hour-by-hour
    to show rush-hour peaks, rather than being a flat block per day.
    Roads with real hourly history get a true, fully-learned hour-by-hour
    forecast with no profile applied.
    """
    road = db.query(models.Road).filter(models.Road.id == road_id).first()
    if not road:
        raise ValueError("Road not found")

    bundle = load_model(road_id)
    if bundle is None:
        raise ValueError("No trained model found for this road. Train one first via POST /prediction/train/{road_id}.")
    granularity = bundle["granularity"]

    from .routers.traffic import compute_congestion_level

    forecast = []
    if granularity == "daily":
        now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
        hourly_capacity = max(1, road.lane_capacity / 24)
        daily_total_cache: dict = {}
        for h in range(1, hours + 1):
            target_dt = now + timedelta(hours=h)
            day_start = target_dt.replace(hour=0, minute=0, second=0, microsecond=0)
            if day_start not in daily_total_cache:
                daily_total_cache[day_start] = predict_volume(road_id, day_start)
            daily_total = daily_total_cache[day_start]
            predicted_volume = daily_total * _hourly_share(target_dt.hour)
            level = compute_congestion_level(int(round(predicted_volume)), int(round(hourly_capacity)))
            forecast.append(
                {
                    "forecast_time": target_dt.isoformat(),
                    "predicted_vehicle_count": round(predicted_volume, 1),
                    "predicted_congestion_level": level,
                }
            )
    else:
        now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
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

    return {"granularity": granularity, "hourly_profile_applied": granularity == "daily", "forecast": forecast}


def forecast_at(db: Session, road_id: int, target_dt: datetime) -> dict:
    """Single-point forecast: predicts for exactly ONE target date/time,
    rather than a whole window of hours/days leading up to it. Used by the
    date/time picker on the Forecasting page so picking, say, 29 July only
    returns 29 July's prediction — not every day from tomorrow through it.
    """
    road = db.query(models.Road).filter(models.Road.id == road_id).first()
    if not road:
        raise ValueError("Road not found")

    bundle = load_model(road_id)
    if bundle is None:
        raise ValueError("No trained model found for this road. Train one first via POST /prediction/train/{road_id}.")
    granularity = bundle["granularity"]

    from .routers.traffic import compute_congestion_level

    if granularity == "daily":
        # The model predicts a DAILY TOTAL (it genuinely learned day-of-week /
        # month / weekend patterns from real data). We then split that total
        # across the exact hour the user picked using the standard urban
        # diurnal traffic profile — so the time input now actually changes
        # the result, instead of being ignored.
        day_start = target_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        daily_total = predict_volume(road_id, day_start)
        hour_share = _hourly_share(target_dt.hour)
        predicted_volume = daily_total * hour_share
        hourly_capacity = max(1, road.lane_capacity / 24)
        level = compute_congestion_level(int(round(predicted_volume)), int(round(hourly_capacity)))
        effective_dt = target_dt.replace(minute=0, second=0, microsecond=0)

        return {
            "road_id": road.id,
            "road_name": road.name,
            "lane_capacity": road.lane_capacity,
            "generated_at": datetime.utcnow().isoformat(),
            "granularity": granularity,
            "hourly_profile_applied": True,
            "predicted_daily_total": round(daily_total, 1),
            "forecast_time": effective_dt.isoformat(),
            "predicted_vehicle_count": round(predicted_volume, 1),
            "predicted_congestion_level": level,
        }

    effective_dt = target_dt.replace(minute=0, second=0, microsecond=0)
    predicted_volume = predict_volume(road_id, effective_dt)
    level = compute_congestion_level(int(round(predicted_volume)), road.lane_capacity)

    return {
        "road_id": road.id,
        "road_name": road.name,
        "lane_capacity": road.lane_capacity,
        "generated_at": datetime.utcnow().isoformat(),
        "granularity": granularity,
        "hourly_profile_applied": False,
        "forecast_time": effective_dt.isoformat(),
        "predicted_vehicle_count": round(predicted_volume, 1),
        "predicted_congestion_level": level,
    }


def generate_report(db: Session, road_id: int, hours: int = 24) -> dict:
    """Traffic prediction report: forecast + peak-hour identification + model metrics."""
    road = db.query(models.Road).filter(models.Road.id == road_id).first()
    if not road:
        raise ValueError("Road not found")

    result = forecast_next_hours(db, road_id, hours)
    granularity = result["granularity"]
    forecast = result["forecast"]
    peak = max(forecast, key=lambda f: f["predicted_vehicle_count"])
    quietest = min(forecast, key=lambda f: f["predicted_vehicle_count"])

    high_congestion_hours = [f["forecast_time"] for f in forecast if f["predicted_congestion_level"] == "high"]

    return {
        "road_id": road.id,
        "road_name": road.name,
        "lane_capacity": road.lane_capacity,
        "generated_at": datetime.utcnow().isoformat(),
        "forecast_window_hours": hours,
        "granularity": granularity,
        "hourly_profile_applied": result["hourly_profile_applied"],
        "peak_hour": peak,
        "quietest_hour": quietest,
        "predicted_high_congestion_hours": high_congestion_hours,
        "forecast": forecast,
    }
