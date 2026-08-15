from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.prediction_history import PredictionHistory


def get_dashboard_summary(db: Session):
    """
    Dashboard statistics are calculated from live prediction history,
    not from the static training dataset.
    """

    total = db.query(PredictionHistory).count()

    high = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.congestion == "High")
        .count()
    )

    medium = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.congestion == "Medium")
        .count()
    )

    low = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.congestion == "Low")
        .count()
    )

    avg_traffic = db.query(
        func.avg(PredictionHistory.predicted_traffic)
    ).scalar()

    max_traffic = db.query(
        func.max(PredictionHistory.predicted_traffic)
    ).scalar()

    min_traffic = db.query(
        func.min(PredictionHistory.predicted_traffic)
    ).scalar()

    avg_temp = db.query(
        func.avg(PredictionHistory.temp)
    ).scalar()

    avg_clouds = db.query(
        func.avg(PredictionHistory.clouds_all)
    ).scalar()

    avg_speed = db.query(
        func.avg(PredictionHistory.average_speed)
    ).scalar()

    return {
        "total_predictions": total,
        "high_congestion": high,
        "medium_congestion": medium,
        "low_congestion": low,
        "average_predicted_traffic": round(float(avg_traffic or 0), 2),
        "max_predicted_traffic": int(max_traffic or 0),
        "min_predicted_traffic": int(min_traffic or 0),
        "average_temperature": round(float(avg_temp or 0), 2),
        "average_clouds": round(float(avg_clouds or 0), 2),
        "average_speed": round(float(avg_speed or 0), 2),
    }


def get_weather_distribution(db: Session):

    result = (
        db.query(
            PredictionHistory.weather_main,
            func.count(PredictionHistory.id).label("count")
        )
        .filter(PredictionHistory.weather_main.isnot(None))
        .group_by(PredictionHistory.weather_main)
        .order_by(PredictionHistory.weather_main)
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
            PredictionHistory.hour.label("hour"),
            func.avg(
                PredictionHistory.predicted_traffic
            ).label("average_traffic")
        )
        .filter(PredictionHistory.hour.isnot(None))
        .group_by(PredictionHistory.hour)
        .order_by(PredictionHistory.hour)
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
            PredictionHistory.weather_main,
            func.avg(
                PredictionHistory.predicted_traffic
            ).label("average_traffic")
        )
        .filter(PredictionHistory.weather_main.isnot(None))
        .group_by(PredictionHistory.weather_main)
        .order_by(PredictionHistory.weather_main)
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
            PredictionHistory.weekday.label("day"),
            func.avg(
                PredictionHistory.predicted_traffic
            ).label("average_traffic")
        )
        .filter(PredictionHistory.weekday.isnot(None))
        .group_by(PredictionHistory.weekday)
        .order_by(PredictionHistory.weekday)
        .all()
    )

    days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ]

    return [
        {
            "day": days[int(r.day)],
            "average_traffic": round(float(r.average_traffic), 2)
        }
        for r in result
        if 0 <= int(r.day) <= 6
    ]