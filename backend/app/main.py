import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.database.connection import engine
from app.database.base import Base
from app.models.user import User
from app.models.traffic import Traffic
from app.models.road import Road
from app.models.zone import Zone
from app.models.notification import Notification
from app.models.prediction_history import PredictionHistory
from app.routers.user import router as user_router
from app.routers.traffic import router as traffic_router
from app.routers.prediction import router as prediction_router
from app.routers import analytics
from app.routers import alerts
from app.routers import reports
from app.routers import roads
from app.routers import zones
from app.routers import notifications
from app.routers import routes
from app.routers import history
from app.routers import prediction_history


def get_cors_origins():
    raw_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
    )
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


def wait_for_database(max_attempts=30, delay_seconds=2):
    for attempt in range(1, max_attempts + 1):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return
        except SQLAlchemyError:
            if attempt == max_attempts:
                raise
            time.sleep(delay_seconds)


def auto_seed_default_users():
    """
    Ensures default accounts exist in the database on initial startup
    (essential for cloud deployments like Render).
    """
    try:
        from app.database.connection import SessionLocal
        from app.models.user import User
        from app.utils.security import hash_password
        from app.constants.roles import ADMIN, TRAFFIC_OPERATOR, COMMUTER

        default_accounts = [
            {
                "name": "System Administrator",
                "email": "admin@trafficvision.ai",
                "password": "password123",
                "role": ADMIN,
            },
            {
                "name": "Traffic Operator",
                "email": "operator@trafficvision.ai",
                "password": "password123",
                "role": TRAFFIC_OPERATOR,
            },
            {
                "name": "Public Citizen User",
                "email": "user@trafficvision.ai",
                "password": "password123",
                "role": COMMUTER,
            },
        ]

        db = SessionLocal()
        try:
            for acc in default_accounts:
                existing = db.query(User).filter(User.email == acc["email"]).first()
                if not existing:
                    user = User(
                        name=acc["name"],
                        email=acc["email"],
                        password=hash_password(acc["password"]),
                        role=acc["role"],
                    )
                    db.add(user)
            db.commit()
        finally:
            db.close()
    except Exception as e:
        print(f"[STARTUP SEED NOTICE] {e}")


@asynccontextmanager
async def lifespan(app):
    wait_for_database()
    Base.metadata.create_all(bind=engine)
    auto_seed_default_users()
    yield


app = FastAPI(
    title="TrafficVision AI API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_router)
app.include_router(traffic_router)
app.include_router(prediction_router)
app.include_router(prediction_history.router)
app.include_router(analytics.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(roads.router)
app.include_router(zones.router)
app.include_router(notifications.router)
app.include_router(routes.router)
app.include_router(history.router)

@app.get("/")
def home():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "message": "Welcome to TrafficVision AI",
            "database": "Connected successfully"
        }
    except Exception as e:
        return {
            "message": "Database connection failed",
            "error": str(e)
        }


@app.get("/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "Backend Running",
            "database": "Connected successfully",
            "message": "TrafficVision AI API is working"
        }
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "Backend Unhealthy",
                "database": "Connection failed",
                "error": str(exc),
            },
        )
