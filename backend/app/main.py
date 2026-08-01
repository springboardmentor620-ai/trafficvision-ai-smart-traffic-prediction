from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings

from app.db.database import engine
from app.db.base import Base

import app.models

app = FastAPI(
    title=settings.APP_NAME,
    description="Smart Traffic Prediction & Congestion Management System",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    api_router,
    prefix=settings.API_PREFIX
)


@app.get("/", tags=["Root"])
def root():
    return {
        "project": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "Running",
        "message": "Welcome to TrafficVision AI Backend"
    }