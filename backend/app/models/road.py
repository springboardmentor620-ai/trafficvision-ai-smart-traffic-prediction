from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship

from app.database.base import Base


class Road(Base):

    __tablename__ = "roads"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    city = Column(String, nullable=False)

    state = Column(String, nullable=False)

    status = Column(String, default="Normal")

    speed_limit = Column(Integer, default=60)

    latitude = Column(Float, nullable=False)

    longitude = Column(Float, nullable=False)

    traffic = relationship(
    "Traffic",
    back_populates="road",
    cascade="all, delete"
)