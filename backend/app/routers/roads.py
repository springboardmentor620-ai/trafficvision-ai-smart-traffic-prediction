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

    # Seed comprehensive major corridors if less than 16 records
    if len(roads) < 16:
        existing_names = {r.name.lower() for r in roads}
        sample = [
            RoadCreate(
                name="100 Feet Road (Indiranagar)",
                city="Bengaluru",
                state="Karnataka",
                status="Heavy",
                speed_limit=60,
                latitude=12.9716,
                longitude=77.6412,
            ),
            RoadCreate(
                name="Marathahalli Bridge (ORR)",
                city="Bengaluru",
                state="Karnataka",
                status="Moderate",
                speed_limit=50,
                latitude=12.9591,
                longitude=77.6974,
            ),
            RoadCreate(
                name="Hosur Road Express (Silk Board)",
                city="Bengaluru",
                state="Karnataka",
                status="Heavy",
                speed_limit=80,
                latitude=12.9177,
                longitude=77.6238,
            ),
            RoadCreate(
                name="Outer Ring Road (ORR Bellandur)",
                city="Bengaluru",
                state="Karnataka",
                status="Heavy",
                speed_limit=80,
                latitude=12.9352,
                longitude=77.6956,
            ),
            RoadCreate(
                name="M.G. Road Central",
                city="Bengaluru",
                state="Karnataka",
                status="Heavy",
                speed_limit=50,
                latitude=12.9756,
                longitude=77.6066,
            ),
            RoadCreate(
                name="Old Airport Road",
                city="Bengaluru",
                state="Karnataka",
                status="Moderate",
                speed_limit=60,
                latitude=12.9597,
                longitude=77.6580,
            ),
            RoadCreate(
                name="Bellary Road (Hebbal / Airport Link)",
                city="Bengaluru",
                state="Karnataka",
                status="Normal",
                speed_limit=80,
                latitude=13.0358,
                longitude=77.5970,
            ),
            RoadCreate(
                name="Sarjapur Main Road",
                city="Bengaluru",
                state="Karnataka",
                status="Heavy",
                speed_limit=50,
                latitude=12.9105,
                longitude=77.6850,
            ),
            RoadCreate(
                name="Bannerghatta Road",
                city="Bengaluru",
                state="Karnataka",
                status="Moderate",
                speed_limit=50,
                latitude=12.8950,
                longitude=77.5980,
            ),
            RoadCreate(
                name="Tumkur Road (Yeshwanthpur)",
                city="Bengaluru",
                state="Karnataka",
                status="Normal",
                speed_limit=70,
                latitude=13.0238,
                longitude=77.5529,
            ),
            RoadCreate(
                name="Kanakapura Metro Road",
                city="Bengaluru",
                state="Karnataka",
                status="Normal",
                speed_limit=60,
                latitude=12.8870,
                longitude=77.5550,
            ),
            RoadCreate(
                name="Whitefield Main Road (ITPL)",
                city="Bengaluru",
                state="Karnataka",
                status="Moderate",
                speed_limit=50,
                latitude=12.9698,
                longitude=77.7499,
            ),
            RoadCreate(
                name="Koramangala 80 Feet Road",
                city="Bengaluru",
                state="Karnataka",
                status="Moderate",
                speed_limit=50,
                latitude=12.9352,
                longitude=77.6245,
            ),
            RoadCreate(
                name="Electronic City Phase 1 Toll",
                city="Bengaluru",
                state="Karnataka",
                status="Normal",
                speed_limit=80,
                latitude=12.8458,
                longitude=77.6602,
            ),
            RoadCreate(
                name="Majestic Central Station Interchange",
                city="Bengaluru",
                state="Karnataka",
                status="Heavy",
                speed_limit=40,
                latitude=12.9767,
                longitude=77.5713,
            ),
            RoadCreate(
                name="Jayanagar 4th Block Complex",
                city="Bengaluru",
                state="Karnataka",
                status="Normal",
                speed_limit=50,
                latitude=12.9250,
                longitude=77.5938,
            ),
            RoadCreate(
                name="HSR Layout 27th Main",
                city="Bengaluru",
                state="Karnataka",
                status="Moderate",
                speed_limit=50,
                latitude=12.9121,
                longitude=77.6446,
            ),
            RoadCreate(
                name="CMH Road (Indiranagar Metro)",
                city="Bengaluru",
                state="Karnataka",
                status="Normal",
                speed_limit=50,
                latitude=12.9785,
                longitude=77.6380,
            ),
        ]

        for road in sample:
            if road.name.lower() not in existing_names:
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