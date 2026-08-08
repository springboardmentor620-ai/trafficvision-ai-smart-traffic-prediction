from sqlalchemy.orm import Session

from app.models.prediction_history import PredictionHistory


def save_prediction(
    db: Session,
    area_name,
    road_name,
    traffic_volume,
    average_speed,
    weather,
    roadwork,
    prediction,
    level,
    recommendation,
):

    item = PredictionHistory(

        area_name=area_name,

        road_name=road_name,

        traffic_volume=traffic_volume,

        average_speed=average_speed,

        weather=weather,

        roadwork=roadwork,

        predicted_congestion=prediction,

        prediction_level=level,

        recommended_action=recommendation

    )

    db.add(item)

    db.commit()

    db.refresh(item)

    return item


def get_latest(db: Session):

    return (
        db.query(PredictionHistory)
        .order_by(PredictionHistory.timestamp.desc())
        .limit(100)
        .all()
    )