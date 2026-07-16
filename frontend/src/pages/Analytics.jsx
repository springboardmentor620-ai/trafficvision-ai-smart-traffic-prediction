import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line
} from "recharts";

const COLORS = [
    "#2563eb",
    "#16a34a",
    "#dc2626",
    "#f59e0b",
    "#7c3aed",
    "#0891b2"
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
        loadData();
    }, []);

    const loadData = async () => {
        try {

            const [
                summaryRes,
                weatherRes,
                holidayRes,
                hourlyRes
            ] = await Promise.all([

                api.get(
                    "/analytics/summary",
                    getAuthHeader()
                ),

                api.get(
                    "/analytics/weather",
                    getAuthHeader()
                ),

                api.get(
                    "/analytics/holiday",
                    getAuthHeader()
                ),

                api.get(
                    "/analytics/hourly",
                    getAuthHeader()
                )

            ]);

            setSummary(summaryRes.data);
            setWeather(weatherRes.data);
            setHoliday(holidayRes.data);
            setHourly(hourlyRes.data);

        }
        catch (error) {
            console.log(error);
            toast.error("Failed to load analytics.");
        }
    };

    if (!summary) {
        return <Loader />;
    }

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

                <h1>📊 Traffic Analytics Dashboard</h1>

                <hr />

                <div
                    style={{
                        display: "flex",
                        gap: "20px",
                        flexWrap: "wrap",
                        marginTop: "25px",
                        marginBottom: "35px"
                    }}
                >

                    <DashboardCard
                        title="Total Records"
                        value={summary.total_records}
                        color="#2563eb"
                    />

                    <DashboardCard
                        title="Average Traffic"
                        value={summary.average_traffic}
                        color="#16a34a"
                    />

                    <DashboardCard
                        title="Maximum Traffic"
                        value={summary.maximum_traffic}
                        color="#dc2626"
                    />

                    <DashboardCard
                        title="Minimum Traffic"
                        value={summary.minimum_traffic}
                        color="#7c3aed"
                    />

                </div>

                <h2>Traffic by Weather</h2>

                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={weather}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="weather"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar
                            dataKey="average_traffic"
                            fill="#2563eb"
                        />
                    </BarChart>
                </ResponsiveContainer>

                <br/><br/>

                <h2>Holiday Traffic Distribution</h2>

                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>

                        <Pie
                            data={holiday}
                            dataKey="average_traffic"
                            nameKey="holiday"
                            outerRadius={120}
                            label
                        >

                            {
                                holiday.map((entry,index)=>(
                                    <Cell
                                        key={index}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))
                            }

                        </Pie>

                        <Tooltip/>
                        <Legend/>

                    </PieChart>
                </ResponsiveContainer>

                <br/><br/>

                <h2>Hourly Traffic Trend</h2>

                <ResponsiveContainer width="100%" height={350}>

                    <LineChart data={hourly}>

                        <CartesianGrid strokeDasharray="3 3"/>

                        <XAxis dataKey="hour"/>

                        <YAxis/>

                        <Tooltip/>

                        <Line
                            type="monotone"
                            dataKey="average_traffic"
                            stroke="#dc2626"
                            strokeWidth={3}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>
        </>
    );
}

export default Analytics;