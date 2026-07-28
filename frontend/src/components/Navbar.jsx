import {
  FaBell,
  FaCloudSun,
  FaUserCircle,
} from "react-icons/fa";

import "../styles/Navbar.css";

function Navbar() {
  const today = new Date();

  const currentDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentTime = today.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="navbar">

      <div className="navbar-left">

        <h2>TrafficVision AI Dashboard</h2>

        <p>
          Smart Traffic Prediction &
          Congestion Management
        </p>

      </div>

      <div className="navbar-right">

        <div className="nav-card">

          <FaCloudSun className="nav-icon" />

          <div>
            <span>Weather</span>
            <h4>Bengaluru</h4>
          </div>

        </div>

        <div className="nav-card">

          <div>
            <span>Date</span>
            <h4>{currentDate}</h4>
          </div>

        </div>

        <div className="nav-card">

          <div>
            <span>Time</span>
            <h4>{currentTime}</h4>
          </div>

        </div>

        <FaBell className="notification" />

        <FaUserCircle className="profile" />

      </div>

    </header>
  );
}

export default Navbar;