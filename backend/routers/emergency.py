"""
Emergency Traffic Alerts Router.
Supports: Ambulance | FireVehicle | PoliceVehicle | RoadBlock | VIPMovement
All alerts are Critical priority.
"""
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.emergency import EmergencyAlert
from models.traffic import Traffic

router = APIRouter(prefix="/emergency", tags=["Emergency Alerts"])

EMERGENCY_TYPES = ["Ambulance", "FireVehicle", "PoliceVehicle", "RoadBlock", "VIPMovement"]


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _get_action_protocol(emergency_type: str) -> str:
    protocols = {
        "Ambulance": (
            "Clear all lanes immediately on the designated ambulance corridor. "
            "Traffic signals must switch to green on ambulance route. "
            "All vehicles must yield to ambulance. Notify hospitals on route."
        ),
        "FireVehicle": (
            "Clear wide-body lanes for fire trucks. "
            "Signal all intersections to green on fire vehicle route. "
            "Alert residents within 500m radius. Close off affected blocks if required."
        ),
        "PoliceVehicle": (
            "Coordinate with traffic control for police convoy. "
            "Maintain clear path on designated route. "
            "Adjacent routes on standby for re-routing."
        ),
        "RoadBlock": (
            "Full road closure protocol activated. "
            "All traffic diverted to alternate routes immediately. "
            "Deploy officers at all entry points to blocked road."
        ),
        "VIPMovement": (
            "VIP corridor secured. All civilian traffic diverted. "
            "No U-turns permitted on VIP route. "
            "All junctions on VIP corridor cleared 10 minutes prior to movement."
        ),
    }
    return protocols.get(emergency_type, "Follow standard emergency protocol.")


def _emergency_to_dict(e: EmergencyAlert) -> dict:
    return {
        "id": e.id,
        "emergency_type": e.emergency_type,
        "location": e.location,
        "latitude": e.latitude,
        "longitude": e.longitude,
        "priority": e.priority,
        "route_cleared": e.route_cleared,
        "affected_junctions": e.affected_junctions,
        "contact_unit": e.contact_unit,
        "status": e.status,
        "notes": e.notes,
        "action_protocol": _get_action_protocol(e.emergency_type),
        "created_at": e.created_at.isoformat() if e.created_at else None,
        "resolved_at": e.resolved_at.isoformat() if e.resolved_at else None,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────────────────────────────

class EmergencyCreate(BaseModel):
    emergency_type: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    route_cleared: bool = False
    affected_junctions: Optional[str] = None
    contact_unit: Optional[str] = None
    notes: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# GET /emergency/
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/")
def list_emergency_alerts(
    status: Optional[str] = Query(None),
    emergency_type: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(EmergencyAlert)
    if status:
        query = query.filter(EmergencyAlert.status == status)
    if emergency_type:
        query = query.filter(EmergencyAlert.emergency_type == emergency_type)
    alerts = query.order_by(EmergencyAlert.created_at.desc()).offset(skip).limit(limit).all()
    return [_emergency_to_dict(e) for e in alerts]


# ─────────────────────────────────────────────────────────────────────────────
# GET /emergency/active
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/active")
def get_active_emergency_alerts(db: Session = Depends(get_db)):
    alerts = (
        db.query(EmergencyAlert)
        .filter(EmergencyAlert.status == "Active")
        .order_by(EmergencyAlert.created_at.desc())
        .all()
    )
    return {
        "count": len(alerts),
        "alerts": [_emergency_to_dict(e) for e in alerts],
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /emergency/summary
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/summary")
def get_emergency_summary(db: Session = Depends(get_db)):
    alerts = db.query(EmergencyAlert).all()
    by_type = {t: 0 for t in EMERGENCY_TYPES}
    by_status = {"Active": 0, "En Route": 0, "Resolved": 0}

    for a in alerts:
        if a.emergency_type in by_type:
            by_type[a.emergency_type] += 1
        if a.status in by_status:
            by_status[a.status] += 1

    return {
        "total": len(alerts),
        "active": by_status["Active"],
        "by_type": by_type,
        "by_status": by_status,
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /emergency/ — Create new emergency alert
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/")
def create_emergency_alert(data: EmergencyCreate, db: Session = Depends(get_db)):
    if data.emergency_type not in EMERGENCY_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid emergency_type. Must be one of: {EMERGENCY_TYPES}",
        )
    alert = EmergencyAlert(
        emergency_type=data.emergency_type,
        location=data.location,
        latitude=str(data.latitude) if data.latitude else None,
        longitude=str(data.longitude) if data.longitude else None,
        priority="Critical",
        route_cleared=data.route_cleared,
        affected_junctions=data.affected_junctions,
        contact_unit=data.contact_unit,
        status="Active",
        notes=data.notes,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return _emergency_to_dict(alert)


# ─────────────────────────────────────────────────────────────────────────────
# POST /emergency/simulate — auto-generate from traffic DB emergency_status
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/simulate")
def simulate_emergency_from_traffic(db: Session = Depends(get_db)):
    """
    Create emergency alerts from traffic records where emergency_status != 'Normal'.
    """
    records = (
        db.query(Traffic)
        .filter(Traffic.emergency_status.notin_(["Normal", "normal", "None", "none", ""]))
        .all()
    )

    created = []
    for r in records:
        existing = (
            db.query(EmergencyAlert)
            .filter(EmergencyAlert.location == r.location, EmergencyAlert.status == "Active")
            .first()
        )
        if existing:
            continue

        # Map emergency_status string to a known emergency type
        e_type = r.emergency_status if r.emergency_status in EMERGENCY_TYPES else "RoadBlock"

        alert = EmergencyAlert(
            emergency_type=e_type,
            location=r.location,
            latitude=str(r.latitude) if r.latitude else None,
            longitude=str(r.longitude) if r.longitude else None,
            priority="Critical",
            route_cleared=False,
            affected_junctions=r.location,
            status="Active",
            notes=(
                f"Auto-generated from traffic record #{r.id}. "
                f"Emergency status: {r.emergency_status}."
            ),
        )
        db.add(alert)
        created.append(alert)

    db.commit()
    for a in created:
        db.refresh(a)

    return {
        "message": f"Simulated {len(created)} emergency alert(s).",
        "count": len(created),
        "alerts": [_emergency_to_dict(a) for a in created],
    }


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /emergency/{id}/resolve
# ─────────────────────────────────────────────────────────────────────────────
@router.patch("/{alert_id}/resolve")
def resolve_emergency(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Emergency alert not found")
    alert.status = "Resolved"
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return {"message": "Emergency alert resolved", "alert": _emergency_to_dict(alert)}


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /emergency/{id}/route-cleared
# ─────────────────────────────────────────────────────────────────────────────
@router.patch("/{alert_id}/route-cleared")
def mark_route_cleared(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Emergency alert not found")
    alert.route_cleared = True
    alert.status = "En Route"
    db.commit()
    db.refresh(alert)
    return {"message": "Route marked as cleared", "alert": _emergency_to_dict(alert)}


# ─────────────────────────────────────────────────────────────────────────────
# GET /emergency/{id}
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/{alert_id}")
def get_emergency_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(EmergencyAlert).filter(EmergencyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Emergency alert not found")
    return _emergency_to_dict(alert)
