"""Train and persist the TrafficVision Random Forest traffic-condition model."""
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

try:
    from .features import CATEGORICAL_FEATURES, NUMERIC_FEATURES, RAW_FEATURES, TARGET_COLUMN, build_feature_frame
except ImportError:  # Supports direct execution: python ml_model/train_model.py
    from features import CATEGORICAL_FEATURES, NUMERIC_FEATURES, RAW_FEATURES, TARGET_COLUMN, build_feature_frame


BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "processed_traffic_data.csv"
MODEL_PATH = Path(__file__).resolve().parent / "traffic_model.pkl"


def train_model() -> dict:
    """Clean data, encode categorical inputs, train, evaluate, and save the model."""
    data = pd.read_csv(DATASET_PATH).drop_duplicates()
    required_columns = set(RAW_FEATURES + [TARGET_COLUMN])
    missing_columns = required_columns - set(data.columns)
    if missing_columns:
        raise ValueError(f"Dataset is missing required columns: {sorted(missing_columns)}")

    data = data.dropna(subset=[TARGET_COLUMN])
    target = data[TARGET_COLUMN].astype(str).str.lower()
    features = build_feature_frame(data)

    X_train, X_test, y_train, y_test = train_test_split(
        features, target, test_size=0.20, random_state=42, stratify=target
    )
    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", Pipeline([("imputer", SimpleImputer(strategy="median"))]), NUMERIC_FEATURES),
            ("categorical", Pipeline([
                ("imputer", SimpleImputer(strategy="most_frequent")),
                ("encoder", OneHotEncoder(handle_unknown="ignore")),
            ]), CATEGORICAL_FEATURES),
        ]
    )
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=300, random_state=42, class_weight="balanced", n_jobs=-1
        )),
    ])
    pipeline.fit(X_train, y_train)
    predictions = pipeline.predict(X_test)
    labels = sorted(target.unique().tolist())
    feature_names = pipeline.named_steps["preprocessor"].get_feature_names_out()
    importances = pipeline.named_steps["classifier"].feature_importances_
    feature_importance = sorted(
        [{"feature": str(name), "importance": round(float(value), 4)} for name, value in zip(feature_names, importances)],
        key=lambda item: item["importance"], reverse=True,
    )[:12]

    artifact = {
        "model": pipeline,
        "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
        "confusion_matrix": confusion_matrix(y_test, predictions, labels=labels).tolist(),
        "labels": labels,
        "feature_importance": feature_importance,
        "raw_features": RAW_FEATURES,
        "training_rows": int(len(data)),
    }
    joblib.dump(artifact, MODEL_PATH)
    return artifact


if __name__ == "__main__":
    result = train_model()
    print(f"Model saved to {MODEL_PATH}")
    print(f"Accuracy: {result['accuracy']:.2%}")

