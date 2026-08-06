import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAlerts, getTrafficStatistics } from "../services/trafficService";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_records: 0,
    average_vehicle_count: 0,
    average_speed: 0,
    traffic_condition: "Loading...",
    weather: "Loading...",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function loadStatistics() {
      try {
        const [data, currentAlerts] = await Promise.all([getTrafficStatistics(), getAlerts()]);
        setStats(data); setAlerts(currentAlerts.slice(0, 3));
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStatistics();
    const interval = setInterval(loadStatistics, 60000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();

  const currentDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = today.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="dashboard">

      {/* Top Navigation */}
      <header className="topbar">
        <h2>TrafficVision AI</h2>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      {/* Welcome Section */}
      <section className="welcome">
        <h1>Smart Traffic Dashboard</h1>

        <p>
          AI-Based Traffic Monitoring & Congestion Management System
        </p>

        <div className="city-details">

          <div className="city-card">
            <h3> City</h3>
            <p>{stats.areas || 0} areas</p>
          </div>

          <div className="city-card">
            <h3> Traffic status</h3>
            <p>{stats.traffic_condition}</p>
          </div>

          <div className="city-card">
            <h3> Monitoring</h3>
            <p>Live Traffic</p>
          </div>

          <div className="city-card">
            <h3> Coverage</h3>
            <p>{stats.total_records.toLocaleString()} records</p>
          </div>

        </div>

        <div className="date-time">
          <p>{currentDate}</p>
          <p>{currentTime}</p>
        </div>

      </section>

      <section className="cards">
        <div className="card health"><h3>Recent Alerts</h3><h2>{alerts.length}</h2><p>{alerts[0]?.alert_type || "No active alerts"}</p></div>
        <div className="card speed"><h3>Latest Prediction</h3><h2>{stats.traffic_condition}</h2><p>Based on latest dataset conditions</p></div>
      </section>

      {/* Navigation Buttons */}
      <div className="navigation-buttons">

        <button
          className="records-btn"
          onClick={() => navigate("/traffic-records")}
        >
          View Traffic Records
        </button>

        <button
          className="records-btn"
          onClick={() => navigate("/live-map")}
        >
          View Live Traffic Map
        </button>

      </div>

      {/* Dashboard Cards */}
      <section className="cards">

        <div className="card vehicle">
          <h3> Average Vehicle Count</h3>
          <h2>{isLoading ? <span className="skeleton-line" /> : stats.average_vehicle_count}</h2>
          <p>Average vehicles detected</p>
        </div>

        <div className="card congestion">
          <h3> Congestion Level</h3>

          <h2
            className={
              stats.traffic_condition === "Low"
                ? "low"
                : stats.traffic_condition === "Medium"
                ? "medium"
                : "high"
            }
          >
            {isLoading ? <span className="skeleton-line" /> : stats.traffic_condition}
          </h2>

          <p>Current traffic congestion</p>
        </div>

        <div className="card weather">
          <h3> Weather</h3>
          <h2>{isLoading ? <span className="skeleton-line" /> : stats.weather}</h2>
          <p>Current weather condition</p>
        </div>

        <div className="card speed">
          <h3> Average Speed</h3>
          <h2>{isLoading ? <span className="skeleton-line" /> : `${stats.average_speed} km/h`}</h2>
          <p>Average traffic speed</p>
        </div>

        <div className="card status">
          <h3> Total Records</h3>
          <h2>{isLoading ? <span className="skeleton-line" /> : stats.total_records}</h2>
          <p>Historical dataset records</p>
        </div>

        <div className="card health">
          <h3> Traffic Health</h3>

          <h2
            className={
              stats.average_speed >= 60
                ? "low"
                : stats.average_speed >= 40
                ? "medium"
                : "high"
            }
          >
            {isLoading ? <span className="skeleton-line" /> : stats.average_speed >= 60
              ? "Good"
              : stats.average_speed >= 40
              ? "Moderate"
              : "Heavy"}
          </h2>

          <p>Based on average traffic speed</p>
        </div>

      </section>

      {/* Footer */}
      <footer className="footer">
        <p>TrafficVision AI</p>
        <p>Smart Traffic Prediction & Congestion Management System</p>
        <p>Version 1.0</p>
      </footer>

    </div>
  );
}

export default Dashboard;
