import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.linear_model import Ridge
from sklearn.metrics import r2_score
from sqlalchemy.orm import Session

from app.modules.traffic_monitoring.services import get_road_by_id, get_reading_history, calculate_congestion_level
from app.modules.traffic_prediction.models import PredictionLog

MIN_DATA_POINTS = 5


def _build_features(timestamps: pd.Series) -> pd.DataFrame:
    hours = timestamps.dt.hour + timestamps.dt.minute / 60
    dow = timestamps.dt.dayofweek

    t0 = timestamps.min()
    trend_minutes = (timestamps - t0).dt.total_seconds() / 60

    return pd.DataFrame({
        "hour_sin": np.sin(2 * np.pi * hours / 24),
        "hour_cos": np.cos(2 * np.pi * hours / 24),
        "dow_sin": np.sin(2 * np.pi * dow / 7),
        "dow_cos": np.cos(2 * np.pi * dow / 7),
        "trend": trend_minutes,
    })


def train_and_forecast(db: Session, road_id: int, hours_ahead: float) -> dict:
    road = get_road_by_id(db, road_id)
    if not road:
        return None

    history = get_reading_history(db, road_id, limit=1000)
    if len(history) < MIN_DATA_POINTS:
        return {
            "insufficient_data": True,
            "road_id": road.id,
            "road_name": road.name,
            "data_points_available": len(history),
            "data_points_required": MIN_DATA_POINTS,
        }

    history = list(reversed(history))
    timestamps = pd.Series([r.recorded_at for r in history])
    vehicle_counts = pd.Series([r.vehicle_count for r in history])

    X = _build_features(timestamps)
    y = vehicle_counts

    model = Ridge(alpha=5.0)
    model.fit(X, y)

    y_pred_train = model.predict(X)
    r2 = round(float(r2_score(y, y_pred_train)), 3)

    predicted_for = datetime.utcnow() + timedelta(hours=hours_ahead)
    future_X = _build_features(pd.Series([predicted_for]))
    raw_prediction = model.predict(future_X)[0]

    observed_min = float(y.min())
    observed_max = float(y.max())
    safe_low = max(0, observed_min * 0.5)
    safe_high = observed_max * 1.5
    predicted_count = int(round(min(max(raw_prediction, safe_low), safe_high)))

    congestion_level = calculate_congestion_level(predicted_count, road.capacity)

    log_entry = PredictionLog(
        road_id=road.id,
        predicted_for=predicted_for,
        predicted_vehicle_count=predicted_count,
        predicted_congestion_level=congestion_level,
        model_r2_score=r2,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    return {
        "insufficient_data": False,
        "road_id": road.id,
        "road_name": road.name,
        "hours_ahead": hours_ahead,
        "predicted_for": predicted_for,
        "predicted_vehicle_count": predicted_count,
        "predicted_congestion_level": congestion_level,
        "model_r2_score": r2,
        "data_points_used": len(history),
        "generated_at": log_entry.created_at,
    }


def get_latest_prediction(db: Session, road_id: int) -> PredictionLog | None:
    return (
        db.query(PredictionLog)
        .filter(PredictionLog.road_id == road_id)
        .order_by(PredictionLog.created_at.desc())
        .first()
    )


def get_prediction_history(db: Session, road_id: int, limit: int = 20) -> list[PredictionLog]:
    return (
        db.query(PredictionLog)
        .filter(PredictionLog.road_id == road_id)
        .order_by(PredictionLog.created_at.desc())
        .limit(limit)
        .all()
    )


def generate_prediction_report(db: Session) -> list[dict]:
    from app.modules.traffic_monitoring.services import get_all_roads, get_latest_reading_per_road

    roads = get_all_roads(db)
    latest_readings = get_latest_reading_per_road(db)

    report = []
    for road in roads:
        reading = latest_readings.get(road.id)
        prediction = get_latest_prediction(db, road.id)

        trend = None
        if reading and prediction:
            if prediction.predicted_vehicle_count > reading.vehicle_count * 1.05:
                trend = "increasing"
            elif prediction.predicted_vehicle_count < reading.vehicle_count * 0.95:
                trend = "decreasing"
            else:
                trend = "stable"

        report.append({
            "road_id": road.id,
            "road_name": road.name,
            "zone": road.zone,
            "current_vehicle_count": reading.vehicle_count if reading else None,
            "current_congestion_level": reading.congestion_level if reading else None,
            "predicted_vehicle_count": prediction.predicted_vehicle_count if prediction else None,
            "predicted_congestion_level": prediction.predicted_congestion_level if prediction else None,
            "predicted_for": prediction.predicted_for if prediction else None,
            "trend": trend,
        })

    return report