import pandas as pd

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.ml.predictor import predict

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse
)

from app.services.alert_service import AlertService
from app.services.prediction_history_service import save_prediction

from app.constants.traffic import (
    WEATHER_ENCODING,
    get_traffic_category,
    CONGESTION_THRESHOLD_LOW,
    CONGESTION_THRESHOLD_MODERATE,
    PREDICTION_LEVEL_LOW,
    PREDICTION_LEVEL_MODERATE,
    PREDICTION_LEVEL_HIGH,
)

router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


@router.post(
    "/predict",
    response_model=PredictionResponse
)
def predict_congestion(
    data: PredictionRequest,
    db: Session = Depends(get_db)
):
    # ── Validate weather string ──────────────────────────────────────────────
    # Accepted values: Clear, Overcast, Fog, Rain, Windy
    # These are the ONLY strings the training pipeline encoded.
    if data.Weather not in WEATHER_ENCODING:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Invalid weather value '{data.Weather}'. "
                f"Must be one of: {list(WEATHER_ENCODING.keys())}"
            )
        )

    today = datetime.now()

    # ── Derive Traffic Category from Traffic Volume ──────────────────────────
    # Uses identical bin boundaries as FeatureEngineering.traffic_category():
    # pd.cut(bins=[0, 15000, 30000, 50000, 100000],
    #         labels=['Low', 'Moderate', 'Heavy', 'Severe'])
    # The model's OneHotEncoder was trained only on these four strings.
    category = get_traffic_category(data.Traffic_Volume)

    df = pd.DataFrame([{

        "Area Name": data.Area_Name,

        "Road/Intersection Name": data.Road_Intersection_Name,

        "Traffic Category": category,

        "Traffic Volume": data.Traffic_Volume,

        "Average Speed": data.Average_Speed,

        "Travel Time Index": data.Travel_Time_Index,

        "Road Capacity Utilization": data.Road_Capacity_Utilization,

        "Incident Reports": data.Incident_Reports,

        "Environmental Impact": data.Environmental_Impact,

        "Public Transport Usage": data.Public_Transport_Usage,

        "Traffic Signal Compliance": data.Traffic_Signal_Compliance,

        "Parking Usage": data.Parking_Usage,

        "Pedestrian and Cyclist Count": data.Pedestrian_and_Cyclist_Count,

        # Date features are always derived server-side from the current time.
        # The client cannot supply these — they are ignored if submitted.
        "Year": today.year,

        "Month": today.month,

        "Day": today.day,

        "DayOfWeek": today.weekday(),

        # Correct encoding: Clear=0, Overcast=1, Fog=2, Rain=3, Windy=4
        # Matches FeatureEngineering.encode_weather() exactly.
        "Weather": WEATHER_ENCODING[data.Weather],

        "Roadwork": int(data.Roadwork)

    }])

    prediction = float(predict(df))

    # ── Map continuous score to prediction level ─────────────────────────────
    if prediction < CONGESTION_THRESHOLD_LOW:

        level = PREDICTION_LEVEL_LOW

        recommendation = (
            "Traffic flowing normally. Continue current signal timing."
        )

    elif prediction < CONGESTION_THRESHOLD_MODERATE:

        level = PREDICTION_LEVEL_MODERATE

        recommendation = (
            "Increase green signal timing by 10% and monitor traffic."
        )

    else:

        level = PREDICTION_LEVEL_HIGH

        recommendation = (
            "Deploy traffic police, extend green signal timing and divert vehicles."
        )

    alternate_routes = {

        "Marathahalli Bridge":
            "Outer Ring Road",

        "CMH Road":
            "Old Airport Road",

        "Sony World Junction":
            "Sarjapur Road",

        "100 Feet Road":
            "HAL Road",

        "Hosur Road":
            "Electronic City Flyover"

    }

    alternate_route = alternate_routes.get(

        data.Road_Intersection_Name,

        "Nearest Available Route"

    )

    save_prediction(
        db=db,
        area_name=data.Area_Name,
        road_name=data.Road_Intersection_Name,
        traffic_volume=data.Traffic_Volume,
        average_speed=data.Average_Speed,
        weather=data.Weather,
        roadwork=data.Roadwork,
        prediction=prediction,
        level=level,
        recommendation=recommendation
    )

    if prediction >= CONGESTION_THRESHOLD_MODERATE:
        alert_type = "Incident" if data.Incident_Reports > 0 else ("Roadwork" if data.Roadwork else "Congestion")
        AlertService.create_alert(
            db=db,
            road=data.Road_Intersection_Name,
            congestion=prediction,
            recommendation=recommendation,
            alert_type=alert_type,
        )

    return PredictionResponse(

        congestion_prediction=prediction,

        prediction_level=level,

        recommended_action=recommendation,

        alternate_route=alternate_route,

    )