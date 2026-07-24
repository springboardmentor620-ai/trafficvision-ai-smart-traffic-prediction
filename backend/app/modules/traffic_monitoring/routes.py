from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.user_management.dependencies import get_current_user, require_role
from app.modules.user_management.models import User
from app.modules.traffic_monitoring import services
from app.modules.traffic_monitoring.schemas import (
    RoadCreate,
    RoadResponse,
    TrafficReadingCreate,
    TrafficReadingResponse,
    LiveMonitoringSummary,
    LiveRoadStatus,
    RoadUtilization,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# ROAD MANAGEMENT (admin / traffic_operator only)
# ---------------------------------------------------------------------------

@router.post("/monitoring/roads", response_model=RoadResponse, status_code=status.HTTP_201_CREATED)
def create_road(
    payload: RoadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "traffic_operator"])),
):
    road = services.create_road(
        db,
        name=payload.name,
        zone=payload.zone,
        latitude=payload.latitude,
        longitude=payload.longitude,
        capacity=payload.capacity,
    )
    return road


@router.get("/monitoring/roads", response_model=list[RoadResponse])
def list_roads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return services.get_all_roads(db)


# ---------------------------------------------------------------------------
# TRAFFIC READINGS (ingest data — admin / traffic_operator only)
# ---------------------------------------------------------------------------

@router.post("/monitoring/readings", response_model=TrafficReadingResponse, status_code=status.HTTP_201_CREATED)
def submit_traffic_reading(
    payload: TrafficReadingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "traffic_operator"])),
):
    try:
        return services.record_traffic_reading(
            db,
            road_id=payload.road_id,
            vehicle_count=payload.vehicle_count,
            avg_speed_kmph=payload.avg_speed_kmph,
        )
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.post("/monitoring/readings/simulate", response_model=list[TrafficReadingResponse])
def simulate_readings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "traffic_operator"])),
):
    """
    Development helper: generates a random reading for every road so the
    dashboard has live data before real sensors are wired in.
    Call this repeatedly (e.g. every few seconds) to simulate a live feed.
    """
    return services.simulate_readings_for_all_roads(db)


@router.get("/monitoring/roads/{road_id}/history", response_model=list[TrafficReadingResponse])
def get_road_history(
    road_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    road = services.get_road_by_id(db, road_id)
    if not road:
        raise HTTPException(404, "Road not found")
    return services.get_reading_history(db, road_id, limit)


# ---------------------------------------------------------------------------
# LIVE MONITORING SNAPSHOT (what the dashboard calls)
# ---------------------------------------------------------------------------

@router.get("/monitoring/live", response_model=LiveMonitoringSummary)
def get_live_monitoring(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns every road with its most recent reading, plus aggregate stats
    for the dashboard's stat cards (total vehicles, congestion breakdown).
    Any authenticated role (admin, traffic_operator, public) can view this.
    """
    roads = services.get_all_roads(db)
    latest_by_road = services.get_latest_reading_per_road(db)

    roads_by_level = {"low": 0, "moderate": 0, "high": 0, "severe": 0}
    total_vehicles = 0
    road_statuses: list[LiveRoadStatus] = []

    for road in roads:
        reading = latest_by_road.get(road.id)
        status_entry = LiveRoadStatus(
            road_id=road.id,
            road_name=road.name,
            zone=road.zone,
            latitude=road.latitude,
            longitude=road.longitude,
        )
        if reading:
            status_entry.vehicle_count = reading.vehicle_count
            status_entry.avg_speed_kmph = reading.avg_speed_kmph
            status_entry.congestion_level = reading.congestion_level
            status_entry.recorded_at = reading.recorded_at
            roads_by_level[reading.congestion_level.value] += 1
            total_vehicles += reading.vehicle_count

        road_statuses.append(status_entry)

    return LiveMonitoringSummary(
        total_roads=len(roads),
        total_vehicles=total_vehicles,
        roads_by_level=roads_by_level,
        roads=road_statuses,
    )
@router.get("/monitoring/utilization", response_model=list[RoadUtilization])
def get_road_utilization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns every road's utilization percentage (vehicle count vs capacity),
    ranked from most to least utilized.
    """
    return services.get_road_utilization(db)
@router.delete("/monitoring/roads/{road_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_road(
    road_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "traffic_operator"])),
):
    road = services.get_road_by_id(db, road_id)
    if not road:
        raise HTTPException(404, "Road not found")
    db.delete(road)
    db.commit()
    return None
from app.modules.traffic_monitoring.schemas import RoadCreate as RoadUpdate  # reuse same shape for updates


@router.put("/monitoring/roads/{road_id}", response_model=RoadResponse)
def update_road(
    road_id: int,
    payload: RoadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "traffic_operator"])),
):
    road = services.get_road_by_id(db, road_id)
    if not road:
        raise HTTPException(404, "Road not found")

    road.name = payload.name
    road.zone = payload.zone
    road.latitude = payload.latitude
    road.longitude = payload.longitude
    road.capacity = payload.capacity
    db.commit()
    db.refresh(road)
    return road