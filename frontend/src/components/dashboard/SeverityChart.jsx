import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend
} from "recharts";


const COLORS = [
    "#2563EB",
    "#F59E0B",
    "#EF4444"
];


function SeverityChart({ data = [] }) {

    const chartData = data.map((item) => ({
        name: item.accident_severity,
        value: item.total
    }));


    return (

        <div
            className="
                min-w-0
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
                    flex
                    items-start
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
                        Accident Severity
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-400
                        "
                    >
                        Distribution by severity
                    </p>

                </div>

                <span
                    className="
                        rounded-lg
                        bg-slate-100
                        px-2.5
                        py-1
                        text-xs
                        text-slate-500

                        dark:bg-slate-800
                        dark:text-slate-400
                    "
                >
                    Overview
                </span>

            </div>


            <div className="h-[290px]">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <PieChart>

                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="47%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={3}
                            stroke="none"
                        >

                            {chartData.map(
                                (entry, index) => (

                                    <Cell
                                        key={index}
                                        fill={
                                            COLORS[
                                                index %
                                                COLORS.length
                                            ]
                                        }
                                    />

                                )
                            )}

                        </Pie>


                        <Tooltip
                            contentStyle={{
                                borderRadius: "10px",
                                border:
                                    "1px solid #E2E8F0"
                            }}
                        />


                        <Legend
                            verticalAlign="bottom"
                            iconType="circle"
                            wrapperStyle={{
                                fontSize: "12px"
                            }}
                        />

                    </PieChart>

                </ResponsiveContainer>

            </div>

        </div>

    );
}

export default SeverityChart;