from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.database.session import get_db
from app.models.models import Zone, Road, User, TrafficData, Alert
from app.middleware.dependencies import require_roles, get_current_user
from app.schemas.zone import CreateZoneSchema, UpdateZoneSchema, AssignRoadsSchema, ZoneResponseSchema
from app.utils.cache import ttl_cache

router = APIRouter(prefix="/zones", tags=["Zone Management"])

def format_zone_response(z: Zone, db: Session) -> dict:
    if not z:
        return None

    roads = db.query(Road).options(joinedload(Road.assigned_operator)).filter(
        or_(
            Road.zone_id == z.id,
            Road.zone.ilike(f"%{z.zone_name}%")
        )
    ).order_by(Road.id.asc()).all()

    formatted_roads = []
    operator_ids = set()
    operators_list = []
    total_vehicles = 0
    speed_sum = 0.0
    speed_count = 0

    road_ids = [r.id for r in roads]
    telemetry_map = {}
    if road_ids:
        subq = (
            db.query(TrafficData.road_id, func.max(TrafficData.timestamp).label("max_ts"))
            .filter(TrafficData.road_id.in_(road_ids))
            .group_by(TrafficData.road_id)
            .subquery()
        )
        latest_t_list = (
            db.query(TrafficData)
            .join(subq, (TrafficData.road_id == subq.c.road_id) & (TrafficData.timestamp == subq.c.max_ts))
            .all()
        )
        telemetry_map = {t.road_id: t for t in latest_t_list}

    for r in roads:
        if r.assigned_operator and r.assigned_operator.id not in operator_ids:
            operator_ids.add(r.assigned_operator.id)
            operators_list.append({
                "id": r.assigned_operator.id,
                "name": r.assigned_operator.name,
                "email": r.assigned_operator.email,
                "phone": getattr(r.assigned_operator, "phone", None),
                "status": getattr(r.assigned_operator, "status", "Active")
            })

        latest_t = telemetry_map.get(r.id)
        if latest_t:
            total_vehicles += latest_t.vehicle_count or 0
            if latest_t.average_speed is not None:
                speed_sum += float(latest_t.average_speed)
                speed_count += 1

        formatted_roads.append({
            "id": r.id,
            "road_name": r.road_name,
            "road_code": r.road_code or f"RD-{r.id:03d}",
            "zone": r.zone,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "status": r.status or "Active",
            "assigned_operator_name": r.assigned_operator.name if r.assigned_operator else "Unassigned"
        })

    avg_speed = round(speed_sum / max(1, speed_count), 1) if speed_count > 0 else 0.0

    return {
        "id": z.id,
        "zone_name": z.zone_name,
        "zone_code": getattr(z, "zone_code", None) or f"ZONE-{z.id:02d}",
        "description": z.description or "Traffic perimeter monitoring zone",
        "status": getattr(z, "status", "Active") or "Active",
        "center_latitude": getattr(z, "center_latitude", 0.0) or 0.0,
        "center_longitude": getattr(z, "center_longitude", 0.0) or 0.0,
        "road_count": len(formatted_roads),
        "operator_count": len(operators_list),
        "traffic_status": "OPTIMAL",
        "average_congestion": "Low",
        "total_vehicles": total_vehicles,
        "average_speed": avg_speed,
        "roads": formatted_roads,
        "operators": operators_list,
        "alerts": [],
        "created_at": z.created_at.isoformat() if z.created_at else None,
        "updated_at": z.updated_at.isoformat() if getattr(z, "updated_at", None) else (z.created_at.isoformat() if z.created_at else None)
    }

