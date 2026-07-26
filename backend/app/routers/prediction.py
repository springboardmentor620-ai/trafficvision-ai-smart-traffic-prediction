import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .. import models, security, prediction
from ..database import get_db

router = APIRouter(prefix="/prediction", tags=["Traffic Prediction"])


@router.post("/train/{road_id}")
def train(
    road_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_roles("admin", "operator")),
):
    """Train (or retrain) the congestion-forecasting model for a road, using
    every historical reading currently stored in the database for it."""
    road = db.query(models.Road).filter(models.Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    try:
        metrics = prediction.train_model(db, road_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return metrics


@router.get("/forecast_at/{road_id}")
def forecast_at(
    road_id: int,
    target: datetime = Query(..., description="Target date/time to forecast for (ISO 8601)"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Single-point forecast for exactly one date/time (used by the
    Forecasting page's date/time picker) — as opposed to /forecast and
    /report below, which return a whole window leading up to a point."""
    try:
        return prediction.forecast_at(db, road_id, target)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/forecast/{road_id}")
def forecast(
    road_id: int,
    hours: int = Query(24, ge=1, le=720, description="How many hours ahead to forecast"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Congestion forecasting / peak-hour forecasting going forward. Returns
    hourly points for roads with real hourly data, or one point per day for
    roads (like the Bangalore Kaggle dataset) that only have daily history."""
    try:
        result = prediction.forecast_next_hours(db, road_id, hours)
        return result["forecast"]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/report/{road_id}")
def report(
    road_id: int,
    hours: int = Query(24, ge=1, le=720),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Traffic prediction report: forecast + peak-hour + model summary, as JSON."""
    try:
        return prediction.generate_report(db, road_id, hours)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/report/{road_id}/download")
def download_report(
    road_id: int,
    hours: int = Query(24, ge=1, le=720),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Same report, but as a downloadable CSV file (Generate traffic prediction reports)."""
    try:
        rep = prediction.generate_report(db, road_id, hours)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["TrafficVision AI - Traffic Prediction Report"])
    writer.writerow(["Road", rep["road_name"]])
    writer.writerow(["Lane capacity", rep["lane_capacity"]])
    writer.writerow(["Generated at (UTC)", rep["generated_at"]])
    writer.writerow(["Forecast window (hours)", rep["forecast_window_hours"]])
    writer.writerow(["Forecast granularity", rep["granularity"]])
    writer.writerow([])
    writer.writerow(["Peak hour", rep["peak_hour"]["forecast_time"], rep["peak_hour"]["predicted_vehicle_count"]])
    writer.writerow(["Quietest hour", rep["quietest_hour"]["forecast_time"], rep["quietest_hour"]["predicted_vehicle_count"]])
    writer.writerow([])
    writer.writerow(["forecast_time", "predicted_vehicle_count", "predicted_congestion_level"])
    for row in rep["forecast"]:
        writer.writerow([row["forecast_time"], row["predicted_vehicle_count"], row["predicted_congestion_level"]])

    buffer.seek(0)
    filename = f"traffic_prediction_report_road_{road_id}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
