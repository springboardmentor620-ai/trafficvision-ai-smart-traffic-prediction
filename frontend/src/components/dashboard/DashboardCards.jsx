import TrafficCard from "../TrafficCard";

function DashboardCards({ summary }) {
  
  if (!summary) {
    return <h3>Loading Dashboard...</h3>;
  }
  
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "30px",
      }}
    >
      <TrafficCard
        title="Total Vehicles"
        value={summary.total_vehicles}
      />

      <TrafficCard
        title="Heavy Congestion"
        value={summary.heavy_congestion}
      />

      <TrafficCard
        title="Average Speed"
        value={`${summary.average_speed} km/h`}
      />

      <TrafficCard
        title="Roads Monitored"
        value={summary.total_roads}
      />
    </div>
  );
}

export default DashboardCards;