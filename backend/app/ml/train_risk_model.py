import joblib

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import r2_score
from sklearn.model_selection import train_test_split

from app.ml.feature_engineering import encode_dataframe
from app.ml.preprocess import load_dataset
from app.ml.preprocess import preprocess

print("=" * 60)
print("Training Risk Prediction Model")
print("=" * 60)

df = load_dataset()
df = preprocess(df)
df, encoders = encode_dataframe(df)

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

X = df[FEATURE_COLUMNS]

y = df["risk_score"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

pred = model.predict(X_test)

print()
print("MAE :", round(mean_absolute_error(y_test, pred), 4))
print("R² Score :", round(r2_score(y_test, pred), 4))

joblib.dump(
    model,
    "app/saved_models/risk_model.pkl"
)

print()
print("Risk model saved successfully.")