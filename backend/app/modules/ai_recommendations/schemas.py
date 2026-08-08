from pydantic import BaseModel


class AIRecommendation(BaseModel):
    road_id: int
    road_name: str
    zone: str | None

    current_vehicle_count: int | None
    predicted_vehicle_count: int | None

    current_congestion: str | None
    predicted_congestion: str | None

    trend: str | None

    recommendation: str
    priority: str