from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.database.session import get_db
from app.models.models import User, Road, Zone, OperatorRoadAssignment
from app.middleware.dependencies import get_current_user, require_roles
from app.repositories.operator_repository import OperatorRepository
from app.utils.cache import ttl_cache
from app.schemas.assignment import (
    CreateAssignmentSchema,
    UpdateAssignmentSchema,
    TransferRoadsSchema,
    BulkAssignmentSchema,
    AssignmentResponseSchema
)

router = APIRouter(
    prefix="/assignments",
    tags=["Assignment Management"],
    dependencies=[Depends(require_roles(["Admin"]))]
)

def format_assignment_dict(op: User, db: Session) -> dict:
    formatted_op = OperatorRepository._format_operator(op, db)
    
    # Query latest junction record
    latest_assign = db.query(OperatorRoadAssignment).filter(
        OperatorRoadAssignment.operator_id == op.id
    ).order_by(OperatorRoadAssignment.assigned_at.desc()).first()

    assigned_by_name = latest_assign.assigned_by if latest_assign else "Admin Chief Controller"
    assigned_date = latest_assign.assigned_at.isoformat() if (latest_assign and latest_assign.assigned_at) else (op.created_at.isoformat() if op.created_at else None)
    assign_status = latest_assign.status if latest_assign else ("ACTIVE" if formatted_op["assigned_road_count"] > 0 else "UNASSIGNED")

    return {
        "id": op.id,
        "operator": {
            "id": op.id,
            "name": op.name,
            "email": op.email,
            "phone": op.phone or "N/A",
            "role": op.role,
            "status": op.status or "ACTIVE"
        },
        "assigned_zone": formatted_op["zone"],
        "assigned_roads": formatted_op["assigned_roads"],
        "assigned_road_count": formatted_op["assigned_road_count"],
        "assignment_status": assign_status,
        "assigned_by": assigned_by_name,
        "assigned_at": assigned_date
    }

@router.get("", response_model=List[AssignmentResponseSchema])
@router.get("/", response_model=List[AssignmentResponseSchema])
def list_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """
    GET /api/v1/assignments
    Retrieve full roster of operator assignments with 1-pass bulk preloading (< 50ms).
    """
    cached = ttl_cache.get("assignments_list_cache")
    if cached:
        return cached

    # Use bulk-optimized OperatorRepository to load formatted operators in 3 SQL queries
    formatted_ops = OperatorRepository.get_all_operators(db)
    if not formatted_ops:
        return []

    op_ids = [op["id"] for op in formatted_ops]

    # Bulk load latest junction records for all operators in 1 query
    junctions_raw = db.query(OperatorRoadAssignment).filter(
        OperatorRoadAssignment.operator_id.in_(op_ids)
    ).order_by(OperatorRoadAssignment.assigned_at.desc()).all()

    latest_junction_map = {}
    for j in junctions_raw:
        if j.operator_id not in latest_junction_map:
            latest_junction_map[j.operator_id] = j

    result = []
    for f_op in formatted_ops:
        op_id = f_op["id"]
        latest_assign = latest_junction_map.get(op_id)

        assigned_by_name = latest_assign.assigned_by if latest_assign else "Admin Chief Controller"
        assigned_date = latest_assign.assigned_at.isoformat() if (latest_assign and latest_assign.assigned_at) else f_op.get("created_at")
        assign_status = latest_assign.status if latest_assign else ("ACTIVE" if f_op["assigned_road_count"] > 0 else "UNASSIGNED")

        result.append({
            "id": op_id,
            "operator": {
                "id": op_id,
                "name": f_op["name"],
                "email": f_op["email"],
                "phone": f_op.get("phone") or "N/A",
                "role": f_op["role"],
                "status": f_op.get("status") or "ACTIVE"
            },
            "assigned_zone": f_op["zone"],
            "assigned_roads": f_op["assigned_roads"],
            "assigned_road_count": f_op["assigned_road_count"],
            "assignment_status": assign_status,
            "assigned_by": assigned_by_name,
            "assigned_at": assigned_date
        })

    ttl_cache.set("assignments_list_cache", result, ttl_seconds=300)
    return result

