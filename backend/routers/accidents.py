"""
Accidents Router — accident management module.
Sources: simulated from traffic DB (accident_status field).
Architecture supports future integration: CCTV, GPS, Government APIs.
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models.accident import Accident
from models.traffic import Traffic

router = APIRouter(prefix="/accidents", tags=["Accidents"])


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _get_severity_from_vehicle_count(count: int) -> str:
    if count >= 250:
        return "Fatal"
    elif count >= 150:
        return "Major"
    return "Minor"


def _get_diversion(location: str, road_status: str) -> str:
    if road_status == "Fully Blocked":
        return (
            f"Full diversion required from {location}. "
            "All vehicles must use marked alternate routes. "
            "Avoid a 2 km radius around the incident."
        )
    elif road_status == "Partially Blocked":
        return (
            f"Single lane available at {location}. "
            "Slow down, follow traffic officer instructions. "
            "Use service road if available."
        )
    return f"Road at {location} is open. Minor slowdown expected. Proceed with caution."


def _accident_to_dict(a: Accident) -> dict:
    return {
        "id": a.id,
        "location": a.location,
        "latitude": a.latitude,
        "longitude": a.longitude,
        "severity": a.severity,
        "road_status": a.road_status,
        "diversion_route": a.diversion_route,
        "source": a.source,
        "status": a.status,
        "notes": a.notes,
        "reported_at": a.reported_at.isoformat() if a.reported_at else None,
        "cleared_at": a.cleared_at.isoformat() if a.cleared_at else None,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────────────────────────────

class AccidentCreate(BaseModel):
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: str = "Minor"
    road_status: str = "Partially Blocked"
    diversion_route: Optional[str] = None
    source: str = "Manual"
    notes: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# GET /accidents/
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/")
def list_accidents(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(Accident)
    if status:
        query = query.filter(Accident.status == status)
    if severity:
        query = query.filter(Accident.severity == severity)
    accidents = query.order_by(Accident.reported_at.desc()).offset(skip).limit(limit).all()
    return [_accident_to_dict(a) for a in accidents]


# ─────────────────────────────────────────────────────────────────────────────
# GET /accidents/active
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/active")
def get_active_accidents(db: Session = Depends(get_db)):
    accidents = (
        db.query(Accident)
        .filter(Accident.status == "Active")
        .order_by(Accident.reported_at.desc())
        .all()
    )
    return {
        "count": len(accidents),
        "accidents": [_accident_to_dict(a) for a in accidents],
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /accidents/simulate
# Create accident records from traffic DB where accident_status = 'Yes'
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/simulate")
def simulate_accidents(db: Session = Depends(get_db)):
    """
    Reads traffic records where accident_status='Yes' and creates Accident entries.
    This simulates what CCTV / GPS feeds would send in production.
    """
    traffic_records = (
        db.query(Traffic)
        .filter(Traffic.accident_status.in_(["Yes", "yes", "YES", "1", "true"]))
        .all()
    )

    if not traffic_records:
        return {
            "message": "No accident records found in traffic table. "
                       "Update accident_status='Yes' in traffic table to simulate.",
            "count": 0,
            "accidents": [],
        }

    created = []
    for t in traffic_records:
        # Avoid duplicates — check if active accident already exists for this location
        existing = (
            db.query(Accident)
            .filter(Accident.location == t.location, Accident.status == "Active")
            .first()
        )
        if existing:
            continue

        severity = _get_severity_from_vehicle_count(t.vehicle_count)
        road_status = (
            "Fully Blocked" if t.vehicle_count >= 250
            else "Partially Blocked" if t.vehicle_count >= 100
            else "Open"
        )
        diversion = _get_diversion(t.location, road_status)

        accident = Accident(
            location=t.location,
            latitude=t.latitude,
            longitude=t.longitude,
            severity=severity,
            road_status=road_status,
            diversion_route=diversion,
            source="Simulated",
            status="Active",
            notes=(
                f"Auto-generated from traffic record #{t.id}. "
                f"Vehicle count: {t.vehicle_count}. Congestion: {t.congestion_level}."
            ),
        )
        db.add(accident)
        created.append(accident)

    db.commit()
    for a in created:
        db.refresh(a)

    return {
        "message": f"Simulated {len(created)} accident(s) from traffic data.",
        "count": len(created),
        "accidents": [_accident_to_dict(a) for a in created],
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /accidents/
# Manual accident creation
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/")
def create_accident(data: AccidentCreate, db: Session = Depends(get_db)):
    diversion = data.diversion_route or _get_diversion(data.location, data.road_status)
    accident = Accident(
        location=data.location,
        latitude=data.latitude,
        longitude=data.longitude,
        severity=data.severity,
        road_status=data.road_status,
        diversion_route=diversion,
        source=data.source,
        status="Active",
        notes=data.notes,
    )
    db.add(accident)
    db.commit()
    db.refresh(accident)
    return _accident_to_dict(accident)


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /accidents/{id}/clear
# ─────────────────────────────────────────────────────────────────────────────
@router.patch("/{accident_id}/clear")
def clear_accident(accident_id: int, db: Session = Depends(get_db)):
    accident = db.query(Accident).filter(Accident.id == accident_id).first()
    if not accident:
        raise HTTPException(status_code=404, detail="Accident not found")
    accident.status = "Cleared"
    accident.cleared_at = datetime.utcnow()
    db.commit()
    db.refresh(accident)
    return {"message": "Accident cleared successfully", "accident": _accident_to_dict(accident)}


# ─────────────────────────────────────────────────────────────────────────────
# GET /accidents/{id}
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/{accident_id}")
def get_accident(accident_id: int, db: Session = Depends(get_db)):
    accident = db.query(Accident).filter(Accident.id == accident_id).first()
    if not accident:
        raise HTTPException(status_code=404, detail="Accident not found")
    return _accident_to_dict(accident)
