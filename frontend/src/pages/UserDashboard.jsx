import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/dashboard.css";

function UserDashboard() {

  const [name, setName] = useState("");

  useEffect(() => {

    const userName = localStorage.getItem("name");

    if (userName) {

      setName(userName);

    }

  }, []);

  return (

    <>

      <Navbar />

      <div className="dashboard">

        <div className="dashboard-header">

          <h1>Welcome, {name}</h1>

          <p>
            Traffic Operator Dashboard
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

        <div className="dashboard-grid">

          <div className="dashboard-panel">

            <h2>Traffic Status</h2>

            <table>

              <thead>

                <tr>

                  <th>Location</th>

                  <th>Status</th>

                  <th>Traffic</th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>Hanamkonda</td>

                  <td>Moderate</td>

                  <td>65%</td>

                </tr>

                <tr>

                  <td>Warangal</td>

                  <td>Heavy</td>

                  <td>91%</td>

                </tr>

                <tr>

                  <td>Kazipet</td>

                  <td>Low</td>

                  <td>30%</td>

                </tr>

                <tr>

                  <td>Jangaon</td>

                  <td>Medium</td>

                  <td>58%</td>

                </tr>

              </tbody>

            </table>

          </div>

          <div className="dashboard-panel">

            <h2>Today's Tasks</h2>

            <ul>

              <li>Monitor Hanamkonda Junction.</li>

              <li>Check AI congestion alerts.</li>

              <li>Verify smart camera status.</li>

              <li>Update traffic signal timings.</li>

            </ul>

          </div>

        </div>

        <div className="prediction-box">

          <h2>Today's Prediction</h2>

          <p>

            AI predicts heavy congestion between
            <strong> 5:30 PM and 7:30 PM </strong>
            around Warangal Main Road.

          </p>

        </div>

      </div>

      <Footer />

    </>

  );

}

export default UserDashboard;