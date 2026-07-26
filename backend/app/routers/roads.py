from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Union, Dict, Any

from app.database.session import get_db
from app.middleware.dependencies import require_roles
from app.repositories.road_repository import RoadRepository
from app.schemas.road import CreateRoadSchema, UpdateRoadSchema, RoadResponseSchema, PaginatedRoadsResponse

router = APIRouter(
    prefix="/roads",
    tags=["Road Corridor Management"],
    dependencies=[Depends(require_roles(["Admin", "Operator"]))]
)

from app.utils.cache import ttl_cache

@router.get("", response_model=Union[PaginatedRoadsResponse, List[RoadResponseSchema]])
def get_roads(
    search: Optional[str] = Query(None, description="Search query for road name, code, or zone"),
    zone: Optional[str] = Query(None, description="Filter by zone name"),
    status: Optional[str] = Query(None, description="Filter by status: Active, Closed, Maintenance, Archived"),
    sort_by: Optional[str] = Query("id", description="Field to sort by: id, road_name, road_code, zone, status, created_at"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc or desc"),
    page: Optional[int] = Query(None, ge=1, description="Page number for pagination"),
    limit: Optional[int] = Query(None, ge=1, description="Items per page limit"),
    db: Session = Depends(get_db)
):
    """
    GET /api/v1/roads
    Fetch all roads or paginated filtered list with 5-minute TTL cache for full list.
    """
    if not search and not zone and not status and not page and not limit:
        cache_key = f"roads_all_{sort_by}_{sort_order}"
        cached = ttl_cache.get(cache_key)
        if cached:
            return cached
        res = RoadRepository.get_all_roads(
            db,
            search=search,
            zone=zone,
            status_filter=status,
            sort_by=sort_by or "id",
            sort_order=sort_order or "asc",
            page=page,
            limit=limit
        )
        ttl_cache.set(cache_key, res, ttl_seconds=300)
        return res

    return RoadRepository.get_all_roads(
        db,
        search=search,
        zone=zone,
        status_filter=status,
        sort_by=sort_by or "id",
        sort_order=sort_order or "asc",
        page=page,
        limit=limit
    )

@router.get("/{id}", response_model=RoadResponseSchema)
def get_road(id: int, db: Session = Depends(get_db)):
    """
    GET /api/v1/roads/{id}
    Retrieve details for a specific road corridor.
    """
    road = RoadRepository.get_road_by_id(db, id)
    if not road:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Road corridor with ID {id} not found."
        )
    return road

@router.post("", response_model=RoadResponseSchema, status_code=status.HTTP_201_CREATED)
def create_road(payload: CreateRoadSchema, db: Session = Depends(get_db)):
    """
    POST /api/v1/roads
    Create a new road corridor in Supabase with duplicate checks.
    """
    if RoadRepository.check_duplicate_name(db, payload.road_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Road Name '{payload.road_name}' already exists. Road names must be unique."
        )
    if payload.road_code and RoadRepository.check_duplicate_code(db, payload.road_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Road Code '{payload.road_code}' already exists. Road codes must be unique."
        )

    return RoadRepository.create_road(db, payload.dict())

@router.put("/{id}", response_model=RoadResponseSchema)
def update_road(id: int, payload: UpdateRoadSchema, db: Session = Depends(get_db)):
    """
    PUT /api/v1/roads/{id}
    Update an existing road corridor.
    """
    existing = RoadRepository.get_road_by_id(db, id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Road corridor with ID {id} not found."
        )

    data = payload.dict(exclude_unset=True)
    if "road_name" in data and data["road_name"]:
        if RoadRepository.check_duplicate_name(db, data["road_name"], exclude_id=id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Road Name '{data['road_name']}' is already used by another corridor."
            )
    if "road_code" in data and data["road_code"]:
        if RoadRepository.check_duplicate_code(db, data["road_code"], exclude_id=id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Road Code '{data['road_code']}' is already used by another corridor."
            )

    return RoadRepository.update_road(db, id, data)

@router.put("/{id}/archive", response_model=RoadResponseSchema)
def archive_road(id: int, db: Session = Depends(get_db)):
    """
    PUT /api/v1/roads/{id}/archive
    Archive a road corridor (set status to 'Archived').
    """
    archived = RoadRepository.archive_road(db, id)
    if not archived:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Road corridor with ID {id} not found."
        )
    return archived

@router.put("/{id}/restore", response_model=RoadResponseSchema)
def restore_road(id: int, db: Session = Depends(get_db)):
    """
    PUT /api/v1/roads/{id}/restore
    Restore an archived road corridor (set status back to 'Active').
    """
    restored = RoadRepository.restore_road(db, id)
    if not restored:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Road corridor with ID {id} not found."
        )
    return restored

@router.delete("/{id}")
def delete_road(id: int, db: Session = Depends(get_db)):
    """
    DELETE /api/v1/roads/{id}
    Delete a road corridor.
    """
    success = RoadRepository.delete_road(db, id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Road corridor with ID {id} not found."
        )
    return {"message": f"Road corridor {id} deleted successfully."}
