import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import Charts from "../components/Charts";

function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [topRoads, setTopRoads] = useState([]);
    const [topLocations, setTopLocations] = useState([]);
    const [speedAnalysis, setSpeedAnalysis] = useState([]);
    const [congestionChart, setCongestionChart] = useState([]);

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
            alert("Failed to load dashboard");
        }
    };

    const loadTopRoads = async () => {
        const response = await api.get(
            "/dashboard/top-roads",
            getAuthHeader()
        );
        setTopRoads(response.data);
    };

    const loadTopLocations = async () => {
        const response = await api.get(
            "/dashboard/top-locations",
            getAuthHeader()
        );
        setTopLocations(response.data);
    };

    const loadSpeedAnalysis = async () => {
        const response = await api.get(
            "/dashboard/speed-analysis",
            getAuthHeader()
        );
        setSpeedAnalysis(response.data);
    };

    const loadCongestionChart = async () => {
        const response = await api.get(
            "/dashboard/congestion-chart",
            getAuthHeader()
        );
        setCongestionChart(response.data);
    };

    useEffect(() => {
        loadSummary();
        loadTopRoads();
        loadTopLocations();
        loadSpeedAnalysis();
        loadCongestionChart();
    }, []);

    if (!summary) {
        return <h2>Loading...</h2>;
    }

    return (
        <>
            <Navbar />

            <div style={{ padding: "30px" }}>
                <h1>🚦 TrafficVision AI Dashboard</h1>

                <hr />

                <h2>Dashboard Summary</h2>

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "20px",
                        marginTop: "20px",
                        marginBottom: "30px"
                    }}
                >
                    <DashboardCard
                        title="Total Records"
                        value={summary.total_records}
                        color="#2563eb"
                    />

                    <DashboardCard
                        title="High Congestion"
                        value={summary.high_congestion}
                        color="#dc2626"
                    />

                    <DashboardCard
                        title="Medium Congestion"
                        value={summary.medium_congestion}
                        color="#d97706"
                    />

                    <DashboardCard
                        title="Low Congestion"
                        value={summary.low_congestion}
                        color="#16a34a"
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

                <hr />

                <Charts
                    topRoads={topRoads}
                    congestionChart={congestionChart}
                    topLocations={topLocations}
                    speedAnalysis={speedAnalysis}
                />
            </div>
        </>
    );
}

export default Dashboard;