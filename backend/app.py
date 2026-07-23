from fastapi import FastAPI
from routers.auth import router as auth_router
from routers.traffic import router as traffic_router

app = FastAPI(
    title="TrafficVision AI API",
    version="1.0"
)

app.include_router(auth_router)
app.include_router(traffic_router)

@app.get("/")
def home():
    return {
        "message": "TrafficVision AI Backend Running Successfully"
    }