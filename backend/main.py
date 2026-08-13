"""TrafficVision AI — FastAPI application entry point."""

from services.ml_service import _load_model_artifacts, get_model_status
from routers.map_monitoring import router as map_monitoring_router
from routers import users
from routers.traffic_trends import router as traffic_trends_router
from routers.report import router as report_router
from routers.emergency import router as emergency_router
from routers.accidents import router as accidents_router
from routers.analytics import router as analytics_router
from routers.traffic_map import router as traffic_map_router
from routers.prediction import router as prediction_router
from routers.recommendations import router as recommendations_router
from routers.notifications import router as notifications_router
from routers.alerts import router as alerts_router
from routers.route import router as route_router
from routers.profile import router as profile_router
from routers.dashboard import router as dashboard_router
from routers.traffic import router as traffic_router
from routers.auth import router as auth_router
from models.traffic_dataset import TrafficDataset
from models.emergency import EmergencyAlert
from models.accident import Accident
from models.notification import Notification
from models.alert import Alert
from models.prediction import Prediction
from models.traffic import Traffic
from models.user import User
from database import Base, engine
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import logging
import sys
import warnings
from contextlib import asynccontextmanager
from pathlib import Path

# ── Suppress sklearn parallel warning at process level ────────────────────
# Registered here (before any sklearn import anywhere in the app) as a
# second line of defence alongside the filter in ml_service.py.
warnings.filterwarnings(
    "ignore",
    category=UserWarning,
    module=r"sklearn\.utils\.parallel",
)
warnings.filterwarnings(
    "ignore",
    category=UserWarning,
    message=r".*sklearn\.utils\.parallel\.delayed.*",
)
# ─────────────────────────────────────────────────────────────────────────


# ── ORM Models ────────────────────────────────────────────────────────────

# ── Routers ───────────────────────────────────────────────────────────────

try:
    from routers.maps import router as maps_router
except ImportError as e:
    maps_router = None
    print(f"⚠️  Maps router disabled — {e}")


# ── Logging ───────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Paths ─────────────────────────────────────────────────────────────────
backend_dir = Path(__file__).resolve().parent
root_dir = backend_dir.parent

for p in (str(backend_dir), str(root_dir)):
    if p not in sys.path:
        sys.path.insert(0, p)


# ── Lifespan ──────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Everything before `yield` runs ONCE at server boot,
    before the first request is accepted.
    Everything after `yield` runs ONCE at server shutdown.
    """

    # ── STARTUP ───────────────────────────────────────────────────────────
    logger.info("=" * 65)
    logger.info("  TrafficVision AI  —  Starting Up")
    logger.info("=" * 65)

    # 1. Database
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✓ Database tables verified")
    except Exception as exc:
        logger.error(f"✗ Database setup failed: {exc}")

    # 2. ML model — loaded HERE so no user ever waits for it
    logger.info("⏳ Loading ML model artifacts ...")
    try:
        _load_model_artifacts()
        status = get_model_status()
        logger.info(
            f"✓ ML model ready — "
            f"{status['feature_count']} features | "
            f"n_jobs={status['n_jobs']} | "
            f"n_estimators={status['n_estimators']}"
        )
    except Exception as exc:
        # Don't crash the server — non-ML endpoints still work
        logger.error(f"✗ ML model failed to load: {exc}")
        logger.error("  Prediction endpoints will return 500 until fixed.")

    logger.info("✓ All routers registered")
    logger.info("✓ CORS configured")
    logger.info("=" * 65)
    logger.info("  Server ready — accepting requests")
    logger.info("=" * 65)

    yield  # ← server is live here

    # ── SHUTDOWN ──────────────────────────────────────────────────────────
    logger.info("=" * 65)
    logger.info("  TrafficVision AI  —  Shutting Down")
    logger.info("=" * 65)


# ── App ───────────────────────────────────────────────────────────────────
app = FastAPI(
    title="TrafficVision AI",
    description="Smart Traffic Prediction & Congestion Management System",
    version="3.0.0",
    lifespan=lifespan,   # ← replaces deprecated @app.on_event
)


# ── Static Files ──────────────────────────────────────────────────────────
try:
    app.mount(
        "/static",
        StaticFiles(directory=str(backend_dir / "static")),
        name="static",
    )
except Exception as exc:
    logger.warning(f"Static files not mounted: {exc}")


# ── CORS ──────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────────────────
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
app.include_router(accidents_router)
app.include_router(emergency_router)
app.include_router(report_router)
app.include_router(traffic_trends_router)
app.include_router(map_monitoring_router)

if maps_router is not None:
    app.include_router(maps_router)
else:
    logger.warning("Maps router not registered — see startup log")


# ── Health Endpoints ──────────────────────────────────────────────────────
@app.get("/")
def home():
    return {
        "message": "TrafficVision AI Backend Running — Milestone 3",
        "version": "3.0.0",
        "modules": [
            "Auth", "Traffic", "Dashboard", "Route", "Alerts",
            "Notifications", "Recommendations", "TrafficMap", "Analytics",
            "Accidents", "Emergency", "Report", "Prediction", "Map Monitoring",
        ],
    }


@app.get("/health")
def health_check():
    """Liveness probe — no DB or ML dependency."""
    return {
        "status":  "healthy",
        "service": "TrafficVision AI",
        "version": "3.0.0",
    }


@app.get("/health/ml")
def ml_health_check():
    """ML model readiness probe."""
    return get_model_status()


# ── Entry Point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
