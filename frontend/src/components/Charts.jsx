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

const chartCardStyle = {
    background: "linear-gradient(135deg,#ffffff,#f8fafc)",
    padding: "28px",
    borderRadius: "20px",
    boxShadow: "0 12px 30px rgba(0,0,0,.08)",
    marginBottom: "35px",
    transition: "all .3s ease",
    border: "1px solid #e5e7eb"
};

const headingStyle = {
    color: "#1e3a8a",
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "700"
};

function Charts({
    weatherDistribution,
    hourlyTraffic,
    weatherTraffic,
    daywiseTraffic
}) {

    const handleEnter = (e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow =
            "0 20px 40px rgba(37,99,235,.15)";
    };

    const handleLeave = (e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
            "0 12px 30px rgba(0,0,0,.08)";
    };

    return (
        <>
            {/* Weather Distribution */}

            <div
                style={chartCardStyle}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
            >
                <h2 style={headingStyle}>
                    🌦 Weather Distribution
                </h2>

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
            </div>

            {/* Hourly Traffic */}

            <div
                style={chartCardStyle}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
            >
                <h2 style={headingStyle}>
                    🕒 Average Hourly Traffic
                </h2>

                <ResponsiveContainer width="100%" height={330}>
                    <LineChart data={hourlyTraffic}>
                        <CartesianGrid strokeDasharray="4 4" />

                        <XAxis dataKey="hour" />

                        <YAxis />

                        <Tooltip />

                        <Line
                            type="monotone"
                            dataKey="average_traffic"
                            stroke="#2563eb"
                            strokeWidth={4}
                            dot={{ r: 5 }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Day Wise Traffic */}

            <div
                style={chartCardStyle}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
            >
                <h2 style={headingStyle}>
                    📅 Average Traffic by Day
                </h2>

                <ResponsiveContainer width="100%" height={330}>
                    <BarChart data={daywiseTraffic}>
                        <CartesianGrid strokeDasharray="4 4" />

                        <XAxis dataKey="day" />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="average_traffic"
                            fill="#2563eb"
                            radius={[10, 10, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Weather vs Traffic */}

            <div
                style={chartCardStyle}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
            >
                <h2 style={headingStyle}>
                    🌧 Weather vs Average Traffic
                </h2>

                <ResponsiveContainer width="100%" height={330}>
                    <BarChart data={weatherTraffic}>
                        <CartesianGrid strokeDasharray="4 4" />

                        <XAxis dataKey="weather_main" />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="average_traffic"
                            fill="#8b5cf6"
                            radius={[10, 10, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}

export default Charts;