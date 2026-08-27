// frontend/src/constants/traffic.js
//
// Canonical frontend constants for TrafficVision AI.
//
// IMPORTANT — these must stay in sync with:
//   backend/app/constants/traffic.py
//
// The backend converts WEATHER_OPTIONS strings to integers before the ML model.
// Any string not in WEATHER_ENCODING on the backend will produce a 422 error.

// ─── Weather options ─────────────────────────────────────────────────────────
// Backend encoding: Clear→0, Overcast→1, Fog→2, Rain→3, Windy→4
export const WEATHER_OPTIONS = [
  "Clear",
  "Overcast",
  "Fog",
  "Rain",
  "Windy",
];

// ─── Prediction levels ───────────────────────────────────────────────────────
// Values returned by the API in the `prediction_level` field.
// Stored in prediction_history.prediction_level in the database.
export const PREDICTION_LEVEL = {
  LOW:      "Low",
  MODERATE: "Moderate",
  HIGH:     "High",
};

// ─── Live-traffic status ─────────────────────────────────────────────────────
// Values returned by /traffic endpoint in the `status` field.
// Written by the simulator based on average speed (independent of ML output).
export const TRAFFIC_STATUS = {
  NORMAL:   "Normal",
  MODERATE: "Moderate",
  HEAVY:    "Heavy",
};

// ─── Colour mapping for TrafficMap circles ───────────────────────────────────
// Maps live-traffic `status` values to hex colours.
export function getStatusColor(status) {
  switch (status) {
    case TRAFFIC_STATUS.HEAVY:    return "#ef4444";
    case TRAFFIC_STATUS.MODERATE: return "#f59e0b";
    case TRAFFIC_STATUS.NORMAL:   return "#22c55e";
    default:                      return "#3b82f6";
  }
}
