from sqlalchemy.orm import Session

from app.models.road import Road


class RoadService:

    @staticmethod
    def get_all(db: Session):

        return db.query(Road).all()

    @staticmethod
    def create(db: Session, road):

        new_road = Road(**road.dict())

        db.add(new_road)

        db.commit()

        db.refresh(new_road)

        return new_road

    @staticmethod
    def update(db: Session, road_id, road):

        existing = db.query(Road).filter(
            Road.id == road_id
        ).first()

        if not existing:
            return None

        for key, value in road.dict().items():

            setattr(existing, key, value)

        db.commit()

        db.refresh(existing)

        return existing

    @staticmethod
    def delete(db: Session, road_id):

        road = db.query(Road).filter(
            Road.id == road_id
        ).first()

        if not road:
            return False

        db.delete(road)

        db.commit()

        return True