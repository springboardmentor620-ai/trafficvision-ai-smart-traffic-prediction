import joblib

encoder = joblib.load("weather_encoder.pkl")
print(encoder.classes_)