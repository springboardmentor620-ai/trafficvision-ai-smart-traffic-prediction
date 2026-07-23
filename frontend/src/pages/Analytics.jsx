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

    const [summary, setSummary] = useState(null);
    const [weather, setWeather] = useState([]);
    const [holiday, setHoliday] = useState([]);
    const [hourly, setHourly] = useState([]);

    const getAuthHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
    });

    useEffect(() => {

        loadSummary();
        loadWeather();
        loadHoliday();
        loadHourly();

    }, []);

    const loadSummary = async () => {

        const response = await api.get(
            "/analytics/summary",
            getAuthHeader()
        );

        setSummary(response.data);

    };

    const loadWeather = async () => {

        const response = await api.get(
            "/analytics/weather",
            getAuthHeader()
        );

        setWeather(response.data);

    };

    const loadHoliday = async () => {

        const response = await api.get(
            "/analytics/holiday",
            getAuthHeader()
        );

        setHoliday(response.data);

    };

    const loadHourly = async () => {

        const response = await api.get(
            "/analytics/hourly",
            getAuthHeader()
        );

        setHourly(response.data);

    };

    if (!summary)
        return <h2 style={{ textAlign: "center" }}>Loading...</h2>;


    const cardStyle = {
        background: "linear-gradient(135deg,#2563eb,#1e40af)",
        color: "white",
        padding: "25px",
        borderRadius: "18px",
        textAlign: "center",
        boxShadow: "0 10px 25px rgba(0,0,0,.15)",
        transition: "0.3s"
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

                <>
                    <h1
                        style={{
                            color: "#1e3a8a",
                            marginBottom: "5px",
                            fontSize: "34px",
                            fontWeight: "700"
                        }}
                    >
                        📊 Traffic Analytics Dashboard
                    </h1>

                    <p
                        style={{
                            color: "#666",
                            marginBottom: "35px",
                            fontSize: "17px"
                        }}
                    >
                        Visual insights of traffic patterns based on weather, holidays and time.
                    </p>
                </>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                        gap: "25px",
                        marginBottom: "45px"
                    }}
                >

                    <div style={cardStyle}>
                        <h3>📄 Total Records</h3>
                        <h1>{summary.total_records}</h1>
                    </div>

                    <div style={cardStyle}>
                        <h3>🚗 Average Traffic</h3>
                        <h1>{summary.average_traffic}</h1>
                    </div>

                    <div style={cardStyle}>
                        <h3>📈 Maximum Traffic</h3>
                        <h1>{summary.maximum_traffic}</h1>
                    </div>

                    <div style={cardStyle}>
                        <h3>📉 Minimum Traffic</h3>
                        <h1>{summary.minimum_traffic}</h1>
                    </div>

                </div>

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
                🌦 Weather Analysis
                </h2>

                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={weather}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="weather" />
                        <YAxis />
                        <Tooltip />

                        <Bar
                            dataKey="average_traffic"
                            fill="#2563eb"
                        />
                    </BarChart>
                </ResponsiveContainer>
                </div>

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
        🎉 Holiday Analysis
    </h2>

    <ResponsiveContainer width="100%" height={350}>
        <PieChart>
            <Pie
                data={holiday}
                dataKey="average_traffic"
                nameKey="holiday"
                outerRadius={120}
                label
            >
                {holiday.map((item, index) => (
                    <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                    />
                ))}
            </Pie>

            <Tooltip />
            <Legend />
        </PieChart>
    </ResponsiveContainer>
</div>

            <div
                style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "18px",
                    boxShadow: "0 10px 25px rgba(0,0,0,.08)"
                }}
            >
                <h2
                    style={{
                        color: "#1e3a8a",
                        marginBottom: "20px"
                    }}
                >
                    🕒 Hourly Traffic
                </h2>

                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={hourly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="average_traffic"
                            stroke="#dc2626"
                            strokeWidth={3}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            </div>
        </>
    );
}

export default Analytics;