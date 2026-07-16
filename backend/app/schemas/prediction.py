from pydantic import BaseModel


class PredictionRequest(BaseModel):
    holiday: str
    temp: float
    rain_1h: float
    snow_1h: float
    clouds_all: int
    weather_main: str
    weather_description: str
    hour: int
    day: int
    month: int
    weekday: int


class PredictionResponse(BaseModel):
    predicted_traffic: int