from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.traffic import Traffic
from app.schemas.traffic import TrafficResponse

router = APIRouter()


@router.get("/traffic", response_model=list[TrafficResponse])
def get_traffic(db: Session = Depends(get_db)):
    return db.query(Traffic).all()


@router.post("/traffic/seed")
def seed_traffic(db: Session = Depends(get_db)):
    if db.query(Traffic).count() > 0:
        return {"message": "Traffic data already exists"}

    sample_data = [
        Traffic(
            road="NH44",
            status="Heavy",
            vehicles=540,
            average_speed=22,
        ),
        Traffic(
            road="MG Road",
            status="Moderate",
            vehicles=310,
            average_speed=41,
        ),
        Traffic(
            road="Ring Road",
            status="Normal",
            vehicles=180,
            average_speed=64,
        ),
        Traffic(
            road="Airport Road",
            status="Heavy",
            vehicles=470,
            average_speed=27,
        ),
    ]

    db.add_all(sample_data)
    db.commit()

    return {"message": "Sample traffic data inserted"}