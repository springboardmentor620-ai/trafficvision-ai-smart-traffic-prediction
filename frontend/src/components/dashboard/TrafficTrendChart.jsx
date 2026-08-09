import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

function TrafficTrendChart({ data = [] }) {

    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    const formattedData = data.map((item) => ({
        monthName:
            monthNames[item.month - 1] ||
            item.month,
        total:
            Number(item.total_accidents) || 0
    }));

    return (
        <section
            className="
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm

                dark:border-slate-800
                dark:bg-slate-900
            "
        >

            {/* HEADER */}

            <div
                className="
                    flex
                    items-start
                    justify-between
                    border-b
                    border-slate-100
                    px-5
                    py-4

                    dark:border-slate-800
                "
            >

                <div>

                    <h2
                        className="
                            text-base
                            font-semibold
                            text-slate-900
                            dark:text-white
                        "
                    >
                        Traffic Overview
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-500
                            dark:text-slate-400
                        "
                    >
                        Monthly accident activity
                    </p>

                </div>

                <span
                    className="
                        rounded-lg
                        bg-blue-50
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                        text-blue-600

                        dark:bg-blue-950/40
                        dark:text-blue-400
                    "
                >
                    Monthly
                </span>

            </div>


            {/* CHART */}

            <div className="h-[300px] w-full px-3 py-4">

                {formattedData.length === 0 ? (

                    <div
                        className="
                            flex
                            h-full
                            items-center
                            justify-center
                            text-sm
                            text-slate-400
                        "
                    >
                        No traffic data available
                    </div>

                ) : (

                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >

                        <LineChart
                            data={formattedData}
                            margin={{
                                top: 8,
                                right: 12,
                                left: 4,
                                bottom: 4
                            }}
                        >

                            <CartesianGrid
                                strokeDasharray="4 4"
                                vertical={false}
                                stroke="#CBD5E1"
                                opacity={0.45}
                            />

                            <XAxis
                                dataKey="monthName"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 11,
                                    fill: "#94A3B8"
                                }}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                width={42}
                                tick={{
                                    fontSize: 11,
                                    fill: "#94A3B8"
                                }}
                            />

                            <Tooltip
                                cursor={{
                                    stroke: "#94A3B8",
                                    strokeDasharray: "4 4"
                                }}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border:
                                        "1px solid #E2E8F0",
                                    background:
                                        "#FFFFFF",
                                    boxShadow:
                                        "0 10px 30px rgba(15,23,42,0.12)"
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="total"
                                name="Accidents"
                                stroke="#2563EB"
                                strokeWidth={3}
                                dot={{
                                    r: 3.5,
                                    strokeWidth: 2,
                                    stroke: "#2563EB",
                                    fill: "#FFFFFF"
                                }}
                                activeDot={{
                                    r: 6
                                }}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                )}

            </div>

        </section>
    );
}

export default TrafficTrendChart;