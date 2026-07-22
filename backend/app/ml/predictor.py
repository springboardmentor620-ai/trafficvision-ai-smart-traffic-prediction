import joblib
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "best_model.pkl"

model = joblib.load(MODEL_PATH)


def predict(data):
    prediction = model.predict(data)
    return float(prediction[0])