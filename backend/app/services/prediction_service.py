import os
import joblib
import numpy as np

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


def predict_traffic(data):


    holiday = holiday_encoder.transform([data.holiday])[0]

    weather = weather_encoder.transform(
        [data.weather_main]
    )[0]

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

    return {
        "predicted_traffic": int(prediction[0])
    }