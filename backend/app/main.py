from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# Import routers
from app.modules.user_management.routes import router as user_management_router
from app.modules.traffic_monitoring.routes import router as traffic_monitor_router

# Create database tables automatically
# (For production, use Alembic migrations instead.)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TrafficVision AI",
    description="TrafficVision AI Backend API with User Management and Traffic Monitoring",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(
    user_management_router,
    tags=["User Management"]
)

app.include_router(
    traffic_monitor_router,
    prefix="/traffic",
    tags=["Traffic Monitoring"]
)

# Health Check API
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Root API
@app.get("/")
def root():
    return {
        "message": "Welcome to TrafficVision AI Backend",
        "status": "Running Successfully"
    }