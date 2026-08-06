from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd

from .features import RAW_FEATURES, build_feature_frame


MODEL_PATH = Path(__file__).resolve().parent / "traffic_model.pkl"


@lru_cache(maxsize=1)
def load_model_artifact() -> dict:
    """Load the persisted model once per backend process."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Traffic model is not trained. Run ml_model/train_model.py first.")
    return joblib.load(MODEL_PATH)


def predict_traffic_condition(payload: dict) -> dict:
    """Predict a traffic condition and return model evaluation metadata."""
    missing_features = [feature for feature in RAW_FEATURES if feature not in payload]
    if missing_features:
        raise ValueError(f"Missing prediction fields: {', '.join(missing_features)}")

    artifact = load_model_artifact()
    input_frame = build_feature_frame(pd.DataFrame([{feature: payload[feature] for feature in RAW_FEATURES}]))
    probabilities = artifact["model"].predict_proba(input_frame)[0]
    classes = artifact["model"].classes_
    best_index = int(probabilities.argmax())
    return {
        "predicted_traffic_condition": str(classes[best_index]),
        "confidence": round(float(probabilities[best_index]) * 100, 2),
        "model_accuracy": round(float(artifact["accuracy"]) * 100, 2),
        "confusion_matrix": {"labels": artifact["labels"], "matrix": artifact["confusion_matrix"]},
        "feature_importance": artifact["feature_importance"],
    }

