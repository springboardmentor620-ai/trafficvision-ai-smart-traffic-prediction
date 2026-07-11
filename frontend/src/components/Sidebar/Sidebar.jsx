import "./Sidebar.css";

import {
  MdDashboard,
  MdTraffic,
  MdAnalytics,
  MdAssessment,
  MdSettings,
  MdLogout,
} from "react-icons/md";

function Sidebar() {
  return (
    <div className="sidebar">

      <div className="logo">

        <h2>🚦 TrafficVision AI</h2>

        <p>Smart Traffic System</p>

      </div>

      <ul>

        <li className="active">
          <MdDashboard className="icon" />
          Dashboard
        </li>

        <li>
          <MdTraffic className="icon" />
          Live Traffic
        </li>

        <li>
          <MdAnalytics className="icon" />
          Prediction
        </li>

        <li>
          <MdAssessment className="icon" />
          Analytics
        </li>

        <li>
          <MdSettings className="icon" />
          Settings
        </li>

      </ul>

      <div className="sidebar-footer">

        <button className="sidebar-logout">

          <MdLogout />

          Logout

        </button>

      </div>

    </div>
  );
}

export default Sidebar;