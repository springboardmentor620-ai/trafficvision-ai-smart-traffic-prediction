from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.zone import (
    ZoneCreate,
    ZoneUpdate,
    ZoneResponse,
)
from app.services.zone_service import ZoneService

router = APIRouter(
    prefix="/zones",
    tags=["Zones"],
)


@router.get("/", response_model=list[ZoneResponse])
def get_zones(db: Session = Depends(get_db)):
    return ZoneService.get_all(db)


@router.post("/", response_model=ZoneResponse)
def create_zone(
    zone: ZoneCreate,
    db: Session = Depends(get_db),
):
    return ZoneService.create(db, zone)


@router.put("/{zone_id}", response_model=ZoneResponse)
def update_zone(
    zone_id: int,
    zone: ZoneUpdate,
    db: Session = Depends(get_db),
):
    updated = ZoneService.update(
        db,
        zone_id,
        zone,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Zone not found",
        )

    return updated


@router.delete("/{zone_id}")
def delete_zone(
    zone_id: int,
    db: Session = Depends(get_db),
):
    deleted = ZoneService.delete(
        db,
        zone_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Zone not found",
        )

    return {
        "message": "Zone deleted successfully"
    }