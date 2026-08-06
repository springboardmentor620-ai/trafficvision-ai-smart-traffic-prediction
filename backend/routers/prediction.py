"""
Prediction Router — Uses trained Random Forest ML model for traffic predictions.
Stores prediction records in MySQL database.
"""
import warnings
from datetime import datetime
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models.prediction import Prediction

warnings.filterwarnings("ignore")

router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)

# ============================================================================
# ML Model Loading with Error Handling
# ============================================================================
BASE_DIR = Path(__file__).resolve().parent.parent
ML_DIR = BASE_DIR / "ml_models"
print("BASE_DIR =", BASE_DIR)
print("ML_DIR =", ML_DIR)
print("Model exists:", (ML_DIR / "traffic_prediction_model.pkl").exists())

try:
    model = joblib.load(ML_DIR / "traffic_prediction_model.pkl")
    label_encoders = joblib.load(ML_DIR / "label_encoders.pkl")
    feature_columns = joblib.load(ML_DIR / "feature_columns.pkl")
except FileNotFoundError as e:
    raise RuntimeError(f"ML model files not found in {ML_DIR}: {e}")
except Exception as e:
    raise RuntimeError(f"Error loading ML model files: {e}")

# ============================================================================
# Pydantic Models
# ============================================================================


class PredictInput(BaseModel):
    """Request body for traffic prediction."""
    Road_Name: str = Field(..., description="Name of the road/highway")
    Weather: str = Field(...,
                         description="Weather condition (e.g., Clear, Rainy)")
    Traffic_Signal: str = Field(..., description="Traffic signal status")
    Accident: str = Field(..., description="Accident status (Yes/No)")
    Hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    Minute: int = Field(..., ge=0, le=59,
                        description="Minute of the hour (0-59)")
    Day: int = Field(..., ge=1, le=31, description="Day of the month")
    Month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    Weekday: int = Field(..., ge=0, le=6,
                         description="Day of week (0=Monday, 6=Sunday)")
    IsWeekend: int = Field(..., ge=0, le=1,
                           description="Is weekend (0=No, 1=Yes)")
    PeakHour: str = Field(...,
                          description="Peak hour status (e.g., Peak, Non-Peak)")
    TimeSlot: str = Field(...,
                          description="Time slot (e.g., Morning, Evening)")


class PredictionResponse(BaseModel):
    """Response model for prediction."""
    status: str
    prediction: dict
    timestamp: Optional[str] = None


# ============================================================================
# Helper Functions
# ============================================================================
def get_congestion_level(vehicle_count: float) -> str:
    """Map vehicle count to congestion level."""
    if vehicle_count <= 100:
        return "Low"
    elif vehicle_count <= 300:
        return "Moderate"
    elif vehicle_count <= 600:
        return "High"
    else:
        return "Severe"


def get_estimated_speed(congestion_level: str) -> float:
    """Map congestion level to estimated speed in km/h."""
    speed_map = {
        "Low": 70.0,
        "Moderate": 50.0,
        "High": 30.0,
        "Severe": 15.0
    }
    return speed_map.get(congestion_level, 50.0)


def get_estimated_delay(congestion_level: str) -> int:
    """Map congestion level to estimated delay in minutes."""
    delay_map = {
        "Low": 0,
        "Moderate": 5,
        "High": 15,
        "Severe": 30
    }
    return delay_map.get(congestion_level, 0)


def get_alternate_route(road_name: str, congestion_level: str) -> str:
    """Get alternate route recommendation based on congestion."""
    alternate_routes = {
        "Hitech City": "Madhapur",
        "Miyapur": "Kukatpally",
        "Tank Bund": "Necklace Road",
        "Abids Road": "Koti Road",
        "Banjara Hills Rd 1": "Jubilee Hills Road"
    }

    # Recommend alternate route only for High or Severe congestion
    if congestion_level in ["High", "Severe"]:
        return alternate_routes.get(road_name, "Current Route Recommended")
    else:
        return "Current Route Recommended"


