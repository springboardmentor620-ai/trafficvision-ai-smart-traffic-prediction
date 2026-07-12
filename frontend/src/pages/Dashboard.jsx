import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TrafficCard from "../components/TrafficCard";
import TrafficChart from "../components/TrafficChart";
import api from "../services/api";

import "../styles/chart.css";

function Dashboard() {

  const [backendStatus, setBackendStatus] = useState("Checking...");

  useEffect(() => {
    api
      .get("/health")
      .then((response) => {
        setBackendStatus(response.data.message);
      })
      .catch(() => {
        setBackendStatus("Backend Connection Failed");
      });
  }, []);

  return (
    <>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <main style={{ padding: "20px", flex: 1 }}>
          <h1>Traffic Dashboard</h1>

          <p><strong>Backend Status:</strong> {backendStatus}</p>

          <br />

          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <TrafficCard title="Vehicles Today" value="12,540" />
            <TrafficCard title="Congested Roads" value="17" />
            <TrafficCard title="Average Speed" value="41 km/h" />
            <TrafficCard title="Active Alerts" value="5" />
          </div>

          <div className="chart-container">
            <TrafficChart />
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;