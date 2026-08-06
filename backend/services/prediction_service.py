import joblib
import pandas as pd
from pathlib import Path

# Path to ML folder
BASE_DIR = Path(__file__).resolve().parent.parent
ML_DIR = BASE_DIR / "ml_models"

# Load model and encoders
model = joblib.load(ML_DIR / "traffic_prediction_model.pkl")
label_encoders = joblib.load(ML_DIR / "label_encoders.pkl")
feature_columns = joblib.load(ML_DIR / "feature_columns.pkl")


def predict_traffic(data: dict):

    input_data = data.copy()

    # Encode categorical columns
    categorical_columns = [
        "Road_Name",
        "Weather",
        "Traffic_Signal",
        "Accident",
        "PeakHour",
        "TimeSlot"
    ]

    for col in categorical_columns:
        input_data[col] = label_encoders[col].transform([input_data[col]])[0]

    # Create DataFrame
    input_df = pd.DataFrame([input_data])

    # Arrange columns in training order
    input_df = input_df[feature_columns]

    # Predict
    vehicle_count = int(model.predict(input_df)[0])

    return vehicle_count
