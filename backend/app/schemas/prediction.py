from pydantic import BaseModel


class PredictionRequest(BaseModel):
    """
    Input schema for POST /prediction/predict.

    Fields removed vs. the original schema:
      - Traffic_Category: the server derives this from Traffic_Volume using the
        training-pipeline bin boundaries. Client-supplied values were silently ignored.
      - Year, Month, Day, DayOfWeek: always substituted server-side with
        datetime.now(). Client-supplied values were silently ignored.

    Weather must be one of: Clear, Overcast, Fog, Rain, Windy.
    Any other value returns HTTP 422.
    """

    Area_Name: str

    Road_Intersection_Name: str

    Traffic_Volume: int

    Average_Speed: float

    Travel_Time_Index: float

    Road_Capacity_Utilization: float

    Incident_Reports: int

    Environmental_Impact: float

    Public_Transport_Usage: float

    Traffic_Signal_Compliance: float

    Parking_Usage: float

    Pedestrian_and_Cyclist_Count: int

    Weather: str

    Roadwork: bool


class PredictionResponse(BaseModel):
    """
    Output schema for POST /prediction/predict.

    Field removed vs. the original schema:
      - confidence: the model is a RandomForestRegressor with no predict_proba
        and oob_score was not enabled at training time. The previous values
        (96.5, 93.2, 95.4) were hard-coded placeholders with no statistical
        meaning. They have been removed to avoid misleading consumers.

    prediction_level values: Low | Moderate | High
    """

    congestion_prediction: float

    prediction_level: str

    recommended_action: str

    alternate_route: str