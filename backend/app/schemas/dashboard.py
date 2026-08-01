from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_accidents: int
    total_states: int
    total_cities: int
    average_risk_score: float


class LabelValue(BaseModel):
    label: str
    value: int


class CityStatistics(BaseModel):
    city: str
    accidents: int