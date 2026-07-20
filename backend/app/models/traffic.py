from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import Date

from app.database import Base


class TrafficData(Base):

    __tablename__ = "traffic_data"

    id = Column(Integer, primary_key=True, index=True)

    date = Column(Date)

    area_name = Column(String)

    road_name = Column(String)

    traffic_volume = Column(Integer)

    average_speed = Column(Float)

    travel_time_index = Column(Float)

    congestion_level = Column(Float)

    road_capacity_utilization = Column(Float)

    incident_reports = Column(Integer)

    environmental_impact = Column(Float)

    public_transport_usage = Column(Float)

    traffic_signal_compliance = Column(Float)

    parking_usage = Column(Float)

    pedestrian_cyclist_count = Column(Integer)

    weather_conditions = Column(String)

    roadwork_activity = Column(String)