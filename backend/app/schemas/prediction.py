from pydantic import BaseModel


class PredictionRequest(BaseModel):

    Area_Name: str

    Road_Intersection_Name: str

    Traffic_Category: str

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

    Year: int

    Month: int

    Day: int

    DayOfWeek: int

    Weather: str

    Roadwork: bool


class PredictionResponse(BaseModel):

    congestion_prediction: float

    prediction_level: str

    confidence: float

    recommended_action: str

    alternate_route: str