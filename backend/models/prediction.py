from datetime import date, datetime, time
from pydantic import BaseModel, ConfigDict, Field


class TrafficPredictionRequest(BaseModel):
    """Validated model input using API-friendly field names."""

    model_config = ConfigDict(populate_by_name=True)

    vehicle_count: float = Field(alias="Vehicle_Count")
    traffic_speed_kmh: float = Field(alias="Traffic_Speed_kmh")
    road_occupancy: float = Field(alias="Road_Occupancy_%")
    traffic_light_state: str | int = Field(alias="Traffic_Light_State")
    weather_condition: str | int = Field(alias="Weather_Condition")
    accident_report: int = Field(alias="Accident_Report")
    sentiment_score: float = Field(alias="Sentiment_Score")
    ride_sharing_demand: float = Field(alias="Ride_Sharing_Demand")
    parking_availability: float = Field(alias="Parking_Availability")
    emission_levels: float = Field(alias="Emission_Levels_g_km")
    energy_consumption: float = Field(alias="Energy_Consumption_L_h")
    hour: int
    day_of_week: int
    is_weekend: int
    is_rush_hour: int
    journey_date: date | None = None
    journey_time: time | None = None

    def to_dataset_record(self) -> dict:
        """Map the validated request to the dataset's exact feature names."""
        record = self.model_dump(by_alias=True, exclude={"journey_date", "journey_time"})
        if self.journey_date and self.journey_time:
            journey = datetime.combine(self.journey_date, self.journey_time)
            record.update({"hour": journey.hour, "day_of_week": journey.weekday(), "is_weekend": int(journey.weekday() >= 5), "is_rush_hour": int(8 <= journey.hour <= 10 or 17 <= journey.hour <= 20)})
        return record
