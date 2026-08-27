import { Link } from "react-router-dom";
import "../styles/HeroSection.css";

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-badge-pill">
          <span className="pulse-beacon"></span>
          <span>Bengaluru Urban Mobility & AI Traffic Platform</span>
        </div>

        <h1>
          Autonomous Traffic Intelligence for{" "}
          <span className="gradient-text">Congestion-Free</span> Cities.
        </h1>

        <p>
          TrafficVision AI combines real-time IoT sensor telemetry, machine learning congestion forecasting,
          and dynamic corridor rerouting to eliminate urban bottlenecks across Bengaluru.
        </p>

        <div className="hero-buttons">
          <Link to="/login" className="hero-btn-primary">
            <span>Explore Live Dashboard</span>
            <span>→</span>
          </Link>

          <Link to="/register" className="hero-btn-secondary">
            <span>Create Public Account</span>
          </Link>
        </div>

        <div className="hero-trust-chips">
          <span>🧠 Random Forest ML Engine</span>
          <span>•</span>
          <span>🚦 18+ Monitored Corridors</span>
          <span>•</span>
          <span>🗺️ Real-Time GIS Mapping</span>
          <span>•</span>
          <span>🛡️ Role-Based Access</span>
        </div>
      </div>

      <div className="hero-right">
        <div className="telemetry-preview-card">
          <div className="telemetry-card-header">
            <h3>
              <span>📡</span> Live City Telemetry Engine
            </h3>
            <span className="telemetry-live-badge">
              <span className="pulse-beacon" style={{ width: "6px", height: "6px" }}></span>
              Live Telemetry
            </span>
          </div>

          <div className="corridor-item">
            <div className="corridor-top">
              <span className="corridor-name">🛣️ M.G. Road (Zone 1 - Central)</span>
              <span className="corridor-status-tag optimal">Optimal Flow</span>
            </div>
            <div className="corridor-stats">
              <span>Flow: 420 veh/hr</span>
              <span>Avg Speed: 48 km/h</span>
            </div>
          </div>

          <div className="corridor-item">
            <div className="corridor-top">
              <span className="corridor-name">🛣️ Silk Board Flyover (Zone 3 - South)</span>
              <span className="corridor-status-tag reroute">Heavy Congestion</span>
            </div>
            <div className="corridor-stats">
              <span>Flow: 920 veh/hr</span>
              <span>Avg Speed: 16 km/h</span>
            </div>
          </div>

          <div className="corridor-item">
            <div className="corridor-top">
              <span className="corridor-name">🛣️ Outer Ring Road (Zone 2 - East)</span>
              <span className="corridor-status-tag moderate">Moderate Flow</span>
            </div>
            <div className="corridor-stats">
              <span>Flow: 680 veh/hr</span>
              <span>Avg Speed: 34 km/h</span>
            </div>
          </div>

          <div className="telemetry-forecast-box">
            <span className="forecast-icon">🤖</span>
            <div className="forecast-text">
              <h5>ML Horizon Forecast: +30 Mins</h5>
              <p>Predicts congestion probabilities using vehicle volume, speed limits, and weather indices.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;