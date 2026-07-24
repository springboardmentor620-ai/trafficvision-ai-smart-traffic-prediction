import pandas as pd

from fastapi import APIRouter

from datetime import datetime

from app.ml.predictor import predict

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse
)

router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


@router.post(
    "/predict",
    response_model=PredictionResponse
)
def predict_congestion(data: PredictionRequest):

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

        "Travel Time Index": 1.2,

        "Road Capacity Utilization": 70,

        "Incident Reports": 1,

        "Environmental Impact": 100,

        "Public Transport Usage": 40,

        "Traffic Signal Compliance": 85,

        "Parking Usage": 70,

        "Pedestrian and Cyclist Count": 120,

        "Year": today.year,

        "Month": today.month,

        "Day": today.day,

        "DayOfWeek": today.weekday(),

        "Weather": weather_map[data.Weather],

        "Roadwork": int(data.Roadwork)

    }])

    prediction = predict(df)

    return PredictionResponse(
        congestion_prediction=prediction
    )