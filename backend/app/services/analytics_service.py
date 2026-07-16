from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.traffic_dataset import TrafficDataset


def get_summary(db: Session):
    return {
        "total_records": db.query(TrafficDataset).count(),
        "average_traffic": round(
            db.query(func.avg(TrafficDataset.traffic_volume)).scalar() or 0,
            2,
        ),
        "maximum_traffic": db.query(
            func.max(TrafficDataset.traffic_volume)
        ).scalar(),
        "minimum_traffic": db.query(
            func.min(TrafficDataset.traffic_volume)
        ).scalar(),
    }


def weather_analysis(db: Session):
    rows = (
        db.query(
            TrafficDataset.weather_main,
            func.avg(TrafficDataset.traffic_volume).label("avg"),
        )
        .group_by(TrafficDataset.weather_main)
        .all()
    )

    return [
        {
            "weather": r.weather_main,
            "average_traffic": round(float(r.avg), 2),
        }
        for r in rows
    ]


def holiday_analysis(db: Session):
    rows = (
        db.query(
            TrafficDataset.holiday,
            func.avg(TrafficDataset.traffic_volume).label("avg"),
        )
        .group_by(TrafficDataset.holiday)
        .all()
    )

    return [
        {
            "holiday": r.holiday,
            "average_traffic": round(float(r.avg), 2),
        }
        for r in rows
    ]


def hourly_analysis(db: Session):
    rows = (
        db.query(
            extract("hour", TrafficDataset.date_time).label("hour"),
            func.avg(TrafficDataset.traffic_volume).label("avg"),
        )
        .group_by("hour")
        .order_by("hour")
        .all()
    )

    return [
        {
            "hour": int(r.hour),
            "average_traffic": round(float(r.avg), 2),
        }
        for r in rows
    ]