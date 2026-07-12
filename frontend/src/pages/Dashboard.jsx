import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/dashboard.css";

function Dashboard() {

  const [username, setUsername] = useState("");

  useEffect(() => {

    const name = localStorage.getItem("username");

    if (name) {
      setUsername(name);
    }

  }, []);

  return (
    <>
      <Navbar />

      <div className="dashboard">

        <div className="dashboard-header">

          <h1>Traffic Monitoring Dashboard</h1>

          <h2>
            Welcome {username}
          </h2>

          <p>
            Monitor traffic conditions,
            congestion levels and AI predictions.
          </p>

        </div>

        <div className="dashboard-cards">

          <div className="dashboard-card">
            <h2>124</h2>
            <p>Active Traffic Signals</p>
          </div>

          <div className="dashboard-card">
            <h2>38</h2>
            <p>Smart Cameras</p>
          </div>

          <div className="dashboard-card">
            <h2>91%</h2>
            <p>Prediction Accuracy</p>
          </div>

          <div className="dashboard-card">
            <h2>16</h2>
            <p>Congested Areas</p>
          </div>

        </div>

      </div>

      <Footer />

    </>
  );

}

export default Dashboard;