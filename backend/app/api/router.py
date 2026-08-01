from fastapi import APIRouter

from app.api.v1.accident import router as accident_router
from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.prediction import router as prediction_router
from app.api.v1.prediction_history import router as prediction_history_router
from app.api.v1.report import router as report_router

api_router = APIRouter(
    prefix="/api/v1"
)

api_router.include_router(auth_router)

api_router.include_router(accident_router)

api_router.include_router(prediction_router)

api_router.include_router(dashboard_router)

api_router.include_router(prediction_history_router)

api_router.include_router(report_router)