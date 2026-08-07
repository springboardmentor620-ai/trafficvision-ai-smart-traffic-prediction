import "../styles/Analytics.css";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

/* ===========================
   Traffic Trend Data
=========================== */

const trafficTrend = [
  { day: "Mon", traffic: 420 },
  { day: "Tue", traffic: 510 },
  { day: "Wed", traffic: 610 },
  { day: "Thu", traffic: 575 },
  { day: "Fri", traffic: 760 },
  { day: "Sat", traffic: 690 },
  { day: "Sun", traffic: 430 },
];

/* ===========================
   Peak Hour Data
=========================== */

const peakHours = [
  { hour: "6 AM", vehicles: 120 },
  { hour: "9 AM", vehicles: 430 },
  { hour: "12 PM", vehicles: 260 },
  { hour: "3 PM", vehicles: 340 },
  { hour: "6 PM", vehicles: 540 },
  { hour: "9 PM", vehicles: 180 },
];

/* ===========================
   Congestion Data
=========================== */

const congestionData = [
  { name: "Low", value: 30 },
  { name: "Medium", value: 45 },
  { name: "High", value: 25 },
];

const COLORS = [
  "#22c55e",
  "#f59e0b",
  "#ef4444",
];

/* ===========================
   Road Performance
=========================== */

const roads = [
  {
    area: "Silk Board",
    speed: "18 km/h",
    status: "Heavy",
    color: "danger",
  },
  {
    area: "Whitefield",
    speed: "34 km/h",
    status: "Moderate",
    color: "warning",
  },
  {
    area: "MG Road",
    speed: "47 km/h",
    status: "Smooth",
    color: "success",
  },
  {
    area: "Hebbal",
    speed: "29 km/h",
    status: "Moderate",
    color: "warning",
  },
];

function Analytics() {

  return (

    <div className="analytics-page">

      {/* ================= HEADER ================= */}

      <div className="analytics-header">

        <div>

          <h1>
            📊 Analytics Dashboard
          </h1>

          <p>
            AI-powered Traffic Analytics & Congestion Insights
          </p>

        </div>

        <div className="live-status">

          <div className="live-dot"></div>

          Live Monitoring

        </div>

      </div>

      {/* ================= FIRST ROW ================= */}

      <div className="analytics-grid">

        {/* Traffic Trend */}

        <div className="analytics-card">

          <h2>📈 Traffic Trend</h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <LineChart
              data={trafficTrend}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="day" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="traffic"
                stroke="#2563eb"
                strokeWidth={4}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

        {/* Peak Hour */}

        <div className="analytics-card">

          <h2>📊 Peak Hour Analysis</h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={peakHours}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="hour" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="vehicles"
                fill="#16a34a"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* ================= SECOND ROW ================= */}

      <div className="analytics-grid">

        {/* Congestion Distribution */}

        <div className="analytics-card">

          <h2>🥧 Congestion Distribution</h2>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={congestionData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >

                {
                  congestionData.map((item, index) => (

                    <Cell
                      key={index}
                      fill={COLORS[index]}
                    />

                  ))
                }

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

        {/* Road Performance */}

        <div className="analytics-card">

          <h2>🚦 Road Performance</h2>

          <table className="road-table">

            <thead>

              <tr>

                <th>Area</th>

                <th>Speed</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {roads.map((road, index) => (

                <tr key={index}>

                  <td>{road.area}</td>

                  <td>{road.speed}</td>

                  <td>

                    <span className={road.color}>
                      {road.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
            {/* ================= THIRD ROW ================= */}

      <div className="analytics-bottom">

        {/* LEFT SIDE */}

        <div className="analytics-left">

          {/* Historical Insights */}

          <div className="analytics-card">

            <h2>📅 Historical Insights</h2>

            <div className="history-grid">

              <div className="history-card blue">

                <div className="history-icon">🚦</div>

                <div className="history-value">64%</div>

                <div className="history-title">
                  Average Congestion
                </div>

                <small>↑ 8% This Week</small>

              </div>

              <div className="history-card orange">

                <div className="history-icon">📅</div>

                <div className="history-value">
                  Friday
                </div>

                <div className="history-title">
                  Peak Day
                </div>

                <small>5 PM - 8 PM</small>

              </div>

              <div className="history-card green">

                <div className="history-icon">🌙</div>

                <div className="history-value">
                  Sunday
                </div>

                <div className="history-title">
                  Lowest Traffic
                </div>

                <small>Early Morning</small>

              </div>

              <div className="history-card purple">

                <div className="history-icon">🚗</div>

                <div className="history-value">
                  41 km/h
                </div>

                <div className="history-title">
                  Avg Speed
                </div>

                <small>↑ Better Flow</small>

              </div>

            </div>

          </div>

          {/* System Health */}

          <div className="analytics-card">

            <h2>🟢 System Health</h2>

            <div className="system-health">

              <div className="system-item">

                <span>Backend API</span>

                <span className="online">
                  ● Running
                </span>

              </div>

              <div className="system-item">

                <span>Machine Learning</span>

                <span className="online">
                  ● Connected
                </span>

              </div>

              <div className="system-item">

                <span>Database</span>

                <span className="online">
                  ● Healthy
                </span>

              </div>

              <div className="system-item">

                <span>Traffic API</span>

                <span className="online">
                  ● Active
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="analytics-right">

          {/* AI Recommendations */}

          <div className="analytics-card">

            <h2>🤖 AI Recommendations</h2>

            <div className="recommend-grid">

              <div className="recommend-card green-bg">

                <h3>
                  🚗 Alternate Route
                </h3>

                <p>

                  Use NICE Road to bypass
                  Silk Board traffic.

                </p>

                <strong>

                  Save 12 Minutes

                </strong>

              </div>

              <div className="recommend-card orange-bg">

                <h3>

                  🚦 Congestion Alert

                </h3>

                <p>

                  Heavy traffic expected
                  near Hebbal.

                </p>

                <strong>

                  5 PM - 8 PM

                </strong>

              </div>

              <div className="recommend-card blue-bg">

                <h3>

                  🤖 AI Optimization

                </h3>

                <p>

                  Increase signal timing
                  at MG Road Junction.

                </p>

                <strong>

                  +15% Better Flow

                </strong>

              </div>

            </div>

          </div>
                    {/* Live Analytics */}

          <div className="analytics-card">

            <h2>📡 Live Analytics Status</h2>

            <div className="live-grid">

              <div className="live-box">

                <h3>Last Prediction</h3>

                <h1>2 sec</h1>

                <p>Latest AI Prediction</p>

              </div>

              <div className="live-box">

                <h3>Traffic Alerts</h3>

                <h1>5</h1>

                <p>Currently Active</p>

              </div>

              <div className="live-box">

                <h3>Active Roads</h3>

                <h1>28</h1>

                <p>Being Monitored</p>

              </div>

              <div className="live-box">

                <h3>Auto Refresh</h3>

                <h1>30s</h1>

                <p>Real-Time Updates</p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Analytics;