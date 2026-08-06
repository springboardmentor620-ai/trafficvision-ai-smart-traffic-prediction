"""
AI Recommendations Router — uses the Random Forest model for predictions.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models.traffic import Traffic
from services import ml_service

router = APIRouter(prefix="/recommendations", tags=["AI Recommendations"])


# ─────────────────────────────────────────────────────────────────────────────
# GET /recommendations/
# All traffic junctions with RF predictions + AI recommendations
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/")
def get_ai_recommendations(
    db: Session = Depends(get_db),
    hour: int = Query(None, ge=0, le=23, description="Override hour (default = current hour)"),
):
    """
    For every traffic record in the DB, use the Random Forest model to:
    - Predict next-hour vehicle volume
    - Classify congestion level
    - Generate AI recommendation text
    """
    records = db.query(Traffic).all()
    now = datetime.now()
    target_hour = hour if hour is not None else (now.hour + 1) % 24

    results = []
    for r in records:
        pred_count = ml_service.predict_volume(
            junction=r.id % 4 + 1,   # map DB id to junction 1–4
            hour=target_hour,
            year=now.year,
            month=now.month,
            day=now.day,
            day_of_week=now.weekday(),
        )
        cong = ml_service.classify_congestion(pred_count)
        recommendation = ml_service.get_recommendation(pred_count, r.id % 4 + 1, target_hour)
        signal = ml_service.get_signal_recommendation(pred_count)
        needs_police = ml_service.needs_police_deployment(pred_count)

        results.append({
            "location": r.location,
            "current_vehicle_count": r.vehicle_count,
            "current_congestion": r.congestion_level,
            "predicted_vehicle_count": pred_count,
            "predicted_congestion_level": cong["level"],
            "predicted_urgency": cong["urgency"],
            "congestion_color": cong["color"],
            "ai_recommendation": recommendation,
            "signal_optimization": signal,
            "deploy_police": needs_police,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "prediction_hour": target_hour,
        })

    # Sort by predicted vehicle count descending (worst first)
    results.sort(key=lambda x: x["predicted_vehicle_count"], reverse=True)
    return {
        "prediction_hour": f"{target_hour:02d}:00",
        "total_locations": len(results),
        "critical_count": sum(1 for r in results if r["predicted_urgency"] == "Critical"),
        "high_count": sum(1 for r in results if r["predicted_urgency"] == "High"),
        "recommendations": results,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /recommendations/signal-optimization
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/signal-optimization")
def get_signal_optimization(db: Session = Depends(get_db)):
    """
    Suggest optimal signal timing for each junction based on RF predictions.
    """
    records = db.query(Traffic).all()
    now = datetime.now()

    optimizations = []
    for r in records:
        pred_count = ml_service.predict_volume(
            junction=r.id % 4 + 1,
            hour=(now.hour + 1) % 24,
            year=now.year,
            month=now.month,
            day=now.day,
            day_of_week=now.weekday(),
        )
        signal = ml_service.get_signal_recommendation(pred_count)
        cong = ml_service.classify_congestion(pred_count)

        optimizations.append({
            "location": r.location,
            "predicted_volume": pred_count,
            "congestion_level": cong["level"],
            "recommended_green_time_sec": signal["green_time"],
            "recommended_red_time_sec": signal["red_time"],
            "cycle_length_sec": signal["cycle_length"],
            "strategy": signal["strategy"],
            "latitude": r.latitude,
            "longitude": r.longitude,
        })

    optimizations.sort(key=lambda x: x["predicted_volume"], reverse=True)
    return {
        "total_junctions": len(optimizations),
        "generated_at": now.isoformat(),
        "optimizations": optimizations,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /recommendations/police-deployment
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/police-deployment")
def get_police_deployment(db: Session = Depends(get_db)):
    """
    Flag junctions that need police deployment based on RF predicted volume.
    """
    records = db.query(Traffic).all()
    now = datetime.now()

    deployment_needed = []
    no_deployment = []

    for r in records:
        pred_count = ml_service.predict_volume(
            junction=r.id % 4 + 1,
            hour=(now.hour + 1) % 24,
            year=now.year,
            month=now.month,
            day=now.day,
            day_of_week=now.weekday(),
        )
        entry = {
            "location": r.location,
            "predicted_vehicle_count": pred_count,
            "current_vehicle_count": r.vehicle_count,
            "congestion_level": r.congestion_level,
            "deploy_police": ml_service.needs_police_deployment(pred_count),
            "priority": "Immediate" if pred_count >= 250 else "Standby",
            "latitude": r.latitude,
            "longitude": r.longitude,
        }
        if entry["deploy_police"]:
            deployment_needed.append(entry)
        else:
            no_deployment.append(entry)

    return {
        "junctions_needing_police": len(deployment_needed),
        "junctions_clear": len(no_deployment),
        "deploy_immediately": [e for e in deployment_needed if e["priority"] == "Immediate"],
        "deploy_standby": [e for e in deployment_needed if e["priority"] == "Standby"],
        "clear_junctions": no_deployment,
        "generated_at": now.isoformat(),
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /recommendations/hourly-forecast
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/hourly-forecast")
def get_hourly_forecast(
    junction: int = Query(1, ge=1, le=4),
    db: Session = Depends(get_db),
):
    """
    RF predictions for all 24 hours for a specific junction.
    Used for trend analysis charts.
    """
    now = datetime.now()
    forecast = []
    for hour in range(24):
        pred_count = ml_service.predict_volume(
            junction=junction,
            hour=hour,
            year=now.year,
            month=now.month,
            day=now.day,
            day_of_week=now.weekday(),
        )
        cong = ml_service.classify_congestion(pred_count)
        forecast.append({
            "hour": hour,
            "hour_label": f"{hour:02d}:00",
            "predicted_vehicles": pred_count,
            "congestion_level": cong["level"],
            "urgency": cong["urgency"],
            "color": cong["color"],
        })

    return {
        "junction": junction,
        "date": now.strftime("%Y-%m-%d"),
        "forecast": forecast,
        "peak_hour": max(forecast, key=lambda x: x["predicted_vehicles"])["hour_label"],
        "min_hour": min(forecast, key=lambda x: x["predicted_vehicles"])["hour_label"],
    }
