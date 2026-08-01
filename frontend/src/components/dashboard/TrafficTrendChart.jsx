import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

function TrafficTrendChart({ data }) {

    const chartData = data.map((item) => ({

        month: item.month,

        total: item.total_accidents

    }));

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">

                Monthly Traffic Trend

            </h2>

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <LineChart data={chartData}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="month" />

                    <YAxis />

                    <Tooltip />

                    <Line

                        type="monotone"

                        dataKey="total"

                        stroke="#2563EB"

                        strokeWidth={3}

                    />

                </LineChart>

            </ResponsiveContainer>

        </div>

    );

}

export default TrafficTrendChart;