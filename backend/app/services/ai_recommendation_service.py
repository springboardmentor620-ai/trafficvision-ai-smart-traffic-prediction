"""Rule-based AI recommendation engine (Milestone 3, Feature 2).

Builds a structured, human-readable recommendation for the prediction
result screen and PDF report. This is intentionally rule-based (no
external AI API) and is derived entirely from data the prediction
pipeline already computed - the TrafficAlert row that
generate_alert_for_prediction() just created, plus the original request
data - so nothing about the ML prediction or congestion classification
is touched or duplicated here.
"""

from typing import Optional

BASE_SAFETY_TIPS = [
    "Keep a safe following distance",
    "Watch for pedestrians and cyclists",
]

REASON_BY_CATEGORY = {
    "Congestion": "Current route has high predicted traffic.",
    "Accident": "This route has a history of frequent high-congestion incidents.",
    "Weather": "Weather conditions are reducing visibility and road grip.",
    "Road Work": "Ongoing road maintenance is expected to slow traffic.",
    "Event": "Local event or holiday traffic is expected to increase congestion.",
}


def _confidence_note(confidence: Optional[float]) -> Optional[str]:
    """Low ensemble agreement means the model itself is less sure -
    surface that instead of presenting every prediction with equal
    certainty."""
    if confidence is None:
        return None
    if confidence < 70:
        return (
            "Model confidence for this prediction is lower than usual - "
            "treat the numbers as indicative rather than exact."
        )
    return None


def _suggested_departure(congestion: str, hour: int, distance: float) -> str:
    if congestion != "High":
        return "Current time is suitable for travel."

    # A shifted departure time recovers a bigger share of a short trip's
    # total travel time than a long one, where the fixed delay matters
    # more than exactly when you leave.
    if distance <= 5:
        shift_note = (
            " Since this is a short trip, even a small shift in departure "
            "time can meaningfully cut your delay."
        )
    else:
        shift_note = (
            " Given the distance, plan for the delay rather than expecting "
            "a shifted departure time to fully avoid it."
        )

    if 7 <= hour <= 10:
        return "Travel before 7:00 AM or after 10:30 AM if possible." + shift_note

    if 17 <= hour <= 20:
        return "Travel after 8:30 PM if possible." + shift_note

    return "Consider delaying travel by 30-45 minutes if possible." + shift_note


def _fuel_tips(congestion: str, distance: float) -> list:
    tips = [
        "Maintain a constant speed where possible",
        "Avoid sudden acceleration and braking",
    ]

    if congestion == "High":
        tips.append("Follow the recommended alternate route to avoid idling in traffic")

    if distance >= 15:
        tips.append(
            "For a longer trip like this, a short detour is usually still "
            "faster overall than idling through peak congestion"
        )
    else:
        tips.append(
            "For a short trip like this, waiting a few minutes before "
            "departing can beat rerouting"
        )

    return tips


def _safety_tips(category: str, distance: float) -> list:
    tips = ["Drive slowly and stay alert", *BASE_SAFETY_TIPS]

    if category == "Weather":
        tips.append("Turn on headlights and use fog lamps if fitted")
    elif category == "Accident":
        tips.append("Maintain extra distance from the vehicle ahead")
    elif category == "Road Work":
        tips.append("Watch for lane closures and reduced speed zones")

    if distance >= 30:
        tips.append("Plan a short rest stop - fatigue is a bigger risk on longer drives in heavy traffic")

    return tips


def build_recommendation(
    alert,
    data,
    congestion: str,
    confidence: Optional[float],
    recommended_route: str,
) -> dict:
    """`alert` is the TrafficAlert ORM row generate_alert_for_prediction
    just created - reused here as the single source of truth for
    category/title/delay so nothing is recomputed."""

    reason = REASON_BY_CATEGORY.get(
        alert.category, "Traffic conditions are within normal range."
    )

    confidence_note = _confidence_note(confidence)
    if confidence_note:
        reason = f"{reason} {confidence_note}"

    return {
        "traffic_status": alert.title,
        "congestion_level": congestion,
        "recommended_route": recommended_route,
        "reason": reason,
        "estimated_delay": alert.expected_delay,
        "suggested_departure": _suggested_departure(congestion, data.hour, data.distance),
        "fuel_tips": _fuel_tips(congestion, data.distance),
        "safety_tips": _safety_tips(alert.category, data.distance),
        "confidence": confidence,
    }
