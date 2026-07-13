import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line
} from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

function Charts({
    topRoads,
    congestionChart,
    topLocations,
    speedAnalysis
}) {
    return (
        <>
            <h2>Top Roads</h2>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topRoads}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="road_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                        dataKey="avg_vehicle_count"
                        fill="#3b82f6"
                    />
                </BarChart>
            </ResponsiveContainer>

            <br />

            <h2>Congestion Analysis</h2>

            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={congestionChart}
                        dataKey="count"
                        nameKey="congestion_level"
                        outerRadius={120}
                        label
                    >
                        {congestionChart.map((entry, index) => (
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

            <br />

            <h2>Top Locations</h2>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topLocations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                        dataKey="records"
                        fill="#10b981"
                    />
                </BarChart>
            </ResponsiveContainer>

            <br />

            <h2>Average Speed Analysis</h2>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={speedAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="road_name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="average_speed"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                    />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
}

export default Charts;