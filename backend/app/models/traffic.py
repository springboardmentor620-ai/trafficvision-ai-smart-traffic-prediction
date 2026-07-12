from sqlalchemy import Column, Integer, String

from app.database.base import Base


class Traffic(Base):
    __tablename__ = "traffic"

    id = Column(Integer, primary_key=True, index=True)

    road = Column(String, nullable=False)

    status = Column(String, nullable=False)

    vehicles = Column(Integer, nullable=False)

    average_speed = Column(Integer, nullable=False)