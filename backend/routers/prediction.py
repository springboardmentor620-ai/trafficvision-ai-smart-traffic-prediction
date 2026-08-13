"""
Traffic Prediction Router

Uses the trained Random Forest model for traffic prediction.

ML files required:
backend/ml_models/
    traffic_model.pkl
    label_encoders.pkl
    feature_columns.json
"""

import csv
import io
import json
import warnings

from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models.prediction import Prediction


warnings.filterwarnings("ignore")


# ============================================================================
# ROUTER
# ============================================================================

router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


# ============================================================================
# ML MODEL PATHS
# ============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent

ML_DIR = BASE_DIR / "ml_models"

MODEL_PATH = ML_DIR / "traffic_model.pkl"
ENCODER_PATH = ML_DIR / "label_encoders.pkl"
FEATURE_PATH = ML_DIR / "feature_columns.json"


print("=" * 70)
print("TRAFFIC PREDICTION MODEL")
print("=" * 70)
print("BASE_DIR :", BASE_DIR)
print("ML_DIR   :", ML_DIR)
print("MODEL    :", MODEL_PATH)
print("ENCODER  :", ENCODER_PATH)
print("FEATURES :", FEATURE_PATH)
print("=" * 70)


# ============================================================================
# LOAD MODEL ARTIFACTS
# ============================================================================

_model = None
_label_encoders = None
_feature_columns = None

_model_loaded = False
_load_error = None


def load_model_artifacts():
    """
    Load ML model artifacts with error handling.
    """

    global _model
    global _label_encoders
    global _feature_columns
    global _model_loaded
    global _load_error

    if _model_loaded:
        return _model is not None

    try:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model file not found: {MODEL_PATH}"
            )

        if not ENCODER_PATH.exists():
            raise FileNotFoundError(
                f"Label encoder file not found: {ENCODER_PATH}"
            )

        if not FEATURE_PATH.exists():
            raise FileNotFoundError(
                f"Feature columns file not found: {FEATURE_PATH}"
            )

        _model = joblib.load(MODEL_PATH)

        _label_encoders = joblib.load(
            ENCODER_PATH
        )

        with open(
            FEATURE_PATH,
            "r",
            encoding="utf-8"
        ) as f:
            _feature_columns = json.load(f)

        if not isinstance(
            _feature_columns,
            list
        ):
            raise ValueError(
                "feature_columns.json must contain a list."
            )

        print("Model loaded successfully.")

        print("Model feature columns:")

        for feature in _feature_columns:
            print("  -", feature)

        print("Categorical encoders:")
        print(
            list(
                _label_encoders.keys()
            )
        )

        print("=" * 70)

        _model_loaded = True

        return True

    except Exception as e:

        _load_error = str(e)

        print(
            f"Warning: Failed to load ML model artifacts: {e}"
        )

        print(
            "Prediction endpoints will return fallback responses."
        )

        print("=" * 70)

        _model_loaded = True

        return False


# ============================================================================
# PYDANTIC INPUT
# ============================================================================

class PredictInput(BaseModel):
    """
    Input received from Prediction.jsx.
    """

    Road_Name: str = Field(
        ...,
        min_length=1,
        description="Hyderabad road name"
    )

    Weather: str = Field(
        ...,
        min_length=1,
        description="Weather condition"
    )

    Traffic_Signal: str = Field(
        ...,
        min_length=1,
        description="Traffic signal"
    )

    Accident: str = Field(
        ...,
        min_length=1,
        description="Accident status"
    )

    Hour: int = Field(
        ...,
        ge=0,
        le=23
    )

    Minute: int = Field(
        ...,
        ge=0,
        le=59
    )

    Day: int = Field(
        ...,
        ge=1,
        le=31
    )

    Month: int = Field(
        ...,
        ge=1,
        le=12
    )

    Weekday: int = Field(
        ...,
        ge=0,
        le=6
    )

    IsWeekend: int = Field(
        ...,
        ge=0,
        le=1
    )

    PeakHour: int = Field(
        ...,
        ge=0,
        le=1
    )

    TimeSlot: str = Field(
        ...,
        min_length=1
    )


