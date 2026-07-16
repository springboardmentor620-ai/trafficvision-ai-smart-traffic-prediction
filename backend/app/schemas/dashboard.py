from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_records: int
    average_traffic: float
    max_traffic: int
    min_traffic: int
    average_temperature: float
    average_clouds: float


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