from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# Import models
from app.modules.user_management.models import *
from app.modules.traffic_monitoring.models import *
from app.modules.traffic_prediction.models import *


# Import routers
from app.modules.user_management.routes import router as user_management_router
from app.modules.traffic_monitoring.routes import router as traffic_monitoring_router
from app.modules.traffic_prediction.routes import router as traffic_prediction_router
from app.modules.route_analysis.routes import router as route_analysis_router
from app.modules.alerts.routes import router as alerts_router
from app.modules.analytics.routes import router as analytics_router
from app.modules.ai_recommendations.routes import router as ai_recommendations_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TrafficVision AI",
    description="TrafficVision AI Backend API with User Management and Traffic Monitoring",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(user_management_router, tags=["User Management"])
app.include_router(traffic_monitoring_router, prefix="/traffic", tags=["Traffic Monitoring"])
app.include_router(traffic_prediction_router, prefix="/traffic", tags=["Traffic Prediction"])
app.include_router(route_analysis_router, prefix="/traffic", tags=["Route Analysis"])
app.include_router(alerts_router, prefix="/traffic", tags=["Alerts"])
app.include_router(analytics_router, prefix="/traffic", tags=["Analytics"])
app.include_router(
    ai_recommendations_router,
    prefix="/traffic",
    tags=["AI Recommendations"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def root():
    return {
        "message": "Welcome to TrafficVision AI Backend",
        "status": "Running Successfully",
    }