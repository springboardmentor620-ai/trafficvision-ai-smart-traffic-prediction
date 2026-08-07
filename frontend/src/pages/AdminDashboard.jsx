// import Navbar from "../components/layout/Navbar";
// import Footer from "../components/layout/Footer";
// import "../styles/dashboard.css";

// function AdminDashboard() {
//   return (
//     <>
//       <Navbar />

//       <div className="dashboard">

//         <div className="dashboard-header">
//           <h1>Admin Dashboard</h1>
//           <p>
//             Welcome Admin! Manage users, monitor traffic, and control the
//             TrafficVision AI system.
//           </p>
//         </div>

//         {/* Statistics */}

//         <div className="dashboard-cards">

//           <div className="dashboard-card">
//             <h2>250</h2>
//             <p>Total Users</p>
//           </div>

//           <div className="dashboard-card">
//             <h2>38</h2>
//             <p>Traffic Operators</p>
//           </div>

//           <div className="dashboard-card">
//             <h2>124</h2>
//             <p>Traffic Signals</p>
//           </div>

//           <div className="dashboard-card">
//             <h2>91%</h2>
//             <p>AI Prediction Accuracy</p>
//           </div>

//         </div>

//         {/* Main Content */}

//         <div className="dashboard-grid">

//           {/* User Management */}

//           <div className="dashboard-panel">

//             <h2>User Management</h2>

//             <table>

//               <thead>

//                 <tr>
//                   <th>Name</th>
//                   <th>Role</th>
//                   <th>Status</th>
//                 </tr>

//               </thead>

//               <tbody>

//                 <tr>
//                   <td>Rahul</td>
//                   <td>Traffic Operator</td>
//                   <td>Active</td>
//                 </tr>

//                 <tr>
//                   <td>Vinuthna</td>
//                   <td>Admin</td>
//                   <td>Active</td>
//                 </tr>

//                 <tr>
//                   <td>Sai</td>
//                   <td>Traffic Operator</td>
//                   <td>Offline</td>
//                 </tr>

//                 <tr>
//                   <td>Ravi</td>
//                   <td>Traffic Operator</td>
//                   <td>Active</td>
//                 </tr>

//               </tbody>

//             </table>

//           </div>

//           {/* Admin Controls */}

//           <div className="dashboard-panel">

//             <h2>Admin Controls</h2>

//             <ul>
//               <li>✔ Manage Users</li>
//               <li>✔ Add Traffic Operators</li>
//               <li>✔ View Reports</li>
//               <li>✔ Manage AI Predictions</li>
//               <li>✔ Monitor Smart Cameras</li>
//               <li>✔ Update Traffic Signals</li>
//             </ul>

//           </div>

//         </div>

//         {/* Bottom Section */}

//         <div className="prediction-box">

//           <h2>System Status</h2>

//           <p>
//             All services are running successfully.
//             AI prediction engine is active.
//             Smart cameras are connected.
//             Database status: <strong>Online</strong>.
//           </p>

//         </div>

//       </div>

//       <Footer />
//     </>
//   );
// }

// export default AdminDashboard;

// import { useEffect, useState } from "react";
// import Navbar from "../components/layout/Navbar";
// import Footer from "../components/layout/Footer";
// import "../styles/AdminDashboard.css";

// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";

// function AdminDashboard() {

//   const [currentTime, setCurrentTime] = useState(new Date());

//   useEffect(() => {

//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     return () => clearInterval(timer);

//   }, []);

//   const trafficData = [
//     { area: "EC", traffic: 420 },
//     { area: "Hebbal", traffic: 360 },
//     { area: "MG Road", traffic: 520 },
//     { area: "Whitefield", traffic: 480 },
//     { area: "Koramangala", traffic: 390 },
//     { area: "Jayanagar", traffic: 310 },
//   ];

//   const congestionTrend = [
//     { time: "6 AM", value: 20 },
//     { time: "8 AM", value: 55 },
//     { time: "10 AM", value: 40 },
//     { time: "12 PM", value: 60 },
//     { time: "3 PM", value: 45 },
//     { time: "6 PM", value: 90 },
//     { time: "9 PM", value: 35 },
//   ];

