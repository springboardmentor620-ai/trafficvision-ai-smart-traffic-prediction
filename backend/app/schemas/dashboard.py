from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_predictions: int

    high_congestion: int
    medium_congestion: int
    low_congestion: int

    average_predicted_traffic: float
    max_predicted_traffic: int
    min_predicted_traffic: int

    average_temperature: float
    average_clouds: float

    average_speed: float


class WeatherDistribution(BaseModel):
    weather_main: str
    count: int


class HourlyTraffic(BaseModel):
    hour: int
    average_traffic: float


class WeatherTraffic(BaseModel):
    weather_main: str
    average_traffic: float


class DayTraffic(BaseModel):
    day: str
    average_traffic: float