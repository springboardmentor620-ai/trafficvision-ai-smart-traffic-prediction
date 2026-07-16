import TrafficCard from "../TrafficCard";

function DashboardCards({ trafficData }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
      }}
    >
      <TrafficCard
        title="Vehicles Today"
        value={trafficData.reduce(
          (sum, road) => sum + road.vehicles,
          0
        )}
      />

      <TrafficCard
        title="Congested Roads"
        value={
          trafficData.filter(
            (road) => road.status === "Heavy"
          ).length
        }
      />

      <TrafficCard
        title="Average Speed"
        value={
          trafficData.length
            ? (
                trafficData.reduce(
                  (sum, road) => sum + road.average_speed,
                  0
                ) / trafficData.length
              ).toFixed(1) + " km/h"
            : "0 km/h"
        }
      />

      <TrafficCard
        title="Active Alerts"
        value={
          trafficData.filter(
            (road) => road.status === "Heavy"
          ).length
        }
      />
    </div>
  );
}

export default DashboardCards;