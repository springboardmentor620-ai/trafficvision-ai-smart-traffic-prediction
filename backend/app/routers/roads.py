from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.road import (
    RoadCreate,
    RoadUpdate,
    RoadResponse,
)
from app.services.road_service import RoadService

router = APIRouter(
    prefix="/roads",
    tags=["Roads"],
)


@router.get("/", response_model=list[RoadResponse])
def get_roads(db: Session = Depends(get_db)):

    roads = RoadService.get_all(db)

    # Temporary seed if database is empty
    if len(roads) == 0:

        sample = [

            RoadCreate(
                name="100 Feet Road",
                city="Bengaluru",
                state="Karnataka",
                status="Heavy",
                speed_limit=60,
                latitude=12.9716,
                longitude=77.5946,
            ),

            RoadCreate(
                name="Marathahalli Bridge",
                city="Bengaluru",
                state="Karnataka",
                status="Moderate",
                speed_limit=50,
                latitude=12.9591,
                longitude=77.6974,
            ),

            RoadCreate(
                name="Hosur Road",
                city="Bengaluru",
                state="Karnataka",
                status="Normal",
                speed_limit=60,
                latitude=12.9177,
                longitude=77.6238,
            ),

            RoadCreate(
                name="Outer Ring Road",
                city="Bengaluru",
                state="Karnataka",
                status="Heavy",
                speed_limit=80,
                latitude=12.9352,
                longitude=77.6956,
            ),

        ]

        for road in sample:
            RoadService.create(db, road)

        roads = RoadService.get_all(db)

    return roads


@router.post("/", response_model=RoadResponse)
def create_road(
    road: RoadCreate,
    db: Session = Depends(get_db),
):

    return RoadService.create(db, road)


@router.put("/{road_id}", response_model=RoadResponse)
def update_road(
    road_id: int,
    road: RoadUpdate,
    db: Session = Depends(get_db),
):

    updated = RoadService.update(
        db,
        road_id,
        road,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Road not found",
        )

    return updated


@router.delete("/{road_id}")
def delete_road(
    road_id: int,
    db: Session = Depends(get_db),
):

    deleted = RoadService.delete(
        db,
        road_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Road not found",
        )

    return {
        "message": "Road deleted successfully"
    }