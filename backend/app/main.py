from fastapi import FastAPI
from app.database.database import Base, engine
from app.models.user import User
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.admin import router as admin_router
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TrafficVision AI",
    description="AI Smart Traffic Prediction & Congestion Management System",
    version="1.0.0"
)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(admin_router)
@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "TrafficVision AI Backend Running Successfully"
    }