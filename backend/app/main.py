from fastapi import FastAPI
from app.database import engine, Base
from app.routes.auth import router as auth_router

from fastapi import Depends
from app.dependencies import get_current_user
from app.routes.traffic import router as traffic_router
from app.routes.dashboard import router as dashboard_router
from app.routes.prediction import router as prediction_router

from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.routes.route import router as route_router

from app.routes.alert import router as alert_router

from app.exceptions.handlers import (
    http_exception_handler,
    validation_exception_handler,
    internal_exception_handler
)

import app.models.user

import app.models.traffic

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TrafficVision AI")

app.add_exception_handler(
    StarletteHTTPException,
    http_exception_handler
)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler
)

app.add_exception_handler(
    Exception,
    internal_exception_handler
)

app.include_router(auth_router)
app.include_router(traffic_router)
app.include_router(dashboard_router)
app.include_router(prediction_router)
app.include_router(route_router)
app.include_router(alert_router)

@app.get("/")
def home():
    return {
        "message":"TrafficVision AI Backend Running Successfully 🚦"
    }

@app.get("/profile")
def profile(current_user=Depends(get_current_user)):
    return {
        "message": "Welcome!",
        "user": current_user
    }