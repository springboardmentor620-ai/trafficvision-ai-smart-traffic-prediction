import io
from datetime import datetime
from typing import Optional

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
from sqlalchemy import desc
from sqlalchemy.orm import Session

from .. import models, security, prediction
from ..database import get_db
from .analytics import CONGESTION_SCORE, DOW_NAMES

router = APIRouter(prefix="/insights", tags=["AI Insights"])


def _build_recommendations(db: Session) -> list:
    """Shared by the JSON endpoint and the PDF report so the two never
    drift out of sync — one road-scoring pass, two presentations."""
    roads = db.query(models.Road).all()
    recommendations = []

    for road in roads:
        latest = (
            db.query(models.TrafficReading)
            .filter(models.TrafficReading.road_id == road.id)
            .order_by(desc(models.TrafficReading.recorded_at))
            .first()
        )
        if not latest:
            continue

        active_alerts = (
            db.query(models.Alert)
            .filter(
                models.Alert.road_id == road.id,
                models.Alert.status != models.AlertStatusEnum.resolved,
            )
            .count()
        )

        # If a forecasting model exists for this road, fold its near-term
        # peak into the recommendation (Smart traffic recommendations).
        bundle = prediction.load_model(road.id)
        forecast_note: Optional[str] = None
        peak_level: Optional[str] = None
        if bundle is not None:
            try:
                result = prediction.forecast_next_hours(db, road.id, hours=12)
                fc = result["forecast"]
                if fc:
                    peak = max(fc, key=lambda p: p["predicted_vehicle_count"])
                    peak_level = peak["predicted_congestion_level"]
                    if peak_level == "high":
                        forecast_note = (
                            f"Model forecasts high congestion around "
                            f"{peak['forecast_time'][:16].replace('T', ' ')} — plan ahead."
                        )
            except ValueError:
                pass

        priority = "low"
        actions = []

        if latest.congestion_level == "high":
            priority = "high"
            actions.append(
                f"Currently high congestion ({latest.vehicle_count} vehicles, "
                f"{latest.avg_speed_kmph} km/h avg) — signal alternate routes to commuters."
            )
        elif latest.congestion_level == "medium":
            priority = "medium"
            actions.append("Moderate congestion — monitor closely, may escalate during peak hours.")
        else:
            actions.append("Traffic flowing freely — no action needed right now.")

        if active_alerts:
            priority = "high"
            actions.append(f"{active_alerts} unresolved alert(s) currently open on this road.")

        if forecast_note:
            if priority == "low":
                priority = "medium"
            actions.append(forecast_note)
        elif bundle is None:
            actions.append("No trained forecasting model yet — train one on the Forecasting page for predictive alerts.")

        recommendations.append(
            {
                "road_id": road.id,
                "road_name": road.name,
                "location": road.location,
                "priority": priority,
                "current_congestion": latest.congestion_level,
                "active_alerts": active_alerts,
                "has_model": bundle is not None,
                "recommendation": " ".join(actions),
            }
        )

    priority_rank = {"high": 0, "medium": 1, "low": 2}
    recommendations.sort(key=lambda r: priority_rank.get(r["priority"], 3))
    return recommendations


@router.get("/recommendations")
def smart_recommendations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """AI Prediction Module: smart traffic recommendations. Combines each
    road's live congestion state, unresolved alerts, and (where a model has
    been trained) its forecasted peak into a single plain-language
    recommendation, ranked by priority — the 'AI-based traffic
    recommendations' deliverable for the Analytics/AI dashboard."""
    return _build_recommendations(db)


