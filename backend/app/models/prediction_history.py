from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean
from datetime import datetime, timezone

from app.database.base import Base


class PredictionHistory(Base):

    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)

    # timezone-aware UTC timestamp; lambda avoids the deprecated datetime.utcnow
    timestamp = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    area_name = Column(String, nullable=False)

    road_name = Column(String, nullable=False)

    traffic_volume = Column(Integer)

    average_speed = Column(Float)

    # Stored as the original weather string (e.g. "Clear", "Rain")
    weather = Column(String)

    # Boolean: True = roadwork present, False = no roadwork
    # Changed from String → Boolean to match actual data type passed by the service.
    # Note: if an existing SQLite database has this column as TEXT (True/False strings),
    # the table must be recreated or Alembic migration applied.
    roadwork = Column(Boolean)

    predicted_congestion = Column(Float)

    # Vocabulary: Low | Moderate | High
    prediction_level = Column(String)

    recommended_action = Column(String)