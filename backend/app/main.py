from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
 
from app.database import Base, engine
 
from app.routes.auth import router as auth_router
from app.routes.traffic import router as traffic_router
from app.routes.dashboard import router as dashboard_router
from app.routes.prediction import router as prediction_router
from app.routes.analytics import router as analytics_router
from app.routes.alerts import router as alerts_router
from app.routes.super_admin import router as super_admin_router
from app.routes.admin_requests import router as admin_requests_router
from app.routes.admin import router as admin_router
 
from app.exceptions.handlers import (
    http_exception_handler,
    validation_exception_handler,
    internal_exception_handler,
)
 
# Importing app.models registers every model class on Base's metadata
# before create_all() runs below.
from app.models import *  # noqa: F401,F403
 
Base.metadata.create_all(bind=engine)
 
app = FastAPI(title="TrafficVision AI")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, internal_exception_handler)
 
app.include_router(analytics_router)
app.include_router(auth_router)
app.include_router(traffic_router)
app.include_router(dashboard_router)
app.include_router(prediction_router)
app.include_router(alerts_router)
app.include_router(super_admin_router)
app.include_router(admin_requests_router)
app.include_router(admin_router)
 
 
@app.get("/")
def home():
    return {"message": "TrafficVision AI Backend Running Successfully 🚦"}
 