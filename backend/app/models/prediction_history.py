from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from datetime import datetime

from app.database import Base

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    holiday = Column(String(100))
    temp = Column(Float)
    rain_1h = Column(Float)
    snow_1h = Column(Float)
    clouds_all = Column(Integer)

    weather_main = Column(String(50))
    weather_description = Column(String(100))

    hour = Column(Integer)
    day = Column(Integer)
    month = Column(Integer)
    weekday = Column(Integer)

    distance = Column(Float)

    source = Column(String(200))
    destination = Column(String(200))

    source_lat = Column(Float)
    source_lng = Column(Float)

    destination_lat = Column(Float)
    destination_lng = Column(Float)

    predicted_traffic = Column(Integer)

    confidence = Column(Float)

    congestion = Column(String(20))

    recommended_route = Column(String(100))

    travel_time = Column(Float)

    delay = Column(Float)

    average_speed = Column(Float)

    ai_recommendation = Column(String(500))

    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship(
        "User",
        back_populates="prediction_history"
    )