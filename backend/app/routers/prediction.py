import pandas as pd

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.ml.predictor import predict

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse
)

from app.services.alert_service import AlertService
from app.services.prediction_history_service import save_prediction

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

    today = datetime.now()

    weather_map = {
        "Clear": 0,
        "Cloudy": 1,
        "Rain": 2,
        "Fog": 3,
        "Storm": 4
    }

    traffic_volume = data.Traffic_Volume

    if traffic_volume < 15000:
        category = "Low"
    elif traffic_volume < 35000:
        category = "Medium"
    else:
        category = "High"

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

        "Year": today.year,

        "Month": today.month,

        "Day": today.day,

        "DayOfWeek": today.weekday(),

        "Weather": weather_map[data.Weather],

        "Roadwork": int(data.Roadwork)

    }])

    prediction = float(predict(df))

    if prediction < 30:

        level = "Low"

        confidence = 96.5

        recommendation = (
        "Traffic flowing normally. Continue current signal timing."
        )

    elif prediction < 70:

        level = "Moderate"

        confidence = 93.2

        recommendation = (
        "Increase green signal timing by 10% and monitor traffic."
        )

    else:

        level = "High"

        confidence = 95.4

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

    if prediction >= 70:

        AlertService.create_alert(

            db=db,

            road=data.Road_Intersection_Name,

            congestion=prediction,

            recommendation=recommendation,

        )

    return PredictionResponse(

        congestion_prediction=prediction,

        prediction_level=level,

        confidence=confidence,

        recommended_action=recommendation,

        alternate_route=alternate_route,

    )