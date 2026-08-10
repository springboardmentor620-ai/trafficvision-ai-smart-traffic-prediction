from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    password = Column(String, nullable=False)

    role = Column(String, default="operator")

    # Forgot-password flow (see app.services.password_reset_service).
    # reset_token is cleared (set back to None) as soon as it's used or
    # once it expires, so a stale value here always means "no active
    # reset request".
    reset_token = Column(String, nullable=True, index=True)
    reset_token_expiry = Column(DateTime, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    traffic_records = relationship(
    "TrafficRecord",
    back_populates="owner"
    )

    prediction_history = relationship(
        "PredictionHistory",
        back_populates="user"
    )