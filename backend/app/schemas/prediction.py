from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):

    # =========================================================
    # LOCATION
    # =========================================================

    city: str
    state: str

    source: str | None = None
    destination: str | None = None

    # Actual route information coming from Maps & Routes
    route_distance_km: float | None = Field(
        default=None,
        ge=0
    )

    route_duration_minutes: float | None = Field(
        default=None,
        ge=0
    )

    route_index: int = Field(
        default=0,
        ge=0
    )

    # =========================================================
    # TIME
    # =========================================================

    hour: int

    day_of_week: str

    is_weekend: bool

    # =========================================================
    # ROAD CONDITIONS
    # =========================================================

    road_type: str

    lanes: int

    traffic_signal: bool

    # =========================================================
    # WEATHER
    # =========================================================

    weather: str

    visibility: str

    temperature: float

    # =========================================================
    # TRAFFIC / INCIDENT CONTEXT
    # =========================================================

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