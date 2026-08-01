from pydantic import BaseModel


class HeatmapPoint(BaseModel):

    latitude: float

    longitude: float

    city: str

    state: str

    risk_score: float

    accident_severity: str