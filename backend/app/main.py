import random
import threading
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from . import models
from .seed import run_seed
from .routers import auth, users, traffic

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TrafficVision AI",
    description="Smart Traffic Prediction & Congestion Management System — API Gateway / Backend Services",
    version="0.1.0 (Milestone 1)",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to the deployed frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(traffic.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "TrafficVision AI API", "milestone": "1"}


def _simulate_sensor_feed():
    """Stand-in for 'External Data Sources -> Traffic Sensors / CCTV Feeds' until
    real hardware/API integration lands in a later milestone. Writes a fresh
    reading per road every 5 seconds so the live dashboard has real motion.
    """
    time.sleep(2)  # let startup finish
    db = SessionLocal()
    try:
        while True:
            roads = db.query(models.Road).all()
            for road in roads:
                vehicle_count = random.randint(0, int(road.lane_capacity * 1.1))
                avg_speed = round(random.uniform(8, 60), 1)
                from .routers.traffic import compute_congestion_level

                reading = models.TrafficReading(
                    road_id=road.id,
                    vehicle_count=vehicle_count,
                    avg_speed_kmph=avg_speed,
                    congestion_level=compute_congestion_level(vehicle_count, road.lane_capacity),
                )
                db.add(reading)
            db.commit()
            time.sleep(5)
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    run_seed()
    thread = threading.Thread(target=_simulate_sensor_feed, daemon=True)
    thread.start()
