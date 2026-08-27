import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import TrafficMap from "../../components/dashboard/TrafficMap";
import { optimizeRoute } from "../../services/routes";
import { getAlerts } from "../../services/alerts";


function Dashboard() {
  const [source, setSource] = useState("Indiranagar");
  const [destination, setDestination] = useState("Whitefield");
  const [routeResult, setRouteResult] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const bangaloreLocations = [
    "Indiranagar",
    "Whitefield",
    "Koramangala",
    "Electronic City",
    "M.G. Road",
    "Jayanagar",
    "Hebbal",
    "Yeshwanthpur",
    "Marathahalli",
    "HSR Layout",
  ];

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoadingAlerts(true);
        const data = await getAlerts();
        setAlerts((data || []).filter((a) => a.status === "Active"));
      } catch (err) {
        console.error("Failed to load alerts", err);
      } finally {
        setLoadingAlerts(false);
      }
    };

    fetchAlerts();
  }, []);

  const handlePlanRoute = async (e) => {
    e.preventDefault();
    if (!source || !destination) return;

    try {
      setLoadingRoute(true);
      const res = await optimizeRoute(source, destination);
      setRouteResult(res);
    } catch (err) {
      console.error("Route planning failed", err);
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ width: "100%" }}>

          {/* Header Banner */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              padding: "28px 32px",
              boxShadow: "var(--shadow-sm)",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  backgroundColor: "var(--primary-tint)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                }}
              >
                👤
              </div>
              <div>
                <h1 style={{ color: "var(--text-primary)", margin: 0, fontSize: "24px", fontWeight: "700" }}>
                  Public User Mobility Hub
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "4px 0 0 0" }}>
                  AI-assisted commute planning, active city bottleneck alerts, and traffic intelligence.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "var(--bg-surface-secondary)",
                borderRadius: "20px",
                border: "1px solid var(--border-color)",
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--success)",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--success)" }}></span>
              Live Telemetry Connected
            </div>
          </div>

          {/* Commuter Quick Actions Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            <Link
              to="/admin/routes"
              style={{
                padding: "14px 18px",
                backgroundColor: "var(--bg-surface)",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "transform 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <span style={{ fontSize: "22px" }}>🚗</span>
              <div>
                <strong style={{ color: "var(--text-primary)", fontSize: "14px", display: "block" }}>Route Optimizer</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>A* shortest congestion paths</span>
              </div>
            </Link>

            <Link
              to="/admin/traffic"
              style={{
                padding: "14px 18px",
                backgroundColor: "var(--bg-surface)",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "transform 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <span style={{ fontSize: "22px" }}>🚦</span>
              <div>
                <strong style={{ color: "var(--text-primary)", fontSize: "14px", display: "block" }}>City Traffic Cameras</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>6-camera intersection feeds</span>
              </div>
            </Link>

            <Link
              to="/admin/alerts"
              style={{
                padding: "14px 18px",
                backgroundColor: "var(--bg-surface)",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "transform 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <span style={{ fontSize: "22px" }}>🚨</span>
              <div>
                <strong style={{ color: "var(--text-primary)", fontSize: "14px", display: "block" }}>City Emergency Alerts</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Active road hazard warnings</span>
              </div>
            </Link>

            <Link
              to="/admin/settings"
              style={{
                padding: "14px 18px",
                backgroundColor: "var(--bg-surface)",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "transform 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <span style={{ fontSize: "22px" }}>⚙️</span>
              <div>
                <strong style={{ color: "var(--text-primary)", fontSize: "14px", display: "block" }}>User Settings</strong>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>Preferences & Profile</span>
              </div>
            </Link>
          </div>


          {/* Main 2-Column Content Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "24px",
              marginBottom: "28px",
            }}
          >
            {/* Smart Route Planner Card */}
            <div
              style={{
                backgroundColor: "var(--bg-surface)",
                borderRadius: "16px",
                border: "1px solid var(--border-color)",
                padding: "24px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "22px" }}>🗺️</span>
                <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
                  Commute Route Planner
                </h2>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
                Find optimal travel corridors to bypass active congestion points across Bengaluru.
              </p>

              <form onSubmit={handlePlanRoute}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                    Starting Junction (Origin)
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  >
                    {bangaloreLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                    Destination Point
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  >
                    {bangaloreLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loadingRoute}
                  style={{
                    width: "100%",
                    height: "44px",
                    backgroundColor: "var(--primary)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {loadingRoute ? "Calculating Optimal Path..." : "🚗 Find Best Route"}
                </button>
              </form>

              {routeResult && (
                <div
                  style={{
                    marginTop: "24px",
                    padding: "18px",
                    backgroundColor: "var(--bg-surface-secondary)",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--primary)", margin: "0 0 12px 0" }}>
                    Recommended Corridor Path
                  </h3>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                    {routeResult.recommended_route?.map((r, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          padding: "4px 10px",
                          backgroundColor: "var(--bg-surface)",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          color: "var(--text-primary)",
                        }}
                      >
                        📍 {r}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-secondary)" }}>
                    <span>Estimated Time: <strong style={{ color: "var(--text-primary)" }}>{routeResult.estimated_time}</strong></span>
                    <span>Distance: <strong style={{ color: "var(--text-primary)" }}>{routeResult.distance}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Active Citizen Alerts Card */}
            <div
              style={{
                backgroundColor: "var(--bg-surface)",
                borderRadius: "16px",
                border: "1px solid var(--border-color)",
                padding: "24px",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "22px" }}>🚨</span>
                <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
                  Live Incident & Congestion Alerts
                </h2>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
                Active real-time warnings published by city traffic operators.
              </p>

              {loadingAlerts ? (
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading active alerts...</p>
              ) : alerts.length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    backgroundColor: "var(--bg-surface-secondary)",
                    borderRadius: "12px",
                    color: "var(--text-muted)",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>✅</span>
                  No major bottlenecks or incidents reported. City traffic is flowing normally!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "360px", overflowY: "auto" }}>
                  {alerts.map((alt) => (
                    <div
                      key={alt.id}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "10px",
                        backgroundColor: "var(--bg-surface-secondary)",
                        borderLeft: `4px solid ${alt.severity === "Critical" ? "var(--danger)" : "var(--warning)"}`,
                        borderTop: "1px solid var(--border-color)",
                        borderRight: "1px solid var(--border-color)",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>{alt.title}</strong>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            backgroundColor: alt.severity === "Critical" ? "var(--danger)" : "var(--warning)",
                            color: "#fff",
                          }}
                        >
                          {alt.severity}
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 6px 0", lineHeight: 1.4 }}>
                        {alt.message}
                      </p>
                      <small style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Corridor: <strong>{alt.road}</strong>
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Embedded Interactive City Traffic Map */}
          <div
            id="city-map"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              padding: "24px 32px",
              boxShadow: "var(--shadow-sm)",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "22px" }}>🗺️</span>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>
                    Bengaluru Arterial Traffic Map
                  </h2>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
                    Live OpenStreetMap corridor telemetry, speed distributions, and road management profiles.
                  </p>
                </div>
              </div>

              <Link
                to="/commuter/map"
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--primary)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>Open Fullscreen Map</span>
                <span>↗</span>
              </Link>
            </div>

            <TrafficMap />
          </div>

          {/* Quick Commuter Tips Banner */}
          <div

            style={{
              backgroundColor: "var(--bg-surface)",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              padding: "24px 32px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "14px" }}>
              💡 Smart Commuter Transit Tips
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              <div style={{ padding: "12px 16px", backgroundColor: "var(--bg-surface-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "13px", color: "var(--text-secondary)" }}>
                ⏱️ <strong>Peak Hour Shift:</strong> Planning departures 15 minutes before 8:30 AM reduces average commute delay by up to 28%.
              </div>
              <div style={{ padding: "12px 16px", backgroundColor: "var(--bg-surface-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "13px", color: "var(--text-secondary)" }}>
                🌧️ <strong>Weather Adjustments:</strong> Rainy conditions decrease average corridor velocity by 18-25%. Check alternate arterial routes before departure.
              </div>
              <div style={{ padding: "12px 16px", backgroundColor: "var(--bg-surface-secondary)", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "13px", color: "var(--text-secondary)" }}>
                🚌 <strong>Transit Priority:</strong> Monitored corridors with dedicated bus lanes maintain 35% higher transit compliance during peak evening hours.
              </div>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
}

export default Dashboard;