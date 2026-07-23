from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    holiday = Column(String)
    weather = Column(String)

    temperature = Column(Float)

    predicted_traffic = Column(Integer)

    congestion = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())