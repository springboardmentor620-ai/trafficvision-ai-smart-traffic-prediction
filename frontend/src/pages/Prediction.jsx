import { useState } from "react";
import { predictTraffic } from "../services/predictionService";
import "../styles/Prediction.css";
import { useNavigate } from "react-router-dom";
const AREAS = [
  "Electronic City",
  "Hebbal",
  "Indiranagar",
  "Jayanagar",
  "Koramangala",
  "M.G. Road",
  "Whitefield",
  "Yeshwanthpur",
];

function Prediction() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    source: "",
    destination: "",
  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const swapLocations = () => {

    setFormData((prev) => ({
      source: prev.destination,
      destination: prev.source,
    }));

  };

  const handlePrediction = async () => {

    if (!formData.source || !formData.destination) {

        alert("Please select Source and Destination");

        return;

    }

    try {

        setLoading(true);

        const response = await predictTraffic({

            source: formData.source,

            destination: formData.destination

        });

        console.log(response);

        setResult(response);

        localStorage.setItem(

            "latestPrediction",

            JSON.stringify(response)

        );
        localStorage.setItem(
          "reportData",
          JSON.stringify(response)
        );

        const previous = JSON.parse(

            localStorage.getItem("trafficAlerts")

        ) || [];

        previous.push(response);

        localStorage.setItem(

            "trafficAlerts",

            JSON.stringify(previous)

        );

        setTimeout(() => {

            navigate("/recommendations");

        }, 2000);

    }

    catch (err) {

        console.log(err);

        alert("Prediction Failed");

    }

    finally {

        setLoading(false);

    }

};

  const getStatusColor = (severity) => {

    switch (severity) {

      case "Severe":
        return "#dc2626";

      case "High":
        return "#ef4444";

      case "Medium":
        return "#f59e0b";

      case "Low":
        return "#22c55e";

      default:
        return "#3b82f6";

    }

  };

  return (

    <div className="prediction-page">

      <h1 className="prediction-title">
        🚦 AI Traffic Congestion Prediction
      </h1>

      <p className="prediction-subtitle">
        Select a source and destination to predict traffic congestion.
      </p>

      <div className="prediction-form">

        <div className="form-grid">

          <div className="form-group">

            <label>📍 Source</label>

            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
            >

              <option value="">
                Select Source
              </option>

              {AREAS.map((area) => (

                <option
                  key={area}
                  value={area}
                >
                  {area}
                </option>

              ))}

            </select>

          </div>

          <div className="swap-container">

            <button
              type="button"
              className="swap-btn"
              onClick={swapLocations}
            >
              ⇄
            </button>

          </div>

          <div className="form-group">

            <label>🎯 Destination</label>

            <select
              name="destination"
              value={formData.destination}
              onChange={handleChange}
            >

              <option value="">
                Select Destination
              </option>

              {AREAS.filter(
                (a) => a !== formData.source
              ).map((area) => (

                <option
                  key={area}
                  value={area}
                >
                  {area}
                </option>

              ))}

            </select>

          </div>

        </div>

        <button
          className="predict-btn"
          onClick={handlePrediction}
        >

          {loading
            ? "Predicting..."
            : "🚀 Predict Congestion"}

        </button>

        
                {result && (

          <div className="result-card">

            <h2>📊 Prediction Result</h2>

            <div className="result-grid">

              <div className="result-box">
                <h4>📍 Source</h4>
                <h3>{result.source}</h3>
              </div>

              <div className="result-box">
                <h4>🎯 Destination</h4>
                <h3>{result.destination}</h3>
              </div>

              <div className="result-box">
                <h4>📏 Distance</h4>
                <h3>{result.distance} km</h3>
              </div>

              <div className="result-box">
                <h4>⏱ Estimated Time</h4>
                <h3>{result.duration} mins</h3>
              </div>

              <div className="result-box">
                <h4>🚦 Congestion</h4>
                <h3>
                  {Number(result.predicted_congestion).toFixed(1)}%
                </h3>
              </div>

              <div className="result-box">
                <h4>🚨 Severity</h4>

                <h3
                  style={{
                    color: getStatusColor(result.severity)
                  }}
                >
                  {result.severity}
                </h3>

              </div>

              <div className="result-box">
                <h4>🚗 Traffic Level</h4>
                <h3>{result.traffic_level}</h3>
              </div>

              <div className="result-box">
                <h4>⛽ Fuel</h4>
                <h3>{result.fuel} L</h3>
              </div>

            </div>

            <div className="ai-box">

              <div className="alert-header">

                <h3>
                  🚨 Traffic Alerts
                </h3>

                <div
                  className={`priority-badge ${result.alert_priority.toLowerCase()}`}
                >
                  {result.alert_priority}
                </div>

              </div>

              <p className="alert-time">
                🕒 {result.alert_time}
              </p>

              <ul>

                {result.alerts &&
                  result.alerts.map((item, index) => (

                    <li key={index}>
                      {item}
                    </li>

                  ))}

              </ul>

            </div>

            <div className="ai-box">

              <h3>
                💡 AI Recommendations
              </h3>

              <ul>

                {result.recommendations &&
                  result.recommendations.map((item, index) => (

                    <li key={index}>
                      {item}
                    </li>

                  ))}

              </ul>

            </div>

            {result.route && (

              <div className="route-summary">

                <h3>
                  🛣 Route Summary
                </h3>

                <div className="route-grid">

                  <div className="route-box">

                    <h4>Recommended Route</h4>

                    <p>
                      Distance :
                      <strong>
                        {" "}
                        {result.route.distance} km
                      </strong>
                    </p>

                    <p>
                      Time :
                      <strong>
                        {" "}
                        {result.route.duration} mins
                      </strong>
                    </p>

                    <p>
                      Traffic :
                      <strong>
                        {" "}
                        {result.route.traffic}
                      </strong>
                    </p>

                  </div>

                  {result.alternate_route && (

                    <div className="route-box">

                      <h4>
                        Alternate Route
                      </h4>

                      <p>
                        Distance :
                        <strong>
                          {" "}
                          {result.alternate_route.distance} km
                        </strong>
                      </p>

                      <p>
                        Time :
                        <strong>
                          {" "}
                          {result.alternate_route.duration} mins
                        </strong>
                      </p>

                      <p>
                        Traffic :
                        <strong>
                          {" "}
                          {result.alternate_route.traffic}
                        </strong>
                      </p>

                    </div>

                  )}

                </div>

              </div>

            )}

          </div>

        )}

      </div>

    </div>

  );

}

export default Prediction;