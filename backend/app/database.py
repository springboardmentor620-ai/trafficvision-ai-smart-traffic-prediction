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


def run_lightweight_migrations():
    """Add any new columns that don't exist yet on an existing database, without
    touching existing data. SQLAlchemy's create_all() only creates missing
    TABLES, not missing COLUMNS on tables that already exist — so when a new
    field is added to a model (e.g. Road.latitude), anyone with an existing
    database needs this to pick it up automatically on next startup.
    """
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    if "roads" not in inspector.get_table_names():
        return  # fresh DB — create_all() will create it with all current columns

    existing_columns = {col["name"] for col in inspector.get_columns("roads")}
    statements = []
    if "latitude" not in existing_columns:
        statements.append("ALTER TABLE roads ADD COLUMN latitude FLOAT")
    if "longitude" not in existing_columns:
        statements.append("ALTER TABLE roads ADD COLUMN longitude FLOAT")

    if statements:
        with engine.connect() as conn:
            for stmt in statements:
                conn.execute(text(stmt))
            conn.commit()
