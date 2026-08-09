import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";


function WeatherChart({ data = [] }) {

    const chartData = data.map((item) => ({
        weather: item.weather,
        total: item.total
    }));


    return (

        <div
            className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm

                dark:border-slate-800
                dark:bg-slate-900
            "
        >

            <div
                className="
                    mb-5
                    flex
                    items-center
                    justify-between
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
                        Weather Impact
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-400
                        "
                    >
                        Accidents recorded under different
                        weather conditions
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
                    Analysis
                </span>

            </div>


            <div className="h-[280px]">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -18,
                            bottom: 5
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={false}
                            stroke="#E2E8F0"
                        />

                        <XAxis
                            dataKey="weather"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 11,
                                fill: "#64748B"
                            }}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 11,
                                fill: "#94A3B8"
                            }}
                        />

                        <Tooltip
                            cursor={{
                                fill: "rgba(37,99,235,0.05)"
                            }}
                            contentStyle={{
                                borderRadius: "10px",
                                border:
                                    "1px solid #E2E8F0"
                            }}
                        />

                        <Bar
                            dataKey="total"
                            fill="#2563EB"
                            radius={[6, 6, 0, 0]}
                            barSize={55}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>

    );
}

export default WeatherChart;