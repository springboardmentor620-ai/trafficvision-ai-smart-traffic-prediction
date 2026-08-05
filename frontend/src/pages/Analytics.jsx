import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line
} from "recharts";

const COLORS = [
    "#2563eb",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4"
];

function Analytics() {

    const [dashboard, setDashboard] = useState(null);
    const [dailyTrend, setDailyTrend] = useState([]);

    const getAuthHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
    });

    useEffect(() => {
        loadDashboard();
        loadDailyTrend();
    }, []);

    const loadDashboard = async () => {
        const res = await api.get(
            "/analytics/dashboard-summary",
            getAuthHeader()
        );

        setDashboard(res.data);
    };

    const loadDailyTrend = async () => {
        const res = await api.get(
            "/analytics/trend/daily",
            getAuthHeader()
        );

        setDailyTrend(res.data);
    };

    if (!dashboard) {
        return (
            <>
                <Navbar />
                <h2
                    style={{
                        textAlign: "center",
                        marginTop: "100px"
                    }}
                >
                    Loading...
                </h2>
            </>
        );
    }

    const { kpis } = dashboard;
    const topRoutes = dashboard.top_congested_routes;

    const cardStyle = {
        background: "linear-gradient(135deg,#2563eb,#1e40af)",
        color: "white",
        padding: "25px",
        borderRadius: "18px",
        textAlign: "center",
        boxShadow: "0 10px 25px rgba(0,0,0,.15)"
    };


    return (
<>
<Navbar />

<div
style={{
padding: "30px",
background: "#f5f7fb",
minHeight: "100vh"
}}
>

<h1
style={{
color:"#1e3a8a",
marginBottom:"5px"
}}
>
📊 Traffic Analytics Dashboard
</h1>

<p
style={{
marginBottom:"35px",
color:"#666"
}}
>
Traffic prediction analytics based on your own prediction history.
</p>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:"20px",
marginBottom:"35px"
}}
>

<div style={cardStyle}>
<h3>Total Predictions</h3>
<h1>{kpis.total_predictions}</h1>
</div>

<div style={cardStyle}>
<h3>Active Alerts</h3>
<h1>{kpis.active_alerts}</h1>
</div>

<div style={cardStyle}>
<h3>High Congestion</h3>
<h1>{kpis.high_congestion_count}</h1>
</div>

<div style={cardStyle}>
<h3>Average Congestion</h3>
<h1>{kpis.avg_congestion}%</h1>
</div>

<div style={cardStyle}>
<h3>Average Delay</h3>
<h1>{kpis.avg_delay} min</h1>
</div>

<div style={cardStyle}>
<h3>Peak Hour</h3>
<h1>
{kpis.peak_hour !== null
? `${kpis.peak_hour}:00`
: "-"}
</h1>
</div>

</div>
{/* Congestion Distribution */}

<div
    style={{
        background: "white",
        padding: "25px",
        borderRadius: "18px",
        boxShadow: "0 10px 25px rgba(0,0,0,.08)",
        marginBottom: "35px"
    }}
>

<h2
style={{
color:"#1e3a8a",
marginBottom:"20px"
}}
>
🚦 Congestion Distribution
</h2>

<ResponsiveContainer width="100%" height={350}>
<PieChart>

<Pie
data={dashboard.congestion_distribution}
dataKey="count"
nameKey="label"
outerRadius={120}
label
>

{
dashboard.congestion_distribution.map((entry,index)=>(
<Cell
key={index}
fill={COLORS[index%COLORS.length]}
/>
))
}

</Pie>

<Tooltip/>

<Legend/>

</PieChart>
</ResponsiveContainer>

</div>



{/* Weather Distribution */}

<div
style={{
background:"white",
padding:"25px",
borderRadius:"18px",
boxShadow:"0 10px 25px rgba(0,0,0,.08)",
marginBottom:"35px"
}}
>

<h2
style={{
color:"#1e3a8a",
marginBottom:"20px"
}}
>
🌦 Weather Distribution
</h2>

<ResponsiveContainer width="100%" height={350}>

<BarChart
data={dashboard.weather_distribution}
>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="label"/>

<YAxis/>

<Tooltip/>

<Bar
dataKey="count"
fill="#2563eb"
/>

</BarChart>

</ResponsiveContainer>

</div>



{/* Daily Trend */}

<div
style={{
background:"white",
padding:"25px",
borderRadius:"18px",
boxShadow:"0 10px 25px rgba(0,0,0,.08)",
marginBottom:"35px"
}}
>

<h2
style={{
color:"#1e3a8a",
marginBottom:"20px"
}}
>
📈 Daily Traffic Trend
</h2>

<ResponsiveContainer width="100%" height={350}>

<LineChart
data={dailyTrend}
>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="period"/>

<YAxis/>

<Tooltip/>

<Line
type="monotone"
dataKey="avg_congestion"
stroke="#ef4444"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

{/* Top Congested Routes */}

<div
    style={{
        background: "white",
        padding: "25px",
        borderRadius: "18px",
        boxShadow: "0 10px 25px rgba(0,0,0,.08)",
        marginBottom: "35px"
    }}
>

    <h2
        style={{
            color: "#1e3a8a",
            marginBottom: "20px"
        }}
    >
        🛣 Top Congested Routes
    </h2>

    <table
        style={{
            width: "100%",
            borderCollapse: "collapse"
        }}
    >
        <thead>
            <tr
                style={{
                    background: "#2563eb",
                    color: "white"
                }}
            >
                <th style={{ padding: "12px" }}>Source</th>
                <th style={{ padding: "12px" }}>Destination</th>
                <th style={{ padding: "12px" }}>Predictions</th>
                <th style={{ padding: "12px" }}>Avg Congestion</th>
                <th style={{ padding: "12px" }}>Max Congestion</th>
            </tr>
        </thead>

        <tbody>

            {topRoutes.map((route, index) => (

                <tr
                    key={index}
                    style={{
                        textAlign: "center",
                        borderBottom: "1px solid #ddd"
                    }}
                >
                    <td style={{ padding: "10px" }}>
                        {route.source}
                    </td>

                    <td style={{ padding: "10px" }}>
                        {route.destination}
                    </td>

                    <td style={{ padding: "10px" }}>
                        {route.predictions}
                    </td>

                    <td style={{ padding: "10px" }}>
                        {route.avg_congestion}%
                    </td>

                    <td style={{ padding: "10px" }}>
                        {route.max_congestion}%
                    </td>

                </tr>

            ))}

        </tbody>

    </table>

</div>

</div>
</>
);
}

export default Analytics;