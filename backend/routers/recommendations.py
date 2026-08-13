"""
TrafficVisionAI
AI Recommendations Router

Optimized architecture:

- One dashboard API request for the Recommendations page
- One representative traffic record per junction
- Single SQL query for latest junction records
- One Random Forest prediction per junction for dashboard
- Signal optimization and police recommendations reuse the same prediction
- Risk score and operational priority
- Traffic change percentage
- Rerouting advisory
- Backward-compatible endpoints
- 24-hour forecast remains separate because it requires 24 predictions
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.traffic import Traffic
from services import ml_service


router = APIRouter(
    prefix="/recommendations",
    tags=["AI Recommendations"],
)


# ================================================================
# CONSTANTS
# ================================================================

TOTAL_JUNCTIONS = 4


# ================================================================
# HELPER FUNCTIONS
# ================================================================

def get_junction_id(record):
    """
    Maps a traffic record to one of the project's 4 junctions.

    Existing project logic:
        ((record.id - 1) % 4) + 1

    Examples:
        ID 1 -> Junction 1
        ID 2 -> Junction 2
        ID 3 -> Junction 3
        ID 4 -> Junction 4
        ID 5 -> Junction 1
    """

    record_id = getattr(record, "id", None)

    try:
        record_id = int(record_id)
    except (TypeError, ValueError):
        return 1

    return ((record_id - 1) % TOTAL_JUNCTIONS) + 1


def calculate_change_percentage(current, predicted):
    """
    Calculate percentage change between current
    and predicted traffic.

    Example:
        current = 100
        predicted = 120

        result = +20.0%
    """

    try:
        current = float(current or 0)
        predicted = float(predicted or 0)
    except (TypeError, ValueError):
        return 0.0

    if current <= 0:
        return 0.0

    return round(
        ((predicted - current) / current) * 100,
        1,
    )


def calculate_risk_score(
    predicted_volume,
    urgency,
    deploy_police=False,
):
    """
    Generate an operational risk score.

    IMPORTANT:
    This is NOT an ML probability.

    It is an operational score based on:
    - predicted traffic volume
    - congestion urgency
    - police deployment requirement
    """

    try:
        volume = float(predicted_volume or 0)
    except (TypeError, ValueError):
        volume = 0.0

    score = min(
        100,
        int((volume / 300) * 100),
    )

    urgency_bonus = {
        "Critical": 25,
        "High": 15,
        "Medium": 5,
        "Low": 0,
    }

    score += urgency_bonus.get(
        urgency,
        0,
    )

    if deploy_police:
        score += 10

    return min(score, 100)


def get_priority(
    urgency,
    risk_score,
):
    """
    Convert congestion urgency and risk
    into an operational priority.
    """

    if urgency == "Critical" or risk_score >= 85:
        return "Immediate"

    if urgency == "High" or risk_score >= 65:
        return "High"

    if urgency == "Medium" or risk_score >= 40:
        return "Monitor"

    return "Normal"


def get_action_advisory(
    urgency,
    deploy_police=False,
    signal=None,
    predicted_volume=0,
):
    """
    Generate a human-readable operational action.

    The signal and predicted volume arguments are intentionally
    retained for compatibility with the existing architecture.
    """

    if urgency == "Critical":
        return (
            "Immediate traffic intervention required. "
            "Optimize signals and prepare emergency traffic control."
        )

    if deploy_police:
        return (
            "Deploy traffic police and monitor junction continuously."
        )

    if urgency == "High":
        return (
            "Increase green time for the dominant traffic direction "
            "and monitor congestion closely."
        )

    if urgency == "Medium":
        return (
            "Apply adaptive signal timing and monitor traffic buildup."
        )

    return (
        "Normal traffic conditions. Continue standard signal operation."
    )


def get_rerouting_advisory(
    urgency,
    predicted_volume=0,
):
    """
    Provides a route-management advisory.

    This does NOT calculate an actual alternate route.

    It only tells the traffic operator when rerouting
    should be considered.
    """

    if urgency == "Critical":
        return (
            "Consider diverting traffic to alternate routes "
            "until congestion decreases."
        )

    if urgency == "High":
        return (
            "Prepare alternate-route advisory if congestion continues."
        )

    if urgency == "Medium":
        return (
            "Monitor nearby routes for possible traffic diversion."
        )

    return "No rerouting required."


# ================================================================
# DATABASE OPTIMIZATION
# ================================================================

def get_latest_junction_records(db: Session):
    """
    Return one latest traffic record per project junction.

    IMPORTANT PERFORMANCE FIX
    --------------------------

    The old implementation did:

        db.query(Traffic).order_by(...).all()

    That loads potentially thousands of records into Python.

    This implementation performs the grouping inside MySQL
    using ROW_NUMBER() and returns only the latest row for
    each of the 4 junctions.

    Junction mapping:

        ((id - 1) % 4) + 1

    MySQL 8+ supports ROW_NUMBER().
    """

    junction_expression = (
        ((Traffic.id - 1) % TOTAL_JUNCTIONS) + 1
    )

    ranked_records = (
        db.query(
            Traffic,
            func.row_number()
            .over(
                partition_by=junction_expression,
                order_by=Traffic.id.desc(),
            )
            .label("row_number"),
        )
        .subquery()
    )

    traffic_columns = [
        column
        for column in Traffic.__table__.columns
    ]

    traffic_alias = Traffic.__table__.alias(
        "latest_traffic"
    )

    # ------------------------------------------------------------
    # Simpler and more reliable SQLAlchemy approach:
    #
    # Build a subquery containing the latest ID per junction,
    # then join it back to traffic_data.
    #
    # This avoids loading the entire table.
    # ------------------------------------------------------------

    latest_ids = (
        db.query(
            func.max(Traffic.id).label(
                "latest_id"
            )
        )
        .group_by(
            junction_expression
        )
        .subquery()
    )

    records = (
        db.query(Traffic)
        .join(
            latest_ids,
            Traffic.id == latest_ids.c.latest_id,
        )
        .order_by(Traffic.id.asc())
        .all()
    )

    result = []

    for record in records:
        junction_id = get_junction_id(record)
        result.append(
            (
                junction_id,
                record,
            )
        )

    return result


# ================================================================
# BUILD RECOMMENDATION DATA
# ================================================================

def build_recommendation_data(
    db: Session,
    target_hour: int,
):
    """
    Build the complete AI recommendation dashboard.

    PERFORMANCE DESIGN
    ------------------

    For the dashboard:

        1 DB query
        4 representative traffic records maximum
        4 RF predictions maximum
        4 congestion classifications
        4 signal recommendations
        4 police checks
        4 recommendation generations

    The frontend receives everything in one response.
    """

    now = datetime.now()

    # ------------------------------------------------------------
    # LATEST RECORDS
    # ------------------------------------------------------------

    junction_records = get_latest_junction_records(db)

    recommendations = []
    signal_optimizations = []

    police_needed = []
    police_clear = []

    # ------------------------------------------------------------
    # ONE PREDICTION PER JUNCTION
    # ------------------------------------------------------------

    for junction_id, record in junction_records:

        # ========================================================
        # RANDOM FOREST PREDICTION
        # ========================================================

        predicted_volume = ml_service.predict_volume(
            junction=junction_id,
            hour=target_hour,
            year=now.year,
            month=now.month,
            day=now.day,
            day_of_week=now.weekday(),
        )

        try:
            predicted_volume = round(
                float(predicted_volume),
                2,
            )
        except (TypeError, ValueError):
            predicted_volume = 0.0

        # ========================================================
        # CONGESTION
        # ========================================================

        congestion = (
            ml_service.classify_congestion(
                predicted_volume
            )
            or {}
        )

        congestion_level = congestion.get(
            "level",
            "Low",
        )

        urgency = congestion.get(
            "urgency",
            "Low",
        )

        congestion_color = congestion.get(
            "color",
            "gray",
        )

        # ========================================================
        # SIGNAL
        # ========================================================

        signal = (
            ml_service.get_signal_recommendation(
                predicted_volume
            )
            or {}
        )

        # ========================================================
        # POLICE
        # ========================================================

        deploy_police = bool(
            ml_service.needs_police_deployment(
                predicted_volume
            )
        )

        # ========================================================
        # CURRENT TRAFFIC
        # ========================================================

        try:
            current_volume = float(
                record.vehicle_count or 0
            )
        except (TypeError, ValueError):
            current_volume = 0.0

        # ========================================================
        # TRAFFIC CHANGE
        # ========================================================

        change_percentage = (
            calculate_change_percentage(
                current_volume,
                predicted_volume,
            )
        )

        # ========================================================
        # RISK
        # ========================================================

        risk_score = calculate_risk_score(
            predicted_volume,
            urgency,
            deploy_police,
        )

        priority = get_priority(
            urgency,
            risk_score,
        )

        # ========================================================
        # OPERATIONAL ACTION
        # ========================================================

        action = get_action_advisory(
            urgency=urgency,
            deploy_police=deploy_police,
            signal=signal,
            predicted_volume=predicted_volume,
        )

        rerouting = get_rerouting_advisory(
            urgency=urgency,
            predicted_volume=predicted_volume,
        )

        # ========================================================
        # MAIN AI RECOMMENDATION
        # ========================================================

        recommendation = (
            ml_service.get_recommendation(
                predicted_volume,
                junction_id,
                target_hour,
            )
        )

        if recommendation is None:
            recommendation = (
                "Continue monitoring traffic conditions."
            )

        # ========================================================
        # MAIN RECOMMENDATION ENTRY
        # ========================================================

        entry = {
            "junction_id": junction_id,

            "location": record.location,

            "latitude": record.latitude,

            "longitude": record.longitude,

            "current_vehicle_count": current_volume,

            "current_congestion": (
                record.congestion_level
            ),

            "predicted_vehicle_count": predicted_volume,

            "predicted_congestion_level": (
                congestion_level
            ),

            "predicted_urgency": urgency,

            "congestion_color": (
                congestion_color
            ),

            "traffic_change_percentage": (
                change_percentage
            ),

            "risk_score": risk_score,

            "priority": priority,

            "ai_recommendation": recommendation,

            "recommended_action": action,

            "rerouting_advisory": rerouting,

            "signal_optimization": signal,

            "deploy_police": deploy_police,

            "prediction_hour": target_hour,

            "prediction_time": now.isoformat(),
        }

        recommendations.append(entry)

        # ========================================================
        # SIGNAL OPTIMIZATION ENTRY
        # ========================================================

        signal_entry = {
            "junction_id": junction_id,

            "location": record.location,

            "latitude": record.latitude,

            "longitude": record.longitude,

            "predicted_volume": predicted_volume,

            "congestion_level": congestion_level,

            "urgency": urgency,

            "recommended_green_time_sec": (
                signal.get(
                    "green_time",
                    0,
                )
            ),

            "recommended_red_time_sec": (
                signal.get(
                    "red_time",
                    0,
                )
            ),

            "cycle_length_sec": (
                signal.get(
                    "cycle_length",
                    0,
                )
            ),

            "strategy": signal.get(
                "strategy",
                "Adaptive",
            ),
        }

        signal_optimizations.append(
            signal_entry
        )

        # ========================================================
        # POLICE ENTRY
        # ========================================================

        police_entry = {
            "junction_id": junction_id,

            "location": record.location,

            "latitude": record.latitude,

            "longitude": record.longitude,

            "predicted_vehicle_count": (
                predicted_volume
            ),

            "current_vehicle_count": (
                current_volume
            ),

            "congestion_level": (
                congestion_level
            ),

            "urgency": urgency,

            "risk_score": risk_score,

            "deploy_police": deploy_police,

            "priority": (
                "Immediate"
                if urgency == "Critical"
                else "Standby"
                if deploy_police
                else "Clear"
            ),
        }

        if deploy_police:
            police_needed.append(
                police_entry
            )
        else:
            police_clear.append(
                police_entry
            )

    # ============================================================
    # SORT RESULTS
    # ============================================================

    recommendations.sort(
        key=lambda item: item["risk_score"],
        reverse=True,
    )

    signal_optimizations.sort(
        key=lambda item: item["predicted_volume"],
        reverse=True,
    )

    police_needed.sort(
        key=lambda item: item["risk_score"],
        reverse=True,
    )

    police_clear.sort(
        key=lambda item: item["risk_score"],
        reverse=True,
    )

    # ============================================================
    # SUMMARY COUNTS
    # ============================================================

    critical_count = sum(
        1
        for item in recommendations
        if item["predicted_urgency"] == "Critical"
    )

    high_count = sum(
        1
        for item in recommendations
        if item["predicted_urgency"] == "High"
    )

    medium_count = sum(
        1
        for item in recommendations
        if item["predicted_urgency"] == "Medium"
    )

    low_count = sum(
        1
        for item in recommendations
        if item["predicted_urgency"] == "Low"
    )

    # ============================================================
    # AVERAGE PREDICTED VOLUME
    # ============================================================

    if recommendations:
        average_predicted_volume = round(
            sum(
                item[
                    "predicted_vehicle_count"
                ]
                for item in recommendations
            )
            / len(recommendations),
            2,
        )
    else:
        average_predicted_volume = 0

    # ============================================================
    # MAXIMUM RISK
    # ============================================================

    if recommendations:
        max_risk = max(
            item["risk_score"]
            for item in recommendations
        )
    else:
        max_risk = 0

    # ============================================================
    # FINAL RESPONSE
    # ============================================================

    return {
        "prediction_hour": (
            f"{target_hour:02d}:00"
        ),

        "generated_at": (
            now.isoformat()
        ),

        "total_locations": (
            len(recommendations)
        ),

        "critical_count": critical_count,

        "high_count": high_count,

        "medium_count": medium_count,

        "low_count": low_count,

        "average_predicted_volume": (
            average_predicted_volume
        ),

        "highest_risk_score": max_risk,

        "recommendations": recommendations,

        "signal_optimizations": (
            signal_optimizations
        ),

        "police": {
            "junctions_needing_police": (
                len(police_needed)
            ),

            "junctions_clear": (
                len(police_clear)
            ),

            "deploy_immediately": [
                item
                for item in police_needed
                if item["priority"] == "Immediate"
            ],

            "deploy_standby": [
                item
                for item in police_needed
                if item["priority"] == "Standby"
            ],

            "clear_junctions": police_clear,
        },
    }


# ================================================================
# ONE OPTIMIZED DASHBOARD ENDPOINT
# ================================================================

@router.get("/dashboard")
def get_recommendation_dashboard(
    db: Session = Depends(get_db),

    hour: Optional[int] = Query(
        None,
        ge=0,
        le=23,
        description="Prediction hour override",
    ),
):
    """
    Optimized AI recommendation dashboard.

    The Recommendations.jsx frontend should call ONLY this
    endpoint during initial page loading.

    Example:

        GET /recommendations/dashboard

    or:

        GET /recommendations/dashboard?hour=18
    """

    now = datetime.now()

    target_hour = (
        hour
        if hour is not None
        else (now.hour + 1) % 24
    )

    return build_recommendation_data(
        db=db,
        target_hour=target_hour,
    )


# ================================================================
# BACKWARD-COMPATIBLE RECOMMENDATIONS ENDPOINT
# ================================================================

@router.get("/")
def get_ai_recommendations(
    db: Session = Depends(get_db),

    hour: Optional[int] = Query(
        None,
        ge=0,
        le=23,
    ),
):
    """
    Backward-compatible recommendations endpoint.

    Older frontend code can still use this endpoint.
    """

    now = datetime.now()

    target_hour = (
        hour
        if hour is not None
        else (now.hour + 1) % 24
    )

    data = build_recommendation_data(
        db=db,
        target_hour=target_hour,
    )

    return {
        "prediction_hour": (
            data["prediction_hour"]
        ),

        "generated_at": (
            data["generated_at"]
        ),

        "total_locations": (
            data["total_locations"]
        ),

        "critical_count": (
            data["critical_count"]
        ),

        "high_count": (
            data["high_count"]
        ),

        "recommendations": (
            data["recommendations"]
        ),
    }


# ================================================================
# SIGNAL OPTIMIZATION
# ================================================================

@router.get("/signal-optimization")
def get_signal_optimization(
    db: Session = Depends(get_db),
):
    """
    Signal optimization endpoint.

    Uses the same optimized dashboard-building logic.
    """

    now = datetime.now()

    target_hour = (
        now.hour + 1
    ) % 24

    data = build_recommendation_data(
        db=db,
        target_hour=target_hour,
    )

    return {
        "total_junctions": (
            len(
                data[
                    "signal_optimizations"
                ]
            )
        ),

        "generated_at": (
            data["generated_at"]
        ),

        "optimizations": (
            data["signal_optimizations"]
        ),
    }


# ================================================================
# POLICE DEPLOYMENT
# ================================================================

@router.get("/police-deployment")
def get_police_deployment(
    db: Session = Depends(get_db),
):
    """
    Police deployment advisory endpoint.
    """

    now = datetime.now()

    target_hour = (
        now.hour + 1
    ) % 24

    data = build_recommendation_data(
        db=db,
        target_hour=target_hour,
    )

    return data["police"]


# ================================================================
# HOURLY FORECAST
# ================================================================

@router.get("/hourly-forecast")
def get_hourly_forecast(
    junction: int = Query(
        1,
        ge=1,
        le=4,
    ),

    db: Session = Depends(get_db),
):
    """
    Generate a 24-hour Random Forest traffic forecast
    for a selected junction.

    This endpoint intentionally performs 24 predictions
    because the frontend requires a complete hourly forecast.

    It should NOT be called together with the dashboard
    endpoint during initial Recommendations page loading.
    """

    now = datetime.now()

    forecast = []

    # ------------------------------------------------------------
    # 24 predictions are intentional here.
    # ------------------------------------------------------------

    for hour in range(24):

        pred_count = ml_service.predict_volume(
            junction=junction,
            hour=hour,
            year=now.year,
            month=now.month,
            day=now.day,
            day_of_week=now.weekday(),
        )

        try:
            pred_count = round(
                float(pred_count),
                2,
            )
        except (TypeError, ValueError):
            pred_count = 0.0

        congestion = (
            ml_service.classify_congestion(
                pred_count
            )
            or {}
        )

        forecast.append(
            {
                "hour": hour,

                "hour_label": (
                    f"{hour:02d}:00"
                ),

                "predicted_vehicles": (
                    pred_count
                ),

                "congestion_level": (
                    congestion.get(
                        "level",
                        "Low",
                    )
                ),

                "urgency": (
                    congestion.get(
                        "urgency",
                        "Low",
                    )
                ),

                "color": (
                    congestion.get(
                        "color",
                        "gray",
                    )
                ),
            }
        )

    # ------------------------------------------------------------
    # Empty forecast safety
    # ------------------------------------------------------------

    if not forecast:
        return {
            "junction": junction,
            "date": now.strftime(
                "%Y-%m-%d"
            ),
            "generated_at": (
                now.isoformat()
            ),
            "forecast": [],
            "peak_hour": None,
            "peak_vehicle_count": 0,
            "min_hour": None,
            "min_vehicle_count": 0,
        }

    # ------------------------------------------------------------
    # PEAK / MINIMUM
    # ------------------------------------------------------------

    peak = max(
        forecast,
        key=lambda item: item[
            "predicted_vehicles"
        ],
    )

    minimum = min(
        forecast,
        key=lambda item: item[
            "predicted_vehicles"
        ],
    )

    # ------------------------------------------------------------
    # RESPONSE
    # ------------------------------------------------------------

    return {
        "junction": junction,

        "date": now.strftime(
            "%Y-%m-%d"
        ),

        "generated_at": (
            now.isoformat()
        ),

        "forecast": forecast,

        "peak_hour": (
            peak["hour_label"]
        ),

        "peak_vehicle_count": (
            peak["predicted_vehicles"]
        ),

        "min_hour": (
            minimum["hour_label"]
        ),

        "min_vehicle_count": (
            minimum["predicted_vehicles"]
        ),
    }
