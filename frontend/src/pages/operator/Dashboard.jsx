import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrafficData } from "../../services/traffic";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardCards from "../../components/dashboard/DashboardCards";
import PredictionPanel from "../../components/dashboard/PredictionPanel";
import TrafficMap from "../../components/dashboard/TrafficMap";
import api from "../../services/api";
import "../../styles/chart.css";

function Dashboard() {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [trafficData, setTrafficData] = useState([]);
  const [predictionResult, setPredictionResult] = useState(null);

  useEffect(() => {
    api
      .get("/health")
      .then((response) => {
        setBackendStatus(response.data.message || "Backend Running");
      })
      .catch(() => {
        setBackendStatus("Backend Connection Failed");
      });
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchTraffic = () => {
      getTrafficData()
        .then((data) => {
          if (mounted) setTrafficData(data || []);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    fetchTraffic();
    const interval = setInterval(fetchTraffic, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const operatorQuickLinks = [
    { title: "AI Prediction", path: "/operator/prediction", icon: "🧠", desc: "Simulate Congestion Scores" },
    { title: "CCTV Surveillance", path: "/admin/traffic", icon: "🚦", desc: "6-Camera Intersection Feeds" },
    { title: "Incident Dispatch", path: "/admin/alerts", icon: "🚨", desc: "Active City Alerts" },
    { title: "Corridor Rerouting", path: "/admin/routes", icon: "🚗", desc: "A* Bypass Paths" },
    { title: "Audit Reports", path: "/admin/reports", icon: "📄", desc: "Export PDF Summaries" },
    { title: "Historical Trends", path: "/admin/history", icon: "📈", desc: "Long-term Velocity Telemetry" },
  ];

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Traffic Operator Dashboard"
        subtitle="Monitor real-time intersection telemetry, trigger ML predictions, and coordinate city traffic flow."
      />

      {/* Status and Operations Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            padding: "10px 18px",
            backgroundColor: "var(--bg-surface)",
            borderRadius: "10px",
            border: "1px solid var(--border-color)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <strong style={{ color: "var(--text-primary)", fontSize: "14px" }}>Backend Status:</strong>{" "}
          <span style={{ color: "var(--success)", fontWeight: "600", fontSize: "14px" }}>{backendStatus}</span>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link
            to="/operator/prediction"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            <span>🧠</span>
            <span>Prediction Console</span>
          </Link>
          <Link
            to="/admin/traffic"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            <span>🚦</span>
            <span>Live CCTV Surveillance</span>
          </Link>
        </div>
      </div>

      {/* Operator Modules Navigation Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {operatorQuickLinks.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            style={{
              padding: "14px",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
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
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              <strong style={{ color: "var(--text-primary)", fontSize: "14px" }}>{item.title}</strong>
            </div>
            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>{item.desc}</span>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <DashboardCards trafficData={trafficData} />

        <PredictionPanel
          predictionResult={predictionResult}
          setPredictionResult={setPredictionResult}
        />

        <TrafficMap predictionResult={predictionResult} />
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;