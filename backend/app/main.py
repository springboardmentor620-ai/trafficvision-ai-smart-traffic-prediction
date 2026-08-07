from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.prediction_routes import router as prediction_router
from app.routes.auth_routes import router as auth_router
from app.routes.traffic_routes import router as traffic_router
from app.routes.route import router as route_router
from app.routes.dashboard import router as dashboard_router
from app.routes.report import router as report_router
from app.routes import alert_routes
from app.routes import heatmap_routes
from app.routes import analytics_routes
from app.routes.admin import router as admin_router
from app.routes.prediction_history import router as prediction_history_router
from app.routes.admin_prediction import router as admin_prediction_router
from app.routes.admin_alerts import router as admin_alert_router
from app.routes.admin_notifications import router as admin_notification_router




app = FastAPI(
    title="TrafficVision AI",
    version="1.0.0"
)

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Routers
# -----------------------------
app.include_router(auth_router)
app.include_router(prediction_router)
app.include_router(traffic_router)
app.include_router(route_router)
app.include_router(dashboard_router)
app.include_router(report_router)
app.include_router(alert_routes.router)
app.include_router(heatmap_routes.router)
app.include_router(analytics_routes.router)
app.include_router(admin_router)
app.include_router(prediction_router)
app.include_router(admin_prediction_router)
app.include_router(admin_alert_router)
app.include_router(admin_notification_router)


# -----------------------------
# Root
# -----------------------------
@app.get("/")
async def root():
    return {
        "message": "TrafficVision AI Backend Running Successfully"
    }

# -----------------------------
# Health Check
# -----------------------------
@app.get("/health")
async def health():
    return {
        "status": "Healthy"
    }