from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, security, routing
from ..database import get_db

router = APIRouter(prefix="/routes", tags=["Route Analysis"])


@router.get("/geocode")
def geocode(
    query: str = Query(..., min_length=2, description="Place name or address to look up"),
    current_user: models.User = Depends(security.get_current_user),
):
    """Turn a place name into coordinates (for planning a route to/from a
    location that isn't already one of the monitored roads)."""
    try:
        return routing.geocode(query)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/plan")
def plan(
    origin_road_id: Optional[int] = Query(None, description="Use an existing monitored road as the origin"),
    destination_road_id: Optional[int] = Query(None, description="Use an existing monitored road as the destination"),
    origin_lat: Optional[float] = Query(None),
    origin_lon: Optional[float] = Query(None),
    destination_lat: Optional[float] = Query(None),
    destination_lon: Optional[float] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Alternate route suggestions, route optimization, and congestion-aware
    travel time estimation. Either pass road ids (for two monitored roads) or
    raw lat/lon pairs (e.g. from /routes/geocode) for either end.
    """
    def resolve_point(road_id, lat, lon, label):
        if road_id is not None:
            road = db.query(models.Road).filter(models.Road.id == road_id).first()
            if not road:
                raise HTTPException(status_code=404, detail=f"{label} road not found")
            if road.latitude is None or road.longitude is None:
                raise HTTPException(status_code=400, detail=f"{label} road has no coordinates set")
            return road.latitude, road.longitude
        if lat is not None and lon is not None:
            return lat, lon
        raise HTTPException(status_code=400, detail=f"Provide either {label}_road_id or {label}_lat/{label}_lon")

    o_lat, o_lon = resolve_point(origin_road_id, origin_lat, origin_lon, "origin")
    d_lat, d_lon = resolve_point(destination_road_id, destination_lat, destination_lon, "destination")

    try:
        return routing.plan_route(db, o_lat, o_lon, d_lat, d_lon)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/road-condition/{road_id}")
def road_condition(
    road_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    """Road condition monitoring: current congestion + speed for a road,
    framed as a condition report (used by route planning to flag problem
    segments)."""
    road = db.query(models.Road).filter(models.Road.id == road_id).first()
    if not road:
        raise HTTPException(status_code=404, detail="Road not found")

    latest = (
        db.query(models.TrafficReading)
        .filter(models.TrafficReading.road_id == road_id)
        .order_by(models.TrafficReading.recorded_at.desc())
        .first()
    )
    if not latest:
        raise HTTPException(status_code=404, detail="No readings yet for this road")

    condition = "normal"
    if latest.congestion_level == "high":
        condition = "congested"
    elif latest.avg_speed_kmph < 15:
        condition = "slow-moving"

    return {
        "road_id": road.id,
        "road_name": road.name,
        "condition": condition,
        "congestion_level": latest.congestion_level,
        "avg_speed_kmph": latest.avg_speed_kmph,
        "as_of": latest.recorded_at.isoformat(),
    }
