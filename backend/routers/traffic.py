import warnings
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.traffic import Traffic
from services.ml_service import (
    predict_from_features,
    classify_congestion,
    get_recommendation,
    get_signal_recommendation,
    needs_police_deployment,
    get_feature_columns,
    get_categorical_columns,
    get_available_categories
)

warnings.filterwarnings("ignore")

router = APIRouter(
    prefix="/traffic",
    tags=["Traffic"]
)

# =====================================================
# Schemas
# =====================================================


class TrafficUpdate(BaseModel):
    """Update traffic record."""
    location: str
    vehicle_count: int
    congestion_level: str
    road_status: str


class TrafficPredictionRequest(BaseModel):
    """Traffic prediction with all 18 required features."""
    Latitude: float
    Longitude: float
    Speed: float
    Congestion_Level: int
    Weather: str
    Road_Name: str
    Traffic_Signal: int
    Accident: int
    Hour: int
    Day: int
    Month: int
    Year: int
    DayOfWeek: int
    Weekday: int
    IsWeekend: int
    PeakHour: int
    Minute: int
    TimeSlot: str


class TrafficResponse(BaseModel):
    """
    Standard traffic record response.

    IMPORTANT FIX:
    Every one of these fields is `nullable=True` on the Traffic
    model (see models/traffic.py). Pydantic/FastAPI validates the
    response against this schema BEFORE sending it — if even one
    row in the query result has a NULL in a field that was
    previously required (str/int/float, not Optional), the whole
    response raises a ResponseValidationError and FastAPI returns
    a 500 for the ENTIRE request, not just that row. With ~200
    rows fetched at once, hitting at least one NULL is close to
    guaranteed. Making these Optional (with default None) fixes
    that without changing anything about how populated rows look.

    Also added `weather`, `speed`, and `accident` — the frontend's
    Road Performance table (Analytics.jsx -> roadStats) reads these
    fields directly, but they were previously missing from this
    response entirely, so the Weather/Accident/Speed columns were
    silently always showing default/placeholder values.
    """
    id: int
    location: Optional[str] = None
    vehicle_count: Optional[int] = None
    congestion_level: Optional[str] = None
    road_status: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    weather: Optional[str] = None
    speed: Optional[float] = None
    accident: Optional[str] = None


# =====================================================
# Get All Traffic Records
# =====================================================


@router.get("/", response_model=list[TrafficResponse])
def get_all_traffic(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all traffic records with pagination."""
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
            "longitude": record.longitude,
            "weather": record.weather,
            "speed": record.speed,
            "accident": record.accident,
        }
        for record in records
    ]


# =====================================================
# Map Data API
# =====================================================


@router.get("/map", response_model=list[TrafficResponse])
def get_map_data(db: Session = Depends(get_db)):
    """Get traffic data for map visualization (100 most recent records)."""
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
            "longitude": record.longitude,
            "weather": record.weather,
            "speed": record.speed,
            "accident": record.accident,
        }
        for record in records
    ]


# =====================================================
# Traffic Trend API (Line Chart)
# =====================================================


@router.get("/trend")
def get_traffic_trend(db: Session = Depends(get_db)):
    """Get traffic trend data for line charts."""
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
def predict_traffic(request: TrafficPredictionRequest):
    """
    Predict traffic congestion with all features.

    Returns:
    - Vehicle count prediction
    - Congestion classification (Low/Moderate/High/Severe)
    - Text recommendation
    - Signal timing suggestion
    - Police deployment flag

    Args:
        request: All 18 required features

    Raises:
        HTTPException 400: Missing/invalid features
        HTTPException 500: Prediction error
    """
    try:
        # Convert request to dict
        features = request.model_dump()

        # Predict using ml_service
        prediction_result = predict_from_features(features)
        vehicle_count = prediction_result["prediction"]

        # Generate congestion classification
        congestion = classify_congestion(vehicle_count)

        # Generate text recommendation
        road_name = features.get("Road_Name", "Unknown Road")
        hour = features.get("Hour", 0)
        recommendation = get_recommendation(vehicle_count, road_name, hour)

        # Generate signal timing recommendation
        signal_timing = get_signal_recommendation(vehicle_count)

        # Check if police deployment is needed
        police_needed = needs_police_deployment(vehicle_count)

        return {
            "prediction": vehicle_count,
            "confidence": prediction_result["confidence"],
            "model_version": prediction_result["model_version"],
            "congestion": congestion,
            "recommendation": recommendation,
            "signal_timing": signal_timing,
            "police_deployment_needed": police_needed
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Prediction failed: {str(e)}")


# =====================================================
# Get Traffic By ID
# =====================================================


@router.get("/{traffic_id}", response_model=TrafficResponse)
def get_traffic_by_id(
    traffic_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific traffic record by ID."""
    record = (
        db.query(Traffic)
        .filter(Traffic.id == traffic_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Traffic record not found"
        )

    return {
        "id": record.id,
        "location": record.location,
        "vehicle_count": record.vehicle_count,
        "congestion_level": record.congestion_level,
        "road_status": record.road_status,
        "latitude": record.latitude,
        "longitude": record.longitude,
        "weather": record.weather,
        "speed": record.speed,
        "accident": record.accident,
    }


# =====================================================
# Update Traffic Record
# =====================================================


@router.put("/{traffic_id}")
def update_traffic(
    traffic_id: int,
    traffic_data: TrafficUpdate,
    db: Session = Depends(get_db)
):
    """Update a traffic record."""
    record = (
        db.query(Traffic)
        .filter(Traffic.id == traffic_id)
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
        "message": "Traffic record updated successfully",
        "id": record.id
    }


# =====================================================
# Delete Traffic Record
# =====================================================


@router.delete("/{traffic_id}")
def delete_traffic(
    traffic_id: int,
    db: Session = Depends(get_db)
):
    """Delete a traffic record."""
    record = (
        db.query(Traffic)
        .filter(Traffic.id == traffic_id)
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
        "message": "Traffic record deleted successfully",
        "id": traffic_id
    }
