import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import Charts from "../components/Charts";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

function Dashboard() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    const [summary, setSummary] = useState(null);
    const [weatherDistribution, setWeatherDistribution] = useState([]);
    const [hourlyTraffic, setHourlyTraffic] = useState([]);
    const [weatherTraffic, setWeatherTraffic] = useState([]);
    const [daywiseTraffic, setDaywiseTraffic] = useState([]);

    const getAuthHeader = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
    });

    const loadSummary = async () => {
        try {
            const response = await api.get(
                "/dashboard/summary",
                getAuthHeader()
            );

            setSummary(response.data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to load dashboard summary");
        }
    };

    const loadWeatherDistribution = async () => {
        try {
            const response = await api.get(
                "/dashboard/weather-distribution",
                getAuthHeader()
            );

            setWeatherDistribution(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const loadHourlyTraffic = async () => {
        try {
            const response = await api.get(
                "/dashboard/hourly-traffic",
                getAuthHeader()
            );

            setHourlyTraffic(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const loadWeatherTraffic = async () => {
        try {
            const response = await api.get(
                "/dashboard/weather-traffic",
                getAuthHeader()
            );

            setWeatherTraffic(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const loadDaywiseTraffic = async () => {
        try {
            const response = await api.get(
                "/dashboard/daywise-traffic",
                getAuthHeader()
            );

            setDaywiseTraffic(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        loadSummary();
        loadWeatherDistribution();
        loadHourlyTraffic();
        loadWeatherTraffic();
        loadDaywiseTraffic();
    }, []);

    if (!summary) {
        return <Loader />;
    }

    const buttonStyle = {
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "16px",
        padding: "22px",
        fontSize: "18px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all .3s ease",
        boxShadow: "0 10px 25px rgba(37,99,235,.25)"
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
                        color: "#1e3a8a",
                        marginBottom: "8px",
                        fontSize: "36px",
                        fontWeight: "700"
                    }}
                >
                    🚦 TrafficVision AI
                </h1>

                <p
                    style={{
                        color: "#6b7280",
                        fontSize: "18px",
                        marginBottom: "30px"
                    }}
                >
                    Smart Traffic Monitoring & Prediction Dashboard
                </p>

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "20px",
                        marginBottom: "40px"
                    }}
                >
                    <DashboardCard
                        title="Total Records"
                        value={summary.total_records}
                        color="#2563eb"
                    />

                    <DashboardCard
                        title="High Traffic"
                        value={summary.high_congestion}
                        color="#dc2626"
                    />

                    <DashboardCard
                        title="Medium Traffic"
                        value={summary.medium_congestion}
                        color="#f59e0b"
                    />

                    <DashboardCard
                        title="Low Traffic"
                        value={summary.low_congestion}
                        color="#22c55e"
                    />

                    <DashboardCard
                        title="Average Speed"
                        value={`${summary.average_speed} km/h`}
                        color="#7c3aed"
                    />

                    <DashboardCard
                        title="Average Vehicles"
                        value={summary.average_vehicle_count}
                        color="#0891b2"
                    />
                </div>

                <h2
                    style={{
                        color: "#1e3a8a",
                        marginTop: "50px",
                        marginBottom: "25px"
                    }}
                >
                    ⚡ Quick Actions
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px,1fr))",
                        gap: "20px",
                        marginBottom: "45px"
                    }}
                >
                    {role === "admin" && (
                        <button
                            onClick={() => navigate("/traffic/add")}
                            style={buttonStyle}
                            onMouseEnter={(e) => {
                                e.target.style.background = "#1d4ed8";
                                e.target.style.transform = "translateY(-4px)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "#2563eb";
                                e.target.style.transform = "translateY(0)";
                            }}
                        >
                            ➕ Add Traffic Record
                        </button>
                    )}

                    <button
                        onClick={() => navigate("/traffic/list")}
                        style={buttonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.background = "#1d4ed8";
                            e.target.style.transform = "translateY(-4px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#2563eb";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        📋 Traffic Records
                    </button>

                    <button
                        onClick={() => navigate("/analytics")}
                        style={buttonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.background = "#1d4ed8";
                            e.target.style.transform = "translateY(-4px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#2563eb";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        📊 Analytics
                    </button>

                    <button
                        onClick={() => navigate("/prediction")}
                        style={buttonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.background = "#1d4ed8";
                            e.target.style.transform = "translateY(-4px)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = "#2563eb";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        🤖 Traffic Prediction
                    </button>
                </div>

                <h2
                    style={{
                        color: "#1e3a8a",
                        marginBottom: "25px"
                    }}
                >
                    📈 Traffic Statistics
                </h2>

                <Charts
                    weatherDistribution={weatherDistribution}
                    hourlyTraffic={hourlyTraffic}
                    weatherTraffic={weatherTraffic}
                    daywiseTraffic={daywiseTraffic}
                />
            </div>
        </>
    );
}

export default Dashboard;