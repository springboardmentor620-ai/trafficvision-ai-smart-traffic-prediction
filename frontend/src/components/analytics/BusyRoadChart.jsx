import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getBusiestRoads } from "../../services/analytics";

function BusyRoadChart() {
  const [roads, setRoads] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchRoads = async () => {
      try {
        const data = await getBusiestRoads();
        if (!mounted) return;
        const formatted = (data || []).map((item, idx) => ({
          ...item,
          road:
            typeof item.road === "object"
              ? item.road?.name
              : item.road || item.name || item.road_name || `Road #${idx + 1}`,
        }));
        setRoads(formatted);
      } catch (err) {
        console.error(err);
      }
    };


    fetchRoads();
    const timer = setInterval(fetchRoads, 5000);

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
      <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "var(--text-primary)" }}>Top Busy Roads</h2>

      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={roads} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis type="number" stroke="var(--chart-text)" />
          <YAxis type="category" dataKey="road" stroke="var(--chart-text)" width={120} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="vehicles" fill="var(--primary)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BusyRoadChart;