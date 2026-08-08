from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime

from app.database.base import Base


class PredictionHistory(Base):

    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)

    timestamp = Column(DateTime, default=datetime.utcnow)

    area_name = Column(String, nullable=False)

    road_name = Column(String, nullable=False)

    traffic_volume = Column(Integer)

    average_speed = Column(Float)

    weather = Column(String)

    roadwork = Column(String)

    predicted_congestion = Column(Float)

    prediction_level = Column(String)

    recommended_action = Column(String)