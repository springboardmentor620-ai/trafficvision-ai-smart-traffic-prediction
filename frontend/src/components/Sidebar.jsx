import { NavLink } from "react-router-dom";
import "./../styles/sidebar.css";

function Sidebar() {
  const menu = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: "🏠",
    },
    {
      title: "Traffic Monitoring",
      path: "/admin/traffic",
      icon: "🚦",
    },
    {
      title: "Analytics",
      path: "/admin/analytics",
      icon: "📊",
    },
    {
      title: "Alerts",
      path: "/admin/alerts",
      icon: "🚨",
    },
    {
      title: "Reports",
      path: "/admin/reports",
      icon: "📄",
    },
    {
      title: "Road Management",
      path: "/admin/roads",
      icon: "🛣️",
    },
    {
      title: "Zone Management",
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
      title: "Settings",
      path: "/admin/settings",
      icon: "⚙️",
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>TrafficVision AI</h2>
      </div>

      <nav>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-item active"
                : "sidebar-item"
            }
          >
            <span className="icon">
              {item.icon}
            </span>

            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;