@router.get("/{id}", response_model=AssignmentResponseSchema)
def get_assignment(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """
    GET /api/v1/assignments/{id}
    Retrieve detailed assignment record for a specific operator.
    """
    op = db.query(User).filter(User.id == id, func.lower(User.role) == "operator").first()
    if not op:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Operator assignment record for ID {id} not found.")
    return format_assignment_dict(op, db)

@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_assignment(
    payload: CreateAssignmentSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """
    POST /api/v1/assignments
    Assign an Operator to specified Zone and Road Corridors in Supabase junction table.
    """
    admin_name = payload.assigned_by or current_user.name
    
    op = db.query(User).filter(User.id == payload.operator_id).first()
    if not op:
        raise HTTPException(status_code=404, detail=f"Operator with ID {payload.operator_id} not found.")

    res = OperatorRepository.assign_operator_roads(
        db, 
        operator_id=payload.operator_id, 
        zone=payload.zone, 
        road_ids=payload.road_ids
    )

    # Sync junction table in Supabase
    zone_obj = db.query(Zone).filter(Zone.zone_name.ilike(payload.zone)).first() if payload.zone else None
    zone_id = zone_obj.id if zone_obj else None

    # Clear previous junction entries for this operator
    db.query(OperatorRoadAssignment).filter(OperatorRoadAssignment.operator_id == payload.operator_id).delete()
    
    for r_id in payload.road_ids:
        new_junction = OperatorRoadAssignment(
            operator_id=payload.operator_id,
            road_id=r_id,
            zone_id=zone_id,
            assigned_by=admin_name,
            status="ACTIVE"
        )
        db.add(new_junction)
    
    db.commit()
    ttl_cache.invalidate()
    db.refresh(op)

    return {
        "message": f"Assignments updated for operator '{op.name}' in Supabase",
        "assignment": format_assignment_dict(op, db)
    }

@router.put("/{id}")
def update_assignment(
    id: int,
    payload: UpdateAssignmentSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """
    PUT /api/v1/assignments/{id}
    Update or reassign an operator's zone and road corridors.
    """
    op = db.query(User).filter(User.id == id).first()
    if not op:
        raise HTTPException(status_code=404, detail=f"Operator assignment record for ID {id} not found.")

    res = OperatorRepository.assign_operator_roads(
        db,
        operator_id=id,
        zone=payload.zone,
        road_ids=payload.road_ids
    )

    # Sync junction table in Supabase
    zone_obj = db.query(Zone).filter(Zone.zone_name.ilike(payload.zone)).first() if payload.zone else None
    zone_id = zone_obj.id if zone_obj else None

    db.query(OperatorRoadAssignment).filter(OperatorRoadAssignment.operator_id == id).delete()
    for r_id in payload.road_ids:
        new_j = OperatorRoadAssignment(
            operator_id=id,
            road_id=r_id,
            zone_id=zone_id,
            assigned_by=current_user.name,
            status="ACTIVE"
        )
        db.add(new_j)
    db.commit()
    ttl_cache.invalidate()

    return {
        "message": f"Assignment updated for '{op.name}'",
        "assignment": format_assignment_dict(op, db)
    }

@router.post("/transfer")
def transfer_roads(
    payload: TransferRoadsSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """
    POST /api/v1/assignments/transfer
    Transfer specified road corridors from source operator to target operator.
    """
    source_op = db.query(User).filter(User.id == payload.source_operator_id).first()
    target_op = db.query(User).filter(User.id == payload.target_operator_id).first()
    if not source_op or not target_op:
        raise HTTPException(status_code=404, detail="Source or Target Operator not found.")

    # Reassign roads in Supabase
    db.query(Road).filter(Road.id.in_(payload.road_ids)).update(
        {"assigned_operator_id": target_op.id}, synchronize_session=False
    )
    
    # Sync junction table
    zone_obj = db.query(Zone).filter(Zone.zone_name.ilike(target_op.zone)).first() if target_op.zone else None
    zone_id = zone_obj.id if zone_obj else None

    db.query(OperatorRoadAssignment).filter(
        OperatorRoadAssignment.operator_id == payload.source_operator_id,
        OperatorRoadAssignment.road_id.in_(payload.road_ids)
    ).delete(synchronize_session=False)

    for r_id in payload.road_ids:
        new_j = OperatorRoadAssignment(
            operator_id=target_op.id,
            road_id=r_id,
            zone_id=zone_id,
            assigned_by=current_user.name,
            status="ACTIVE"
        )
        db.add(new_j)

    db.commit()
    ttl_cache.invalidate()

    return {
        "message": f"Transferred {len(payload.road_ids)} corridors from '{source_op.name}' to '{target_op.name}'",
        "source_operator": format_assignment_dict(source_op, db),
        "target_operator": format_assignment_dict(target_op, db)
    }

@router.post("/bulk")
def bulk_assignment(
    payload: BulkAssignmentSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """
    POST /api/v1/assignments/bulk
    Perform bulk assignment or unassignment across multiple operators and roads.
    """
    if not payload.operator_ids:
        raise HTTPException(status_code=400, detail="No operators selected for bulk action.")

    action_type = (payload.action or "ASSIGN").upper()
    admin_name = current_user.name if current_user else "Admin Chief Controller"
    
    if action_type == "UNASSIGN":
        for op_id in payload.operator_ids:
            db.query(Road).filter(Road.assigned_operator_id == op_id).update(
                {"assigned_operator_id": None}, synchronize_session=False
            )
            db.query(OperatorRoadAssignment).filter(OperatorRoadAssignment.operator_id == op_id).delete()
        db.commit()
        ttl_cache.invalidate()
        return {
            "message": f"Successfully removed all road assignments for {len(payload.operator_ids)} operators in Supabase.",
            "count": len(payload.operator_ids)
        }

    # ASSIGN action
    zone_obj = db.query(Zone).filter(Zone.zone_name.ilike(payload.zone)).first() if payload.zone else None
    zone_id = zone_obj.id if zone_obj else None

    for op_id in payload.operator_ids:
        op = db.query(User).filter(User.id == op_id).first()
        if not op:
            continue
        
        if payload.zone:
            op.zone = payload.zone.strip()

        if payload.road_ids:
            # Unassign these roads from previous owners if any (Enforce One Road -> One Operator)
            db.query(Road).filter(Road.assigned_operator_id == op_id).update(
                {"assigned_operator_id": None}, synchronize_session=False
            )
            db.query(Road).filter(Road.id.in_(payload.road_ids)).update(
                {"assigned_operator_id": op_id}, synchronize_session=False
            )

            # Sync junction table
            db.query(OperatorRoadAssignment).filter(OperatorRoadAssignment.operator_id == op_id).delete()
            for r_id in payload.road_ids:
                new_j = OperatorRoadAssignment(
                    operator_id=op_id,
                    road_id=r_id,
                    zone_id=zone_id,
                    assigned_by=admin_name,
                    status="ACTIVE"
                )
                db.add(new_j)

    db.commit()
    ttl_cache.invalidate()
    return {
        "message": f"Bulk assignment completed for {len(payload.operator_ids)} operators in zone '{payload.zone or 'Zone Alpha'}'.",
        "operator_count": len(payload.operator_ids),
        "road_count": len(payload.road_ids)
    }

@router.delete("/{id}")
def delete_assignment(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    """
    DELETE /api/v1/assignments/{id}
    Remove all road assignments for an operator.
    """
    op = db.query(User).filter(User.id == id).first()
    if not op:
        raise HTTPException(status_code=404, detail=f"Operator assignment record for ID {id} not found.")

    # Unassign roads
    db.query(Road).filter(Road.assigned_operator_id == id).update(
        {"assigned_operator_id": None}, synchronize_session=False
    )
    db.query(OperatorRoadAssignment).filter(OperatorRoadAssignment.operator_id == id).delete()
    db.commit()
    ttl_cache.invalidate()

    return {"message": f"All assignments removed for operator '{op.name}' in Supabase."}

