import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line
} from "recharts";

const COLORS = [
    "#2563eb",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899"
];

function Charts({
    weatherDistribution,
    hourlyTraffic,
    weatherTraffic,
    daywiseTraffic
}) {
    return (
        <>
            {/* Weather Distribution */}

            <h2>🌦 Weather Distribution</h2>

            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={weatherDistribution}
                        dataKey="count"
                        nameKey="weather_main"
                        outerRadius={120}
                        label
                    >
                        {weatherDistribution.map((entry, index) => (
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

            {/* Hourly Traffic */}

            <h2>🕒 Average Hourly Traffic</h2>

            <ResponsiveContainer width="100%" height={320}>
                <LineChart
                    data={hourlyTraffic}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 10
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="average_traffic"
                        stroke="#16a34a"
                        strokeWidth={3}
                    />
                </LineChart>
            </ResponsiveContainer>

            <br />

            {/* Day Wise Traffic */}

            <h2>📅 Average Traffic by Day</h2>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart
                    data={daywiseTraffic}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 10
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />

                    <Bar
                        dataKey="average_traffic"
                        fill="#6366f1"
                    />
                </BarChart>
            </ResponsiveContainer>

            <br />

            {/* Weather vs Traffic */}

            <h2>🌧 Weather vs Average Traffic</h2>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart
                    data={weatherTraffic}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 10
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="weather_main" />
                    <YAxis />
                    <Tooltip />

                    <Bar
                        dataKey="average_traffic"
                        fill="#8b5cf6"
                    />
                </BarChart>
            </ResponsiveContainer>
        </>
    );
}

export default Charts;