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
    zones = ZoneService.get_all(db)
    if len(zones) == 0:
        sample_zones = [
            ZoneCreate(
                name="Central Business District (CBD)",
                city="Bengaluru",
                state="Karnataka",
                status="Heavy",
                roads=14,
            ),
            ZoneCreate(
                name="East IT Corridor (Whitefield & Bellandur)",
                city="Bengaluru",
                state="Karnataka",
                status="Heavy",
                roads=22,
            ),
            ZoneCreate(
                name="South Tech Corridor (Electronic City & Silk Board)",
                city="Bengaluru",
                state="Karnataka",
                status="Moderate",
                roads=18,
            ),
            ZoneCreate(
                name="North Airport Transit Zone (Hebbal & Yelahanka)",
                city="Bengaluru",
                state="Karnataka",
                status="Normal",
                roads=12,
            ),
            ZoneCreate(
                name="West Industrial Sector (Peenya & Yeshwanthpur)",
                city="Bengaluru",
                state="Karnataka",
                status="Normal",
                roads=10,
            ),
            ZoneCreate(
                name="Southeast Hub (HSR Layout & Sarjapur)",
                city="Bengaluru",
                state="Karnataka",
                status="Moderate",
                roads=16,
            ),
            ZoneCreate(
                name="Southwest Residential Belt (Jayanagar & JP Nagar)",
                city="Bengaluru",
                state="Karnataka",
                status="Normal",
                roads=11,
            ),
            ZoneCreate(
                name="Metro Arterial Belt (Indiranagar & MG Road)",
                city="Bengaluru",
                state="Karnataka",
                status="Heavy",
                roads=15,
            ),
        ]
        for z in sample_zones:
            ZoneService.create(db, z)
        zones = ZoneService.get_all(db)
    return zones


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