from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.connection import engine
from app.database.base import Base
from app.models.user import User
from app.models.traffic import Traffic
from app.routers.user import router as user_router
from app.routers.traffic import router as traffic_router
from app.routers.prediction import router as prediction_router

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_router)
app.include_router(traffic_router)
app.include_router(prediction_router)

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


@app.get("/health")
def health():
    return {
        "status": "Backend Running",
        "message": "TrafficVision AI API is working"
    }