# ============================================================================
# RESPONSE
# ============================================================================

class PredictionResponse(BaseModel):

    status: str

    prediction: dict

    timestamp: Optional[str] = None


# ============================================================================
# HELPERS
# ============================================================================

def normalize_text(value):

    if value is None:
        return ""

    return str(value).strip()


# ============================================================================
# CONGESTION
# ============================================================================

def get_congestion_level(
    vehicle_count: float
) -> str:

    vehicle_count = float(
        vehicle_count
    )

    if vehicle_count < 100:
        return "Low"

    elif vehicle_count < 250:
        return "Moderate"

    elif vehicle_count < 450:
        return "High"

    else:
        return "Severe"


# ============================================================================
# SPEED
# ============================================================================

def get_estimated_speed(
    vehicle_count: float,
    congestion_level: str
) -> float:

    vehicle_count = float(
        vehicle_count
    )

    if congestion_level == "Low":

        if vehicle_count < 50:
            return 50.0

        return 45.0

    if congestion_level == "Moderate":

        if vehicle_count < 180:
            return 38.0

        return 32.0

    if congestion_level == "High":

        if vehicle_count < 350:
            return 27.0

        return 22.0

    if vehicle_count < 550:
        return 18.0

    return 14.0


# ============================================================================
# DELAY
# ============================================================================

def get_estimated_delay(
    vehicle_count: float,
    congestion_level: str
) -> int:

    vehicle_count = float(
        vehicle_count
    )

    if congestion_level == "Low":

        if vehicle_count < 50:
            return 2

        return 4

    if congestion_level == "Moderate":

        if vehicle_count < 180:
            return 7

        return 10

    if congestion_level == "High":

        if vehicle_count < 350:
            return 15

        return 20

    if vehicle_count < 550:
        return 28

    return 35


# ============================================================================
# HYDERABAD ALTERNATE ROUTES
# ============================================================================

ALTERNATE_ROUTES = {

    "Hitech City": "Madhapur",

    "HiTech City": "Madhapur",

    "Miyapur": "Kukatpally",

    "Kukatpally": "Miyapur",

    "Banjara Hills": "Jubilee Hills",

    "Jubilee Hills": "Banjara Hills",

    "Gachibowli": "Nanakramguda",

    "Nanakramguda": "Gachibowli",

    "Madhapur": "Jubilee Hills",

    "Secunderabad": "Begumpet",

    "Begumpet": "Secunderabad",

    "Mehdipatnam": "Tolichowki",

    "Tolichowki": "Mehdipatnam",

    "LB Nagar": "Dilsukhnagar",

    "Dilsukhnagar": "LB Nagar",

    "Koti": "Abids",

    "Abids": "Koti",

    "Ameerpet": "Punjagutta",

    "Punjagutta": "Ameerpet",

    "Kondapur": "Gachibowli",

    "Uppal": "Nagole",

    "Nagole": "Uppal",
}


def get_alternate_route(
    road_name: str,
    congestion_level: str
) -> str:

    road_name = normalize_text(
        road_name
    )

    if congestion_level not in [
        "High",
        "Severe"
    ]:
        return "Current Route Recommended"

    return ALTERNATE_ROUTES.get(
        road_name,
        "Consider an alternate route"
    )


# ============================================================================
# VALUE MAPPING
# ============================================================================

ROAD_NAME_MAP = {

    "Hitech City":
        "HITEC City Road",

    "HiTech City":
        "HITEC City Road",

    "Banjara Hills":
        "Banjara Hills Road No. 12",

    "Gachibowli":
        "Gachibowli-Miyapur Road",

    "Kukatpally":
        "Kukatpally Main Road",

    "Miyapur":
        "Gachibowli-Miyapur Road",

    "Madhapur":
        "Madhapur Road",

    "Kondapur":
        "Kondapur Road",

    "LB Nagar":
        "LB Nagar Main Road",

    "Mehdipatnam":
        "Mehdipatnam Road",

    "Begumpet":
        "Begumpet Road",

    "Tank Bund":
        "Tank Bund Road",
}


