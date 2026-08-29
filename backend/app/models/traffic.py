from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.database.base import Base


class Traffic(Base):

    __tablename__ = "traffic"

    id = Column(Integer, primary_key=True, index=True)

    road_id = Column(
        Integer,
        ForeignKey("roads.id"),
        nullable=False,
    )

    status = Column(String, nullable=False)

    vehicles = Column(Integer, nullable=False)

    average_speed = Column(Integer, nullable=False)

    road = relationship("Road")
    
    def __str__(self):
        return self.road.name if self.road else f"Traffic #{self.id}"

    def __repr__(self):
        return self.road.name if self.road else f"Traffic #{self.id}"