import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { getCongestionChart } from "../../services/analytics";

const COLORS = [
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
];

function CongestionPieChart() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {

    let mounted = true;

    const fetchChart = async () => {

      try {

        const data = await getCongestionChart();

        if (!mounted) return;

        const formatted = data.map((item) => ({
          name: item.status,
          value: item.count,
        }));

        setChartData(formatted);

      } catch (err) {

        console.error(err);

      }

    };

    fetchChart();

    const timer = setInterval(fetchChart, 5000);

    return () => {

      mounted = false;

      clearInterval(timer);

    };

  }, []);

  return (

    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 3px 12px rgba(0,0,0,.08)",
        height: "420px",
      }}
    >

      <h2>Congestion Distribution</h2>

      <ResponsiveContainer
        width="100%"
        height="90%"
      >

        <PieChart>

          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >

            {chartData.map((entry, index) => (

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

  );

}

export default CongestionPieChart;