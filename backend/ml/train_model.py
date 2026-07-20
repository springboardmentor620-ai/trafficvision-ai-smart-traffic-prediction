import pandas as pd
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# -------------------------------------
# Load Dataset
# -------------------------------------

current_dir = os.path.dirname(__file__)

file_path = os.path.join(
    current_dir,
    "..",
    "data",
    "Banglore_traffic_Dataset.csv"
)

df = pd.read_csv(file_path)

# -------------------------------------
# Encode Categorical Columns
# -------------------------------------

encoders = {}

categorical_columns = [
    "Area Name",
    "Road/Intersection Name",
    "Weather Conditions",
    "Roadwork and Construction Activity"
]

for column in categorical_columns:

    encoder = LabelEncoder()

    df[column] = encoder.fit_transform(df[column])

    encoders[column] = encoder

# Convert Date to datetime

df["Date"] = pd.to_datetime(df["Date"])

# Extract useful information

df["Year"] = df["Date"].dt.year
df["Month"] = df["Date"].dt.month
df["Day"] = df["Date"].dt.day

# Remove original Date column

df.drop("Date", axis=1, inplace=True)

# -------------------------------------
# Features and Target
# -------------------------------------

X = df.drop("Congestion Level", axis=1)

y = df["Congestion Level"]

# -------------------------------------
# Split Dataset
# -------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# -------------------------------------
# Train Model
# -------------------------------------

model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# -------------------------------------
# Predictions
# -------------------------------------

predictions = model.predict(X_test)

# -------------------------------------
# Evaluation
# -------------------------------------

print("\nModel Performance")

print("MAE :", mean_absolute_error(y_test, predictions))

print("MSE :", mean_squared_error(y_test, predictions))

print("R2 Score :", r2_score(y_test, predictions))

# -------------------------------------
# Save Model
# -------------------------------------

model_path = os.path.join(current_dir, "traffic_model.pkl")

joblib.dump(model, model_path)

encoder_path = os.path.join(current_dir, "label_encoders.pkl")

joblib.dump(encoders, encoder_path)

print("Encoders Saved Successfully!")

print(model_path)