
from models.traffic_dataset import TrafficDataset
from database import engine
from routers.prediction import router as prediction_router
from routers.report import router as report_router
from routers.emergency import router as emergency_router
from routers.accidents import router as accidents_router
from routers.analytics import router as analytics_router
from routers.traffic_map import router as traffic_map_router
from routers.recommendations import router as recommendations_router
from routers.notifications import router as notifications_router
from routers.alerts import router as alerts_router
from routers.route import router as route_router
from routers.profile import router as profile_router
from routers.dashboard import router as dashboard_router
from routers.traffic import router as traffic_router
from routers.auth import router as auth_router
from routers import users
from models.emergency import EmergencyAlert
from models.accident import Accident
from models.alert import Alert
from models.prediction import Prediction
from models.notification import Notification
from models.traffic import Traffic
from models.user import User
from database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import sys
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from routers.prediction import router as prediction_router

# Ensure backend and root directory are in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
root_dir = backend_dir.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))


# ──────────────────────────────────────────────────────────────────────────────
# Import ALL Models (so SQLAlchemy creates the tables on startup)
# ──────────────────────────────────────────────────────────────────────────────

# ──────────────────────────────────────────────────────────────────────────────
# Import Routers
# ──────────────────────────────────────────────────────────────────────────────
# ──────────────────────────────────────────────────────────────────────────────
# App
# ──────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="TrafficVision AI",
    description="Smart Traffic Prediction & Congestion Management System",
    version="3.0.0",
)
app.mount("/static", StaticFiles(directory="static"), name="static")
# ──────────────────────────────────────────────────────────────────────────────
# CORS
# ──────────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────────────────────────────────────
# Create Database Tables
# ──────────────────────────────────────────────────────────────────────────────

Base.metadata.create_all(bind=engine)

# ──────────────────────────────────────────────────────────────────────────────
# Register Routers
# ──────────────────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(traffic_router)
app.include_router(dashboard_router)
app.include_router(profile_router)
app.include_router(users.router)
app.include_router(route_router)
app.include_router(alerts_router)
app.include_router(notifications_router)
app.include_router(recommendations_router)
app.include_router(prediction_router)
app.include_router(traffic_map_router)
app.include_router(analytics_router)

# Milestone 3 — new routers
app.include_router(accidents_router)
app.include_router(emergency_router)
app.include_router(report_router)
app.include_router(prediction_router)

# ──────────────────────────────────────────────────────────────────────────────
# Root
# ──────────────────────────────────────────────────────────────────────────────


@app.get("/")
def home():
    return {
        "message": "TrafficVision AI Backend Running — Milestone 3",
        "version": "3.0.0",
        "modules": [
            "Auth", "Traffic", "Dashboard", "Route",
            "Alerts", "Notifications", "Recommendations",
            "TrafficMap", "Analytics", "Accidents",
            "Emergency", "Report",
        ],
    }