//   const severityData = [
//     { name: "High", value: 18 },
//     { name: "Medium", value: 12 },
//     { name: "Low", value: 8 },
//   ];

//   const COLORS = [
//     "#ef4444",
//     "#f59e0b",
//     "#22c55e",
//   ];

//   return (
//     <>

//       <Navbar />

//       <div className="admin-container">

//         {/* Header */}

//         <div className="admin-header">

//           <div>

//             <h1>🚦 Admin Dashboard</h1>

//             <p>
//               Welcome back, Administrator.
//               Monitor the AI Traffic Prediction System in real time.
//             </p>

//           </div>

//           <div className="admin-time">

//             <h3>
//               {currentTime.toLocaleDateString()}
//             </h3>

//             <span>
//               {currentTime.toLocaleTimeString()}
//             </span>

//           </div>

//         </div>

//         {/* Statistics Cards */}

//         <div className="stats-grid">

//           <div className="stat-card blue">
//             <div className="stat-icon">👥</div>
//             <h2>250</h2>
//             <p>Total Users</p>
//           </div>

//           <div className="stat-card green">
//             <div className="stat-icon">🧠</div>
//             <h2>1265</h2>
//             <p>Total Predictions</p>
//           </div>

//           <div className="stat-card red">
//             <div className="stat-icon">🚨</div>
//             <h2>18</h2>
//             <p>Active Alerts</p>
//           </div>

//           <div className="stat-card orange">
//             <div className="stat-icon">✅</div>
//             <h2>96</h2>
//             <p>Resolved Alerts</p>
//           </div>

//           <div className="stat-card purple">
//             <div className="stat-icon">🎯</div>
//             <h2>91%</h2>
//             <p>AI Accuracy</p>
//           </div>

//         </div>
//         {/* Analytics Charts */}

// <div className="charts-grid">

//   {/* Traffic Volume */}

//   <div className="dashboard-card">

//     <h2>📈 Traffic Volume by Area</h2>

//     <ResponsiveContainer width="100%" height={300}>
//       <BarChart data={trafficData}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="area" />
//         <YAxis />
//         <Tooltip />

//         <Bar
//           dataKey="traffic"
//           fill="#2563eb"
//           radius={[8, 8, 0, 0]}
//         />
//       </BarChart>
//     </ResponsiveContainer>

//   </div>



//   {/* Congestion Trend */}

//   <div className="dashboard-card">

//     <h2>📉 Congestion Trend</h2>

//     <ResponsiveContainer width="100%" height={300}>
//       <LineChart data={congestionTrend}>

//         <CartesianGrid strokeDasharray="3 3" />

//         <XAxis dataKey="time" />

//         <YAxis />

//         <Tooltip />

//         <Line
//           type="monotone"
//           dataKey="value"
//           stroke="#ef4444"
//           strokeWidth={3}
//         />

//       </LineChart>
//     </ResponsiveContainer>

//   </div>



//   {/* Alert Severity */}

//   <div className="dashboard-card">

//     <h2>🥧 Alert Severity Distribution</h2>

//     <ResponsiveContainer width="100%" height={300}>

//       <PieChart>

//         <Pie
//           data={severityData}
//           dataKey="value"
//           outerRadius={95}
//           label
//         >

//           {severityData.map((entry, index) => (

//             <Cell
//               key={index}
//               fill={COLORS[index]}
//             />

//           ))}

//         </Pie>

//         <Tooltip />

//       </PieChart>

//     </ResponsiveContainer>

//   </div>

// </div>



// {/* System Status */}

// <div className="dashboard-card">

//     <h2>⚙ System Health</h2>

//     <div className="system-health">

//         <div className="health-box">

//             <h3>Backend</h3>

//             <span className="online">
//                 🟢 Online
//             </span>

//         </div>

//         <div className="health-box">

//             <h3>AI Model</h3>

//             <span className="online">
//                 🟢 Running
//             </span>

//         </div>

//         <div className="health-box">

//             <h3>Database</h3>

//             <span className="online">
//                 🟢 Connected
//             </span>

//         </div>

//         <div className="health-box">

//             <h3>OpenRouteService</h3>

//             <span className="online">
//                 🟢 Active
//             </span>

//         </div>

//     </div>

