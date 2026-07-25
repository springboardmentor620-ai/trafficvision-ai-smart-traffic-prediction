import { useState } from "react";
import { predictTraffic } from "../services/predictionService";
import "../styles/Prediction.css";

const roadOptions = {
  "Electronic City": [
    "Hosur Road",
    "Silk Board Junction",
  ],

  Hebbal: [
    "Hebbal Flyover",
    "Ballari Road",
  ],

  Indiranagar: [
    "100 Feet Road",
    "CMH Road",
  ],

  Jayanagar: [
    "Jayanagar 4th Block",
    "South End Circle",
  ],

  Koramangala: [
    "Sony World Junction",
    "Sarjapur Road",
  ],

  "M.G. Road": [
    "Trinity Circle",
    "Anil Kumble Circle",
  ],

  Whitefield: [
    "ITPL Main Road",
    "Marathahalli Bridge",
  ],

  Yeshwanthpur: [
    "Tumkur Road",
    "Yeshwanthpur Circle",
  ],
};

function Prediction() {
  const [loading, setLoading] = useState(false);

  const [prediction, setPrediction] = useState(null);

  const [status, setStatus] = useState("");

  const [recommendation, setRecommendation] = useState("");

  const [formData, setFormData] = useState({
    area_name: "",
    road_name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "area_name") {
      setFormData({
        area_name: value,
        road_name: "",
      });

      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePrediction = async () => {
    if (!formData.area_name || !formData.road_name) {
      alert("Please select Area and Road.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        area_name: formData.area_name,
        road_name: formData.road_name,

        traffic_volume: 35000,
        average_speed: 35,
        travel_time_index: 1.5,
        road_capacity_utilization: 80,
        incident_reports: 1,
        environmental_impact: 70,
        public_transport_usage: 60,
        traffic_signal_compliance: 85,
        parking_usage: 75,
        pedestrian_count: 120,
        weather_conditions: "Clear",
        roadwork_activity: "No",
        year: 2022,
        month: 1,
        day: 15,
      };

      const result = await predictTraffic(payload);

      const value = Number(result.predicted_congestion_level);

      setPrediction(value);

      if (value < 35) {
        setStatus("🟢 Smooth Traffic");
        setRecommendation(
          "Traffic is flowing smoothly. No congestion is expected."
        );
      } else if (value < 65) {
        setStatus("🟡 Moderate Traffic");
        setRecommendation(
          "Moderate traffic expected. Start your journey a little earlier."
        );
      } else if (value < 85) {
        setStatus("🟠 Heavy Traffic");
        setRecommendation(
          "Heavy congestion expected. Use an alternate route if possible."
        );
      } else {
        setStatus("🔴 Severe Congestion");
        setRecommendation(
          "Avoid this route during peak hours."
        );
      }
    } catch (error) {
      console.error(error);
      alert("Prediction Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-page">

      <h1 className="prediction-title">
        🚦 AI Traffic Congestion Prediction
      </h1>

      <p className="prediction-subtitle">
        Select a Bengaluru area and road to predict traffic congestion.
      </p>

      <div className="prediction-form">

        <div className="form-grid">

          <div className="form-group">
            <label>Area</label>

            <select
              name="area_name"
              value={formData.area_name}
              onChange={handleChange}
            >
              <option value="">Select Area</option>

              {Object.keys(roadOptions).map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Road</label>

            <select
              name="road_name"
              value={formData.road_name}
              onChange={handleChange}
              disabled={!formData.area_name}
            >
              <option value="">Select Road</option>

              {formData.area_name &&
                roadOptions[formData.area_name].map((road) => (
                  <option key={road} value={road}>
                    {road}
                  </option>
                ))}
            </select>
          </div>

        </div>

        <button
          className="predict-btn"
          onClick={handlePrediction}
        >
          {loading ? "Predicting..." : "🚀 Predict Congestion"}
        </button>

        {prediction !== null && (
          <div className="result-card">

            <h2>📊 Prediction Result</h2>

            <div className="result-grid">

              <div className="result-box">
                <h4>📍 Area</h4>
                <h3>{formData.area_name}</h3>
              </div>

              <div className="result-box">
                <h4>🛣 Road</h4>
                <h3>{formData.road_name}</h3>
              </div>

              <div className="result-box">
                <h4>🤖 Congestion</h4>
                <h3>{prediction.toFixed(2)}</h3>
              </div>

              <div className="result-box">
                <h4>Status</h4>
                <h3>{status}</h3>
              </div>

            </div>

            <div className="ai-box">

              <h3>💡 AI Recommendation</h3>

              <p>{recommendation}</p>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default Prediction;