@router.get("", response_model=List[ZoneResponseSchema])
@router.get("/", response_model=List[ZoneResponseSchema])
def list_zones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve list of all monitoring zones with 5-minute TTL caching & batch queries."""
    cached = ttl_cache.get("zones_list_cache")
    if cached:
        return cached

    zones = db.query(Zone).order_by(Zone.id.asc()).all()
    all_roads = db.query(Road).options(joinedload(Road.assigned_operator)).all()
    roads_by_zone_id = {}
    roads_by_zone_name = {}
    for r in all_roads:
        if r.zone_id:
            roads_by_zone_id.setdefault(r.zone_id, []).append(r)
        if r.zone:
            roads_by_zone_name.setdefault(r.zone.lower(), []).append(r)

    # Batch fetch all latest telemetry in 1 query
    subq = (
        db.query(TrafficData.road_id, func.max(TrafficData.timestamp).label("max_ts"))
        .group_by(TrafficData.road_id)
        .subquery()
    )
    latest_telemetry_list = (
        db.query(TrafficData)
        .join(subq, (TrafficData.road_id == subq.c.road_id) & (TrafficData.timestamp == subq.c.max_ts))
        .all()
    )
    telemetry_map = {t.road_id: t for t in latest_telemetry_list}

    result = []
    for z in zones:
        z_roads = roads_by_zone_id.get(z.id) or roads_by_zone_name.get(z.zone_name.lower()) or []
        operator_ids = set()
        operators_list = []
        total_vehicles = 0
        speed_sum = 0.0
        speed_count = 0
        formatted_roads = []

        for r in z_roads:
            if r.assigned_operator and r.assigned_operator.id not in operator_ids:
                operator_ids.add(r.assigned_operator.id)
                operators_list.append({
                    "id": r.assigned_operator.id,
                    "name": r.assigned_operator.name,
                    "email": r.assigned_operator.email,
                    "phone": getattr(r.assigned_operator, "phone", None),
                    "status": getattr(r.assigned_operator, "status", "Active")
                })
            latest_t = telemetry_map.get(r.id)
            if latest_t:
                total_vehicles += latest_t.vehicle_count or 0
                if latest_t.average_speed is not None:
                    speed_sum += float(latest_t.average_speed)
                    speed_count += 1
            formatted_roads.append({
                "id": r.id,
                "road_name": r.road_name,
                "road_code": r.road_code or f"RD-{r.id:03d}",
                "zone": r.zone,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "status": r.status or "Active",
                "assigned_operator_name": r.assigned_operator.name if r.assigned_operator else "Unassigned"
            })

        avg_speed = round(speed_sum / max(1, speed_count), 1) if speed_count > 0 else 0.0
        result.append({
            "id": z.id,
            "zone_name": z.zone_name,
            "zone_code": getattr(z, "zone_code", None) or f"ZONE-{z.id:02d}",
            "description": z.description or "Traffic perimeter monitoring zone",
            "status": getattr(z, "status", "Active") or "Active",
            "center_latitude": getattr(z, "center_latitude", 0.0) or 0.0,
            "center_longitude": getattr(z, "center_longitude", 0.0) or 0.0,
            "road_count": len(formatted_roads),
            "operator_count": len(operators_list),
            "traffic_status": "OPTIMAL",
            "average_congestion": "Low",
            "total_vehicles": total_vehicles,
            "average_speed": avg_speed,
            "roads": formatted_roads,
            "operators": operators_list,
            "alerts": [],
            "created_at": z.created_at.isoformat() if z.created_at else None,
            "updated_at": z.updated_at.isoformat() if getattr(z, "updated_at", None) else (z.created_at.isoformat() if z.created_at else None)
        })

    ttl_cache.set("zones_list_cache", result, ttl_seconds=300)
    return result

@router.get("/{zone_id}", response_model=ZoneResponseSchema)
def get_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve details for a specific zone."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    return format_zone_response(zone, db)

@router.post("", response_model=ZoneResponseSchema, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ZoneResponseSchema, status_code=status.HTTP_201_CREATED)
def create_zone(
    payload: CreateZoneSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """Admin: Create new zone in Supabase."""
    existing = db.query(Zone).filter(func.lower(Zone.zone_name) == payload.zone_name.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Zone '{payload.zone_name}' already exists.")

    new_zone = Zone(
        zone_name=payload.zone_name.strip(),
        zone_code=payload.zone_code or f"ZONE-{int(datetime.now().timestamp()) % 1000}",
        description=payload.description,
        status=payload.status or "Active",
        center_latitude=payload.center_latitude or 0.0,
        center_longitude=payload.center_longitude or 0.0
    )
    db.add(new_zone)
    db.commit()
    db.refresh(new_zone)

    if payload.road_ids:
        db.query(Road).filter(Road.id.in_(payload.road_ids)).update({
            Road.zone_id: new_zone.id,
            Road.zone: new_zone.zone_name
        }, synchronize_session=False)
        db.commit()

    ttl_cache.invalidate()
    return format_zone_response(new_zone, db)

@router.put("/{zone_id}", response_model=ZoneResponseSchema)
def update_zone(
    zone_id: int,
    payload: UpdateZoneSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """Admin: Update zone details in Supabase."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    if payload.zone_name:
        new_name = payload.zone_name.strip()
        existing_dup = db.query(Zone).filter(
            func.lower(Zone.zone_name) == new_name.lower(),
            Zone.id != zone_id
        ).first()
        if existing_dup:
            raise HTTPException(status_code=400, detail=f"Zone name '{new_name}' is already used by another zone.")
        zone.zone_name = new_name
        # Update zone name string on linked roads
        db.query(Road).filter(Road.zone_id == zone.id).update({
            Road.zone: new_name
        }, synchronize_session=False)

    if payload.zone_code:
        zone.zone_code = payload.zone_code
    if payload.description is not None:
        zone.description = payload.description
    if payload.status:
        zone.status = payload.status
    if payload.center_latitude is not None:
        zone.center_latitude = payload.center_latitude
    if payload.center_longitude is not None:
        zone.center_longitude = payload.center_longitude

    if payload.road_ids is not None:
        # Unlink roads previously linked to this zone that are not in payload
        db.query(Road).filter(Road.zone_id == zone.id, ~Road.id.in_(payload.road_ids)).update({
            Road.zone_id: None,
            Road.zone: "Unassigned"
        }, synchronize_session=False)
        # Link specified roads
        if payload.road_ids:
            db.query(Road).filter(Road.id.in_(payload.road_ids)).update({
                Road.zone_id: zone.id,
                Road.zone: zone.zone_name
            }, synchronize_session=False)

    zone.updated_at = datetime.utcnow()
    db.commit()

    ttl_cache.invalidate()
    return format_zone_response(zone, db)

