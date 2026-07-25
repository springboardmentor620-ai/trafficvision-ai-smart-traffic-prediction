import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

import "../styles/analytics.css";

const trafficData = [

  { area: "Indiranagar", volume: 5600 },
  { area: "Whitefield", volume: 8300 },
  { area: "Jayanagar", volume: 4700 },
  { area: "MG Road", volume: 9200 },
  { area: "Electronic City", volume: 10800 }

];

const congestionData = [

  { day: "Mon", congestion: 52 },
  { day: "Tue", congestion: 63 },
  { day: "Wed", congestion: 70 },
  { day: "Thu", congestion: 61 },
  { day: "Fri", congestion: 88 },
  { day: "Sat", congestion: 74 },
  { day: "Sun", congestion: 48 }

];

const pieData = [

  { name: "Low", value: 30 },
  { name: "Medium", value: 45 },
  { name: "High", value: 25 }

];

const speedData = [

  { area: "Indiranagar", speed: 42 },
  { area: "Whitefield", speed: 33 },
  { area: "Jayanagar", speed: 38 },
  { area: "MG Road", speed: 29 },
  { area: "Electronic City", speed: 31 }

];

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

function Analytics() {

  return (

    <>
      <Navbar />

      <div className="analytics">

        <h1>Traffic Analytics Dashboard</h1>

        <div className="analytics-grid">

          <div className="chart-card">

            <h2>Traffic Volume by Area</h2>

            <ResponsiveContainer width="100%" height={300}>

              <BarChart data={trafficData}>

                <CartesianGrid strokeDasharray="3 3"/>

                <XAxis dataKey="area"/>

                <YAxis/>

                <Tooltip/>

                <Bar
                  dataKey="volume"
                  fill="#2563eb"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

          <div className="chart-card">

            <h2>Weekly Congestion Trend</h2>

            <ResponsiveContainer width="100%" height={300}>

              <LineChart data={congestionData}>

                <CartesianGrid strokeDasharray="3 3"/>

                <XAxis dataKey="day"/>

                <YAxis/>

                <Tooltip/>

                <Line
                  type="monotone"
                  dataKey="congestion"
                  stroke="#ef4444"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

          <div className="chart-card">

            <h2>Traffic Distribution</h2>

            <ResponsiveContainer width="100%" height={300}>

              <PieChart>

                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={100}
                  label
                >

                  {
                    pieData.map((entry,index)=>(

                      <Cell
                        key={index}
                        fill={COLORS[index]}
                      />

                    ))
                  }

                </Pie>

                <Legend/>

              </PieChart>

            </ResponsiveContainer>

          </div>

          <div className="chart-card">

            <h2>Average Speed by Area</h2>

            <ResponsiveContainer width="100%" height={300}>

              <BarChart data={speedData}>

                <CartesianGrid strokeDasharray="3 3"/>

                <XAxis dataKey="area"/>

                <YAxis/>

                <Tooltip/>

                <Bar
                  dataKey="speed"
                  fill="#10b981"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

      <Footer />

    </>

  );

}

export default Analytics;