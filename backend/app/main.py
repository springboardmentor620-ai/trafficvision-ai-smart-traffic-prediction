from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router

app = FastAPI(
    title="TrafficVision AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/")
async def root():
    return {
        "message": "TrafficVision AI Backend Running Successfully"
    }


@app.get("/health")
async def health():
    return {
        "status": "Healthy"
    }