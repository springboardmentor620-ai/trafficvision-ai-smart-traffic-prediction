from pydantic import BaseModel

class PredictionRequest(BaseModel):

    source: str
    destination: str

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

    distance: float

    source_lat: float
    source_lng: float

    destination_lat: float
    destination_lng: float


class PredictionResponse(BaseModel):
    predicted_traffic: int