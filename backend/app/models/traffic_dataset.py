from sqlalchemy import Column, Integer, Float, String, DateTime

from app.database import Base


class TrafficDataset(Base):
    __tablename__ = "traffic_dataset"

    id = Column(Integer, primary_key=True, index=True)

    holiday = Column(String, nullable=True)

    temp = Column(Float)

    rain_1h = Column(Float)

    snow_1h = Column(Float)

    clouds_all = Column(Integer)

    weather_main = Column(String)

    weather_description = Column(String)

    date_time = Column(DateTime)

    traffic_volume = Column(Integer)