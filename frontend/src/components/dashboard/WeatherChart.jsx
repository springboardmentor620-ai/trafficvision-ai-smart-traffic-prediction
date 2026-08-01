import {

    ResponsiveContainer,

    BarChart,

    Bar,

    XAxis,

    YAxis,

    Tooltip,

    CartesianGrid

} from "recharts";

function WeatherChart({

    data

}) {

    const chartData = data.map((item) => ({

        weather: item.weather,

        total: item.total

    }));

    return (

        <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-6">

                Weather Distribution

            </h2>

            <ResponsiveContainer
                width="100%"
                height={320}
            >

                <BarChart data={chartData}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="weather" />

                    <YAxis />

                    <Tooltip />

                    <Bar

                        dataKey="total"

                        fill="#2563EB"

                        radius={[8, 8, 0, 0]}

                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

}

export default WeatherChart;