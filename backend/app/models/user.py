from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        nullable=False,
        default="operator"
    )

    # Google account's stable unique identifier.
    # NULL for normal email/password users.
    google_sub = Column(
        String,
        unique=True,
        nullable=True,
        index=True
    )

    # Traffic records created by this user
    traffic_records = relationship(
        "TrafficRecord",
        back_populates="owner"
    )

    # Prediction history created by this user
    prediction_history = relationship(
        "PredictionHistory",
        back_populates="user"
    )