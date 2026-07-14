from fastapi import FastAPI

app = FastAPI(
    title="TrafficVision AI",
    description="AI Smart Traffic Prediction & Congestion Management System",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "TrafficVision AI Backend Running Successfully"
    }