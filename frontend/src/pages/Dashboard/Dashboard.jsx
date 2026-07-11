import "./Dashboard.css";

import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import StatCard from "../../components/StatCard/StatCard";

import trafficData from "../../data/trafficData";

function Dashboard() {
  return (
    <div className="dashboard">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <div className="welcome">
          <h1>Welcome, Admin 👋</h1>
          <p>Monitor and manage city traffic in real time.</p>
        </div>

        <div className="cards">
          <StatCard title="Vehicle Density" value="2,450" />
          <StatCard title="Congestion Level" value="35%" />
          <StatCard title="Road Utilization" value="82%" />
          <StatCard title="Active Cameras" value="120" />
        </div>

        <div className="dashboard-grid">

          <div className="traffic-monitor">

            <div className="section-header">
              <h2>Live Traffic Monitoring</h2>
              <button className="refresh-btn">
                Refresh
              </button>
            </div>

            <table>

              <thead>

                <tr>
                  <th>Location</th>
                  <th>Density</th>
                  <th>Congestion</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {trafficData.map((road) => (

                  <tr key={road.id}>

                    <td>{road.location}</td>

                    <td>{road.density}</td>

                    <td>{road.congestion}</td>

                    <td>

                      <span
                        className={`status ${road.status.toLowerCase()}`}
                      >
                        {road.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <div className="alerts">

            <h2>Traffic Alerts</h2>

            <div className="alert-card red">
              🚦 Heavy Congestion at Ring Road
            </div>

            <div className="alert-card orange">
              🚑 Accident Reported at NH-44
            </div>

            <div className="alert-card yellow">
              🚧 Road Maintenance Near City Center
            </div>

            <div className="alert-card blue">
              ⚠ Signal Failure at MG Road
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;