@router.get("/recommendations/report")
def recommendations_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Same recommendations, as a downloadable PDF (the 'reports' half of
    'Generate AI-based traffic recommendations and reports')."""
    recommendations = _build_recommendations(db)

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

    story.append(Paragraph("TrafficVision AI - Smart Recommendations Report", styles["Title"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"Generated at (UTC): {datetime.utcnow().isoformat(timespec='seconds')}", styles["Normal"]))
    story.append(Spacer(1, 16))

    if not recommendations:
        story.append(Paragraph("No roads with data yet.", styles["Normal"]))
    else:
        header = ["Priority", "Road", "Congestion", "Active Alerts", "Recommendation"]
        rows = [
            [
                r["priority"].upper(),
                r["road_name"],
                r["current_congestion"],
                str(r["active_alerts"]),
                r["recommendation"],
            ]
            for r in recommendations
        ]
        styles["Normal"].fontSize = 8
        styles["Normal"].leading = 10
        rows_wrapped = [
            [row[0], row[1], row[2], row[3], Paragraph(row[4], styles["Normal"])]
            for row in rows
        ]
        table = Table(
            [header] + rows_wrapped,
            colWidths=[0.8 * inch, 1.3 * inch, 0.9 * inch, 0.9 * inch, 3.1 * inch],
            repeatRows=1,
        )
        priority_colors = {"HIGH": colors.HexColor("#f8d7da"), "MEDIUM": colors.HexColor("#fff3cd"), "LOW": colors.HexColor("#d4edda")}
        style_cmds = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2f5597")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ]
        for i, row in enumerate(rows, start=1):
            bg = priority_colors.get(row[0])
            if bg:
                style_cmds.append(("BACKGROUND", (0, i), (0, i), bg))
        table.setStyle(TableStyle(style_cmds))
        story.append(table)

    doc.build(story)
    buffer.seek(0)
    filename = "traffic_recommendations_report.pdf"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/patterns/{road_id}")
def pattern_analysis(
    road_id: int,
    sample_size: int = Query(500, ge=20, le=5000, description="How many recent readings to analyze"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """AI Prediction Module: pattern analysis for a single road — a
    day-of-week congestion breakdown plus a weekday-vs-weekend comparison,
    drawn from its recent historical readings.

    Note: this intentionally breaks down by DAY of week, not hour of day.
    The underlying dataset is daily-granularity (see bangalore_import.py),
    so an hour-of-day breakdown would have no real signal — every
    historically-imported reading is stamped at midnight, and the live
    replay feed re-stamps historical values with the current wall-clock
    time, which would make "busiest hour" reflect server uptime rather
    than any real traffic pattern.
    """
    road = db.query(models.Road).filter(models.Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    readings = (
        db.query(models.TrafficReading)
        .filter(models.TrafficReading.road_id == road_id)
        .order_by(desc(models.TrafficReading.recorded_at))
        .limit(sample_size)
        .all()
    )
    if not readings:
        return {
            "road_id": road.id,
            "road_name": road.name,
            "readings_analyzed": 0,
            "daily_pattern": [],
            "weekday_avg_score": None,
            "weekend_avg_score": None,
            "busiest_day": None,
        }

    dow_scores = {d: [] for d in range(7)}  # 0 = Monday
    weekday_scores, weekend_scores = [], []
    for r in readings:
        score = CONGESTION_SCORE[r.congestion_level]
        dow_scores[r.recorded_at.weekday()].append(score)
        (weekend_scores if r.recorded_at.weekday() >= 5 else weekday_scores).append(score)

    daily_pattern = [
        {"day": DOW_NAMES[d], "avg_congestion_score": round(sum(v) / len(v), 2) if v else None}
        for d, v in dow_scores.items()
    ]
    valid = [p for p in daily_pattern if p["avg_congestion_score"] is not None]
    busiest = max(valid, key=lambda p: p["avg_congestion_score"]) if valid else None

    return {
        "road_id": road.id,
        "road_name": road.name,
        "readings_analyzed": len(readings),
        "daily_pattern": daily_pattern,
        "weekday_avg_score": round(sum(weekday_scores) / len(weekday_scores), 2) if weekday_scores else None,
        "weekend_avg_score": round(sum(weekend_scores) / len(weekend_scores), 2) if weekend_scores else None,
        "busiest_day": busiest,
    }
