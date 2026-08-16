"""Train Random Forest models on the Kaggle Bangalore Traffic Analysis dataset.

Dataset: https://www.kaggle.com/datasets/asshridattaaigal/bangalore-traffic-analysis-dataset
Outputs:
  model/route_travel_time_rf.pkl   - travel time regressor (sklearn)
  model/route_speed_rf.pkl         - speed regressor (sklearn)
  model/metrics.json               - evaluation metrics
  src/lib/ml/route-forest.json     - compact forest export scored at the edge
  src/lib/ml/places.json (via export_places.py)
"""
import json, os, pickle
import numpy as np, pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

CSV = os.environ.get("ROUTES_CSV", "/tmp/kag/bangalore_routes.csv")
OUT = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(OUT)
DOW = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
WEA = ["Clear","Cloudy","Rainy","Foggy"]

df = pd.read_csv(CSV)
df = df.sample(n=min(500000, len(df)), random_state=42)
df["dow"] = df.day_of_week.map({d: i for i, d in enumerate(DOW)}).fillna(0)
df["wea"] = df.weather.map({w: i for i, w in enumerate(WEA)}).fillna(0)
df["is_weekend"] = (df.dow >= 5).astype(int)

FEATURES = ["distance","hour","dow","is_weekend","is_peak","wea","road_capacity","signal_time"]
X = df[FEATURES].to_numpy(np.float32)

def train(y, name, n=22, depth=11):
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42)
    m = RandomForestRegressor(n_estimators=n, max_depth=depth, min_samples_leaf=25,
                              n_jobs=-1, random_state=42)
    m.fit(Xtr, ytr)
    p = m.predict(Xte)
    met = {
        "mae": float(mean_absolute_error(yte, p)),
        "rmse": float(np.sqrt(mean_squared_error(yte, p))),
        "r2": float(r2_score(yte, p)),
        "rows": int(len(df)),
    }
    with open(os.path.join(OUT, f"{name}.pkl"), "wb") as f:
        pickle.dump(m, f)
    print(name, met)
    return m, met

tt_model, tt_metrics = train(df.travel_time.to_numpy(np.float32), "route_travel_time_rf")
sp_model, sp_metrics = train(df.speed.to_numpy(np.float32), "route_speed_rf")
veh_model, veh_metrics = train(df.vehicles.to_numpy(np.float32), "route_vehicles_rf", n=16, depth=10)

def export(model):
    trees = []
    for est in model.estimators_:
        t = est.tree_
        trees.append({
            "f": [int(v) for v in t.feature],
            "t": [round(float(v), 3) for v in t.threshold],
            "l": [int(v) for v in t.children_left],
            "r": [int(v) for v in t.children_right],
            "v": [round(float(v[0][0]), 3) for v in t.value],
        })
    return {"features": FEATURES, "trees": trees}

bundle = {
    "features": FEATURES,
    "travelTime": export(tt_model),
    "speed": export(sp_model),
    "vehicles": export(veh_model),
    "metrics": {"travelTime": tt_metrics, "speed": sp_metrics, "vehicles": veh_metrics},
    "dayOfWeek": DOW,
    "weather": WEA,
}
path = os.path.join(ROOT, "src/lib/ml/route-forest.json")
with open(path, "w") as f:
    json.dump(bundle, f, separators=(",", ":"))
print("wrote", path, os.path.getsize(path) / 1e6, "MB")
json.dump(bundle["metrics"], open(os.path.join(OUT, "metrics.json"), "w"), indent=2)
