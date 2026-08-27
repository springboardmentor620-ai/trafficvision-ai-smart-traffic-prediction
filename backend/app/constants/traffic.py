# backend/app/constants/traffic.py
#
# Canonical ML contract constants for TrafficVision AI.
#
# These values are derived directly from the training pipeline and MUST match:
#   analysis/src/feature_engineering.py  — encode_weather(), traffic_category()
#   analysis/src/preprocessing.py        — create_preprocessor()
#
# DO NOT change these values without retraining best_model.pkl.
# Confirmed against the fitted model via:
#   model.named_steps['preprocessor'].transformers_[0][2]  → OHE columns + categories
#   model.named_steps['preprocessor'].transformers_[1][2]  → numeric passthrough columns
# ─────────────────────────────────────────────────────────────────────────────

# ─── Weather encoding ────────────────────────────────────────────────────────
# Source: FeatureEngineering.encode_weather() in analysis/src/feature_engineering.py
# Original raw column: "Weather Conditions"
# Encoded column fed to model: "Weather" (integer)
WEATHER_ENCODING: dict[str, int] = {
    "Clear":    0,
    "Overcast": 1,
    "Fog":      2,
    "Rain":     3,
    "Windy":    4,
}

# Ordered list for dropdown menus — order matches encoding above.
WEATHER_OPTIONS: list[str] = list(WEATHER_ENCODING.keys())
# → ['Clear', 'Overcast', 'Fog', 'Rain', 'Windy']

# ─── Traffic Category ────────────────────────────────────────────────────────
# Source: FeatureEngineering.traffic_category() in analysis/src/feature_engineering.py
# pd.cut(bins=[0, 15000, 30000, 50000, 100000],
#         labels=['Low', 'Moderate', 'Heavy', 'Severe'])
#
# The trained OneHotEncoder knows exactly these four strings.
# Any other value produces a zero-vector (silently ignored by handle_unknown='ignore').
TRAFFIC_CATEGORY_LABELS: list[str] = ["Low", "Moderate", "Heavy", "Severe"]


def get_traffic_category(traffic_volume: int) -> str:
    """
    Derive Traffic Category from Traffic Volume using the identical bin
    boundaries as the training pipeline's pd.cut call.

    Bins: (0, 15000] → Low
          (15000, 30000] → Moderate
          (30000, 50000] → Heavy
          (50000, 100000] → Severe

    Falls back to 'Severe' for volumes above 100 000 (out-of-training range).
    Returns one of: 'Low', 'Moderate', 'Heavy', 'Severe'.
    """
    if traffic_volume < 15_000:
        return "Low"
    elif traffic_volume < 30_000:
        return "Moderate"
    elif traffic_volume < 50_000:
        return "Heavy"
    else:
        return "Severe"


# ─── Congestion prediction thresholds ────────────────────────────────────────
# Applied to the RandomForestRegressor's continuous output (approximate range 0–100).
# Used by: prediction router, simulator.
CONGESTION_THRESHOLD_LOW: float = 30.0      # score < 30  → "Low"
CONGESTION_THRESHOLD_MODERATE: float = 70.0  # score < 70  → "Moderate"
# score >= 70 → "High"

# Prediction-level labels (stored in prediction_history, returned by the API).
# Vocabulary: Low | Moderate | High
PREDICTION_LEVEL_LOW: str = "Low"
PREDICTION_LEVEL_MODERATE: str = "Moderate"
PREDICTION_LEVEL_HIGH: str = "High"

# ─── Live-traffic status labels ───────────────────────────────────────────────
# Written by the simulator into the `traffic` table (column: status).
# Consumed by /traffic endpoint and TrafficMap.jsx getStatusColor().
# Derived from average speed, NOT from the ML prediction score.
# Vocabulary: Normal | Moderate | Heavy  (DISTINCT from prediction levels above)
TRAFFIC_STATUS_NORMAL: str = "Normal"
TRAFFIC_STATUS_MODERATE: str = "Moderate"
TRAFFIC_STATUS_HEAVY: str = "Heavy"
