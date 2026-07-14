import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>TrafficVision AI Dashboard</h1>

        <button
          onClick={handleLogout}
          className="logout-btn"
        >
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <h2>Welcome to TrafficVision AI 🚦</h2>

        <p>
          AI Smart Traffic Prediction & Congestion Management System
        </p>

        {/* Your dashboard cards, charts and analytics will go here */}
      </div>
    </div>
  );
}

export default Dashboard;