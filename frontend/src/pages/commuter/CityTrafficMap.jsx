import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import TrafficMap from "../../components/dashboard/TrafficMap";

function CityTrafficMap() {
  return (
    <DashboardLayout>
      <DashboardHeader
        title="Bengaluru City Live Traffic Map"
        subtitle="Explore real-time congestion levels, vehicle velocities, and corridor profiles across 18+ monitored arterial junctions."
      />

      <div style={{ marginTop: "10px" }}>
        <TrafficMap />
      </div>
    </DashboardLayout>
  );
}

export default CityTrafficMap;
