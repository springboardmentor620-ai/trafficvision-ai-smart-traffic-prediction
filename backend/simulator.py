import random
import time

from app.database.connection import SessionLocal
from app.models.road import Road
from app.models.traffic import Traffic
from app.services.alert_service import AlertService

import pandas as pd

from datetime import datetime

from app.ml.predictor import (
    predict,
    get_prediction_level,
)

from app.services.prediction_history_service import (
    save_prediction,
)

db = SessionLocal()


def get_status(speed):

    if speed < 20:
        return "Heavy"

    elif speed < 40:
        return "Moderate"

    return "Normal"


def generate_values():

    vehicles = random.randint(80, 900)

    speed = max(
        10,
        80 - vehicles // 12 + random.randint(-5, 5)
    )

    status = get_status(speed)

    return vehicles, speed, status


def initialize():

    roads = db.query(Road).all()

    for road in roads:

        exists = (
            db.query(Traffic)
            .filter(Traffic.road_id == road.id)
            .first()
        )

        if exists:
            continue

        vehicles, speed, status = generate_values()

        db.add(

            Traffic(

                road_id=road.id,

                vehicles=vehicles,

                average_speed=speed,

                status=status

            )

        )

    db.commit()

    print("Traffic initialized.")


def simulate():

    print("Traffic simulator started...")

    while True:

        rows = db.query(Traffic).all()

        for row in rows:

            vehicles = row.vehicles + random.randint(-60, 60)

            vehicles = max(50, min(1000, vehicles))

            speed = max(
                10,
                80 - vehicles // 12 + random.randint(-4, 4)
            )

            today = datetime.now()

            weather = random.choice([
                "Clear",
                "Cloudy",
                "Rain",
                "Fog",
                "Storm"
            ])

            weather_map = {
                "Clear": 0,
                "Cloudy": 1,
                "Rain": 2,
                "Fog": 3,
                "Storm": 4
            }

            traffic_category = (
                "Low"
                if vehicles < 15000
                else "Medium"
                if vehicles < 35000
                else "High"
            )

            df = pd.DataFrame([{

                "Area Name": row.road.city,

                "Road/Intersection Name": row.road.name,

                "Traffic Category": traffic_category,

                "Traffic Volume": vehicles,

                "Average Speed": speed,

                "Travel Time Index": 1.2,

                "Road Capacity Utilization": 70,

                "Incident Reports": 1,

                "Environmental Impact": 100,

                "Public Transport Usage": 40,

                "Traffic Signal Compliance": 85,

                "Parking Usage": 70,

                "Pedestrian and Cyclist Count": 120,

                "Year": today.year,

                "Month": today.month,

                "Day": today.day,

                "DayOfWeek": today.weekday(),

                "Weather": weather_map[weather],

                "Roadwork": 0

            }])

            prediction = predict(df)

            level = get_prediction_level(prediction)

            row.vehicles = vehicles

            row.average_speed = speed

            row.status = level

            save_prediction(

                db,

                area_name=row.road.city,

                road_name=row.road.name,

                traffic_volume=vehicles,

                average_speed=speed,

                weather=weather,

                roadwork=False,

                prediction=prediction,

                level=level,

                recommendation=(

                    "Traffic normal."

                    if prediction < 30

                    else

                    "Increase green signal timing by 10%."

                    if prediction < 70

                    else

                    "Deploy traffic police, extend green signals and divert vehicles."

                )

            )

            if prediction >= 70:

                AlertService.create_alert(

                    db=db,

                    road=row.road.name,

                    congestion=prediction,

                    recommendation=(
                        f"AI detected heavy congestion on {row.road.name}. "
                        "Traffic diversion recommended."
                    ),

                )

        db.commit()

        print("Traffic updated.")

        time.sleep(5)


if __name__ == "__main__":

    initialize()

    simulate()