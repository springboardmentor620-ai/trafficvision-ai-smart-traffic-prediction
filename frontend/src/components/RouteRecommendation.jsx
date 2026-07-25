import { useState } from "react";
import "../styles/RouteRecommendation.css";
import RouteMap from "./RouteMap";

function RouteRecommendation({ areas = [] }) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const [routeData, setRouteData] = useState(null);

  const findRoute = () => {
    if (!source || !destination) {
      alert("Please select both source and destination.");
      return;
    }

    if (source === destination) {
      alert("Source and Destination cannot be the same.");
      return;
    }

    // Clear previous result
    setRouteData(null);
  };

  return (
    <div className="route-card">

      <h2>🛣️ Smart Route Recommendation</h2>

      <p className="route-subtitle">
        Select your source and destination to discover the fastest route and
        AI-powered alternate route.
      </p>

      <div className="route-search">

        <div className="input-group">
          <label>📍 From</label>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">Select Starting Area</option>

            {areas.map((area) => (
              <option
                key={area}
                value={area}
              >
                {area}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>🎯 To</label>

          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            <option value="">Select Destination</option>

            {areas.map((area) => (
              <option
                key={area}
                value={area}
              >
                {area}
              </option>
            ))}
          </select>
        </div>

        <button
          className="route-btn"
          onClick={findRoute}
        >
          🚗 Find Best Route
        </button>

      </div>

      {routeData && (
        <div className="route-result">

          <div className="route-box">
            <h3>✅ Recommended Route</h3>

            <p>
              <strong>Distance:</strong>{" "}
              {routeData.recommended.distance.toFixed(2)} km
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {routeData.recommended.duration} mins
            </p>

            <p>
              <strong>Traffic:</strong>{" "}
              {routeData.recommended.traffic}
            </p>
          </div>

          {routeData.alternate && (
            <div className="route-box">
              <h3>🛣️ Alternate Route</h3>

              <p>
                <strong>Distance:</strong>{" "}
                {routeData.alternate.distance.toFixed(2)} km
              </p>

              <p>
                <strong>Time:</strong>{" "}
                {routeData.alternate.duration} mins
              </p>

              <p>
                <strong>Traffic:</strong>{" "}
                {routeData.alternate.traffic}
              </p>
            </div>
          )}

          <div className="route-box">
            <h3>🏆 Best Route</h3>

            <h2 style={{ color: "green" }}>
              {routeData.comparison.best_route}
            </h2>

            <p>
              ✔ Saves{" "}
              {routeData.comparison.time_saved} mins
            </p>

            <p>
              ✔ Saves{" "}
              {routeData.comparison.distance_saved.toFixed(2)} km
            </p>

            <p>
              ✔ Less Traffic
            </p>
          </div>

        </div>
      )}

      <RouteMap
        source={source}
        destination={destination}
        onRouteData={(data) => setRouteData(data)}
      />

    </div>
  );
}

export default RouteRecommendation;