from sqlalchemy import Column, Integer, Float, String, Date, TIMESTAMP, text
from database import Base


class Prediction(Base):
    __tablename__ = "traffic_predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_date = Column(Date)
    hour = Column(Integer)
    junction = Column(Integer)
    predicted_vehicles = Column(Float)
    congestion = Column(String(20))
    recommendation = Column(String(100))
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
