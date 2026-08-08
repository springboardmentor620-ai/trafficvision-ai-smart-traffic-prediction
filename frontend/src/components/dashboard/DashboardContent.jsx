import TrafficChart from "../TrafficChart";
import TrafficTable from "../TrafficTable";

function DashboardContent({ trafficData }) {

  return (

    <>

      <TrafficChart
        trafficData={trafficData}
      />

      <TrafficTable
        traffic={trafficData}
      />

    </>

  );

}

export default DashboardContent;