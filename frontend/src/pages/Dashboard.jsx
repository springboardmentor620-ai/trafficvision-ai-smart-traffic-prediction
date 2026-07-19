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

    const [topRoads, setTopRoads] = useState([]);
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

    const loadTopRoads = async () => {
        try {
            const response = await api.get(
                "/dashboard/top-roads",
                getAuthHeader()
            );

            setTopRoads(response.data);
        } catch (error) {
            console.log(error);
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
        const response = await api.get(
            "/dashboard/daywise-traffic",
            getAuthHeader()
        );

        setDaywiseTraffic(response.data);
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
        borderRadius: "12px",
        padding: "18px",
        fontSize: "17px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "0.3s",
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
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
                <h1>🚦 TrafficVision AI Analytics Dashboard</h1>

                <hr />

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "20px",
                        marginTop: "25px",
                        marginBottom: "30px"
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

                <h2 style={{ marginTop: "40px" }}>⚡ Quick Actions</h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "20px",
                        marginTop: "20px",  
                        marginBottom: "40px"
                    }}
                >
                    {role === "admin" && (
                        <button
                            onClick={() => navigate("/traffic/add")}
                            style={buttonStyle}
                        >
                            ➕ Add Traffic Record
                        </button>
                    )}

                    <button
                        onClick={() => navigate("/traffic/list")}
                        style={buttonStyle}
                    >
                        📋 Traffic Records
                    </button>

                    <button
                        onClick={() => navigate("/analytics")}
                        style={buttonStyle}
                    >
                        📊 Analytics
                    </button>

                    <button
                        onClick={() => navigate("/prediction")}
                        style={buttonStyle}
                    >
                        🤖 Traffic Prediction
                    </button>
                </div>

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