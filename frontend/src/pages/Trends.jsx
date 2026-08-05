import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import SummaryCard from "../components/SummaryCard";
import api from "../services/api";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
});

function Trends() {
    const [summary, setSummary] = useState(null);
    const [daily, setDaily] = useState([]);
    const [monthly, setMonthly] = useState([]);
    const [congestion, setCongestion] = useState([]);
    const [peakHour, setPeakHour] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTrends();
    }, []);

    async function loadTrends() {
        try {
            setLoading(true);
            setError(null);

            const [summaryRes, dailyRes, monthlyRes, congestionRes, peakRes] = await Promise.all([
                api.get("/analytics/trends/summary", authHeader()),
                api.get("/analytics/trends/daily?days=30", authHeader()),
                api.get("/analytics/trends/monthly?months=12", authHeader()),
                api.get("/analytics/trends/congestion", authHeader()),
                api.get("/analytics/trends/peak-hour", authHeader()),
            ]);

            setSummary(summaryRes.data);
            setDaily(dailyRes.data);
            setMonthly(monthlyRes.data);
            setCongestion(congestionRes.data);
            setPeakHour(peakRes.data.map((p) => ({ ...p, hourLabel: `${p.hour}:00` })));
        } catch (err) {
            console.log(err);
            setError("We couldn't load trend analytics. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <Loader />;

    return (
        <>
            <Navbar />

            <div style={{ padding: "30px", background: "#f5f7fb", minHeight: "100vh" }}>
                <h1 style={{ color: "#1e3a8a", marginBottom: "5px" }}>📈 Traffic Trend Analysis</h1>
                <p style={{ color: "#64748b", marginBottom: "30px" }}>
                    Daily, monthly, and peak-hour traffic patterns from your prediction history.
                </p>

                {error && (
                    <div style={panelStyle}>
                        <p style={{ color: "#dc2626", fontWeight: 600, textAlign: "center" }}>{error}</p>
                        <div style={{ textAlign: "center" }}>
                            <button onClick={loadTrends} style={retryButtonStyle}>Retry</button>
                        </div>
                    </div>
                )}

                {!error && summary && summary.highest_traffic_day === null && (
                    <div style={{ ...panelStyle, textAlign: "center", padding: "60px 20px" }}>
                        <div style={{ fontSize: "40px" }}>📉</div>
                        <h3 style={{ color: "#1e3a8a", margin: "10px 0 4px" }}>No trend data yet</h3>
                        <p style={{ color: "#64748b", margin: 0 }}>
                            Run a few traffic predictions and trends will start showing up here.
                        </p>
                    </div>
                )}

                {!error && summary && summary.highest_traffic_day !== null && (
                    <>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "20px",
                                marginBottom: "30px",
                            }}
                        >
                            <SummaryCard
                                title="Avg Daily Traffic"
                                value={Math.round(summary.average_daily_traffic)}
                                color="#2563eb"
                            />
                            <SummaryCard
                                title="Busiest Day"
                                value={summary.highest_traffic_day || "-"}
                                color="#ef4444"
                            />
                            <SummaryCard
                                title="Calmest Day"
                                value={summary.lowest_traffic_day || "-"}
                                color="#16a34a"
                            />
                            <SummaryCard
                                title="Peak Hour"
                                value={summary.peak_hour !== null ? `${summary.peak_hour}:00` : "-"}
                                color="#f59e0b"
                            />
                            <SummaryCard
                                title="Most Common Congestion"
                                value={summary.most_common_congestion || "-"}
                                color="#7c3aed"
                            />
                        </div>

                        <ChartPanel title="📅 Daily Trend (last 30 days)">
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={daily}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="avg_congestion"
                                        name="Avg Congestion %"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartPanel>

                        <ChartPanel title="🗓️ Monthly Trend (last 12 months)">
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={monthly}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="predictions" name="Predictions" fill="#2563eb" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartPanel>

                        <ChartPanel title="⏰ Peak Hour Analysis">
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={peakHour}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hourLabel" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="avg_traffic" name="Avg Traffic" fill="#f59e0b" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartPanel>

                        <ChartPanel title="🚦 Congestion Breakdown">
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie data={congestion} dataKey="count" nameKey="label" outerRadius={110} label>
                                        {congestion.map((entry, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartPanel>
                    </>
                )}
            </div>
        </>
    );
}

function ChartPanel({ title, children }) {
    return (
        <div style={panelStyle}>
            <h2 style={{ color: "#1e3a8a", marginBottom: "20px", fontSize: "18px" }}>{title}</h2>
            {children}
        </div>
    );
}

const panelStyle = {
    background: "white",
    padding: "25px",
    borderRadius: "18px",
    boxShadow: "0 10px 25px rgba(0,0,0,.08)",
    marginBottom: "30px",
};

const retryButtonStyle = {
    marginTop: "14px",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
};

export default Trends;
