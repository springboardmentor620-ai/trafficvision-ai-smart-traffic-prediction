from fastapi import FastAPI
from app.database.database import Base, engine
from app.models.user import User
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.admin import router as admin_router
from app.api.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TrafficVision AI",
    description="AI Smart Traffic Prediction & Congestion Management System",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(admin_router)
app.include_router(dashboard_router)
@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "TrafficVision AI Backend Running Successfully"
    }