WEATHER_MAP = {

    "Clear":
        "Clear",

    "Cloudy":
        "Cloudy",

    "Rainy":
        "Rain",

    "Foggy":
        "Partly Cloudy",

    "Stormy":
        "Rain",
}


SIGNAL_MAP = {

    "Green":
        "Adaptive",

    "Red":
        "Fixed-Time",

    "Yellow":
        "Fixed-Time",

    "Working":
        "Adaptive",

    "Not Working":
        "Fixed-Time",

    "Faulty":
        "Fixed-Time",
}


WEEKDAY_MAP = {

    0: "Monday",

    1: "Tuesday",

    2: "Wednesday",

    3: "Thursday",

    4: "Friday",

    5: "Saturday",

    6: "Sunday",
}


# ============================================================================
# ROAD COORDINATES
# ============================================================================

ROAD_COORDS = {

    "HITEC City Road":
        (17.4435, 78.3772),

    "Banjara Hills Road No. 12":
        (17.4156, 78.4347),

    "Gachibowli-Miyapur Road":
        (17.4401, 78.3489),

    "Kukatpally Main Road":
        (17.4849, 78.4138),

    "LB Nagar Main Road":
        (17.3473, 78.5521),

    "Madhapur Road":
        (17.4381, 78.3908),

    "Mehdipatnam Road":
        (17.4013, 78.4406),

    "Begumpet Road":
        (17.4449, 78.4498),

    "Kondapur Road":
        (17.4576, 78.3653),

    "Tank Bund Road":
        (17.4239, 78.4738),
}


# ============================================================================
# ENCODE CATEGORICAL FEATURES
# ============================================================================

def encode_categorical_features(
    data: dict
):

    if not load_model_artifacts():

        raise RuntimeError(
            "ML model not available for encoding"
        )

    categorical_columns = [

        "road_name",

        "weather",

        "traffic_signal",

        "accident",

        "weekday",

        "time_slot",

        "congestion_level",

        "alternative_route"
    ]

    for column in categorical_columns:

        if column not in data:

            raise ValueError(
                f"Missing categorical column: {column}"
            )

        if column not in _label_encoders:

            raise ValueError(
                f"No encoder found for column: {column}"
            )

        value = normalize_text(
            data[column]
        )

        # Frontend -> model mappings

        if column == "road_name":

            value = ROAD_NAME_MAP.get(
                value,
                value
            )

        elif column == "weather":

            value = WEATHER_MAP.get(
                value,
                value
            )

        elif column == "traffic_signal":

            value = SIGNAL_MAP.get(
                value,
                value
            )

        elif column == "weekday":

            if value.isdigit():

                value = WEEKDAY_MAP.get(
                    int(value),
                    value
                )

        encoder = _label_encoders[column]

        valid_values = [

            str(v).strip()

            for v in encoder.classes_
        ]

        if value not in valid_values:

            raise ValueError(

                f"Invalid value for {column}: "
                f"'{value}'. "
                f"Valid values are: "
                f"{valid_values}"
            )

        data[column] = int(
            encoder.transform(
                [value]
            )[0]
        )

    return data


# ============================================================================
# BUILD MODEL INPUT
# ============================================================================

