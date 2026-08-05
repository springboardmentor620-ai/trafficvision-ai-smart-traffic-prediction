import os
import joblib
import numpy as np

from app.models.prediction_history import PredictionHistory
from app.services.traffic_alert_service import generate_alert_for_prediction
from app.services.ai_recommendation_service import build_recommendation

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

ML_DIR = os.path.join(BASE_DIR, "ml")

# Load model
model = joblib.load(
    os.path.join(ML_DIR, "traffic_model.pkl")
)

# Load encoders
holiday_encoder = joblib.load(
    os.path.join(ML_DIR, "holiday_encoder.pkl")
)

weather_encoder = joblib.load(
    os.path.join(ML_DIR, "weather_encoder.pkl")
)

description_encoder = joblib.load(
    os.path.join(ML_DIR, "weather_description_encoder.pkl")
)


def predict_traffic(data, db, current_user):

    print("Supported Holidays:")
    print(holiday_encoder.classes_)

    holiday = holiday_encoder.transform(
        [data.holiday]
    )[0]

    weather = weather_encoder.transform(
        [data.weather_main]
    )[0]

    print("Supported Weather Descriptions:")
    print(description_encoder.classes_)

    description = description_encoder.transform(
        [data.weather_description]
    )[0]

    features = np.array([[
        holiday,
        data.temp,
        data.rain_1h,
        data.snow_1h,
        data.clouds_all,
        weather,
        description,
        data.hour,
        data.day,
        data.month,
        data.weekday
    ]])

    prediction = model.predict(features)

    predicted_value = int(prediction[0])

    # Confidence proxy: RandomForestRegressor exposes each tree's
    # prediction via model.estimators_. A tight spread across trees means
    # the ensemble agrees (high confidence); a wide spread means the
    # trees disagree (low confidence). This is a standard technique for
    # estimating uncertainty from tree ensembles when the model doesn't
    # natively expose prediction probabilities (regression, not
    # classification).
    tree_predictions = np.array([
        tree.predict(features)[0] for tree in model.estimators_
    ])
    mean_tree_pred = float(tree_predictions.mean())
    std_tree_pred = float(tree_predictions.std())
    relative_dispersion = std_tree_pred / max(mean_tree_pred, 1.0)
    confidence = round(
        max(50.0, min(99.0, 100 - relative_dispersion * 100)), 1
    )

    if predicted_value < 2500:
        congestion = "Low"
        route = "Current Route"
    elif predicted_value < 4500:
        congestion = "Medium"
        route = "Inner Ring Road"
    else:
        congestion = "High"
        route = "Outer Ring Road"

    history = PredictionHistory(
        user_id=current_user.id,

        holiday=data.holiday,
        temp=data.temp,
        rain_1h=data.rain_1h,
        snow_1h=data.snow_1h,
        clouds_all=data.clouds_all,
        weather_main=data.weather_main,
        weather_description=data.weather_description,
        hour=data.hour,
        day=data.day,
        month=data.month,
        weekday=data.weekday,
        distance=data.distance,
        source=data.source,
        destination=data.destination,
        source_lat=data.source_lat,
        source_lng=data.source_lng,
        destination_lat=data.destination_lat,
        destination_lng=data.destination_lng,
        predicted_traffic=predicted_value,
        confidence=confidence,
        congestion=congestion,
        recommended_route=route
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    # Automatic alert generation - no manual alert creation by users.
    alert = generate_alert_for_prediction(
        db,
        user_id=current_user.id,
        prediction=history,
        data=data,
        congestion=congestion,
        recommended_route=route,
        predicted_value=predicted_value,
    )

    # Rule-based AI recommendation, built from the alert above so nothing
    # is recomputed - see app.services.ai_recommendation_service.
    recommendation = build_recommendation(
        alert=alert,
        data=data,
        congestion=congestion,
        confidence=confidence,
        recommended_route=route,
    )

    return {
        "predicted_traffic": predicted_value,
        "congestion": congestion,
        "recommended_route": route,
        "confidence": confidence,
        "alert": alert,
        "ai_recommendation": recommendation
    }