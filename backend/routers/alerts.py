"""
TrafficVisionAI
Alerts Router

Provides API endpoints for:
- Generating alerts
- Getting all alerts
- Getting alert summary
- Getting a single alert
- Assigning an alert
- Acknowledging an alert
- Starting an alert
- Resolving an alert

IMPORTANT:
This router is compatible with the existing MySQL `alerts`
table and does not use fields that do not exist in the database.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from services.alert_service import (
    generate_alerts,
    get_all_alerts,
    get_alert_summary,
    get_alert,
    assign_alert,
    acknowledge_alert,
    start_alert,
    resolve_alert,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)


# ============================================================
# GENERATE ALERTS
# ============================================================

@router.post("/generate")
def generate_alerts_endpoint(
    db: Session = Depends(get_db),
):
    """
    Scan traffic data and generate new alerts.

    Duplicate unresolved alerts are not created.
    """

    try:
        alerts = generate_alerts(db)

        return {
            "success": True,
            "message": f"{len(alerts)} new alert(s) generated.",
            "count": len(alerts),
            "alerts": alerts,
        }

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate alerts: {str(e)}",
        )


# ============================================================
# GET ALL ALERTS
# ============================================================

@router.get("")
def get_alerts_endpoint(
    skip: int = Query(
        0,
        ge=0,
    ),
    limit: int = Query(
        100,
        ge=1,
        le=500,
    ),
    status: Optional[str] = Query(
        None,
    ),
    severity: Optional[str] = Query(
        None,
    ),
    alert_type: Optional[str] = Query(
        None,
    ),
    db: Session = Depends(get_db),
):
    """
    Get alerts with optional filters.
    """

    try:

        # ----------------------------------------------------
        # No filters
        # ----------------------------------------------------

        if (
            status is None
            and severity is None
            and alert_type is None
        ):
            alerts = get_all_alerts(
                db,
                skip=skip,
                limit=limit,
            )

            return {
                "success": True,
                "count": len(alerts),
                "alerts": alerts,
            }

        # ----------------------------------------------------
        # Filtered query
        # ----------------------------------------------------

        from models.alert import Alert

        query = db.query(Alert)

        if status:
            query = query.filter(
                Alert.status == status
            )

        if severity:
            query = query.filter(
                Alert.severity == severity
            )

        if alert_type:
            query = query.filter(
                Alert.alert_type == alert_type
            )

        alerts = (
            query
            .order_by(Alert.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        # Use the service serializer
        from services.alert_service import _alert_to_dict

        result = [
            _alert_to_dict(alert)
            for alert in alerts
        ]

        return {
            "success": True,
            "count": len(result),
            "alerts": result,
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch alerts: {str(e)}",
        )


# ============================================================
# ALERT SUMMARY
# ============================================================

@router.get("/summary")
def alert_summary_endpoint(
    db: Session = Depends(get_db),
):
    """
    Return alert statistics grouped by:
    - severity
    - type
    - status
    """

    try:

        summary = get_alert_summary(db)

        return {
            "success": True,
            **summary,
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch alert summary: {str(e)}",
        )


# ============================================================
# GET SINGLE ALERT
# ============================================================

@router.get("/{alert_id}")
def get_single_alert_endpoint(
    alert_id: int,
    db: Session = Depends(get_db),
):
    """
    Get one alert by ID.
    """

    alert = get_alert(
        db,
        alert_id,
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found.",
        )

    return {
        "success": True,
        "alert": alert,
    }


# ============================================================
# ASSIGN ALERT
# ============================================================

@router.patch("/{alert_id}/assign")
def assign_alert_endpoint(
    alert_id: int,
    db: Session = Depends(get_db),
):
    """
    Move alert to Assigned status.

    The existing database does not contain an assigned_to
    column, therefore only the status is changed.
    """

    alert = assign_alert(
        db,
        alert_id,
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found or already resolved.",
        )

    return {
        "success": True,
        "message": "Alert assigned successfully.",
        "alert": alert,
    }


# ============================================================
# ACKNOWLEDGE ALERT
# ============================================================

@router.patch("/{alert_id}/acknowledge")
def acknowledge_alert_endpoint(
    alert_id: int,
    db: Session = Depends(get_db),
):
    """
    Move alert to Acknowledged status.
    """

    alert = acknowledge_alert(
        db,
        alert_id,
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found or already resolved.",
        )

    return {
        "success": True,
        "message": "Alert acknowledged successfully.",
        "alert": alert,
    }


# ============================================================
# START ALERT
# ============================================================

@router.patch("/{alert_id}/start")
def start_alert_endpoint(
    alert_id: int,
    db: Session = Depends(get_db),
):
    """
    Move alert to In Progress status.
    """

    alert = start_alert(
        db,
        alert_id,
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found or already resolved.",
        )

    return {
        "success": True,
        "message": "Alert moved to In Progress.",
        "alert": alert,
    }


# ============================================================
# RESOLVE ALERT
# ============================================================

@router.patch("/{alert_id}/resolve")
def resolve_alert_endpoint(
    alert_id: int,
    db: Session = Depends(get_db),
):
    """
    Resolve an alert and store resolved_at.
    """

    alert = resolve_alert(
        db,
        alert_id,
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found.",
        )

    return {
        "success": True,
        "message": "Alert resolved successfully.",
        "alert": alert,
    }
