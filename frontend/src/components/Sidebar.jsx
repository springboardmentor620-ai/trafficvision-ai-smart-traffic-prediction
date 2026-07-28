import {
  MdDashboard,
  MdTraffic,
} from "react-icons/md";

import {
  FaMapMarkedAlt,
  FaRoute,
  FaFileAlt,
  FaUserCircle,
} from "react-icons/fa";

import { HiChartBar } from "react-icons/hi";

import { FiLogOut } from "react-icons/fi";

import { NavLink } from "react-router-dom";

import "../styles/Sidebar.css";

const navigationItems = [
  { to: "/dashboard", icon: MdDashboard, label: "Dashboard" },
  { to: "/traffic-records", icon: MdTraffic, label: "Traffic Records" },
  { to: "/live-map", icon: FaMapMarkedAlt, label: "Live Map" },
  { to: "/navigation", icon: FaRoute, label: "Smart Navigation" },
  { to: "/analytics", icon: HiChartBar, label: "Analytics" },
  { to: "/reports", icon: FaFileAlt, label: "Reports" },
  { to: "/profile", icon: FaUserCircle, label: "Profile" },
];

function Sidebar() {
  return (
    <div className="sidebar">

      <div className="logo">

        <h2>🚦 TrafficVision AI</h2>

        <p>Smart Traffic Management</p>

      </div>

      <h4 className="menu-title">
        MAIN MENU
      </h4>

      <nav>
        {navigationItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className="menu-item">
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}

      </nav>

      <div className="sidebar-bottom">

        <div className="system-status">

          <div className="green-dot"></div>

          <span>System Online</span>

        </div>

        <button className="logout">

          <FiLogOut />

          Logout

        </button>

      </div>

    </div>
  );
}

export default Sidebar;
