from sqlalchemy import Column, Integer, String

from app.database.base import Base


class Zone(Base):

    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    city = Column(String, nullable=False)

    state = Column(String, nullable=False)

    status = Column(String, default="Active")

    roads = Column(Integer, default=0)
    
    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name