# ============================================================================
# API Endpoints
# ============================================================================
@router.post("/predict", response_model=PredictionResponse, status_code=200)
def predict_traffic(
    input_data: PredictInput,
    db: Session = Depends(get_db)
):
    """
    Predict vehicle count, congestion level, and traffic metrics.

    Accepts JSON body with traffic parameters. Uses trained Random Forest model
    to predict vehicle count and generates congestion level, estimated speed,
    estimated delay, and route recommendations. Saves prediction to MySQL.

    **Request Body:**
    - Road_Name: str
    - Weather: str
    - Traffic_Signal: str
    - Accident: str
    - Hour: int (0-23)
    - Minute: int (0-59)
    - Day: int (1-31)
    - Month: int (1-12)
    - Weekday: int (0-6)
    - IsWeekend: int (0-1)
    - PeakHour: str
    - TimeSlot: str

    **Returns:**
    - status: "success" or "error"
    - prediction: Dict with vehicle count, congestion, speed, delay, recommendations
    """
    try:
        # Get current time for defaults
        now = datetime.now()

        # Prepare data dictionary from input
        data = input_data.dict()

        # ====================================================================
        # Encode Categorical Columns
        # ====================================================================
        categorical_cols = [
            "Road_Name",
            "Weather",
            "Traffic_Signal",
            "Accident",
            "PeakHour",
            "TimeSlot"
        ]

        for col in categorical_cols:
            if col not in label_encoders:
                raise ValueError(f"Label encoder not found for column: {col}")

            try:
                encoded_val = label_encoders[col].transform([data[col]])[0]
                data[col] = int(encoded_val)
            except ValueError as e:
                raise ValueError(f"Unknown value for {col}: {data[col]}. {e}")

        # ====================================================================
        # Create DataFrame and Filter by Feature Columns
        # ====================================================================
        df_input = pd.DataFrame([data])

        # Verify all feature columns exist
        missing_cols = set(feature_columns) - set(df_input.columns)
        if missing_cols:
            raise ValueError(f"Missing feature columns: {missing_cols}")

        df_input = df_input[feature_columns]

        # ====================================================================
        # Make Prediction
        # ====================================================================
        if model is None:
            raise RuntimeError("ML model not loaded properly")

        try:
            predicted_vehicle_count = float(model.predict(df_input)[0])
        except Exception as e:
            raise RuntimeError(f"Error during model prediction: {e}")

        # Ensure non-negative prediction
        predicted_vehicle_count = max(0.0, predicted_vehicle_count)

        # ====================================================================
        # Generate Metrics
        # ====================================================================
        congestion_level = get_congestion_level(predicted_vehicle_count)
        estimated_speed = get_estimated_speed(congestion_level)
        estimated_delay = get_estimated_delay(congestion_level)
        alternate_route = get_alternate_route(
            input_data.Road_Name, congestion_level
        )

        # ====================================================================
        # Save to MySQL Database
        # ====================================================================
        try:
            pred_date = datetime(
                now.year, input_data.Month, input_data.Day
            ).date()
        except ValueError:
            pred_date = now.date()

        prediction_record = Prediction(
            prediction_date=pred_date,
            hour=input_data.Hour,
            road_name=input_data.Road_Name,
            weather=input_data.Weather,
            traffic_signal=input_data.Traffic_Signal,
            accident=input_data.Accident,
            predicted_vehicle_count=round(predicted_vehicle_count, 2),
            congestion_level=congestion_level,
            estimated_speed=estimated_speed,
            estimated_delay=estimated_delay,
            recommendation=alternate_route,
            alternate_route=alternate_route if congestion_level in [
                "High", "Severe"
            ] else None
        )

        db.add(prediction_record)
        db.commit()
        db.refresh(prediction_record)

        # ====================================================================
        # Return Response
        # ====================================================================
        return PredictionResponse(
            status="success",
            prediction={
                "id": prediction_record.id,
                "road_name": input_data.Road_Name,
                "weather": input_data.Weather,
                "traffic_signal": input_data.Traffic_Signal,
                "accident": input_data.Accident,
                "predicted_vehicle_count": round(predicted_vehicle_count, 2),
                "congestion_level": congestion_level,
                "estimated_speed": estimated_speed,
                "estimated_delay": estimated_delay,
                "recommendation": alternate_route,
                "alternate_route": alternate_route if congestion_level in [
                    "High", "Severe"
                ] else None,
                "prediction_date": str(pred_date),
                "hour": input_data.Hour,
                "created_at": prediction_record.created_at.isoformat(
                ) if prediction_record.created_at else None
            },
            timestamp=datetime.now().isoformat()
        )

    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input: {str(e)}"
        )
    except RuntimeError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


@router.get("/history")
def prediction_history(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get recent predictions from the database.

    **Query Parameters:**
    - limit: int (default: 50) - Maximum number of recent predictions to return

    **Returns:**
    - List of prediction records sorted by most recent first
    """
    try:
        records = db.query(Prediction).order_by(
            Prediction.created_at.desc()
        ).limit(limit).all()

        return {
            "status": "success",
            "count": len(records),
            "predictions": [
                {
                    "id": r.id,
                    "prediction_date": str(r.prediction_date) if r.prediction_date else None,
                    "hour": r.hour,
                    "road_name": r.road_name,
                    "weather": r.weather,
                    "traffic_signal": r.traffic_signal,
                    "accident": r.accident,
                    "predicted_vehicle_count": r.predicted_vehicle_count,
                    "congestion_level": r.congestion_level,
                    "estimated_speed": r.estimated_speed,
                    "estimated_delay": r.estimated_delay,
                    "recommendation": r.recommendation,
                    "alternate_route": r.alternate_route,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                    "updated_at": r.updated_at.isoformat() if r.updated_at else None
                }
                for r in records
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving history: {str(e)}"
        )
