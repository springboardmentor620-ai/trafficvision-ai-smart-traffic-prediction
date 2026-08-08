import TrafficCard from "../TrafficCard";

function AnalyticsCards({ summary }) {
  if (!summary) {
    return <h3>Loading analytics...</h3>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
        gap: "20px",
        marginBottom: "30px",
      }}
    >
      <TrafficCard
        title="Total Vehicles"
        value={summary.total_vehicles}
      />

      <TrafficCard
        title="Roads Monitored"
        value={summary.total_roads}
      />

      <TrafficCard
        title="Average Speed"
        value={`${summary.average_speed} km/h`}
      />

      <TrafficCard
        title="Heavy Congestion"
        value={summary.heavy_congestion}
      />
    </div>
  );
}

export default AnalyticsCards;