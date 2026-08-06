import random
import threading
import time
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal, run_lightweight_migrations
from . import models, bangalore_import
from .seed import run_seed
from .routers import auth, users, traffic, prediction, routes, alerts, analytics, insights

Base.metadata.create_all(bind=engine)
run_lightweight_migrations()

app = FastAPI(
    title="TrafficVision AI",
    description="Smart Traffic Prediction & Congestion Management System — API Gateway / Backend Services",
    version="0.3.0 (Milestone 3)",
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
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(insights.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "TrafficVision AI API", "milestone": "3"}


BANGALORE_ROAD_NAMES = set(bangalore_import.ROAD_COORDS.keys())


def _simulate_sensor_feed():
    """Stand-in for 'External Data Sources -> Traffic Sensors / CCTV Feeds' for
    any CUSTOM road a user adds via Road Management — those have no real
    dataset behind them, so they stay randomly simulated. The 16 real
    Bangalore roads are handled separately by _replay_bangalore_feed below.
    """
    time.sleep(2)  # let startup finish
    db = SessionLocal()
    try:
        while True:
            roads = (
                db.query(models.Road)
                .filter(models.Road.name.notin_(BANGALORE_ROAD_NAMES))
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


def _replay_bangalore_feed(grouped_data: dict):
    """Live feed for the 16 real Bangalore roads: instead of randomly
    generating numbers, step through each road's ACTUAL historical dataset
    in chronological order, one row every 5 seconds per road, inserted as a
    new 'live' reading (timestamped now). When a road's dataset is exhausted,
    it loops back to the start. This means the live dashboard is always
    showing genuine historical traffic patterns from the real dataset for
    every one of the 16 roads — not random numbers.
    """
    from .routers.traffic import compute_congestion_level

    time.sleep(3)
    db = SessionLocal()
    try:
        # Look up roads fresh in THIS thread's own session — the Road objects
        # from the startup function's session are detached once that session
        # closes, and can't be used here.
        roads_by_name = {
            road.name: road
            for road in db.query(models.Road).filter(models.Road.name.in_(grouped_data.keys())).all()
        }
        indices = {name: 0 for name in grouped_data}
        while True:
            for road_name, data in grouped_data.items():
                road = roads_by_name.get(road_name)
                if not road:
                    continue
                rows = data["rows"]
                idx = indices[road_name] % len(rows)
                row = rows[idx]
                indices[road_name] += 1

                reading = models.TrafficReading(
                    road_id=road.id,
                    vehicle_count=int(round(row["vehicle_count"])),
                    avg_speed_kmph=round(row["avg_speed"], 1),
                    congestion_level=compute_congestion_level(int(round(row["vehicle_count"])), road.lane_capacity),
                )
                db.add(reading)
            db.commit()
            time.sleep(5)
    finally:
        db.close()


CITYWIDE_GRIDLOCK_RATIO = 0.4
CITYWIDE_GRIDLOCK_MIN_ROADS = 3


def _monitor_congestion_alerts():
    """Traffic alert system: watches each road's latest live reading and
    auto-raises a 'congestion' alert the moment it hits 'high' — then
    auto-resolves that alert once congestion eases, without spamming
    duplicate alerts for a road that's already flagged and still congested.
    Also watches for citywide gridlock (many roads high at once) and raises
    a single 'emergency' alert for that, auto-resolving it once the
    proportion of jammed roads drops back down.
    """
    time.sleep(6)  # let seed/import + sensor feeds get going first
    db = SessionLocal()
    try:
        while True:
            roads = db.query(models.Road).all()
            roads_with_data = 0
            roads_high = 0

            for road in roads:
                latest = (
                    db.query(models.TrafficReading)
                    .filter(models.TrafficReading.road_id == road.id)
                    .order_by(models.TrafficReading.recorded_at.desc())
                    .first()
                )
                if not latest:
                    continue
                roads_with_data += 1
                if latest.congestion_level == "high":
                    roads_high += 1

                open_alert = (
                    db.query(models.Alert)
                    .filter(
                        models.Alert.road_id == road.id,
                        models.Alert.alert_type == models.AlertTypeEnum.congestion,
                        models.Alert.status != models.AlertStatusEnum.resolved,
                    )
                    .first()
                )

                if latest.congestion_level == "high" and not open_alert:
                    db.add(
                        models.Alert(
                            road_id=road.id,
                            alert_type=models.AlertTypeEnum.congestion,
                            severity="high",
                            message=(
                                f"High congestion detected on {road.name} — "
                                f"{latest.vehicle_count} vehicles, avg {latest.avg_speed_kmph} km/h."
                            ),
                            status=models.AlertStatusEnum.active,
                        )
                    )
                elif latest.congestion_level != "high" and open_alert:
                    open_alert.status = models.AlertStatusEnum.resolved
                    open_alert.resolved_at = datetime.utcnow()

            open_emergency = (
                db.query(models.Alert)
                .filter(
                    models.Alert.road_id.is_(None),
                    models.Alert.alert_type == models.AlertTypeEnum.emergency,
                    models.Alert.status != models.AlertStatusEnum.resolved,
                )
                .first()
            )
            is_gridlock = (
                roads_with_data >= CITYWIDE_GRIDLOCK_MIN_ROADS
                and (roads_high / roads_with_data) >= CITYWIDE_GRIDLOCK_RATIO
            )
            if is_gridlock and not open_emergency:
                db.add(
                    models.Alert(
                        road_id=None,
                        alert_type=models.AlertTypeEnum.emergency,
                        severity="high",
                        message=(
                            f"EMERGENCY: citywide gridlock — {roads_high} of {roads_with_data} "
                            f"monitored roads are at high congestion simultaneously."
                        ),
                        status=models.AlertStatusEnum.active,
                    )
                )
            elif not is_gridlock and open_emergency:
                open_emergency.status = models.AlertStatusEnum.resolved
                open_emergency.resolved_at = datetime.utcnow()

            db.commit()
            time.sleep(10)
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    run_seed()

    # One-time (idempotent) import of the full real Bangalore dataset (16 roads).
    grouped_data = bangalore_import.load_dataset_rows()
    db = SessionLocal()
    try:
        roads_by_name = bangalore_import.get_or_create_roads(db, grouped_data)
        inserted = bangalore_import.bulk_import_if_needed(db, grouped_data, roads_by_name)
        if inserted:
            print(f"[startup] Imported {inserted} real historical readings across {len(grouped_data)} Bangalore roads.")
        else:
            print("[startup] Bangalore dataset already imported — skipping.")

        removed_old = bangalore_import.cleanup_old_single_road_dataset(db)
        if removed_old:
            print("[startup] Removed the superseded single-road Minneapolis dataset.")
    finally:
        db.close()

    threading.Thread(target=_simulate_sensor_feed, daemon=True).start()
    threading.Thread(target=_replay_bangalore_feed, args=(grouped_data,), daemon=True).start()
    threading.Thread(target=_monitor_congestion_alerts, daemon=True).start()
