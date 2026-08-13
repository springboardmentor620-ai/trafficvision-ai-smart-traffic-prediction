import pandas as pd
import joblib
import json
import os

from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==========================
# Load Dataset
# ==========================

df = pd.read_csv(
    "dataset/traffic_hyderabad_realistic.csv"
)


print("Dataset Loaded")
print(df.head())


# ==========================
# Remove unwanted columns
# ==========================

df = df.drop(
    columns=[
        "DateTime",
        "Alternative_Route",
        "Estimated_Delay"
    ]
)


# ==========================
# Encode categorical columns
# ==========================

categorical_columns = [
    "Congestion_Level",
    "Weather",
    "Road_Name",
    "Traffic_Signal",
    "Accident",
    "TimeSlot"
]


encoders = {}


for col in categorical_columns:

    encoder = LabelEncoder()

    df[col] = encoder.fit_transform(
        df[col].astype(str)
    )

    encoders[col] = encoder


# ==========================
# Features and Target
# ==========================

X = df.drop(
    columns=[
        "Vehicle_Count"
    ]
)


y = df["Vehicle_Count"]


# Save feature names

feature_columns = list(X.columns)


# ==========================
# Split Data
# ==========================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,
    test_size=0.2,
    random_state=42

)


# ==========================
# Train Model
# ==========================

model = RandomForestRegressor(

    n_estimators=200,
    random_state=42

)


model.fit(

    X_train,
    y_train

)


# ==========================
# Evaluation
# ==========================

prediction = model.predict(
    X_test
)


print("======================")
print("MODEL RESULT")
print("======================")

print(
    "MAE:",
    mean_absolute_error(
        y_test,
        prediction
    )
)


print(
    "RMSE:",
    mean_squared_error(
        y_test,
        prediction,
        squared=False
    )
)


print(
    "R2:",
    r2_score(
        y_test,
        prediction
    )
)


# ==========================
# Create folder
# ==========================

os.makedirs(
    "ml_models",
    exist_ok=True
)


# ==========================
# Save Files
# ==========================

joblib.dump(

    model,

    "ml_models/traffic_model.pkl"

)


joblib.dump(

    encoders,

    "ml_models/label_encoders.pkl"

)


with open(
    "ml_models/feature_columns.json",
    "w"
) as f:

    json.dump(
        feature_columns,
        f,
        indent=4
    )


print("✅ Model saved")
print("✅ Encoders saved")
print("✅ Feature columns saved")
