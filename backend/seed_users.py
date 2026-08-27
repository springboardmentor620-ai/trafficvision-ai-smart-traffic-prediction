"""
Seed default users for each role in the TrafficVision AI database.
Roles:
  1. admin: System Administrator (admin@trafficvision.ai)
  2. traffic_operator: Traffic Operator (operator@trafficvision.ai)
  3. commuter: Public User (user@trafficvision.ai)
"""

import sys
import os

from app.database.connection import SessionLocal
from app.models.user import User
from app.utils.security import hash_password
from app.constants.roles import ADMIN, TRAFFIC_OPERATOR, COMMUTER

DEFAULT_USERS = [
    {
        "name": "System Administrator",
        "email": "admin@trafficvision.ai",
        "password": "password123",
        "role": ADMIN,
    },
    {
        "name": "Traffic Operator",
        "email": "operator@trafficvision.ai",
        "password": "password123",
        "role": TRAFFIC_OPERATOR,
    },

    {
        "name": "Public Citizen User",
        "email": "user@trafficvision.ai",
        "password": "password123",
        "role": COMMUTER,
    },
]


def seed_users():
    db = SessionLocal()
    try:
        print("Starting user seed process...")
        for u in DEFAULT_USERS:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if existing:
                existing.name = u["name"]
                existing.role = u["role"]
                existing.password = hash_password(u["password"])
                print(f"  [UPDATED] User {u['email']} (Role: {u['role']})")
            else:
                new_user = User(
                    name=u["name"],
                    email=u["email"],
                    password=hash_password(u["password"]),
                    role=u["role"],
                )
                db.add(new_user)
                print(f"  [CREATED] User {u['email']} (Role: {u['role']})")
        db.commit()
        print("Successfully seeded all role users!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding users: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_users()
