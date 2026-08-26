import pandas as pd
from datetime import datetime

from app.ml.model_loader import encoders
from app.ml.model_loader import risk_model
from app.ml.model_loader import severity_model


FEATURE_COLUMNS = [
    "city",
    "state",
    "hour",
    "day_of_week",
    "is_weekend",
    "road_type",
    "lanes",
    "traffic_signal",
    "weather",
    "visibility",
    "temperature",
    "traffic_density",
    "cause",
    "vehicles_involved",
    "casualties",
    "is_peak_hour",
    "festival",
    "day",
    "month",
    "year"
]


def prepare_dataframe(request):

    current_date = datetime.now()

    data = {
        "city": request.city,
        "state": request.state,

        "hour": request.hour,
        "day_of_week": request.day_of_week,
        "is_weekend": request.is_weekend,

        "road_type": request.road_type,
        "lanes": request.lanes,
        "traffic_signal": request.traffic_signal,

        "weather": request.weather,
        "visibility": request.visibility,
        "temperature": request.temperature,

        "traffic_density": request.traffic_density,
        "cause": request.cause,
        "vehicles_involved": request.vehicles_involved,
        "casualties": request.casualties,

        "is_peak_hour": request.is_peak_hour,
        "festival": request.festival,

        # Use the actual current date
        # instead of fixed values.
        "day": current_date.day,
        "month": current_date.month,
        "year": current_date.year
    }

    df = pd.DataFrame([data])

    categorical_columns = [
        "city",
        "state",
        "day_of_week",
        "road_type",
        "weather",
        "visibility",
        "traffic_density",
        "cause",
        "festival"
    ]

    for column in categorical_columns:

        encoder = encoders[column]

        value = str(df.loc[0, column])

        if value in encoder.classes_:

            df[column] = encoder.transform([value])

        else:

            # Keep the existing fallback behaviour
            # for unseen categories.
            df[column] = 0

    # Match the exact feature order used during training.
    df = df[FEATURE_COLUMNS]

    return df


def predict(request):

    df = prepare_dataframe(request)

    # =========================================================
    # SEVERITY PREDICTION
    # =========================================================

    severity_encoded = severity_model.predict(df)[0]

    severity = encoders[
        "accident_severity"
    ].inverse_transform(
        [severity_encoded]
    )[0]

    # =========================================================
    # RISK PREDICTION
    # =========================================================

    risk = float(
        risk_model.predict(df)[0]
    )

    return severity, risk