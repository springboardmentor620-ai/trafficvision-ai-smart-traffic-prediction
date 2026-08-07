# from pydantic import BaseModel


# class PredictionRequest(BaseModel):

#     source: str
#     destination: str

#     traffic_volume: int
#     average_speed: float
#     travel_time_index: float

#     road_capacity_utilization: float
#     incident_reports: int
#     environmental_impact: float
#     public_transport_usage: float
#     traffic_signal_compliance: float
#     parking_usage: float

#     pedestrian_count: int

#     weather_conditions: str
#     roadwork_activity: str

#     year: int
#     month: int
#     day: int
from pydantic import BaseModel


class PredictionRequest(BaseModel):

    source: str
    destination: str