import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardCards from "../../components/dashboard/DashboardCards";
import DashboardContent from "../../components/dashboard/DashboardContent";
import PredictionPanel from "../../components/dashboard/PredictionPanel";
import TrafficMap from "../../components/dashboard/TrafficMap";
import TrafficChart from "../../components/TrafficChart";

import api from "../../services/api";

import {
  getTrafficData,
  getDashboardSummary,
} from "../../services/traffic";

function Dashboard() {
  const [trafficData, setTrafficData] = useState([]);
  const [predictionResult, setPredictionResult] = useState(null);
  const [summary, setSummary] = useState(null);

  // Better backend status state
  const [backendStatus, setBackendStatus] = useState({
    status: "",
    message: "Checking backend...",
  });

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      try {
        const [traffic, dashboardSummary, health] = await Promise.all([
          getTrafficData(),
          getDashboardSummary(),
          api.get("/health"),
        ]);

        if (!mounted) return;

        setTrafficData(traffic);
        setSummary(dashboardSummary);

        // Store entire response
        setBackendStatus({
          status: health.data.status || "Backend Running",
          message: health.data.message || "TrafficVision AI API is working",
        });
      } catch (err) {
        console.error(err);

        if (mounted) {
          setBackendStatus({
            status: "Disconnected",
            message: "Backend Connection Failed",
          });
        }
      }
    };

    fetchDashboard();

    const interval = setInterval(fetchDashboard, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const isConnected =
    backendStatus.status === "Backend Running";

  return (
    <DashboardLayout
      navbar={<Navbar />}
      sidebar={<Sidebar />}
    >
      <DashboardHeader
        title="Traffic Management Dashboard"
        subtitle="Real-time traffic monitoring and administration"
      />

      {/* Backend Status Card */}

      <div
        style={{
          marginBottom: "20px",
          padding: "20px",
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,.08)",
          borderLeft: `6px solid ${
            isConnected ? "#16a34a" : "#dc2626"
          }`,
        }}
      >
        <h3
          style={{
            margin: 0,
            marginBottom: "10px",
          }}
        >
          Backend Status
        </h3>

        <div
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: isConnected ? "#16a34a" : "#dc2626",
          }}
        >
          {isConnected
            ? "🟢 Connected"
            : "🔴 Disconnected"}
        </div>

        <div
          style={{
            marginTop: "8px",
            color: "#555",
          }}
        >
          {backendStatus.message}
        </div>
      </div>

      <DashboardCards summary={summary} />

      <br />

      <TrafficChart />

      <br />

      <PredictionPanel
        predictionResult={predictionResult}
        setPredictionResult={setPredictionResult}
      />

      <br />

      <TrafficMap
        predictionResult={predictionResult}
      />

      <br />

      <DashboardContent
        trafficData={trafficData}
      />
    </DashboardLayout>
  );
}

export default Dashboard;