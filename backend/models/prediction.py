from sqlalchemy import Column, Integer, Float, String, Date, TIMESTAMP, text
from database import Base


class Prediction(Base):
    __tablename__ = "traffic_predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_date = Column(Date, nullable=False)
    hour = Column(Integer, nullable=False)

    # New AI prediction fields
    road_name = Column(String(100), nullable=False)
    weather = Column(String(50), nullable=False)
    traffic_signal = Column(String(50), nullable=False)
    accident = Column(String(10), nullable=False)

    predicted_vehicle_count = Column(Float, nullable=False)
    congestion_level = Column(String(20), nullable=False)
    estimated_speed = Column(Float, nullable=False)
    estimated_delay = Column(Integer, nullable=False)

    recommendation = Column(String(200), nullable=False)
    alternate_route = Column(String(100), nullable=True)

    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    )
