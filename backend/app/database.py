"""
Database configuration.

For local development / Milestone-1 demo we default to SQLite (zero setup).
For production (per architecture doc: PostgreSQL for user/system/log data),
just set the DATABASE_URL env var, e.g.:

    DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/trafficvision

and the same models/code work unchanged.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./trafficvision.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
