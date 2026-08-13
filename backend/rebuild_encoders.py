"""
Rebuild label_encoders.pkl with all categorical values.
Run this once to fix the missing 'Hitech City' and other categories.
"""
import joblib
import numpy as np
from sklearn.preprocessing import LabelEncoder
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ML_DIR = BASE_DIR / "ml_models"

# Define all possible categories for each categorical column
CATEGORIES = {
    "Road_Name": [
        "Hitech City",
        "Miyapur",
        "Tank Bund",
        "Abids Road",
        "Banjara Hills Rd 1",
        "Madhapur",
        "Kukatpally",
        "Necklace Road",
        "Koti Road",
        "Jubilee Hills Road"
    ],
    "Weather": [
        "Clear",
        "Rainy",
        "Cloudy",
        "Foggy",
        "Stormy"
    ],
    "Traffic_Signal": [
        "Working",
        "Not Working",
        "Faulty"
    ],
    "Accident": [
        "Yes",
        "No"
    ],
    "PeakHour": [
        "Peak",
        "Non-Peak"
    ],
    "TimeSlot": [
        "Morning",
        "Afternoon",
        "Evening",
        "Night"
    ]
}

# Create label encoders for each category
label_encoders = {}

for col, categories in CATEGORIES.items():
    le = LabelEncoder()
    le.fit(categories)
    label_encoders[col] = le
    print(f"✅ {col}: {list(le.classes_)}")

# Save to pickle
encoders_path = ML_DIR / "label_encoders.pkl"
joblib.dump(label_encoders, encoders_path)
print(f"\n✅ Saved to {encoders_path}")

# Verify
loaded = joblib.load(encoders_path)
print(f"\n✅ Verification: Loaded {len(loaded)} encoders")
for col in loaded:
    print(f"   {col}: {len(loaded[col].classes_)} classes")
