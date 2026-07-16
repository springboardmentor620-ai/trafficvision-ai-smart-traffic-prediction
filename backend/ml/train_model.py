import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

# -----------------------------
# Load Dataset
# -----------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

dataset_path = os.path.join(
    BASE_DIR,
    "..",
    "imports",
    "Metro_Interstate_Traffic_Volume.csv"
)

df = pd.read_csv(dataset_path)

# -----------------------------
# Feature Engineering
# -----------------------------

df["date_time"] = pd.to_datetime(df["date_time"])

df["hour"] = df["date_time"].dt.hour
df["day"] = df["date_time"].dt.day
df["month"] = df["date_time"].dt.month
df["weekday"] = df["date_time"].dt.weekday

df["holiday"] = df["holiday"].fillna("None")

holiday_encoder = LabelEncoder()
weather_encoder = LabelEncoder()
description_encoder = LabelEncoder()

df["holiday"] = holiday_encoder.fit_transform(
    df["holiday"].astype(str)
)

df["weather_main"] = weather_encoder.fit_transform(
    df["weather_main"]
)

df["weather_description"] = description_encoder.fit_transform(
    df["weather_description"]
)

features = [
    "holiday",
    "temp",
    "rain_1h",
    "snow_1h",
    "clouds_all",
    "weather_main",
    "weather_description",
    "hour",
    "day",
    "month",
    "weekday"
]

X = df[features]
y = df["traffic_volume"]

# -----------------------------
# Train/Test Split
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# -----------------------------
# Train Model
# -----------------------------

model = RandomForestRegressor(
    n_estimators=150,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# -----------------------------
# Evaluate Model
# -----------------------------

predictions = model.predict(X_test)

print("\n========== MODEL RESULTS ==========")
print("R² Score :", round(r2_score(y_test, predictions), 4))
print("MAE      :", round(mean_absolute_error(y_test, predictions), 2))
print("RMSE     :", round(mean_squared_error(y_test, predictions) ** 0.5, 2))
print("===================================\n")

# -----------------------------
# Save Model
# -----------------------------

model_path = os.path.join(BASE_DIR, "traffic_model.pkl")

holiday_encoder_path = os.path.join(BASE_DIR, "holiday_encoder.pkl")
weather_encoder_path = os.path.join(BASE_DIR, "weather_encoder.pkl")
description_encoder_path = os.path.join(BASE_DIR, "weather_description_encoder.pkl")

joblib.dump(model, model_path)
joblib.dump(holiday_encoder, holiday_encoder_path)
joblib.dump(weather_encoder, weather_encoder_path)
joblib.dump(description_encoder, description_encoder_path)

print(f"Model saved successfully at:\n{model_path}")
print("Encoders saved successfully.")