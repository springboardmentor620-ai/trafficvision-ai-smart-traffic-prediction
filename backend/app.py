from fastapi import FastAPI

app = FastAPI(
    title="TrafficVision AI API",
    version="1.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to TrafficVision AI Backend"
    }

@app.get("/traffic")
def traffic():
    return {
        "vehicle_count": 1250,
        "congestion": "Medium",
        "weather": "Sunny",
        "traffic_status": "Normal"
    }