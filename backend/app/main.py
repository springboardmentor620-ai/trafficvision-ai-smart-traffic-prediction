from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Traffic Prediction & Congestion Management System",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # We'll restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "project": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "message": "Backend running successfully."
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "application": settings.APP_NAME
    }