from pydantic import BaseModel


class PredictionRequest(BaseModel):

    city: str
    state: str

    hour: int

    day_of_week: str

    is_weekend: bool

    road_type: str

    lanes: int

    traffic_signal: bool

    weather: str

    visibility: str

    temperature: float

    traffic_density: str

    cause: str

    vehicles_involved: int

    casualties: int

    is_peak_hour: bool

    festival: str


class PredictionResponse(BaseModel):

    predicted_severity: str

    predicted_risk_score: float

    traffic_alert: str

    emergency_level: str

    traffic_status: str

    estimated_delay_minutes: int

    police_required: bool

    ambulance_required: bool

    fire_brigade_required: bool

    road_closure: bool

    alternative_route: str

    confidence: float

    recommendation: str