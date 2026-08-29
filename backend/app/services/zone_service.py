from sqlalchemy.orm import Session

from app.models.zone import Zone


class ZoneService:

    @staticmethod
    def get_all(db: Session):
        return db.query(Zone).all()

    @staticmethod
    def create(db: Session, zone):

        new_zone = Zone(**zone.dict())

        db.add(new_zone)

        db.commit()

        db.refresh(new_zone)

        return new_zone

    @staticmethod
    def update(db: Session, zone_id, zone):

        existing = db.query(Zone).filter(
            Zone.id == zone_id
        ).first()

        if not existing:
            return None

        for key, value in zone.dict().items():
            setattr(existing, key, value)

        db.commit()

        db.refresh(existing)

        return existing

    @staticmethod
    def delete(db: Session, zone_id):

        zone = db.query(Zone).filter(
            Zone.id == zone_id
        ).first()

        if not zone:
            return False

        db.delete(zone)

        db.commit()

        return True