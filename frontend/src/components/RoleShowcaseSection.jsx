import { Link } from "react-router-dom";

function RoleShowcaseSection() {
  const roles = [
    {
      badge: "admin",
      badgeText: "👑 Administrator",
      title: "City System Administrator",
      description: "Full municipal governance. Manage 18+ monitored corridors, 4 city zones, incident thresholds, system diagnostics, and PDF reports.",
      features: [
        "Corridor & Zone Infrastructure Management",
        "Deep Historical Analytics & PDF Report Exports",
        "Citywide Alert Dispatch & Incident Logs",
        "System Configuration & Health Diagnostics",
      ],
      linkText: "Access Admin Portal →",
      target: "/login",
    },
    {
      badge: "operator",
      badgeText: "🚦 Traffic Operator",
      title: "Traffic Operations Console",
      description: "Real-time surveillance. Monitor live OpenStreetMap layers, trigger instant AI predictions, inspect CCTV feeds, and execute corridor rerouting.",
      features: [
        "Live 6-Camera Intersection CCTV Feeds",
        "Random Forest Congestion Prediction Engine",
        "Active Signal Cycle & PTZ Anomaly Tracking",
        "Autonomous Corridor Rerouting & Optimization",
      ],
      linkText: "Access Operator Console →",
      target: "/login",
    },
    {
      badge: "public",
      badgeText: "👤 Public Commuter",
      title: "Public User Mobility Portal",
      description: "Citizen mobility services. Query AI optimal commute paths, receive emergency road alerts, view live traffic densities, and avoid congestion.",
      features: [
        "Optimal Route Planning Across Bengaluru",
        "Active Road Incident & Weather Advisory Alerts",
        "Live Intersection Traffic Cameras & Signal Status",
        "Personalized Commute Tips & Departure Scheduling",
      ],
      linkText: "Access Commuter Portal →",
      target: "/login",
    },
  ];

  return (
    <section id="roles" className="role-showcase-section">
      <div className="section-header">
        <span className="section-tag">Role-Governed Portals</span>
        <h2>Experience Tailored Workflows for Every Role</h2>
        <p>
          TrafficVision AI provides purpose-built interfaces for municipal administrators, traffic operators, and everyday citizens.
        </p>
      </div>

      <div className="roles-grid">
        {roles.map((role, idx) => (
          <div key={idx} className="role-card">
            <div>
              <span className={`role-badge ${role.badge}`}>{role.badgeText}</span>
              <h3>{role.title}</h3>
              <p>{role.description}</p>

              <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 24px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
                {role.features.map((feat, fIdx) => (
                  <li key={fIdx} style={{ fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--primary)", fontSize: "14px" }}>✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Link to={role.target} className="role-demo-btn">
                {role.linkText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RoleShowcaseSection;