def build_model_input(
    original_data: dict
):
    """
    Converts frontend field names into the exact
    columns expected by the trained model.
    """

    road_name = ROAD_NAME_MAP.get(

        normalize_text(
            original_data["Road_Name"]
        ),

        normalize_text(
            original_data["Road_Name"]
        )
    )

    latitude, longitude = ROAD_COORDS.get(

        road_name,

        (17.422785, 78.474264)
    )

    hour = int(
        original_data["Hour"]
    )

    # Peak hour

    peak_hour = 1 if (

        8 <= hour <= 10

        or

        17 <= hour <= 19

    ) else 0

    # Estimated speed heuristic

    if (

        8 <= hour <= 10

        or

        17 <= hour <= 19

    ):

        speed = 30.0

    elif 0 <= hour <= 5:

        speed = 55.0

    else:

        speed = 42.0

    # Model data

    data = {

        "latitude":
            latitude,

        "longitude":
            longitude,

        "speed":
            speed,

        "hour":
            hour,

        "minute":
            original_data["Minute"],

        "day":
            original_data["Day"],

        "month":
            original_data["Month"],

        "year":
            datetime.now().year,

        "day_of_week":
            original_data["Weekday"],

        "is_weekend":
            original_data["IsWeekend"],

        "peak_hour":
            peak_hour,

        "weather":
            original_data["Weather"],

        "road_name":
            original_data["Road_Name"],

        "traffic_signal":
            original_data["Traffic_Signal"],

        "accident":
            original_data["Accident"],

        "weekday":
            original_data["Weekday"],

        "time_slot":
            original_data["TimeSlot"],

        "congestion_level":
            "Moderate",

        "alternative_route":
            "No Alternate Route",
    }

    return data


# ============================================================================
# PREDICTION ENDPOINT
# ============================================================================

