import joblib

encoder = joblib.load("weather_description_encoder.pkl")
print(encoder.classes_)