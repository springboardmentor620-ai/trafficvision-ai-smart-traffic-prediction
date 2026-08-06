import json
import warnings
from pathlib import Path
import joblib
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.traffic import Traffic

warnings.filterwarnings("ignore")

router = APIRouter(
    prefix="/traffic",
    tags=["Traffic"]
)

# =====================================================
# Load ML Model
# =====================================================
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml_models" / "traffic_prediction_model.pkl"
FEATURE_PATH = BASE_DIR / "ml_models" / "feature_columns.pkl"

model = joblib.load(MODEL_PATH)


feature_columns = joblib.load(FEATURE_PATH)


# =====================================================
# Schemas
# =====================================================


class TrafficUpdate(BaseModel):

    location: str

    vehicle_count: int

    congestion_level: str

    road_status: str


class PredictionRequest(BaseModel):

    junction: int

    hour: int

    day: int

    month: int

    weekday: int


# =====================================================
# Get All Traffic Records
# =====================================================


@router.get("/")
def get_all_traffic(

    skip: int = 0,

    limit: int = 50,

    db: Session = Depends(get_db)

):

    records = (

        db.query(Traffic)

        .offset(skip)

        .limit(limit)

        .all()

    )

    return [

        {

            "id": record.id,

            "location": record.location,

            "vehicle_count": record.vehicle_count,

            "congestion_level": record.congestion_level,

            "road_status": record.road_status,

            "latitude": record.latitude,

            "longitude": record.longitude

        }

        for record in records

    ]


# =====================================================
# Map Data API
# =====================================================


@router.get("/map")
def get_map_data(

    db: Session = Depends(get_db)

):

    records = (

        db.query(Traffic)

        .order_by(Traffic.id.desc())

        .limit(100)

        .all()

    )

    return [

        {

            "id": record.id,

            "location": record.location,

            "vehicle_count": record.vehicle_count,

            "congestion_level": record.congestion_level,

            "road_status": record.road_status,

            "latitude": record.latitude,

            "longitude": record.longitude

        }

        for record in records

    ]


# =====================================================
# Traffic Trend API (Line Chart)
# =====================================================


@router.get("/trend")
def get_traffic_trend(

    db: Session = Depends(get_db)

):

    traffic_data = (

        db.query(Traffic)

        .order_by(Traffic.id)

        .limit(20)

        .all()

    )

    result = []

    for traffic in traffic_data:

        result.append(

            {

                "time": str(traffic.id),

                "vehicles": traffic.vehicle_count

            }

        )

    return result


# =====================================================
# AI Traffic Prediction API
# =====================================================


@router.post("/predict")
def predict_traffic(

    request: PredictionRequest

):

    input_data = np.zeros(

        len(feature_columns)

    )

    # Time features

    if "hour" in feature_columns:

        input_data[
            feature_columns.index("hour")
        ] = request.hour

    if "day" in feature_columns:

        input_data[
            feature_columns.index("day")
        ] = request.day

    if "month" in feature_columns:

        input_data[
            feature_columns.index("month")
        ] = request.month

    if "weekday" in feature_columns:

        input_data[
            feature_columns.index("weekday")
        ] = request.weekday

    # Junction one hot encoding

    junction_column = (

        "Junction_"

        + str(request.junction)

    )

    if junction_column in feature_columns:

        input_data[
            feature_columns.index(junction_column)
        ] = 1

    prediction = model.predict(

        [input_data]

    )

    predicted_vehicle = round(

        prediction[0]

    )

    if predicted_vehicle < 50:
        congestion = "Low"
        status_msg = "Traffic is Normal"
    elif predicted_vehicle < 150:
        congestion = "Medium"
        status_msg = "Moderate Traffic Expected"
    else:
        congestion = "High"
        status_msg = "Heavy Traffic Expected"

    return {
        "predicted_vehicle_count": predicted_vehicle,
        "congestion_level": congestion,
        "traffic_status": status_msg
    }


# =====================================================
# Get Traffic By ID
# =====================================================


@router.get("/{traffic_id}")
def get_traffic_by_id(

    traffic_id: int,

    db: Session = Depends(get_db)

):

    record = (

        db.query(Traffic)

        .filter(
            Traffic.id == traffic_id
        )

        .first()

    )

    if not record:

        raise HTTPException(

            status_code=404,

            detail="Traffic record not found"

        )

    return record


# =====================================================
# Update Traffic Record
# =====================================================


@router.put("/{traffic_id}")
def update_traffic(

    traffic_id: int,

    traffic_data: TrafficUpdate,

    db: Session = Depends(get_db)

):

    record = (

        db.query(Traffic)

        .filter(
            Traffic.id == traffic_id
        )

        .first()

    )

    if not record:

        raise HTTPException(

            status_code=404,

            detail="Traffic record not found"

        )

    record.location = traffic_data.location

    record.vehicle_count = traffic_data.vehicle_count

    record.congestion_level = traffic_data.congestion_level

    record.road_status = traffic_data.road_status

    db.commit()

    return {

        "message":
        "Traffic record updated successfully"

    }


# =====================================================
# Delete Traffic Record
# =====================================================


@router.delete("/{traffic_id}")
def delete_traffic(

    traffic_id: int,

    db: Session = Depends(get_db)

):

    record = (

        db.query(Traffic)

        .filter(
            Traffic.id == traffic_id
        )

        .first()

    )

    if not record:

        raise HTTPException(

            status_code=404,

            detail="Traffic record not found"

        )

    db.delete(record)

    db.commit()

    return {

        "message":
        "Traffic record deleted successfully"

    }
