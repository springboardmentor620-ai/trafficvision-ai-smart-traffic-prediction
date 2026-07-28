import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth import router as auth_router
from routers.traffic import router as traffic_router
from routers.route import router as route_router

app = FastAPI(
    title="TrafficVision AI API",
    version="1.0"
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

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

# ===========================
# Home API
# ===========================
@app.get("/")
def home():
    return {
        "message": "TrafficVision AI Backend Running Successfully"
    }
