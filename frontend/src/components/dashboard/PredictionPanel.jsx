import { useState } from "react";
import { predictCongestion } from "../../services/prediction";
import { WEATHER_OPTIONS } from "../../constants/traffic";
import "../../styles/prediction.css";

function PredictionPanel({ predictionResult, setPredictionResult }) {
  const areas = [
    "Indiranagar",
    "Whitefield",
    "Koramangala",
    "Electronic City",
    "M.G. Road",
    "Jayanagar",
    "Hebbal",
    "Yeshwanthpur",
    "Marathahalli",
    "HSR Layout",
  ];

  const roads = [
    "M.G. Road",
    "Brigade Road",
    "100 Feet Road",
    "CMH Road",
    "Outer Ring Road",
    "ITPL Main Road",
    "Whitefield Main Road",
    "Hosur Road",
    "Electronic City Flyover",
    "Silk Board Flyover",
    "Koramangala 80 Feet Road",
    "Sony World Junction",
    "Bannerghatta Road",
    "Bellary Road",
    "Hebbal Flyover",
    "Tumkur Road",
    "Yeshwanthpur Circle",
    "Sarjapur Road",
  ];

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    Area_Name: "Whitefield",
    Road_Intersection_Name: "Outer Ring Road",
    Traffic_Volume: 18500,
    Average_Speed: 36,
    Travel_Time_Index: 1.6,
    Road_Capacity_Utilization: 82,
    Incident_Reports: 1,
    Environmental_Impact: 68,
    Public_Transport_Usage: 45,
    Traffic_Signal_Compliance: 88,
    Parking_Usage: 65,
    Pedestrian_and_Cyclist_Count: 180,
    Weather: "Clear",
    Roadwork: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let parsed = value;
    if (type === "number" || type === "range") {
      parsed = value === "" ? "" : Number(value);
    } else if (type === "checkbox") {
      parsed = checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsed,
    }));
  };

  const applyPreset = (preset) => {
    if (preset === "peak") {
      setFormData((prev) => ({
        ...prev,
        Area_Name: "Koramangala",
        Road_Intersection_Name: "Silk Board Flyover",
        Traffic_Volume: 28000,
        Average_Speed: 14,
        Weather: "Clear",
        Roadwork: false,
      }));
    } else if (preset === "rain") {
      setFormData((prev) => ({
        ...prev,
        Area_Name: "Indiranagar",
        Road_Intersection_Name: "100 Feet Road",
        Traffic_Volume: 19500,
        Average_Speed: 22,
        Weather: "Rain",
        Roadwork: true,
      }));
    } else if (preset === "normal") {
      setFormData((prev) => ({
        ...prev,
        Area_Name: "M.G. Road",
        Road_Intersection_Name: "M.G. Road",
        Traffic_Volume: 11000,
        Average_Speed: 52,
        Weather: "Clear",
        Roadwork: false,
      }));
    }
  };

  const handlePredict = async () => {
    try {
      setLoading(true);
      const result = await predictCongestion(formData);

      if (setPredictionResult) {
        setPredictionResult({
          ...result,
          area: formData.Area_Name,
          road: formData.Road_Intersection_Name,
          trafficVolume: formData.Traffic_Volume,
          averageSpeed: formData.Average_Speed,
          weather: formData.Weather,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Prediction calculation failed. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (w) => {
    switch (w) {
      case "Clear":
        return "☀️";
      case "Rain":
        return "🌧️";
      case "Overcast":
        return "⛅";
      case "Fog":
        return "🌫️";
      case "Windy":
        return "💨";
      default:
        return "🌤️";
    }
  };

  return (
    <div className="prediction-panel-overhaul">
      {/* Header with AI Badge and Presets */}
      <div className="prediction-header">
        <div className="header-left">
          <div className="ai-status-pill">
            <span className="pulse-dot"></span>
            <span>Random Forest ML Model</span>
          </div>
          <h2>AI Traffic Congestion Forecaster</h2>
          <p className="subtitle">
            Simulate dynamic intersection variables and forecast bottleneck risk levels.
          </p>
        </div>

        <div className="preset-scenarios">
          <span className="preset-label">Quick Scenarios:</span>
          <div className="preset-chips">
            <button type="button" onClick={() => applyPreset("peak")} className="preset-chip">
              🔥 Peak Rush Hour
            </button>
            <button type="button" onClick={() => applyPreset("rain")} className="preset-chip">
              🌧️ Rain Advisory
            </button>
            <button type="button" onClick={() => applyPreset("normal")} className="preset-chip">
              ⚡ Optimal Flow
            </button>
          </div>
        </div>
      </div>

      {/* Form Controls Grid */}
      <div className="prediction-form-grid">
        {/* Left Column: Corridor & Geography */}
        <div className="form-card-column">
          <h4 className="column-title">
            <span>📍</span> Geography & Corridor
          </h4>

          <div className="field-group">
            <label>Municipal Area / Sector</label>
            <select name="Area_Name" value={formData.Area_Name} onChange={handleChange} className="form-select">
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Target Road / Intersection</label>
            <select
              name="Road_Intersection_Name"
              value={formData.Road_Intersection_Name}
              onChange={handleChange}
              className="form-select"
            >
              {roads.map((road) => (
                <option key={road} value={road}>
                  {road}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Active Roadwork / Construction</label>
            <div className="toggle-switch-wrapper">
              <label className="switch">
                <input
                  type="checkbox"
                  name="Roadwork"
                  checked={formData.Roadwork}
                  onChange={handleChange}
                />
                <span className="slider round"></span>
              </label>
              <span className="switch-status-text">
                {formData.Roadwork ? "🚧 Roadwork Hazard Present" : "Clear Roadway"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamics & Weather */}
        <div className="form-card-column">
          <h4 className="column-title">
            <span>📊</span> Flow Telemetry & Atmosphere
          </h4>

          <div className="field-group">
            <div className="label-row">
              <label>Hourly Traffic Volume</label>
              <span className="value-badge">{formData.Traffic_Volume.toLocaleString()} veh/hr</span>
            </div>
            <input
              type="range"
              name="Traffic_Volume"
              min="2000"
              max="40000"
              step="500"
              value={formData.Traffic_Volume}
              onChange={handleChange}
              className="slider-range"
            />
          </div>

          <div className="field-group">
            <div className="label-row">
              <label>Average Vehicle Speed</label>
              <span className="value-badge">{formData.Average_Speed} km/h</span>
            </div>
            <input
              type="range"
              name="Average_Speed"
              min="5"
              max="80"
              step="1"
              value={formData.Average_Speed}
              onChange={handleChange}
              className="slider-range"
            />
          </div>

          <div className="field-group">
            <label>Weather Condition</label>
            <div className="weather-chips-container">
              {WEATHER_OPTIONS.map((w) => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setFormData((prev) => ({ ...prev, Weather: w }))}
                  className={`weather-chip-btn ${formData.Weather === w ? "active" : ""}`}
                >
                  <span>{getWeatherIcon(w)}</span>
                  <span>{w}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compute Prediction Action Button */}
      <div className="prediction-submit-row">
        <button type="button" onClick={handlePredict} disabled={loading} className="predict-execute-btn">
          {loading ? (
            <>
              <span className="spinner-dot"></span>
              <span>Evaluating Neural Regressor...</span>
            </>
          ) : (
            <>
              <span>⚡ Execute ML Congestion Forecast</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>

      {/* Prediction Result Display */}
      {predictionResult && (
        <div className="prediction-result-card animate-fadeIn">
          <div className="result-header">
            <div className="result-title-group">
              <span className="result-badge-icon">🧠</span>
              <div>
                <h3>AI Prediction Forecast</h3>
                <p>
                  Evaluated for <strong>{predictionResult.road || formData.Road_Intersection_Name}</strong> ({predictionResult.area || formData.Area_Name})
                </p>
              </div>
            </div>

            <div
              className={`risk-level-tag ${
                predictionResult.prediction_level === "High"
                  ? "danger"
                  : predictionResult.prediction_level === "Moderate"
                  ? "warning"
                  : "success"
              }`}
            >
              ● {predictionResult.prediction_level} Risk Level
            </div>
          </div>

          {/* Metric Highlights Strip */}
          <div className="result-metrics-grid">
            <div className="result-metric-box">
              <span className="metric-title">Congestion Index</span>
              <div className="metric-score-row">
                <h2>
                  {typeof predictionResult.congestion_prediction === "number"
                    ? predictionResult.congestion_prediction.toFixed(1)
                    : predictionResult.congestion_prediction}
                  %
                </h2>
              </div>
              <div className="metric-progress-bar">
                <div
                  className="metric-progress-fill"
                  style={{
                    width: `${Math.min(predictionResult.congestion_prediction, 100)}%`,
                    backgroundColor:
                      predictionResult.congestion_prediction >= 70
                        ? "var(--danger)"
                        : predictionResult.congestion_prediction >= 40
                        ? "var(--warning)"
                        : "var(--success)",
                  }}
                ></div>
              </div>
            </div>

            <div className="result-metric-box">
              <span className="metric-title">Simulated Volume</span>
              <h2>{(predictionResult.trafficVolume || formData.Traffic_Volume).toLocaleString()}</h2>
              <span className="metric-note">Vehicles / Hour</span>
            </div>

            <div className="result-metric-box">
              <span className="metric-title">Predicted Velocity</span>
              <h2>{predictionResult.averageSpeed || formData.Average_Speed} km/h</h2>
              <span className="metric-note">Corridor Flow</span>
            </div>
          </div>

          {/* Recommendations & Alternate Route */}
          <div className="result-actions-grid">
            <div className="recommendation-box">
              <div className="rec-header">
                <span>🚦</span>
                <h4>AI Signal & Dispatch Recommendation</h4>
              </div>
              <p>{predictionResult.recommended_action || "Maintain adaptive signal cycle times."}</p>
            </div>

            <div className="alternate-route-box">
              <div className="rec-header">
                <span>🗺️</span>
                <h4>Suggested Bypass Corridor</h4>
              </div>
              <p>{predictionResult.alternate_route || "Outer Ring Road via Inner Arterial Bypass"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PredictionPanel;