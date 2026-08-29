import threading
from pathlib import Path
import joblib

MODEL_PATH = Path(__file__).parent / "best_model.pkl"

_model = None
_model_lock = threading.Lock()


def get_model():
    """
    Lazy thread-safe singleton loader for the trained RandomForestRegressor model pipeline.
    Prevents module import blocking and accelerates application startup.
    """
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                if not MODEL_PATH.exists():
                    raise FileNotFoundError(f"Model weights file not found at {MODEL_PATH}")
                _model = joblib.load(MODEL_PATH)
    return _model


def predict(data):
    """
    Run the trained RandomForestRegressor pipeline on a prepared DataFrame.

    The model is a sklearn Pipeline with two steps:
      1. 'preprocessor': ColumnTransformer
         - OneHotEncoder on ['Area Name', 'Road/Intersection Name', 'Traffic Category']
           Traffic Category OHE categories: ['Heavy', 'Low', 'Moderate', 'Severe']
         - passthrough on all numeric columns
      2. 'model': RandomForestRegressor(n_estimators=200, random_state=42)

    Input `data` must be a pandas DataFrame with these columns in any order:
      Area Name, Road/Intersection Name, Traffic Category,
      Traffic Volume, Average Speed, Travel Time Index,
      Road Capacity Utilization, Incident Reports, Environmental Impact,
      Public Transport Usage, Traffic Signal Compliance, Parking Usage,
      Pedestrian and Cyclist Count, Year, Month, Day, DayOfWeek,
      Weather (int: 0–4), Roadwork (int: 0 or 1)

    Returns:
        float — predicted congestion score (approximate range 0–100).

    Note on confidence:
        The model is a RandomForestRegressor. It does NOT expose predict_proba
        and was trained without oob_score=True. No per-prediction confidence
        metric is available from this model. Confidence values are not returned.
    """
    model = get_model()
    prediction = model.predict(data)

    return float(prediction[0])