@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK
)
def predict_traffic(
    input_data: PredictInput,
    db: Session = Depends(get_db)
):

    try:

        # ================================================================
        # LOAD MODEL
        # ================================================================

        if not load_model_artifacts():

            return PredictionResponse(

                status="error",

                prediction={

                    "error":
                        "ML model not available",

                    "message":
                        _load_error
                        or
                        "Model files not found",

                    "fallback_prediction":
                        (
                            "Please ensure ML model files "
                            "are present in ml_models/ directory"
                        )
                },

                timestamp=datetime.now().isoformat()
            )

        # ================================================================
        # ORIGINAL INPUT
        # ================================================================

        if hasattr(
            input_data,
            "model_dump"
        ):

            original_data = (
                input_data.model_dump()
            )

        else:

            original_data = (
                input_data.dict()
            )

        print(
            "\n" + "=" * 70
        )

        print(
            "NEW TRAFFIC PREDICTION"
        )

        print(
            "=" * 70
        )

        print(
            "Frontend input:"
        )

        print(
            original_data
        )

        # ================================================================
        # BUILD MODEL INPUT
        # ================================================================

        model_data = build_model_input(
            original_data
        )

        # ================================================================
        # ENCODE CATEGORICAL VALUES
        # ================================================================

        model_data = (
            encode_categorical_features(
                model_data
            )
        )

        # ================================================================
        # DATAFRAME
        # ================================================================

        df_input = pd.DataFrame(
            [model_data]
        )

        # ================================================================
        # CHECK MODEL FEATURES
        # ================================================================

        missing_columns = [

            feature

            for feature in _feature_columns

            if feature not in df_input.columns
        ]

        if missing_columns:

            raise ValueError(

                "Your trained model requires "
                "these features, but Prediction.jsx "
                "does not provide them: "

                + ", ".join(
                    missing_columns
                )

                + ". "

                "This means the current "
                "frontend/input schema does not "
                "match the model used for training."
            )

        # ================================================================
        # EXACT FEATURE ORDER
        # ================================================================

        df_input = df_input[
            _feature_columns
        ]

        print(
            "\nModel input:"
        )

        print(
            df_input
        )

        print(
            "\nFeature order:"
        )

        print(
            _feature_columns
        )

        # ================================================================
        # PREDICT
        # ================================================================

        predicted_vehicle_count = float(

            _model.predict(
                df_input
            )[0]
        )

        predicted_vehicle_count = max(
            0.0,
            predicted_vehicle_count
        )

        predicted_vehicle_count = round(
            predicted_vehicle_count,
            2
        )

        # ================================================================
        # DERIVED METRICS
        # ================================================================

        congestion_level = (
            get_congestion_level(
                predicted_vehicle_count
            )
        )

        estimated_speed = (
            get_estimated_speed(
                predicted_vehicle_count,
                congestion_level
            )
        )

        estimated_delay = (
            get_estimated_delay(
                predicted_vehicle_count,
                congestion_level
            )
        )

        alternate_route = (
            get_alternate_route(
                original_data["Road_Name"],
                congestion_level
            )
        )

        # ================================================================
        # DATE
        # ================================================================

        try:

            prediction_date = datetime(

                datetime.now().year,

                original_data["Month"],

                original_data["Day"]

            ).date()

        except ValueError:

            prediction_date = (
                datetime.now().date()
            )

        # ================================================================
        # SAVE MYSQL
        # ================================================================

        prediction_record = Prediction(

            prediction_date=prediction_date,

            hour=original_data["Hour"],

            road_name=original_data["Road_Name"],

            weather=original_data["Weather"],

            traffic_signal=original_data["Traffic_Signal"],

            accident=original_data["Accident"],

            predicted_vehicle_count=predicted_vehicle_count,

            congestion_level=congestion_level,

            estimated_speed=estimated_speed,

            estimated_delay=estimated_delay,

            recommendation=alternate_route,

            alternate_route=(

                alternate_route

                if congestion_level in [
                    "High",
                    "Severe"
                ]

                else None
            )
        )

        db.add(
            prediction_record
        )

        db.commit()

        db.refresh(
            prediction_record
        )

        # ================================================================
        # RESPONSE
        # ================================================================

        response = PredictionResponse(

            status="success",

            prediction={

                "id":
                    prediction_record.id,

                "road_name":
                    original_data["Road_Name"],

                "weather":
                    original_data["Weather"],

                "traffic_signal":
                    original_data["Traffic_Signal"],

                "accident":
                    original_data["Accident"],

                "predicted_vehicle_count":
                    predicted_vehicle_count,

                "congestion_level":
                    congestion_level,

                "estimated_speed":
                    estimated_speed,

                "estimated_delay":
                    estimated_delay,

                "recommendation":
                    alternate_route,

                "alternate_route": (

                    alternate_route

                    if congestion_level in [
                        "High",
                        "Severe"
                    ]

                    else None
                        ),

                "prediction_date":
                    str(prediction_date),

                "hour":
                    original_data["Hour"],

                "minute":
                    original_data["Minute"],

                "weekday":
                    original_data["Weekday"],

                "is_weekend":
                    original_data["IsWeekend"],

                "peak_hour":
                    original_data["PeakHour"],

                "time_slot":
                    original_data["TimeSlot"],

                "created_at": (

                    prediction_record.created_at.isoformat()

                    if prediction_record.created_at

                    else None
                        )
            },

            timestamp=datetime.now().isoformat()
        )

        print(
            "\nPrediction:"
        )

        print(
            response.prediction
        )

        print(
            "=" * 70
        )

        return response

    # ================================================================
    # VALIDATION / INPUT ERROR
    # ================================================================

    except ValueError as e:

        db.rollback()

        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,

            detail=f"Invalid input: {str(e)}"
        )

    # ================================================================
    # MODEL ERROR
    # ================================================================

    except RuntimeError as e:

        db.rollback()

        raise HTTPException(

            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail=f"Prediction error: {str(e)}"
        )

    # ================================================================
    # UNKNOWN ERROR
    # ================================================================

    except Exception as e:

        db.rollback()

        print(
            "Prediction error:",
            str(e)
        )

        raise HTTPException(

            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail=f"Unexpected error: {str(e)}"
        )


# ============================================================================
# HISTORY
# ============================================================================

