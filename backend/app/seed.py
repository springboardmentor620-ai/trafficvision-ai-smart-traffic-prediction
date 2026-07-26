from .database import SessionLocal
from . import models, security


def run_seed():
    """Seeds demo login accounts only. Roads now come entirely from the real
    Bangalore traffic dataset (see bangalore_import.py), imported separately
    on startup in main.py — no fake/simulated demo roads are created here
    anymore, since every road now has genuine historical data behind it.
    """
    db = SessionLocal()
    try:
        if not db.query(models.User).first():
            admin = models.User(
                username="admin",
                email="admin@trafficvision.local",
                hashed_password=security.hash_password("Admin@123"),
                role=models.RoleEnum.admin,
            )
            operator = models.User(
                username="operator1",
                email="operator1@trafficvision.local",
                hashed_password=security.hash_password("Operator@123"),
                role=models.RoleEnum.operator,
            )
            db.add_all([admin, operator])
            db.commit()
    finally:
        db.close()
