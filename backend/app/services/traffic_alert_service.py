"""Service layer for traffic alerts.

Responsibilities:

1. ``generate_alert_for_prediction`` - automatically derives and persists a
   TrafficAlert every time a traffic prediction is made, including an
   accident-risk score computed from real prediction inputs (congestion,
   rain, snow, visibility, rush hour, accident-prone route history).
   Alerts are never created directly by end users; the prediction service
   is the only caller of this function.
2. ``list_alerts`` / ``delete_alert`` / ``mark_alert_read`` - the
   read/delete/update operations backing the Alerts dashboard and the
   notification panel. Routers stay thin and simply call into these.
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.traffic_alert import TrafficAlert
from app.models.prediction_history import PredictionHistory


# --------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------

# (start_hour, end_hour) ranges, both inclusive, considered rush hour.
PEAK_HOUR_RANGES = ((7, 10), (17, 20))

SEVERE_WEATHER_MAIN = {"Rain", "Snow", "Thunderstorm", "Drizzle"}
FOG_LIKE_KEYWORDS = ("mist", "fog", "haze", "smoke")

BASE_DELAY_MINUTES = {
    "Low": 4.0,
    "Medium": 14.0,
    "High": 28.0,
}

# Predicted vehicle volume is expressed as a 0-100% congestion figure using
# this upper bound (matches the High-congestion threshold used by the
# prediction model with headroom for outliers).
CONGESTION_SCALE_MAX = 7000.0

# A route is flagged "Accident" (i.e. accident-prone / high risk) once it
# has produced this many High-congestion predictions within the window.
# This relies on real prediction history rather than fabricated data - a
# live incidents feed can replace this check without touching callers.
ACCIDENT_PRONE_THRESHOLD = 3
ACCIDENT_PRONE_WINDOW_DAYS = 30

# A composite accident-risk score (0-100, see _accident_risk_score) at or
# above this value escalates the alert's severity to "Critical" regardless
# of what category-based classification produced. Escalation only ever
# raises severity, never lowers it.
CRITICAL_RISK_THRESHOLD = 75.0

SEVERITY_RANK = {"Low": 0, "Medium": 1, "High": 2, "Critical": 3}


def _is_peak_hour(hour: int) -> bool:
    return any(start <= hour <= end for start, end in PEAK_HOUR_RANGES)


def _congestion_percentage(predicted_value: int) -> float:
    pct = (predicted_value / CONGESTION_SCALE_MAX) * 100
    return round(max(0.0, min(pct, 100.0)), 1)


def _is_low_visibility(data) -> bool:
    weather_description = (data.weather_description or "").lower()
    return (
        any(word in weather_description for word in FOG_LIKE_KEYWORDS)
        or data.clouds_all >= 90
    )


def _is_accident_prone_route(db: Session, source: str, destination: str) -> bool:
    since = datetime.utcnow() - timedelta(days=ACCIDENT_PRONE_WINDOW_DAYS)

    count = (
        db.query(PredictionHistory)
        .filter(
            PredictionHistory.source == source,
            PredictionHistory.destination == destination,
            PredictionHistory.congestion == "High",
            PredictionHistory.created_at >= since,
        )
        .count()
    )

    return count >= ACCIDENT_PRONE_THRESHOLD


def _accident_risk_score(
    data, congestion: str, predicted_value: int, accident_prone: bool
) -> float:
    """Composite 0-100 accident-risk score built from real prediction
    inputs: very high predicted traffic, heavy rain, snow, low visibility
    weather, rush hour, and known accident-prone route history. Each
    factor contributes independently so the score reflects how many risk
    conditions are stacking up at once, not just a single worst-case one.
    """

    score = 0.0

    congestion_pct = _congestion_percentage(predicted_value)
    if congestion == "High":
        score += 25.0
        if congestion_pct >= 85:
            score += 15.0  # "very high" predicted traffic, not just High

    if data.snow_1h > 0:
        score += 25.0
    elif data.rain_1h >= 2.5:
        score += 20.0
    elif data.rain_1h > 0:
        score += 10.0

    if _is_low_visibility(data):
        score += 15.0

    if _is_peak_hour(data.hour):
        score += 10.0

    if accident_prone:
        score += 15.0

    return round(min(score, 100.0), 1)


def _classify_alert(data, congestion: str, accident_prone: bool) -> Tuple[str, str, str]:
    """Returns (category, severity, message) for a prediction request.

    Rules are evaluated in priority order and the first match wins, so a
    single alert always has one clear, dominant cause.
    """

    weather_main = data.weather_main
    weather_description = (data.weather_description or "").lower()

    is_severe_weather = (
        weather_main in SEVERE_WEATHER_MAIN
        or data.rain_1h > 0
        or data.snow_1h > 0
        or any(word in weather_description for word in FOG_LIKE_KEYWORDS)
    )

    if is_severe_weather:
        if weather_main == "Snow" or data.snow_1h > 0:
            message = "Snow expected. Drive carefully and allow extra time."
        elif weather_main == "Rain" or data.rain_1h > 0:
            message = "Rain expected. Drive carefully."
        elif weather_main == "Thunderstorm":
            message = "Thunderstorms expected. Roads may be hazardous."
        else:
            message = "Reduced visibility expected. Drive carefully."

        severity = "High" if congestion == "High" else "Medium"
        return "Weather", severity, message

    if accident_prone:
        return (
            "Accident",
            "High",
            "Accident-prone route detected. Proceed with caution and "
            "consider the recommended alternate route.",
        )

    if data.holiday and data.holiday != "None":
        severity = "Medium" if congestion != "Low" else "Low"
        return (
            "Event",
            severity,
            f"{data.holiday} traffic expected. Roads may be busier than usual.",
        )

    is_weekday = data.weekday < 5
    if is_weekday and 11 <= data.hour <= 15 and congestion == "Medium":
        return (
            "Road Work",
            "Medium",
            "Road construction may cause delays during maintenance hours.",
        )

    if _is_peak_hour(data.hour) and congestion in ("Medium", "High"):
        severity = "High" if congestion == "High" else "Medium"
        return "Congestion", severity, "Peak hour traffic expected."

    if congestion == "High":
        return "Congestion", "High", "Heavy congestion detected."

    if congestion == "Medium":
        return (
            "Congestion",
            "Medium",
            "Moderate congestion detected. Expect minor delays.",
        )

    return (
        "Congestion",
        "Low",
        "Traffic flow normal. Smooth driving conditions expected.",
    )


def _expected_delay(congestion: str, category: str, hour: int) -> float:
    delay = BASE_DELAY_MINUTES.get(congestion, 5.0)

    if category == "Weather":
        delay += 8.0
    elif category == "Accident":
        delay += 10.0
    elif category == "Road Work":
        delay += 6.0

    if _is_peak_hour(hour):
        delay += 5.0

    return round(delay, 1)


def _alert_type_label(category: str, severity: str) -> str:
    """Short, emoji-prefixed label shown as the headline of the alert -
    distinct from `category` (which stays Congestion/Accident/Weather/
    Road Work/Event for filtering, unchanged for backward compatibility
    with the existing Alerts dashboard filters)."""

    if severity == "Critical" or category == "Accident":
        return "\U0001F6A8 High Accident Risk"

    if category == "Road Work":
        return "\U0001F6A7 Road Block"

    if category == "Weather":
        return "\u26A0\uFE0F Severe Weather"

    if category == "Congestion" and severity in ("High", "Critical"):
        return "\u26A0\uFE0F Heavy Congestion"

    return f"{category} Alert"


def _apply_emergency_route_note(message: str, severity: str, recommended_route: Optional[str]) -> str:
    """Appends an emergency-route recommendation to the alert message for
    High/Critical alerts that actually have a recommended route to give,
    rather than treating it as its own mutually-exclusive alert type."""

    if severity in ("High", "Critical") and recommended_route:
        return f"{message} \U0001F691 Emergency route recommended via {recommended_route}."

    return message


def generate_alert_for_prediction(
    db: Session,
    user_id: Optional[int],
    prediction: PredictionHistory,
    data,
    congestion: str,
    recommended_route: str,
    predicted_value: int,
) -> TrafficAlert:
    """Creates and persists a TrafficAlert derived from a traffic
    prediction. Called automatically from the prediction service."""

    accident_prone = _is_accident_prone_route(db, data.source, data.destination)

    category, severity, message = _classify_alert(data, congestion, accident_prone)

    risk_score = _accident_risk_score(data, congestion, predicted_value, accident_prone)

    # Escalation only ever raises severity, never lowers it.
    if risk_score >= CRITICAL_RISK_THRESHOLD and SEVERITY_RANK["Critical"] > SEVERITY_RANK[severity]:
        severity = "Critical"

    message = _apply_emergency_route_note(message, severity, recommended_route)
    alert_type = _alert_type_label(category, severity)

    alert = TrafficAlert(
        user_id=user_id,
        prediction_id=prediction.id,
        source=data.source,
        destination=data.destination,
        category=category,
        severity=severity,
        title=f"{alert_type}: {data.source} \u2192 {data.destination}",
        message=message,
        congestion=congestion,
        congestion_percentage=_congestion_percentage(predicted_value),
        accident_risk_score=risk_score,
        recommended_route=recommended_route,
        expected_delay=_expected_delay(congestion, category, data.hour),
        is_read=False,
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert


def list_alerts(
    db: Session,
    user_id: int,
    severity: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    unread_only: bool = False,
):
    query = db.query(TrafficAlert).filter(TrafficAlert.user_id == user_id)

    if severity:
        query = query.filter(TrafficAlert.severity == severity)

    if category:
        query = query.filter(TrafficAlert.category == category)

    if unread_only:
        query = query.filter(TrafficAlert.is_read.is_(False))

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                TrafficAlert.source.ilike(like),
                TrafficAlert.destination.ilike(like),
                TrafficAlert.message.ilike(like),
                TrafficAlert.title.ilike(like),
            )
        )

    return query.order_by(TrafficAlert.created_at.desc()).all()


def mark_alert_read(db: Session, alert_id: int, user_id: int) -> Optional[TrafficAlert]:
    alert = (
        db.query(TrafficAlert)
        .filter(TrafficAlert.id == alert_id, TrafficAlert.user_id == user_id)
        .first()
    )

    if not alert:
        return None

    if not alert.is_read:
        alert.is_read = True
        alert.read_at = datetime.utcnow()
        db.commit()
        db.refresh(alert)

    return alert


def delete_alert(db: Session, alert_id: int, user_id: int) -> bool:
    alert = (
        db.query(TrafficAlert)
        .filter(TrafficAlert.id == alert_id, TrafficAlert.user_id == user_id)
        .first()
    )

    if not alert:
        return False

    db.delete(alert)
    db.commit()
    return True
