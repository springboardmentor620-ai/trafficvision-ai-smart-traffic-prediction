import {

    ResponsiveContainer,

    PieChart,

    Pie,

    Cell,

    Tooltip,

    Legend

} from "recharts";

const COLORS = [

    "#10B981",

    "#F59E0B",

    "#EF4444"

];

function SeverityChart({

    data

}) {

    const chartData = data.map((item) => ({

        name: item.accident_severity,

        value: item.total

    }));

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">

                Accident Severity

            </h2>

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <PieChart>

                    <Pie

                        data={chartData}

                        dataKey="value"

                        nameKey="name"

                        outerRadius={110}

                        label

                    >

                        {

                            chartData.map((entry, index) => (

                                <Cell

                                    key={index}

                                    fill={

                                        COLORS[

                                            index % COLORS.length

                                        ]

                                    }

                                />

                            ))

                        }

                    </Pie>

                    <Tooltip />

                    <Legend />

                </PieChart>

            </ResponsiveContainer>

        </div>

    );

}

export default SeverityChart;