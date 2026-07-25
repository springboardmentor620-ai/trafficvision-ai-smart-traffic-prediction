from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.prediction_routes import router as prediction_router
from app.routes.auth_routes import router as auth_router
from app.routes.traffic_routes import router as traffic_router
from app.routes.route import router as route_router
from app.routes.dashboard import router as dashboard_router
from app.routes.report import router as report_router
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
app.include_router(prediction_router)
app.include_router(traffic_router)
app.include_router(route_router)
app.include_router(dashboard_router)
app.include_router(report_router)
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