// </div>
// {/* Recent Predictions */}

// <div className="dashboard-card">

//     <div className="card-header">

//         <h2>📋 Recent Predictions</h2>

//         <button className="view-btn">
//             View All
//         </button>

//     </div>

//     <table className="prediction-table">

//         <thead>

//             <tr>

//                 <th>Source</th>

//                 <th>Destination</th>

//                 <th>Traffic</th>

//                 <th>Congestion</th>

//                 <th>Status</th>

//             </tr>

//         </thead>

//         <tbody>

//             <tr>

//                 <td>Electronic City</td>

//                 <td>Whitefield</td>

//                 <td>Heavy</td>

//                 <td>91%</td>

//                 <td>
//                     <span className="status-high">
//                         High
//                     </span>
//                 </td>

//             </tr>

//             <tr>

//                 <td>Hebbal</td>

//                 <td>MG Road</td>

//                 <td>Medium</td>

//                 <td>68%</td>

//                 <td>
//                     <span className="status-medium">
//                         Medium
//                     </span>
//                 </td>

//             </tr>

//             <tr>

//                 <td>Jayanagar</td>

//                 <td>Koramangala</td>

//                 <td>Low</td>

//                 <td>32%</td>

//                 <td>
//                     <span className="status-low">
//                         Low
//                     </span>
//                 </td>

//             </tr>

//         </tbody>

//     </table>

// </div>

// {/* Quick Actions */}

// <div className="quick-actions">

//     <div className="dashboard-card action-card">

//         <h3>🚨 Manage Alerts</h3>

//         <p>
//             View, edit and resolve live traffic alerts.
//         </p>

//         <button className="action-btn">
//             Open Alerts
//         </button>

//     </div>

//     <div className="dashboard-card action-card">

//         <h3>📊 Analytics</h3>

//         <p>
//             Analyze congestion trends and AI predictions.
//         </p>

//         <button className="action-btn">
//             Open Analytics
//         </button>

//     </div>

//     <div className="dashboard-card action-card">

//         <h3>📄 Reports</h3>

//         <p>
//             Generate downloadable PDF traffic reports.
//         </p>

//         <button className="action-btn">
//             Generate Report
//         </button>

//     </div>

// </div>

// </div>

// <Footer />

// </>

// );

// }

// export default AdminDashboard;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../components/layout/Footer";

import { getDashboardStats } from "../services/dashboardService";

