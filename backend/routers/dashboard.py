from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.traffic import Traffic


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/analytics")
def get_analytics(

    db: Session = Depends(get_db)

):

    records = db.query(Traffic).all()

    total_records = len(records)

    total_vehicles = sum(

        r.vehicle_count

        for r in records

    )

    high = 0

    medium = 0

    low = 0

    locations = []

    for r in records:

        if r.congestion_level == "High":

            high += 1

        elif r.congestion_level == "Medium":

            medium += 1

        else:

            low += 1

        locations.append({

            "location": r.location,

            "vehicles": r.vehicle_count

        })

    return {


        "total_records": total_records,


        "total_vehicles": total_vehicles,


        "high": high,


        "medium": medium,


        "low": low,


        "locations": locations[:20]


    }
