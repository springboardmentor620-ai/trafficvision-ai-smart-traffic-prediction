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


@router.get("/roads/{road_id}", response_model=schemas.RoadOut)
def get_road(
    road_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Read a single road's details (CRUD: Read)."""
    road = db.query(models.Road).filter(models.Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")
    return road


@router.put("/roads/{road_id}", response_model=schemas.RoadOut)
def update_road(
    road_id: int,
    road_update: schemas.RoadUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_roles("admin", "operator")),
):
    """Edit a road's name, location, or lane capacity (CRUD: Update)."""
    road = db.query(models.Road).filter(models.Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    if road_update.name is not None:
        road.name = road_update.name
    if road_update.location is not None:
        road.location = road_update.location
    if road_update.lane_capacity is not None:
        road.lane_capacity = road_update.lane_capacity
    if road_update.latitude is not None:
        road.latitude = road_update.latitude
    if road_update.longitude is not None:
        road.longitude = road_update.longitude

    db.commit()
    db.refresh(road)
    return road


@router.delete("/roads/{road_id}", status_code=204)
def delete_road(
    road_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.require_roles("admin", "operator")),
):
    """Remove a road and its historical readings (CRUD: Delete)."""
    road = db.query(models.Road).filter(models.Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    db.query(models.TrafficReading).filter(models.TrafficReading.road_id == road_id).delete()
    db.delete(road)
    db.commit()
    return None


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
