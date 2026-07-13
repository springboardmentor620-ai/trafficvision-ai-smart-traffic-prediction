from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.traffic import TrafficRecord
from sqlalchemy import desc

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(TrafficRecord).filter(
        TrafficRecord.user_id == current_user.id
    )

    total_records = query.count()

    high = query.filter(
        TrafficRecord.congestion_level == "High"
    ).count()

    medium = query.filter(
        TrafficRecord.congestion_level == "Medium"
    ).count()

    low = query.filter(
        TrafficRecord.congestion_level == "Low"
    ).count()

    avg_speed = db.query(
        func.avg(TrafficRecord.average_speed)
    ).filter(
        TrafficRecord.user_id == current_user.id
    ).scalar()

    avg_vehicle = db.query(
        func.avg(TrafficRecord.vehicle_count)
    ).filter(
        TrafficRecord.user_id == current_user.id
    ).scalar()

    return {
        "total_records": total_records,
        "high_congestion": high,
        "medium_congestion": medium,
        "low_congestion": low,
        "average_speed": round(avg_speed or 0, 2),
        "average_vehicle_count": round(avg_vehicle or 0, 2)
    }

@router.get("/top-roads")
def top_roads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    avg_vehicle = func.avg(TrafficRecord.vehicle_count).label("avg_vehicle_count")

    roads = (
        db.query(
            TrafficRecord.road_name,
            avg_vehicle
        )
        .filter(TrafficRecord.user_id == current_user.id)
        .group_by(TrafficRecord.road_name)
        .order_by(avg_vehicle.desc())
        .limit(5)
        .all()
    )

    return [
        {
            "road_name": road.road_name,
            "avg_vehicle_count": round(float(road.avg_vehicle_count), 2)
        }
        for road in roads
    ]

@router.get("/congestion-chart")
def congestion_chart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = (
        db.query(
            TrafficRecord.congestion_level,
            func.count(TrafficRecord.id).label("count")
        )
        .filter(TrafficRecord.user_id == current_user.id)
        .group_by(TrafficRecord.congestion_level)
        .all()
    )

    return [
        {
            "congestion_level": row.congestion_level,
            "count": row.count
        }
        for row in result
    ]

@router.get("/speed-analysis")
def speed_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = (
        db.query(
            TrafficRecord.road_name,
            func.avg(TrafficRecord.average_speed).label("average_speed")
        )
        .filter(TrafficRecord.user_id == current_user.id)
        .group_by(TrafficRecord.road_name)
        .all()
    )

    return [
        {
            "road_name": row.road_name,
            "average_speed": round(float(row.average_speed), 2)
        }
        for row in result
    ]

@router.get("/top-locations")
def top_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = (
        db.query(
            TrafficRecord.location,
            func.count(TrafficRecord.id).label("records")
        )
        .filter(TrafficRecord.user_id == current_user.id)
        .group_by(TrafficRecord.location)
        .order_by(func.count(TrafficRecord.id).desc())
        .all()
    )

    return [
        {
            "location": row.location,
            "records": row.records
        }
        for row in result
    ]