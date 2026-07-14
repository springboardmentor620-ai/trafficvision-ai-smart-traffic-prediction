from fastapi import FastAPI
from app.database.database import Base, engine
from app.models.user import User
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TrafficVision AI",
    description="AI Smart Traffic Prediction & Congestion Management System",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "TrafficVision AI Backend Running Successfully"
    }