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
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        borderRadius: "14px",
        padding: "24px",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
        height: "420px",
      }}
    >
      <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "var(--text-primary)" }}>Congestion Level Distribution</h2>

      <ResponsiveContainer width="100%" height="88%">
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

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
              borderRadius: "8px",
            }}
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CongestionPieChart;