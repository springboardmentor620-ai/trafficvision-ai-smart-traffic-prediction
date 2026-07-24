from .database import SessionLocal
from . import models, security


def run_seed():
    db = SessionLocal()
    try:
        if not db.query(models.User).first():
            admin = models.User(
                username="admin",
                full_name="Traffic Authority Admin",
                email="admin@trafficvision.local",
                hashed_password=security.hash_password("Admin@123"),
                role=models.RoleEnum.admin,
            )
            operator = models.User(
                username="operator1",
                full_name="Traffic Operator One",
                email="operator1@trafficvision.local",
                hashed_password=security.hash_password("Operator@123"),
                role=models.RoleEnum.operator,
            )
            db.add_all([admin, operator])

        if not db.query(models.Road).first():
            roads = [
                models.Road(name="MG Road Junction", location="Sector 1", lane_capacity=120,
                            latitude=17.3850, longitude=78.4867),
                models.Road(name="Ring Road - North", location="Sector 4", lane_capacity=200,
                            latitude=17.4400, longitude=78.4983),
                models.Road(name="Airport Flyover", location="Sector 9", lane_capacity=150,
                            latitude=17.2403, longitude=78.4294),
                models.Road(name="Central Market Crossing", location="Sector 2", lane_capacity=80,
                            latitude=17.3616, longitude=78.4747),
            ]
            db.add_all(roads)

        db.commit()
        _backfill_seed_road_coordinates(db)
        db.commit()
    finally:
        db.close()


SEED_ROAD_COORDS = {
    "MG Road Junction": (17.3850, 78.4867),
    "Ring Road - North": (17.4400, 78.4983),
    "Airport Flyover": (17.2403, 78.4294),
    "Central Market Crossing": (17.3616, 78.4747),
}


def _backfill_seed_road_coordinates(db):
    """Fills in latitude/longitude for roads created before this feature
    existed, so upgrading an existing database doesn't need a reset."""
    for name, (lat, lon) in SEED_ROAD_COORDS.items():
        road = db.query(models.Road).filter(models.Road.name == name).first()
        if road and road.latitude is None:
            road.latitude = lat
            road.longitude = lon
