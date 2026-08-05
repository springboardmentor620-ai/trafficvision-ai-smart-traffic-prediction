from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class TrafficAlert(Base):
    """An automatically generated traffic alert tied to a prediction.

    Alerts are never created directly by end users - they are produced
    by app.services.traffic_alert_service whenever a traffic prediction
    is made (see app.services.prediction_service).
    """

    __tablename__ = "traffic_alerts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    prediction_id = Column(
        Integer, ForeignKey("prediction_history.id"), nullable=True, index=True
    )

    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)

    # Congestion | Accident | Weather | Road Work | Event
    category = Column(String, nullable=False, default="Congestion", index=True)

    # Low | Medium | High | Critical
    severity = Column(String, nullable=False, default="Low", index=True)

    title = Column(String, nullable=False)
    message = Column(String, nullable=False)

    congestion = Column(String, nullable=False)
    congestion_percentage = Column(Float, nullable=False, default=0.0)

    # Composite 0-100 accident-risk score - see
    # traffic_alert_service._accident_risk_score for the factors that
    # feed into it (congestion, rain, snow, visibility, rush hour,
    # accident-prone route history).
    accident_risk_score = Column(Float, nullable=False, default=0.0, index=True)

    recommended_route = Column(String, nullable=True)
    expected_delay = Column(Float, nullable=False, default=0.0)  # minutes

    is_read = Column(Boolean, nullable=False, default=False, index=True)
    read_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", backref="traffic_alerts")
