"""
Alerts Router — full CRUD + dynamic generation from traffic DB.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from services import alert_service

router = APIRouter(prefix="/alerts", tags=["Alerts"])


# ─────────────────────────────────────────────────────────────────────────────
# GET /alerts/summary
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/summary")
def get_alert_summary(db: Session = Depends(get_db)):
    """Returns counts grouped by severity, type, and status."""
    return alert_service.get_alert_summary(db)


# ─────────────────────────────────────────────────────────────────────────────
# GET /alerts/
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/")
def list_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    severity: str = Query(None, description="Filter: Critical | High | Medium | Low"),
    alert_type: str = Query(None, description="Filter: Congestion | Accident | RouteDelay | Emergency"),
    status: str = Query(None, description="Filter: Active | Acknowledged | Resolved"),
    db: Session = Depends(get_db),
):
    """List all alerts with optional filters."""
    from models.alert import Alert
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    if status:
        query = query.filter(Alert.status == status)
    alerts = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()
    return [alert_service._alert_to_dict(a) for a in alerts]


# ─────────────────────────────────────────────────────────────────────────────
# POST /alerts/generate
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/generate")
def generate_alerts(db: Session = Depends(get_db)):
    """
    Scans all traffic records in MySQL and dynamically generates alerts.
    Stores new alerts in the alerts table. Returns generated alerts.
    """
    generated = alert_service.generate_alerts(db)
    return {
        "message": f"Successfully generated {len(generated)} alerts from traffic data.",
        "count": len(generated),
        "alerts": generated,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /alerts/{alert_id}
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/{alert_id}")
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    from models.alert import Alert
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert_service._alert_to_dict(alert)


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /alerts/{alert_id}/resolve
# ─────────────────────────────────────────────────────────────────────────────
@router.patch("/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    result = alert_service.resolve_alert(db, alert_id)
    if not result:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert resolved successfully", "alert": result}


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /alerts/{alert_id}/acknowledge
# ─────────────────────────────────────────────────────────────────────────────
@router.patch("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    result = alert_service.acknowledge_alert(db, alert_id)
    if not result:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert acknowledged", "alert": result}