@router.get("/history")
def prediction_history(
    limit: int = 50,
    db: Session = Depends(get_db)
):

    try:

        limit = max(
            1,
            min(limit, 200)
        )

        records = (

            db.query(Prediction)

            .order_by(
                Prediction.created_at.desc()
            )

            .limit(limit)

            .all()
        )

        predictions = []

        for r in records:

            predictions.append({

                "id":
                    r.id,

                "prediction_date": (

                    str(r.prediction_date)

                    if r.prediction_date

                    else None
                ),

                "hour":
                    r.hour,

                "road_name":
                    r.road_name,

                "weather":
                    r.weather,

                "traffic_signal":
                    r.traffic_signal,

                "accident":
                    r.accident,

                "predicted_vehicle_count":
                    r.predicted_vehicle_count,

                "congestion_level":
                    r.congestion_level,

                "estimated_speed":
                    r.estimated_speed,

                "estimated_delay":
                    r.estimated_delay,

                "recommendation":
                    r.recommendation,

                "alternate_route":
                    r.alternate_route,

                "weekday": (

                    r.prediction_date.strftime("%A")

                    if r.prediction_date

                    else None
                ),

                "is_weekend": (

                    1

                    if (
                        r.prediction_date
                        and
                        r.prediction_date.weekday() >= 5
                    )

                    else 0
                ),

                "peak_hour": (

                    1

                    if r.hour in {
                        8,
                        9,
                        10,
                        17,
                        18,
                        19
                    }

                    else 0
                ),

                "time_slot": (

                    "Morning Peak"

                    if r.hour in {
                        7,
                        8,
                        9
                    }

                    else

                    "Morning"

                    if 10 <= r.hour < 14

                    else

                    "Afternoon"

                    if 14 <= r.hour < 17

                    else

                    "Evening Peak"

                    if 17 <= r.hour <= 19

                    else

                    "Evening"

                    if 19 < r.hour < 22

                    else

                    "Night"
                ),

                "created_at": (

                    r.created_at.isoformat()

                    if r.created_at

                    else None
                ),

                "updated_at": (

                    r.updated_at.isoformat()

                    if r.updated_at

                    else None
                )
            })

        return {

            "status":
                "success",

            "count":
                len(predictions),

            "predictions":
                predictions
        }

    except Exception as e:

        raise HTTPException(

            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail=(
                "Error retrieving prediction history: "
                f"{str(e)}"
            )
        )


# ============================================================================
# RECENT PREDICTIONS
# ============================================================================

