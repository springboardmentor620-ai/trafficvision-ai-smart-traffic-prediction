import joblib

encoder = joblib.load("holiday_encoder.pkl")

print(encoder.classes_)