import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboardStats();

      console.log("Dashboard Data:", data);

      setDashboard(data);
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
          fontWeight: "600",
        }}
      >
        Loading Admin Dashboard...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <h2>Unable to load dashboard</h2>

        <button onClick={loadDashboard}>
          Try Again
        </button>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Predictions",
      value: dashboard?.cards?.total_predictions ?? 0,
      icon: "📈",
      color: "#2563eb",
    },
    {
      title: "Active Alerts",
      value: dashboard?.cards?.active_alerts ?? 0,
      icon: "🚨",
      color: "#ef4444",
    },
    {
      title: "Resolved Alerts",
      value: dashboard?.cards?.resolved_alerts ?? 0,
      icon: "✅",
      color: "#22c55e",
    },
    {
      title: "Routes Generated",
      value: dashboard?.cards?.routes_generated ?? 0,
      icon: "🛣️",
      color: "#f59e0b",
    },
  ];

  return (
    <>
      <div className="admin-dashboard">

        {/* ================= HEADER ================= */}

        <div className="admin-dashboard-header">

          <div>
            <h1>🚦 TrafficVision Admin Dashboard</h1>

            <p>
              Monitor traffic predictions, alerts and system activity.
            </p>
          </div>

          <button
            className="admin-action-btn"
            onClick={() => navigate("/admin/alerts")}
          >
            🚨 Manage Alerts
          </button>
          <button
    className="admin-action-btn"
    onClick={() => navigate("/admin/notifications")}
  >
    🔔 Manage Notifications
  </button>
        </div>


        {/* ================= STAT CARDS ================= */}

        <div className="stats-grid">

          {cards.map((card, index) => (
            <div
              key={index}
              className="stat-card"
              style={{
                borderTop: `5px solid ${card.color}`,
              }}
            >

              <div className="stat-icon">
                {card.icon}
              </div>

              <h2>
                {card.value}
              </h2>

              <p>
                {card.title}
              </p>

            </div>
          ))}

        </div>


        {/* ================= ADMIN ACTIONS ================= */}

        <div className="admin-actions">

          <button
            onClick={() => navigate("/admin/alerts")}
            className="admin-action-card"
          >
            <span>🚨</span>

            <div>
              <h3>Manage Alerts</h3>
              <p>
                Resolve, activate or delete traffic alerts.
              </p>
            </div>
          </button>


          <button
            onClick={() => navigate("/admin/notifications")}
            className="admin-action-card"
          >
            <span>🔔</span>

            <div>
              <h3>Notifications</h3>
              <p>
                Create and send notifications to users.
              </p>
            </div>
          </button>


          <button
            onClick={() => navigate("/admin/users")}
            className="admin-action-card"
          >
            <span>👥</span>

            <div>
              <h3>User Monitoring</h3>
              <p>
                Monitor registered users and activity.
              </p>
            </div>
          </button>

        </div>


        {/* ================= TRAFFIC SUMMARY ================= */}

        <div className="panel">

          <div className="panel-header">

            <h2>📊 Traffic Summary</h2>

          </div>

          <div className="summary">

            <div>
              <h3>Average Congestion</h3>

              <p>
                {dashboard?.traffic_summary?.average_congestion ?? 0}%
              </p>
            </div>


            <div>
              <h3>Peak Hour</h3>

              <p>
                {dashboard?.traffic_summary?.peak_hour ?? "N/A"}
              </p>
            </div>


            <div>
              <h3>Weather</h3>

              <p>
                {dashboard?.traffic_summary?.weather ?? "N/A"}
              </p>
            </div>


            <div>
              <h3>Average Speed</h3>

              <p>
                {dashboard?.traffic_summary?.average_speed ?? 0} km/h
              </p>
            </div>

          </div>

        </div>


        {/* ================= RECENT ACTIVITY ================= */}

        <div className="panel">

          <h2>📈 Recent Activity</h2>

          <ul className="activity">

            <li>
              🤖 Prediction Generated
            </li>

            <li>
              🚨 Alert Created
            </li>

            <li>
              🛣️ Route Optimized
            </li>

            <li>
              🚦 Traffic Updated
            </li>

            <li>
              ✅ Alert Resolved
            </li>

          </ul>

        </div>


        {/* ================= RECENT ALERTS ================= */}

        <div className="panel">

          <div className="panel-header">

            <h2>
              🚨 Recent Alerts
            </h2>

            <button
              className="view-alerts-btn"
              onClick={() => navigate("/admin/alerts")}
            >
              View All Alerts →
            </button>

          </div>


          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Congestion</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>

              </thead>


              <tbody>

                {dashboard?.recent_alerts?.length > 0 ? (

                  dashboard.recent_alerts.map((alert, index) => (

                    <tr key={alert._id || index}>

                      <td>
                        {alert.source || "N/A"}
                      </td>

                      <td>
                        {alert.destination || "N/A"}
                      </td>

                      <td>
                        {alert.predicted_congestion ?? 0}%
                      </td>

                      <td>
                        <span
                          className={`severity ${String(
                            alert.severity || ""
                          ).toLowerCase()}`}
                        >
                          {alert.severity || "Unknown"}
                        </span>
                      </td>

                      <td>

                        <span
                          className={`alert-status ${String(
                            alert.status || "Active"
                          ).toLowerCase()}`}
                        >
                          {alert.status || "Active"}
                        </span>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >
                      No alerts available.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* ================= ALERT MANAGEMENT MESSAGE ================= */}

        <div className="admin-info-box">

          <div className="admin-info-icon">
            🔐
          </div>

          <div>

            <h3>
              Admin Alert Control
            </h3>

            <p>
              Alert status is controlled only by administrators.
              Users can view whether an alert is Active or Resolved,
              but cannot modify the status.
            </p>

          </div>

          <button
            onClick={() => navigate("/admin/alerts")}
          >
            Open Alert Management
          </button>

        </div>

      </div>

      <Footer />
    </>
  );
}

export default AdminDashboard;