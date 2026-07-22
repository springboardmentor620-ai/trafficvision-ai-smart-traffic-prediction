from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import APIRouter, Depends, HTTPException

from .. import models, schemas, security
from ..database import get_db

router = APIRouter(prefix="/traffic", tags=["Traffic Monitoring"])


def compute_congestion_level(vehicle_count: int, lane_capacity: int) -> str:
    """Simple density-ratio rule for Milestone 1.
    Prediction Module (Milestone 2) will replace/augment this with a trained model.
    """
    ratio = vehicle_count / max(lane_capacity, 1)
    if ratio < 0.5:
        return "low"
    elif ratio < 0.85:
        return "medium"
    return "high"


# ---------- Roads (setup by admin/operator) ----------
@router.post("/roads", response_model=schemas.RoadOut)
def create_road(
    road_in: schemas.RoadCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_roles("admin", "operator")),
):
    road = models.Road(**road_in.model_dump())
    db.add(road)
    db.commit()
    db.refresh(road)
    return road


@router.get("/roads", response_model=List[schemas.RoadOut])
def list_roads(db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    return db.query(models.Road).all()


# ---------- Readings (vehicle density tracking) ----------
@router.post("/readings", response_model=schemas.ReadingOut)
def submit_reading(
    reading_in: schemas.ReadingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_roles("admin", "operator")),
):
    road = db.query(models.Road).filter(models.Road.id == reading_in.road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    level = compute_congestion_level(reading_in.vehicle_count, road.lane_capacity)
    reading = models.TrafficReading(
        road_id=reading_in.road_id,
        vehicle_count=reading_in.vehicle_count,
        avg_speed_kmph=reading_in.avg_speed_kmph,
        congestion_level=level,
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


# ---------- Live traffic dashboard feed ----------
@router.get("/live", response_model=List[schemas.LiveRoadStatus])
def live_status(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Returns the latest reading per road — feeds the live traffic dashboard
    (Users: Traffic Authorities / Operators / Public via Web-Mobile App -> Dashboard)."""
    roads = db.query(models.Road).all()
    result = []
    for road in roads:
        latest = (
            db.query(models.TrafficReading)
            .filter(models.TrafficReading.road_id == road.id)
            .order_by(desc(models.TrafficReading.recorded_at))
            .first()
        )
        if latest:
            result.append(
                schemas.LiveRoadStatus(
                    road_id=road.id,
                    road_name=road.name,
                    location=road.location,
                    vehicle_count=latest.vehicle_count,
                    avg_speed_kmph=latest.avg_speed_kmph,
                    congestion_level=latest.congestion_level,
                    recorded_at=latest.recorded_at,
                )
            )
    return result


@router.get("/roads/{road_id}/history", response_model=List[schemas.ReadingOut])
def road_history(
    road_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Historical traffic data for a road (used by trend/analytics work in later milestones)."""
    return (
        db.query(models.TrafficReading)
        .filter(models.TrafficReading.road_id == road_id)
        .order_by(desc(models.TrafficReading.recorded_at))
        .limit(limit)
        .all()
    )
