from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import Date
from sqlalchemy import Float
from sqlalchemy import Index
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Time

from app.db.database import Base


class Accident(Base):
    __tablename__ = "accidents"

    accident_id = Column(Integer, primary_key=True)

    city = Column(String(100), nullable=False, index=True)

    state = Column(String(100), nullable=False, index=True)

    latitude = Column(Float, nullable=False)

    longitude = Column(Float, nullable=False)

    date = Column(Date, nullable=False)

    time = Column(Time, nullable=False)

    hour = Column(Integer, nullable=False, index=True)

    day_of_week = Column(String(30), nullable=False)

    is_weekend = Column(Boolean, nullable=False)

    road_type = Column(String(100), nullable=False)

    lanes = Column(Integer, nullable=False)

    traffic_signal = Column(Boolean, nullable=False)

    weather = Column(String(50), nullable=False, index=True)

    visibility = Column(String(30), nullable=False)

    temperature = Column(Float, nullable=False)

    traffic_density = Column(String(50), nullable=False, index=True)

    cause = Column(String(255), nullable=False)

    accident_severity = Column(String(30), nullable=False, index=True)

    vehicles_involved = Column(Integer, nullable=False)

    casualties = Column(Integer, nullable=False)

    is_peak_hour = Column(Boolean, nullable=False)

    festival = Column(String(100), nullable=False)

    risk_score = Column(Float, nullable=False)


Index("idx_city_state", Accident.city, Accident.state)
Index("idx_date_hour", Accident.date, Accident.hour)