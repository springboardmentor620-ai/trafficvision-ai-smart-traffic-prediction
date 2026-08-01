import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

from app.ml.feature_engineering import encode_dataframe
from app.ml.preprocess import load_dataset
from app.ml.preprocess import preprocess

print("=" * 60)
print("Training Severity Prediction Model")
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

y = df["accident_severity"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

pred = model.predict(X_test)

accuracy = accuracy_score(y_test, pred)

print()
print(f"Accuracy : {accuracy * 100:.2f}%")

joblib.dump(
    model,
    "app/saved_models/severity_model.pkl"
)

joblib.dump(
    encoders,
    "app/saved_models/label_encoders.pkl"
)

print()
print("Severity model saved successfully.")