from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.traffic_dataset import TrafficDataset


def get_dashboard_summary(db: Session):

    total = db.query(TrafficDataset).count()

    avg_traffic = db.query(
        func.avg(TrafficDataset.traffic_volume)
    ).scalar()

    max_traffic = db.query(
        func.max(TrafficDataset.traffic_volume)
    ).scalar()

    min_traffic = db.query(
        func.min(TrafficDataset.traffic_volume)
    ).scalar()

    avg_temp = db.query(
        func.avg(TrafficDataset.temp)
    ).scalar()

    avg_clouds = db.query(
        func.avg(TrafficDataset.clouds_all)
    ).scalar()

    return {
        "total_records": total,
        "average_traffic": round(avg_traffic or 0, 2),
        "max_traffic": max_traffic or 0,
        "min_traffic": min_traffic or 0,
        "average_temperature": round(avg_temp or 0, 2),
        "average_clouds": round(avg_clouds or 0, 2)
    }


def get_weather_distribution(db: Session):

    result = (
        db.query(
            TrafficDataset.weather_main,
            func.count(TrafficDataset.id).label("count")
        )
        .group_by(TrafficDataset.weather_main)
        .all()
    )

    return [
        {
            "weather_main": r.weather_main,
            "count": r.count
        }
        for r in result
    ]


def get_hourly_traffic(db: Session):

    result = (
        db.query(
            extract("hour", TrafficDataset.date_time).label("hour"),
            func.avg(TrafficDataset.traffic_volume).label("average_traffic")
        )
        .group_by("hour")
        .order_by("hour")
        .all()
    )

    return [
        {
            "hour": int(r.hour),
            "average_traffic": round(float(r.average_traffic), 2)
        }
        for r in result
    ]


def get_weather_traffic(db: Session):

    result = (
        db.query(
            TrafficDataset.weather_main,
            func.avg(TrafficDataset.traffic_volume).label("average_traffic")
        )
        .group_by(TrafficDataset.weather_main)
        .all()
    )

    return [
        {
            "weather_main": r.weather_main,
            "average_traffic": round(float(r.average_traffic), 2)
        }
        for r in result
    ]

def get_daywise_traffic(db: Session):
    result = (
        db.query(
            extract("dow", TrafficDataset.date_time).label("day"),
            func.avg(TrafficDataset.traffic_volume).label("avg")
        )
        .group_by(extract("dow", TrafficDataset.date_time))
        .order_by(extract("dow", TrafficDataset.date_time))
        .all()
    )

    days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ]

    return [
        {
            "day": days[int(r.day)],
            "average_traffic": round(float(r.avg), 2)
        }
        for r in result
    ]