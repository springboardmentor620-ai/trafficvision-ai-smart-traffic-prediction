from sqlalchemy import Column, Integer, Float, String, DateTime
from database import Base


class Traffic(Base):
    __tablename__ = "traffic_data"

    id = Column(Integer, primary_key=True, index=True)
    datetime = Column(DateTime)
    latitude = Column(Float)
    longitude = Column(Float)
    vehicle_count = Column(Integer)
    speed = Column(Float)
    congestion_level = Column(String(50))
    weather = Column(String(50))
    road_name = Column(String(100))
    traffic_signal = Column(String(20))
    accident = Column(String(20))
