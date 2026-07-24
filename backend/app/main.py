import random
import threading
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal, run_lightweight_migrations
from . import models, kaggle_import
from .seed import run_seed
from .routers import auth, users, traffic, prediction, routes

Base.metadata.create_all(bind=engine)
run_lightweight_migrations()

app = FastAPI(
    title="TrafficVision AI",
    description="Smart Traffic Prediction & Congestion Management System — API Gateway / Backend Services",
    version="0.2.0 (Milestone 2)",
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
app.include_router(prediction.router)
app.include_router(routes.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "TrafficVision AI API", "milestone": "1"}


def _simulate_sensor_feed():
    """Stand-in for 'External Data Sources -> Traffic Sensors / CCTV Feeds' for
    the sample demo roads (MG Road Junction, Ring Road - North, etc.) — these
    have no real-world dataset behind them, so they stay randomly simulated.
    The real Kaggle road is handled separately by _replay_kaggle_feed below.
    """
    time.sleep(2)  # let startup finish
    db = SessionLocal()
    try:
        while True:
            roads = (
                db.query(models.Road)
                .filter(models.Road.name != kaggle_import.KAGGLE_ROAD_NAME)
                .all()
            )
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


def _replay_kaggle_feed(dataset_rows: list[dict]):
    """Live feed for the real Kaggle road: instead of randomly generating
    numbers, step through the ACTUAL historical dataset in chronological
    order, one row every 5 seconds, and insert it as a new 'live' reading
    (timestamped now). When the dataset is exhausted, it loops back to the
    start. This means the live dashboard for this road is always showing a
    genuine historical traffic pattern from the real dataset — not a random
    number.
    """
    from .routers.traffic import compute_congestion_level

    time.sleep(3)
    db = SessionLocal()
    try:
        road = kaggle_import.get_or_create_kaggle_road(db)
        index = 0
        n = len(dataset_rows)
        while True:
            row = dataset_rows[index % n]
            vehicle_count = row["vehicle_count"]
            reading = models.TrafficReading(
                road_id=road.id,
                vehicle_count=vehicle_count,
                avg_speed_kmph=kaggle_import._estimate_speed(vehicle_count, road.lane_capacity),
                congestion_level=compute_congestion_level(vehicle_count, road.lane_capacity),
            )
            db.add(reading)
            db.commit()
            index += 1
            time.sleep(5)
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    run_seed()

    # One-time (idempotent) import of the full real Kaggle dataset into the DB.
    dataset_rows = kaggle_import.load_dataset_rows()
    db = SessionLocal()
    try:
        inserted = kaggle_import.bulk_import_if_needed(db, dataset_rows)
        if inserted:
            print(f"[startup] Imported {inserted} real historical readings from Kaggle dataset.")
        else:
            print("[startup] Kaggle dataset already imported — skipping.")
    finally:
        db.close()

    threading.Thread(target=_simulate_sensor_feed, daemon=True).start()
    threading.Thread(target=_replay_kaggle_feed, args=(dataset_rows,), daemon=True).start()
