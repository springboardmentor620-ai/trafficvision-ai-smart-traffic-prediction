"""Database engine, session factory, and dependency — MySQL."""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config import DATABASE_URL

# ── MySQL Engine ──────────────────────────────────────────────────────────
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,     # detects dropped connections before using them
    pool_size=10,           # 10 persistent connections kept alive
    max_overflow=20,        # 20 extra allowed under burst load
    pool_timeout=30,        # wait max 30s for a free connection
    pool_recycle=1800,      # recycle every 30 min
                            # MySQL drops idle connections after 8h by default
                            # this prevents "MySQL has gone away" errors
)

# ── Session Factory ───────────────────────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


# ── FastAPI Dependency ────────────────────────────────────────────────────
def get_db():
    """
    Yield a database session per request.
    Always closed after request.
    Rolls back automatically on any unhandled exception.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
