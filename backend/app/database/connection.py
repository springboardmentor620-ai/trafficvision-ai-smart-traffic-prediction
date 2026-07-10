from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Replace YOUR_PASSWORD with your PostgreSQL password
DATABASE_URL = "postgresql+psycopg://postgres:Aryan888@localhost:5432/trafficvision_db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)