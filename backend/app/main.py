from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.modules.user_management.routes import router as user_management_router
from app.modules.traffic_prediction.routes import router as traffic_prediction_router
from app.modules.traffic_monitoring.routes import router as traffic_monitoring_router
from app.modules.route_analysis.routes import router as route_analysis_router

# Creates tables automatically on startup if they don't exist yet.
# (For production, use Alembic migrations instead of this.)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TrafficVision AI",
    description="TrafficVision AI Backend API with User Management and Traffic Monitoring",
    version="1.0.0",
)

# Allow the React/Next.js frontend to call this API during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers.
# IMPORTANT: user_management routes already have "/auth/..." and "/users/..."
# baked into their paths, so NO extra prefix is added here (adding one would
# double it up into "/auth/auth/login").
app.include_router(user_management_router, tags=["User Management"])

# traffic_monitoring routes have "/monitoring/..." baked in, so adding
# prefix="/traffic" here makes the final paths "/traffic/monitoring/...",
# which is what the frontend (lib/api.ts) calls.
app.include_router(traffic_monitoring_router, prefix="/traffic", tags=["Traffic Monitoring"])
app.include_router(traffic_prediction_router, prefix="/traffic", tags=["Traffic Prediction"])
app.include_router(route_analysis_router, prefix="/traffic", tags=["Route Analysis"])

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def root():
    return {
        "message": "Welcome to TrafficVision AI Backend",
        "status": "Running Successfully",
    }
