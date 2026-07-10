from fastapi import FastAPI
from sqlalchemy import text

from app.database.connection import engine
from app.database.base import Base
from app.models.user import User
from app.routers.user import router as user_router

app = FastAPI()
app.include_router(user_router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "message": "Welcome to TrafficVision AI",
            "database": "Connected successfully"
        }
    except Exception as e:
        return {
            "message": "Database connection failed",
            "error": str(e)
        }