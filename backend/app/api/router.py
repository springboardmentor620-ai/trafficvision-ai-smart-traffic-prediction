from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.prediction import router as prediction_router
from app.api.v1.prediction_history import (
    router as prediction_history_router
)
from app.api.v1.report import router as report_router
from app.api.v1.traffic_alert import (
    router as traffic_alert_router
)

from app.api.v1.admin_dashboard import (
    router as admin_dashboard_router
)

from app.api.v1.users import router as users_router
from app.api.v1.accident import router as accident_router
from app.api.v1.health import router as health_router
from app.api.v1.routes import router as routes_router
from app.api.v1.audit_log import (
    router as audit_log_router
)
from app.api.v1.system_control import (
    router as system_control_router
)


api_router = APIRouter(
    prefix="/api/v1"
)


# =========================================================
# HEALTH
# =========================================================

api_router.include_router(
    health_router
)


# =========================================================
# AUTHENTICATION
# =========================================================

api_router.include_router(
    auth_router
)


# =========================================================
# USERS
# =========================================================

api_router.include_router(
    users_router
)


# =========================================================
# ACCIDENTS
# =========================================================

api_router.include_router(
    accident_router
)


# =========================================================
# DASHBOARD
# =========================================================

api_router.include_router(
    dashboard_router
)


# =========================================================
# PREDICTION
# =========================================================

api_router.include_router(
    prediction_router
)


# =========================================================
# PREDICTION HISTORY
# =========================================================

api_router.include_router(
    prediction_history_router
)


# =========================================================
# REPORTS
# =========================================================

api_router.include_router(
    report_router
)


# =========================================================
# TRAFFIC ALERTS
# =========================================================

api_router.include_router(
    traffic_alert_router
)


# =========================================================
# ROUTES / MAP
# =========================================================

api_router.include_router(
    routes_router
)


# =========================================================
# ADMIN — SYSTEM ACTIVITY
# =========================================================

api_router.include_router(
    audit_log_router
)


# =========================================================
# ADMIN — SYSTEM CONTROLS
# =========================================================

api_router.include_router(
    system_control_router
)

# =========================================================
# ADMIN — DASHBOARD
# =========================================================

api_router.include_router(
    admin_dashboard_router
)