import pandas as pd
import joblib
import json

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# Load dataset
df = pd.read_excel("dataset/trafficvision.xlsx")

# -----------------------
# Date & Time Features
# -----------------------
df["DateTime"] = pd.to_datetime(df["DateTime"])

df["Hour"] = df["DateTime"].dt.hour
df["Day"] = df["DateTime"].dt.day
df["Month"] = df["DateTime"].dt.month
df["Weekday"] = df["DateTime"].dt.weekday

# -----------------------
# Features & Target
# -----------------------
X = df.drop(columns=["Vehicle_Count", "DateTime"])
y = df["Vehicle_Count"]

# -----------------------
# Numerical Columns
# -----------------------
numeric_features = [
    "Latitude",
    "Longitude",
    "Speed",
    "Hour",
    "Day",
    "Month",
    "Weekday"
]

# -----------------------
# Categorical Columns
# -----------------------
categorical_features = [
    "Congestion_Level",
    "Weather",
    "Road_Name",
    "Traffic_Signal",
    "Accident"
]

# -----------------------
# Preprocessor
# -----------------------
preprocessor = ColumnTransformer(
    transformers=[
        (
            "cat",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features,
        )
    ],
    remainder="passthrough"
)

# -----------------------
# Model
# -----------------------
model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", model)
])

# -----------------------
# Train
# -----------------------
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

pipeline.fit(X_train, y_train)

# -----------------------
# Save Model
# -----------------------
joblib.dump(pipeline, "ml_models/traffic_model.pkl")

# -----------------------
# Save Feature Names
# -----------------------
feature_columns = list(X.columns)

with open("ml_models/feature_columns.json", "w") as f:
    json.dump(feature_columns, f)

print("✅ traffic_model.pkl created successfully")
print("✅ feature_columns.json created successfully")
