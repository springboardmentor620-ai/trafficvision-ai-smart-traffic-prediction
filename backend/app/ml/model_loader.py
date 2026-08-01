import joblib


severity_model = joblib.load(
    "app/saved_models/severity_model.pkl"
)

risk_model = joblib.load(
    "app/saved_models/risk_model.pkl"
)

encoders = joblib.load(
    "app/saved_models/label_encoders.pkl"
)