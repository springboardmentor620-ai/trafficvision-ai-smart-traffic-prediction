from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.traffic import TrafficRecord
from app.schemas.traffic import (
    TrafficCreate,
    TrafficResponse,
    TrafficUpdate
)
from app.dependencies import (
    get_current_user,
    require_role
)
from app.models.user import User
from fastapi import HTTPException
from fastapi import Query

router = APIRouter(
    prefix="/traffic",
    tags=["Traffic Monitoring"]
)


@router.post("/", response_model=TrafficResponse)
def create_traffic(
    traffic: TrafficCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
    require_role("admin", "operator")
    )
):
    new_record = TrafficRecord(
    location=traffic.location,
    road_name=traffic.road_name,
    vehicle_count=traffic.vehicle_count,
    average_speed=traffic.average_speed,
    congestion_level=traffic.congestion_level,
    user_id=current_user.id
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return new_record


@router.get("/", response_model=List[TrafficResponse])
def get_all_traffic(
    location: Optional[str] = None,
    congestion_level: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(TrafficRecord).filter(
        TrafficRecord.user_id == current_user.id
    )

    if location:
        query = query.filter(
            TrafficRecord.location.ilike(f"%{location}%")
        )

    if congestion_level:
        query = query.filter(
            TrafficRecord.congestion_level == congestion_level
        )

    skip = (page - 1) * limit

    return query.offset(skip).limit(limit).all()

@router.get("/{traffic_id}", response_model=TrafficResponse)
def get_traffic(
    traffic_id: int,
    db: Session = Depends(get_db)
):
    traffic = db.query(TrafficRecord).filter(
        TrafficRecord.id == traffic_id
    ).first()

    if not traffic:
        raise HTTPException(
            status_code=404,
            detail="Traffic record not found"
        )

    return traffic


@router.put("/{traffic_id}", response_model=TrafficResponse)
def update_traffic(
    traffic_id: int,
    traffic: TrafficUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = (
        db.query(TrafficRecord)
        .filter(
            TrafficRecord.id == traffic_id,
            TrafficRecord.user_id == current_user.id
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Traffic record not found"
        )

    record.location = traffic.location
    record.road_name = traffic.road_name
    record.vehicle_count = traffic.vehicle_count
    record.average_speed = traffic.average_speed
    record.congestion_level = traffic.congestion_level

    db.commit()
    db.refresh(record)

    return record


@router.delete("/{traffic_id}")
def delete_traffic(
    traffic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(TrafficRecord).filter(
        TrafficRecord.id == traffic_id
    ).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Traffic record not found"
        )
    
    if record.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to delete this record"
        )

    db.delete(record)
    db.commit()

    return {
        "message": "Traffic record deleted successfully"
    }