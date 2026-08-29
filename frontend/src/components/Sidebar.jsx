import { useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import Logo from "./common/Logo";
import "./../styles/sidebar.css";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "admin";
  const { isOpen, isMobile, closeSidebar, toggleSidebar } = useSidebar();

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const isVisible = isMobile ? isOpen : isHovered || isOpen;

  const adminMenu = [
    {
      title: "Command Hub",
      path: "/admin",
      icon: "🏠",
    },
    {
      title: "User Management",
      path: "/admin/users",
      icon: "👥",
    },
    {
      title: "AI Prediction Engine",
      path: "/operator/prediction",
      icon: "🧠",
    },
    {
      title: "Operator Console",
      path: "/operator",
      icon: "🖥️",
    },
    {
      title: "Traffic Monitoring",
      path: "/admin/traffic",
      icon: "🚦",
    },
    {
      title: "Deep Analytics",
      path: "/admin/analytics",
      icon: "📊",
    },
    {
      title: "Alerts & Incidents",
      path: "/admin/alerts",
      icon: "🚨",
    },
    {
      title: "Municipal Reports",
      path: "/admin/reports",
      icon: "📄",
    },
    {
      title: "Road Inventory",
      path: "/admin/roads",
      icon: "🛣️",
    },
    {
      title: "Zone Topology",
      path: "/admin/zones",
      icon: "🗺️",
    },
    {
      title: "Route Optimization",
      path: "/admin/routes",
      icon: "🚗",
    },
    {
      title: "Historical Analytics",
      path: "/admin/history",
      icon: "📈",
    },
    {
      title: "Platform Settings",
      path: "/admin/settings",
      icon: "⚙️",
    },
  ];

  const operatorMenu = [
    {
      title: "Operator Console",
      path: "/operator",
      icon: "🏠",
    },
    {
      title: "AI Prediction",
      path: "/operator/prediction",
      icon: "🧠",
    },
    {
      title: "Traffic Monitoring",
      path: "/admin/traffic",
      icon: "🚦",
    },
    {
      title: "Alerts & Incidents",
      path: "/admin/alerts",
      icon: "🚨",
    },
    {
      title: "Reports & Logs",
      path: "/admin/reports",
      icon: "📄",
    },
    {
      title: "Route Optimization",
      path: "/admin/routes",
      icon: "🚗",
    },
    {
      title: "Settings",
      path: "/admin/settings",
      icon: "⚙️",
    },
  ];

  const commuterMenu = [
    {
      title: "Mobility Hub",
      path: "/commuter",
      icon: "🏠",
    },
    {
      title: "Optimal Route Planner",
      path: "/admin/routes",
      icon: "🚗",
    },
    {
      title: "Live City Alerts",
      path: "/admin/alerts",
      icon: "🚨",
    },
    {
      title: "City Traffic Map",
      path: "/commuter/map",
      icon: "🗺️",
    },
    {
      title: "Settings",
      path: "/admin/settings",
      icon: "⚙️",
    },
  ];

  const menu =
    role === "traffic_operator"
      ? operatorMenu
      : role === "commuter"
      ? commuterMenu
      : adminMenu;

  return (
    <div className="sidebar-hover-wrapper">
      {/* Desktop Left-Edge Hover Trigger Rail */}
      {!isMobile && (
        <div
          className="sidebar-trigger-rail"
          onMouseEnter={handleMouseEnter}
          title="Hover to expand navigation menu"
        >
          <div className="sidebar-trigger-handle">
            <div className="sidebar-trigger-indicator" />
            <span className="sidebar-trigger-text">Menu</span>
            <span style={{ fontSize: "10px" }}>❯</span>
          </div>
        </div>
      )}

      {/* Mobile Backdrop Overlay */}
      {isMobile && isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main Collapsible / Hoverable Sidebar Drawer */}
      <aside
        className={`sidebar ${isVisible ? "sidebar-open" : "sidebar-collapsed"}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="sidebar-logo">
          <Logo size="sm" to="/admin" />
          <button
            onClick={() => {
              if (isMobile) closeSidebar();
              else {
                setIsHovered(false);
                toggleSidebar();
              }
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted, #94a3b8)",
              cursor: "pointer",
              fontSize: "14px",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-role-badge">
          <small>
            {role === "traffic_operator"
              ? "Traffic Operator"
              : role === "commuter"
              ? "Public Commuter"
              : "System Admin"}
          </small>
          <span className="sidebar-hover-hint">
            <span>Hover to reveal</span>
          </span>
        </div>

        <nav>
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (isMobile) closeSidebar();
                else setIsHovered(false);
              }}
              className={({ isActive }) =>
                isActive ? "sidebar-item active" : "sidebar-item"
              }
            >
              <span className="icon">{item.icon}</span>
              <span className="sidebar-title">{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}

export default Sidebar;