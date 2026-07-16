from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_records: int
    average_traffic: float
    maximum_traffic: int
    minimum_traffic: int


class WeatherTraffic(BaseModel):
    weather: str
    average_traffic: float


class HolidayTraffic(BaseModel):
    holiday: str
    average_traffic: float


class HourlyTraffic(BaseModel):
    hour: int
    average_traffic: float