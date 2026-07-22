import pandas as pd

from fastapi import APIRouter

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

    df = pd.DataFrame([{

        "Area Name": data.Area_Name,

        "Road/Intersection Name": data.Road_Intersection_Name,

        "Traffic Category": data.Traffic_Category,

        "Traffic Volume": data.Traffic_Volume,

        "Average Speed": data.Average_Speed,

        "Travel Time Index": data.Travel_Time_Index,

        "Road Capacity Utilization": data.Road_Capacity_Utilization,

        "Incident Reports": data.Incident_Reports,

        "Environmental Impact": data.Environmental_Impact,

        "Public Transport Usage": data.Public_Transport_Usage,

        "Traffic Signal Compliance": data.Traffic_Signal_Compliance,

        "Parking Usage": data.Parking_Usage,

        "Pedestrian and Cyclist Count":
            data.Pedestrian_and_Cyclist_Count,

        "Year": data.Year,

        "Month": data.Month,

        "Day": data.Day,

        "DayOfWeek": data.DayOfWeek,

        "Weather": data.Weather,

        "Roadwork": data.Roadwork

    }])

    prediction = predict(df)

    return PredictionResponse(
        congestion_prediction=prediction
    )