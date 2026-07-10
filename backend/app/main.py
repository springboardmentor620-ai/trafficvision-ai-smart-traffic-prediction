from fastapi import FastAPI
from sqlalchemy import text

from app.database.connection import engine

app = FastAPI()


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