import { useEffect, useState } from "react";
import { getTraffic } from "../../services/traffic";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardCards from "../../components/dashboard/DashboardCards";
import DashboardContent from "../../components/dashboard/DashboardContent";
import api from "../../services/api";

import "../../styles/chart.css";

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

  const [trafficData, setTrafficData] = useState([]);

  useEffect(() => {
    getTraffic()
      .then((data) => {
        setTrafficData(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <>
      <Navbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <main style={{ padding: "20px", flex: 1 }}>
          <DashboardHeader
            title="Traffic Dashboard"
            subtitle="Monitor traffic conditions in real time."
          />

          <p><strong>Backend Status:</strong> {backendStatus}</p>

          <br />

          <DashboardCards trafficData={trafficData} />

          <DashboardContent trafficData={trafficData} />

        </main>
      </div>
    </>
  );
}

export default Dashboard;