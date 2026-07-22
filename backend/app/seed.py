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
                models.Road(name="MG Road Junction", location="Sector 1", lane_capacity=120),
                models.Road(name="Ring Road - North", location="Sector 4", lane_capacity=200),
                models.Road(name="Airport Flyover", location="Sector 9", lane_capacity=150),
                models.Road(name="Central Market Crossing", location="Sector 2", lane_capacity=80),
            ]
            db.add_all(roads)

        db.commit()
    finally:
        db.close()
