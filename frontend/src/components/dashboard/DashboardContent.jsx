import TrafficChart from "../TrafficChart";
import TrafficTable from "../TrafficTable";

function DashboardContent({ trafficData }) {
  return (
    <div className="chart-container">
      <TrafficChart />

      <TrafficTable traffic={trafficData} />
    </div>
  );
}

export default DashboardContent;