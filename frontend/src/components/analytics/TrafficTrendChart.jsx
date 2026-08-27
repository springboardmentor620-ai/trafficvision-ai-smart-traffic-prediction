import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { getTrafficTrend } from "../../services/analytics";

function TrafficTrendChart() {
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchTrend = async () => {
      try {
        const data = await getTrafficTrend();
        if (!mounted) return;
        setTrend(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTrend();
    const timer = setInterval(fetchTrend, 5000);

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
        height: "420px",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "var(--text-primary)" }}>Traffic Volume Trend</h2>

      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={trend}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="label" stroke="var(--chart-text)" />
          <YAxis stroke="var(--chart-text)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="vehicles"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={{ fill: "var(--primary)", r: 4 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrafficTrendChart;