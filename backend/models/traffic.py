from pydantic import BaseModel

class TrafficRecord(BaseModel):
    timestamp: str
    latitude: float
    longitude: float
    vehicle_count: int
    traffic_speed_kmh: float
    road_occupancy: float
    traffic_light_state: str
    weather_condition: str
    accident_report: str
    sentiment_score: float
    ride_sharing_demand: int
    parking_availability: int
    emission_levels: float
    energy_consumption: float
    traffic_condition: str