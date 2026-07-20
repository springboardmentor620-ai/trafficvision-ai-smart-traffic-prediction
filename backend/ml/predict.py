import os
import joblib
import pandas as pd

# Load the trained model
current_dir = os.path.dirname(__file__)

model_path = os.path.join(current_dir, "traffic_model.pkl")

model = joblib.load(model_path)

# Sample input data
sample_data = pd.DataFrame([{
    "Area Name": 2,
    "Road/Intersection Name": 5,
    "Traffic Volume": 35000,
    "Average Speed": 35,
    "Travel Time Index": 1.5,
    "Road Capacity Utilization": 80,
    "Incident Reports": 1,
    "Environmental Impact": 70,
    "Public Transport Usage": 60,
    "Traffic Signal Compliance": 85,
    "Parking Usage": 75,
    "Pedestrian and Cyclist Count": 120,
    "Weather Conditions": 0,
    "Roadwork and Construction Activity": 0,
    "Year": 2022,
    "Month": 1,
    "Day": 15
}])

# Predict congestion level
prediction = model.predict(sample_data)

print("Predicted Congestion Level:", prediction[0])