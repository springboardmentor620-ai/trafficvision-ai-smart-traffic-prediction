import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/dashboard.css";

function AdminDashboard() {
  return (
    <>
      <Navbar />

      <div className="dashboard">

        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>
            Welcome Admin! Manage users, monitor traffic, and control the
            TrafficVision AI system.
          </p>
        </div>

        {/* Statistics */}

        <div className="dashboard-cards">

          <div className="dashboard-card">
            <h2>250</h2>
            <p>Total Users</p>
          </div>

          <div className="dashboard-card">
            <h2>38</h2>
            <p>Traffic Operators</p>
          </div>

          <div className="dashboard-card">
            <h2>124</h2>
            <p>Traffic Signals</p>
          </div>

          <div className="dashboard-card">
            <h2>91%</h2>
            <p>AI Prediction Accuracy</p>
          </div>

        </div>

        {/* Main Content */}

        <div className="dashboard-grid">

          {/* User Management */}

          <div className="dashboard-panel">

            <h2>User Management</h2>

            <table>

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                <tr>
                  <td>Rahul</td>
                  <td>Traffic Operator</td>
                  <td>Active</td>
                </tr>

                <tr>
                  <td>Vinuthna</td>
                  <td>Admin</td>
                  <td>Active</td>
                </tr>

                <tr>
                  <td>Sai</td>
                  <td>Traffic Operator</td>
                  <td>Offline</td>
                </tr>

                <tr>
                  <td>Ravi</td>
                  <td>Traffic Operator</td>
                  <td>Active</td>
                </tr>

              </tbody>

            </table>

          </div>

          {/* Admin Controls */}

          <div className="dashboard-panel">

            <h2>Admin Controls</h2>

            <ul>
              <li>✔ Manage Users</li>
              <li>✔ Add Traffic Operators</li>
              <li>✔ View Reports</li>
              <li>✔ Manage AI Predictions</li>
              <li>✔ Monitor Smart Cameras</li>
              <li>✔ Update Traffic Signals</li>
            </ul>

          </div>

        </div>

        {/* Bottom Section */}

        <div className="prediction-box">

          <h2>System Status</h2>

          <p>
            All services are running successfully.
            AI prediction engine is active.
            Smart cameras are connected.
            Database status: <strong>Online</strong>.
          </p>

        </div>

      </div>

      <Footer />
    </>
  );
}

export default AdminDashboard;