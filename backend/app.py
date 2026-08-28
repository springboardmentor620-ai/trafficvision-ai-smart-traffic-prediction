import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth import router as auth_router
from routers.traffic import router as traffic_router
from routers.route import router as route_router
from routers.alerts import router as alerts_router   # NEW
from routers.analytics import router as analytics_router
from routers.heatmap import router as heatmap_router
from routers.ai import router as ai_router
from routers.predict import router as predict_router
from routers.reports import router as reports_router
from routers.locations import router as locations_router

app = FastAPI(
    title="TrafficVision AI API",
    version="1.0"
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)

# ===========================
# CORS Configuration
# ===========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===========================
# Routers
# ===========================
app.include_router(auth_router)
app.include_router(traffic_router)
app.include_router(route_router)
app.include_router(alerts_router)      # NEW
app.include_router(analytics_router)
app.include_router(heatmap_router)
app.include_router(ai_router)
app.include_router(predict_router)
app.include_router(reports_router)
app.include_router(locations_router)

# ===========================
# Home API
# ===========================
@app.get("/")
def home():
    return {
        "message": "TrafficVision AI Backend Running Successfully"
    }
