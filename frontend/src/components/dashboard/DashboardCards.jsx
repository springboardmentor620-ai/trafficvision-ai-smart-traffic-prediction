import { useEffect, useState } from "react";
import TrafficCard from "../TrafficCard";
import { getDashboardSummary } from "../../services/traffic";

function DashboardCards({ summary: propSummary, trafficData }) {
  const [summary, setSummary] = useState(propSummary || null);
  const [loading, setLoading] = useState(!propSummary);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        const data = await getDashboardSummary();
        if (data && mounted) {
          setSummary(data);
          setLoading(false);
        }
      } catch (err) {
        // Fallback calculation from trafficData if available
        if (trafficData && trafficData.length > 0 && mounted) {
          const totalVehicles = trafficData.reduce(
            (acc, curr) => acc + (curr.vehicles ?? curr.traffic_volume ?? 0),
            0
          );
          const avgSpeed = (
            trafficData.reduce((acc, curr) => acc + (curr.average_speed || 0), 0) /
            trafficData.length
          ).toFixed(1);
          const heavyCongestion = trafficData.filter(
            (r) => r.status === "Heavy" || (r.congestion_level && r.congestion_level >= 70)
          ).length;

          setSummary({
            total_vehicles: totalVehicles,
            heavy_congestion: heavyCongestion,
            average_speed: avgSpeed,
            total_roads: trafficData.length,
          });
          setLoading(false);
        }
      }
    }

    loadSummary();
    const interval = setInterval(loadSummary, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [propSummary, trafficData]);

  if (loading || !summary) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              padding: "20px",
              backgroundColor: "var(--bg-surface)",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              minHeight: "100px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "40%",
                height: "12px",
                backgroundColor: "var(--bg-surface-secondary)",
                borderRadius: "4px",
              }}
            ></div>
            <div
              style={{
                width: "70%",
                height: "24px",
                backgroundColor: "var(--bg-surface-secondary)",
                borderRadius: "6px",
              }}
            ></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}
    >
      <TrafficCard
        title="City Traffic Volume"
        value={
          typeof summary.total_vehicles === "number"
            ? summary.total_vehicles.toLocaleString()
            : summary.total_vehicles
        }
      />

      <TrafficCard
        title="Congestion Hotspots"
        value={summary.heavy_congestion}
      />

      <TrafficCard
        title="Average Velocity"
        value={`${summary.average_speed} km/h`}
      />

      <TrafficCard
        title="Monitored Arterials"
        value={summary.total_roads}
      />
    </div>
  );
}

export default DashboardCards;