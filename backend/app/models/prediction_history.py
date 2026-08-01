from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.sql import func

from app.db.database import Base


class PredictionHistory(Base):

    __tablename__ = "prediction_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    city = Column(
        String(100),
        nullable=False
    )

    state = Column(
        String(100),
        nullable=False
    )

    predicted_severity = Column(
        String(50),
        nullable=False
    )

    predicted_risk_score = Column(
        Float,
        nullable=False
    )

    traffic_alert = Column(
        String(30),
        nullable=False
    )

    emergency_level = Column(
        String(30),
        nullable=False
    )

    recommendation = Column(
        String(500),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )