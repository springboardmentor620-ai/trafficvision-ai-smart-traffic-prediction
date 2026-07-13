import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

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
        <h2> TrafficVision AI</h2>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Welcome Section */}
      <section className="welcome">

        <h1>Welcome, Admin </h1>

        <p>
          Smart Traffic Prediction & Congestion Management Dashboard
        </p>

        <div className="date-time">
          <p>{currentDate}</p>
          <p>{currentTime}</p>
        </div>

      </section>

      {/* Dashboard Cards */}

      <section className="cards">

        <div className="card vehicle">
          <h3> Vehicle Count</h3>
          <h2>1250</h2>
          <p>Vehicles detected today</p>
        </div>

        <div className="card congestion">
          <h3> Congestion</h3>
          <h2>Medium</h2>
          <p>Current traffic condition</p>
        </div>

        <div className="card weather">
          <h3> Weather</h3>
          <h2>Sunny</h2>
          <p>Temperature 32°C</p>
        </div>

        <div className="card status">
          <h3> Traffic Status</h3>
          <h2>Normal</h2>
          <p>All roads are operational</p>
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