@router.get("/recent")
def recent_predictions(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """
    Return the most recent prediction records.

    Used by Prediction.jsx for the Recent Predictions section.
    """

    try:

        limit = max(
            1,
            min(limit, 50)
        )

        records = (

            db.query(Prediction)

            .order_by(
                Prediction.created_at.desc()
            )

            .limit(limit)

            .all()
        )

        predictions = []

        for r in records:

            predictions.append({

                "id":
                    r.id,

                "prediction_date": (

                    str(r.prediction_date)

                    if r.prediction_date

                    else None
                ),

                "hour":
                    r.hour,

                "road_name":
                    r.road_name,

                "weather":
                    r.weather,

                "traffic_signal":
                    r.traffic_signal,

                "accident":
                    r.accident,

                "predicted_vehicle_count":
                    r.predicted_vehicle_count,

                "congestion_level":
                    r.congestion_level,

                "estimated_speed":
                    r.estimated_speed,

                "estimated_delay":
                    r.estimated_delay,

                "recommendation":
                    r.recommendation,

                "alternate_route":
                    r.alternate_route,

                "created_at": (

                    r.created_at.isoformat()

                    if r.created_at

                    else None
                )
            })

        return {

            "status":
                "success",

            "count":
                len(predictions),

            "predictions":
                predictions
        }

    except Exception as e:

        raise HTTPException(

            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail=(
                "Error retrieving recent predictions: "
                f"{str(e)}"
            )
        )


# ============================================================================
# DOWNLOAD PREDICTION REPORT
# ============================================================================

@router.get("/report")
def download_prediction_report(
    db: Session = Depends(get_db)
):
    """
    Generate and download all prediction records as CSV.
    """

    try:

        records = (

            db.query(Prediction)

            .order_by(
                Prediction.created_at.desc()
            )

            .all()
        )

        output = io.StringIO()

        writer = csv.writer(
            output
        )

        # CSV HEADER

        writer.writerow([

            "ID",

            "Prediction Date",

            "Hour",

            "Road Name",

            "Weather",

            "Traffic Signal",

            "Accident",

            "Predicted Vehicle Count",

            "Congestion Level",

            "Estimated Speed",

            "Estimated Delay",

            "Recommendation",

            "Alternate Route",

            "Created At",

            "Updated At"
        ])

        # CSV DATA

        for r in records:

            writer.writerow([

                r.id,

                r.prediction_date,

                r.hour,

                r.road_name,

                r.weather,

                r.traffic_signal,

                r.accident,

                r.predicted_vehicle_count,

                r.congestion_level,

                r.estimated_speed,

                r.estimated_delay,

                r.recommendation,

                r.alternate_route,

                r.created_at,

                r.updated_at
            ])

        output.seek(0)

        filename = (

            "traffic_prediction_report_"

            f"{datetime.now().strftime('%Y%m%d_%H%M%S')}"

            ".csv"
        )

        return StreamingResponse(

            iter([
                output.getvalue()
            ]),

            media_type="text/csv",

            headers={

                "Content-Disposition":
                    f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:

        raise HTTPException(

            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail=(
                "Error generating prediction report: "
                f"{str(e)}"
            )
        )


# ============================================================================
# DEPARTURE TIME CALCULATION
# ============================================================================

@router.get("/{prediction_id}/departure-time")
def calculate_departure_time(
    prediction_id: int,
    arrival_time: str,
    travel_time: int,
    db: Session = Depends(get_db)
):
    """
    Calculate the recommended departure time.

    prediction_id:
        ID of the saved prediction.

    arrival_time:
        Required arrival time in HH:MM format.

    travel_time:
        Normal travel duration in minutes.

    The prediction's estimated_delay is automatically
    added to the normal travel time.
    """

    try:

        # FIND PREDICTION

        prediction = (

            db.query(Prediction)

            .filter(
                Prediction.id == prediction_id
            )

            .first()
        )

        if not prediction:

            raise HTTPException(

                status_code=status.HTTP_404_NOT_FOUND,

                detail="Prediction not found"
            )

        # VALIDATE TRAVEL TIME

        if travel_time <= 0:

            raise HTTPException(

                status_code=status.HTTP_400_BAD_REQUEST,

                detail="travel_time must be greater than 0"
            )

        # PARSE ARRIVAL TIME

        try:

            arrival = datetime.strptime(

                arrival_time,

                "%H:%M"
            )

        except ValueError:

            raise HTTPException(

                status_code=status.HTTP_400_BAD_REQUEST,

                detail="arrival_time must use HH:MM format"
            )

        # TOTAL TRAVEL TIME

        total_travel_minutes = (

            travel_time

            +

            prediction.estimated_delay
        )

        # DEPARTURE TIME

        departure = (

            arrival

            -

            timedelta(
                minutes=total_travel_minutes
            )
        )

        # RESPONSE

        return {

            "status":
                "success",

            "prediction_id":
                prediction.id,

            "road_name":
                prediction.road_name,

            "congestion_level":
                prediction.congestion_level,

            "estimated_delay":
                prediction.estimated_delay,

            "normal_travel_time":
                travel_time,

            "total_travel_time":
                total_travel_minutes,

            "arrival_time":
                arrival.strftime("%H:%M"),

            "recommended_departure_time":
                departure.strftime("%H:%M"),

            "arrival_time_formatted":
                arrival.strftime("%I:%M %p"),

            "recommended_departure_time_formatted":
                departure.strftime("%I:%M %p"),

            "message": (

                f"Leave by "
                f"{departure.strftime('%I:%M %p')} "
                f"to reach by "
                f"{arrival.strftime('%I:%M %p')}"
                    )
        }

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(

            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail=(
                "Error calculating departure time: "
                f"{str(e)}"
            )
        )
