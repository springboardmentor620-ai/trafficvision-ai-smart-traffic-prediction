import joblib
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "best_model.pkl"

model = joblib.load(MODEL_PATH)


def predict(data):

    prediction = model.predict(data)

    return float(prediction[0])


def get_prediction_level(score):

    if score <= 30:
        return "Normal"

    elif score <= 70:
        return "Moderate"

    return "Heavy"


def get_recommendation(level):

    if level == "Normal":
        return "Traffic flowing normally."

    elif level == "Moderate":
        return "Monitor traffic and adjust signals if required."

    return "Deploy traffic police and recommend alternate routes."