import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
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
    """Same report, but as a downloadable PDF file (Generate traffic prediction reports)."""
    try:
        rep = prediction.generate_report(db, road_id, hours)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
    )
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("TrafficVision AI - Traffic Prediction Report", styles["Title"]))
    story.append(Spacer(1, 12))

    summary_data = [
        ["Road", rep["road_name"]],
        ["Lane capacity", str(rep["lane_capacity"])],
        ["Generated at (UTC)", str(rep["generated_at"])],
        ["Forecast window (hours)", str(rep["forecast_window_hours"])],
        ["Forecast granularity", str(rep["granularity"])],
    ]
    summary_table = Table(summary_data, colWidths=[2.2 * inch, 3.8 * inch])
    summary_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ]
        )
    )
    story.append(summary_table)
    story.append(Spacer(1, 16))

    story.append(Paragraph("Peak / Quietest Hour", styles["Heading2"]))
    peak_data = [
        ["", "Forecast time", "Predicted vehicle count"],
        ["Peak hour", str(rep["peak_hour"]["forecast_time"]), str(rep["peak_hour"]["predicted_vehicle_count"])],
        ["Quietest hour", str(rep["quietest_hour"]["forecast_time"]), str(rep["quietest_hour"]["predicted_vehicle_count"])],
    ]
    peak_table = Table(peak_data, colWidths=[1.5 * inch, 2.5 * inch, 2 * inch])
    peak_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2f5597")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
            ]
        )
    )
    story.append(peak_table)
    story.append(Spacer(1, 16))

    story.append(Paragraph("Forecast Detail", styles["Heading2"]))
    story.append(Spacer(1, 6))
    forecast_header = ["Forecast time", "Predicted vehicle count", "Predicted congestion level"]
    forecast_rows = [
        [str(row["forecast_time"]), str(row["predicted_vehicle_count"]), str(row["predicted_congestion_level"])]
        for row in rep["forecast"]
    ]
    forecast_table = Table([forecast_header] + forecast_rows, colWidths=[2 * inch, 2.2 * inch, 2.2 * inch], repeatRows=1)
    forecast_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2f5597")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
            ]
        )
    )
    story.append(forecast_table)

    doc.build(story)
    buffer.seek(0)
    filename = f"traffic_prediction_report_road_{road_id}.pdf"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
