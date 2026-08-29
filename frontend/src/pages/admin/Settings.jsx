import { useState, useEffect } from "react";
import AdminLayout from "../../components/dashboard/AdminLayout";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";

function Settings() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  // Additional configurable preferences stored in localStorage
  const [refreshInterval, setRefreshInterval] = useState(() => {
    return localStorage.getItem("trafficvision_refresh_interval") || "5";
  });
  const [speedUnit, setSpeedUnit] = useState(() => {
    return localStorage.getItem("trafficvision_speed_unit") || "kmh";
  });
  const [audioAlerts, setAudioAlerts] = useState(() => {
    return localStorage.getItem("trafficvision_audio_alerts") === "true";
  });
  const [minSeverity, setMinSeverity] = useState(() => {
    return localStorage.getItem("trafficvision_min_severity") || "High";
  });
  const [autoMapTheme, setAutoMapTheme] = useState(() => {
    return localStorage.getItem("trafficvision_auto_map_theme") !== "false";
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "commuter";

  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [saveToast, setSaveToast] = useState(false);
  const [activeTab, setActiveTab] = useState("appearance");

  useEffect(() => {
    if (activeTab === "developer" && role !== "admin") {
      setActiveTab("appearance");
    }
  }, [role, activeTab]);

  useEffect(() => {
    api.get("/health")
      .then((res) => {
        setBackendStatus(res.data.status || "Backend Online");
      })
      .catch(() => {
        setBackendStatus("Backend Offline");
      });
  }, []);

  const handleSavePreferences = () => {
    localStorage.setItem("trafficvision_refresh_interval", refreshInterval);
    localStorage.setItem("trafficvision_speed_unit", speedUnit);
    localStorage.setItem("trafficvision_audio_alerts", String(audioAlerts));
    localStorage.setItem("trafficvision_min_severity", minSeverity);
    localStorage.setItem("trafficvision_auto_map_theme", String(autoMapTheme));

    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
    }, 3000);
  };

  const handleClearCache = () => {
    if (window.confirm("Are you sure you want to reset preferences and clear cached data?")) {
      const currentTheme = theme;
      localStorage.clear();
      localStorage.setItem("trafficvision_theme", currentTheme);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    }
  };

  const availableTabs = [
    { id: "appearance", label: "🎨 Appearance & Dark Mode", icon: "🎨" },
    { id: "display", label: "📊 Display & Units", icon: "📊" },
    { id: "notifications", label: "🔔 Alerts & Audio", icon: "🔔" },
    { id: "system", label: "⚙️ System & Diagnostics", icon: "⚙️" },
    ...(role === "admin"
      ? [{ id: "developer", label: "⚡ Developer & APIs", icon: "⚡" }]
      : []),
  ];

  return (
    <AdminLayout
      title="Platform Settings"
      subtitle="Customize appearance, notifications, and system preferences"
    >
      {/* Toast Notification */}
      {saveToast && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            backgroundColor: "var(--success)",
            color: "#ffffff",
            padding: "14px 24px",
            borderRadius: "10px",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: "600",
            fontSize: "14px",
            zIndex: 9999,
            animation: "fadeIn 0.25s ease-in-out",
          }}
        >
          <span>✓</span> Preferences updated successfully!
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "24px",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? "700" : "500",
              fontSize: "14px",
              backgroundColor:
                activeTab === tab.id ? "var(--primary)" : "var(--bg-surface-secondary)",
              color: activeTab === tab.id ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Appearance */}
      {activeTab === "appearance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Theme Selector Section */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "14px",
              padding: "28px",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                  Theme Preference
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  Choose how TrafficVision AI appears on your display.
                </p>
              </div>
              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  backgroundColor: "var(--primary-light)",
                  color: "var(--primary)",
                  border: "1px solid var(--border-focus)",
                }}
              >
                Current: {resolvedTheme === "dark" ? "Dark Mode Active 🌙" : "Light Mode Active ☀️"}
              </span>
            </div>

            {/* Visual Theme Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
                marginTop: "16px",
              }}
            >
              {/* Light Mode Option */}
              <div
                onClick={(e) => setTheme("light", e)}
                style={{
                  cursor: "pointer",
                  borderRadius: "14px",
                  padding: "20px",
                  border: `2px solid ${theme === "light" ? "var(--primary)" : "var(--border-color)"}`,
                  backgroundColor: theme === "light" ? "var(--bg-surface-secondary)" : "var(--bg-surface)",
                  boxShadow: theme === "light" ? "var(--shadow-md)" : "none",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                {theme === "light" && (
                  <span
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      backgroundColor: "var(--primary)",
                      color: "white",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    ✓
                  </span>
                )}
                <div
                  style={{
                    height: "70px",
                    background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    marginBottom: "14px",
                  }}
                >
                  ☀️
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                  Light Theme
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Crisp and vibrant interface designed for bright workspaces.
                </p>
              </div>

              {/* Dark Mode Option */}
              <div
                onClick={(e) => setTheme("dark", e)}
                style={{
                  cursor: "pointer",
                  borderRadius: "14px",
                  padding: "20px",
                  border: `2px solid ${theme === "dark" ? "var(--primary)" : "var(--border-color)"}`,
                  backgroundColor: theme === "dark" ? "var(--bg-surface-secondary)" : "var(--bg-surface)",
                  boxShadow: theme === "dark" ? "var(--shadow-md)" : "none",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                {theme === "dark" && (
                  <span
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      backgroundColor: "var(--primary)",
                      color: "white",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    ✓
                  </span>
                )}
                <div
                  style={{
                    height: "70px",
                    background: "linear-gradient(135deg, #0b0f17 0%, #1a243d 100%)",
                    borderRadius: "8px",
                    border: "1px solid #334366",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    marginBottom: "14px",
                  }}
                >
                  🌙
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                  Dark Theme
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Sleek deep-dark tones to reduce eye fatigue and power consumption.
                </p>
              </div>

              {/* System Default Option */}
              <div
                onClick={(e) => setTheme("system", e)}
                style={{
                  cursor: "pointer",
                  borderRadius: "14px",
                  padding: "20px",
                  border: `2px solid ${theme === "system" ? "var(--primary)" : "var(--border-color)"}`,
                  backgroundColor: theme === "system" ? "var(--bg-surface-secondary)" : "var(--bg-surface)",
                  boxShadow: theme === "system" ? "var(--shadow-md)" : "none",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                {theme === "system" && (
                  <span
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      backgroundColor: "var(--primary)",
                      color: "white",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    ✓
                  </span>
                )}
                <div
                  style={{
                    height: "70px",
                    background: "linear-gradient(135deg, #ffffff 50%, #0b0f17 50%)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    marginBottom: "14px",
                  }}
                >
                  🖥️
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                  System Sync
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  Automatically adjusts when your operating system switches modes.
                </p>
              </div>
            </div>

            {/* Quick Toggle bar */}
            <div
              style={{
                marginTop: "24px",
                padding: "16px 20px",
                borderRadius: "10px",
                backgroundColor: "var(--bg-surface-secondary)",
                border: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ color: "var(--text-primary)", fontSize: "14px" }}>
                  Fast Theme Toggle
                </strong>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
                  Click to switch instantly between light and dark palettes
                </p>
              </div>
              <button
                onClick={toggleTheme}
                style={{
                  padding: "8px 18px",
                  background: "var(--primary)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {resolvedTheme === "dark" ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
              </button>
            </div>
          </div>

          {/* Theme Palette Live Preview */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "14px",
              padding: "24px",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px" }}>
              Live Theme Component Preview
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  backgroundColor: "var(--bg-surface-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Surface Secondary</span>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "var(--primary)", marginTop: "4px" }}>
                  Primary Accent
                </div>
              </div>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  backgroundColor: "var(--success-light)",
                  border: "1px solid var(--success)",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--success)" }}>Status Normal</span>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "var(--success)", marginTop: "4px" }}>
                  🟢 Traffic Clear
                </div>
              </div>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  backgroundColor: "var(--danger-light)",
                  border: "1px solid var(--danger)",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--danger)" }}>Status Critical</span>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "var(--danger)", marginTop: "4px" }}>
                  🔴 Congestion Alert
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Display & Units */}
      {activeTab === "display" && (
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "14px",
            padding: "28px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
              Display & Metrics Configuration
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Configure chart update frequency, units of measurement, and map styling.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "var(--text-secondary)" }}>
                Live Traffic Polling Interval
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px" }}
              >
                <option value="3">3 seconds (Ultra High Frequency)</option>
                <option value="5">5 seconds (Recommended Default)</option>
                <option value="10">10 seconds (Balanced)</option>
                <option value="30">30 seconds (Low Bandwidth)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "var(--text-secondary)" }}>
                Speed Metric Unit
              </label>
              <select
                value={speedUnit}
                onChange={(e) => setSpeedUnit(e.target.value)}
                style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px" }}
              >
                <option value="kmh">Kilometers per hour (km/h)</option>
                <option value="mph">Miles per hour (mph)</option>
              </select>
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "var(--bg-surface-secondary)",
              border: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong style={{ color: "var(--text-primary)", fontSize: "14px" }}>
                Auto-sync Map Theme with Dark Mode
              </strong>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
                Applies night mode tile filter to interactive Leaflet traffic maps in dark theme
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoMapTheme}
              onChange={(e) => setAutoMapTheme(e.target.checked)}
              style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--primary)" }}
            />
          </div>

          <button
            onClick={handleSavePreferences}
            style={{
              alignSelf: "flex-start",
              padding: "12px 24px",
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Save Display Settings
          </button>
        </div>
      )}

      {/* Tab Content: Notifications */}
      {activeTab === "notifications" && (
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "14px",
            padding: "28px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
              Alert & Notification Rules
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Control when and how you receive traffic anomaly alerts.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                padding: "16px",
                borderRadius: "10px",
                backgroundColor: "var(--bg-surface-secondary)",
                border: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ color: "var(--text-primary)", fontSize: "14px" }}>
                  Critical Incident Sound Alert
                </strong>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
                  Play an audible chime when severe congestion or road incidents are detected
                </p>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={(e) => setAudioAlerts(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--primary)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "var(--text-secondary)" }}>
                Minimum Severity for Push Alerts
              </label>
              <select
                value={minSeverity}
                onChange={(e) => setMinSeverity(e.target.value)}
                style={{ width: "100%", height: "42px", padding: "0 12px", borderRadius: "8px" }}
              >
                <option value="Critical">Critical Severity Only</option>
                <option value="High">High & Critical Severity</option>
                <option value="Medium">Medium, High & Critical</option>
                <option value="All">All Severity Levels</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSavePreferences}
            style={{
              alignSelf: "flex-start",
              padding: "12px 24px",
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Save Notification Settings
          </button>
        </div>
      )}

      {/* Tab Content: System & Diagnostics */}
      {activeTab === "system" && (
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "14px",
            padding: "28px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
              System Health & Diagnostics
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Platform status, versions, and local client memory controls.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div
              style={{
                padding: "18px",
                borderRadius: "10px",
                backgroundColor: "var(--bg-surface-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Backend Connection</span>
              <div style={{ fontSize: "16px", fontWeight: "700", color: backendStatus.includes("Offline") ? "var(--danger)" : "var(--success)", marginTop: "4px" }}>
                {backendStatus}
              </div>
            </div>

            <div
              style={{
                padding: "18px",
                borderRadius: "10px",
                backgroundColor: "var(--bg-surface-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Platform Version</span>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginTop: "4px" }}>
                TrafficVision AI v2.4.0
              </div>
            </div>

            <div
              style={{
                padding: "18px",
                borderRadius: "10px",
                backgroundColor: "var(--bg-surface-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Theme Engine</span>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)", marginTop: "4px" }}>
                Dual-Palette Token Engine
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
            <h4 style={{ color: "var(--danger)", marginBottom: "8px", fontSize: "15px" }}>
              Reset Client Cache & Preferences
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
              This will clear local preference storage and restore factory visual defaults.
            </p>
            <button
              onClick={handleClearCache}
              style={{
                padding: "10px 20px",
                backgroundColor: "var(--danger)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              🗑️ Reset Local Preferences
            </button>
          </div>
        </div>
      )}

      {/* Tab Content: Developer & APIs (Admin Only) */}
      {activeTab === "developer" && role === "admin" && (
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "14px",
            padding: "28px",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "22px" }}>⚡</span>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                Developer & Backend API Center
              </h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
              Interactive API documentation, OpenAPI specifications, and backend developer tools.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "inherit",
                background: "var(--bg-surface-secondary)",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "24px" }}>⚡</span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#38bdf8", background: "rgba(56, 189, 248, 0.15)", padding: "2px 8px", borderRadius: "4px" }}>
                  SWAGGER
                </span>
              </div>
              <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>FastAPI Swagger UI</strong>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                Explore and execute interactive REST queries with built-in OAuth/JWT testing.
              </p>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary)", marginTop: "4px" }}>
                Open Swagger UI ↗
              </span>
            </a>

            <a
              href="http://localhost:8000/redoc"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "inherit",
                background: "var(--bg-surface-secondary)",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "24px" }}>📖</span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#818cf8", background: "rgba(129, 140, 248, 0.15)", padding: "2px 8px", borderRadius: "4px" }}>
                  REDOC
                </span>
              </div>
              <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>ReDoc API Docs</strong>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                Hierarchical API schema documentation with complete data models and responses.
              </p>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#818cf8", marginTop: "4px" }}>
                Open ReDoc Reference ↗
              </span>
            </a>

            <a
              href="http://localhost:8000/health"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "inherit",
                background: "var(--bg-surface-secondary)",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "24px" }}>🩺</span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#34d399", background: "rgba(52, 211, 153, 0.15)", padding: "2px 8px", borderRadius: "4px" }}>
                  HEALTH
                </span>
              </div>
              <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>Backend Health Probe</strong>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                Live ping endpoint providing JSON status of the FastAPI server and database.
              </p>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#34d399", marginTop: "4px" }}>
                Open Health Endpoint ↗
              </span>
            </a>

            <a
              href="http://localhost:8000/openapi.json"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                color: "inherit",
                background: "var(--bg-surface-secondary)",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "24px" }}>📋</span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#fbbf24", background: "rgba(251, 191, 36, 0.15)", padding: "2px 8px", borderRadius: "4px" }}>
                  OPENAPI
                </span>
              </div>
              <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>OpenAPI JSON Contract</strong>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                Raw JSON schema document describing all endpoints, routes, and security schemes.
              </p>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#fbbf24", marginTop: "4px" }}>
                Download JSON Schema ↗
              </span>
            </a>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Settings;