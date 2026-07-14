from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

# Create the SQLAlchemy engine (connection pool) using the DB URL from .env
engine = create_engine(settings.DATABASE_URL)

# Each request gets its own DB session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All models will inherit from this Base
Base = declarative_base()


def get_db():
    """
    Dependency used in routes to get a DB session.
    Ensures the session is closed after the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
