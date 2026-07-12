import { useEffect, useState } from "react";
import { getTraffic } from "../services/traffic";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TrafficCard from "../components/TrafficCard";
import TrafficChart from "../components/TrafficChart";
import TrafficTable from "../components/TrafficTable";
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
            <TrafficCard
              title="Vehicles Today"
              value={trafficData.reduce(
                (sum, road) => sum + road.vehicles,
                0
              )}
            />

            <TrafficCard
              title="Congested Roads"
              value={
                trafficData.filter(
                  road => road.status === "Heavy"
                ).length
              }
            />

            <TrafficCard
              title="Average Speed"
              value={
                trafficData.length
                  ? (
                      trafficData.reduce(
                        (sum, road) => sum + road.average_speed,
                        0
                      ) / trafficData.length
                    ).toFixed(1) + " km/h"
                  : "0 km/h"
              }
            />

            <TrafficCard
              title="Active Alerts"
              value={
                trafficData.filter(
                  road => road.status === "Heavy"
                ).length
              }
            />
          </div>

          <div className="chart-container">
            <TrafficChart />
            <TrafficTable traffic={trafficData} />
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;