@router.put("/{zone_id}/archive", response_model=ZoneResponseSchema)
def archive_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """Admin: Archive zone (set status to Archived)."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    zone.status = "Archived"
    zone.updated_at = datetime.utcnow()
    db.commit()

    ttl_cache.invalidate()
    return format_zone_response(zone, db)

@router.put("/{zone_id}/restore", response_model=ZoneResponseSchema)
def restore_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """Admin: Restore zone (set status to Active)."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    zone.status = "Active"
    zone.updated_at = datetime.utcnow()
    db.commit()

    ttl_cache.invalidate()
    return format_zone_response(zone, db)

@router.put("/{zone_id}/assign-roads", response_model=ZoneResponseSchema)
def assign_zone_roads(
    zone_id: int,
    payload: AssignRoadsSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """Admin: Assign / reassign road corridors to a zone."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    # Unlink roads previously linked to this zone that are no longer assigned
    db.query(Road).filter(Road.zone_id == zone.id, ~Road.id.in_(payload.road_ids)).update({
        Road.zone_id: None,
        Road.zone: "Unassigned"
    }, synchronize_session=False)

    # Link newly assigned roads
    if payload.road_ids:
        db.query(Road).filter(Road.id.in_(payload.road_ids)).update({
            Road.zone_id: zone.id,
            Road.zone: zone.zone_name
        }, synchronize_session=False)

    zone.updated_at = datetime.utcnow()
    db.commit()

    ttl_cache.invalidate()
    return format_zone_response(zone, db)

@router.delete("/{zone_id}")
def delete_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """Admin: Delete zone from Supabase."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    # Unlink any roads linked to this zone before deletion
    db.query(Road).filter(Road.zone_id == zone.id).update({
        Road.zone_id: None,
        Road.zone: "Unassigned"
    }, synchronize_session=False)

    db.delete(zone)
    db.commit()

    ttl_cache.invalidate()
    return {"message": f"Zone #{zone_id} deleted successfully", "id": zone_id}
