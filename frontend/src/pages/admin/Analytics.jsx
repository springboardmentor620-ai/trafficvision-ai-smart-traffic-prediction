import { useEffect, useState } from "react";

import AdminLayout from "../../components/dashboard/AdminLayout";
import AnalyticsCards from "../../components/analytics/AnalyticsCards";
import CongestionPieChart from "../../components/analytics/CongestionPieChart";
import BusyRoadChart from "../../components/analytics/BusyRoadChart";
import TrafficTrendChart from "../../components/analytics/TrafficTrendChart";
import RoadRankingTable from "../../components/analytics/RoadRankingTable";
import AIInsights from "../../components/analytics/AIInsights";

import {
  getDashboardSummary,
} from "../../services/traffic";

function Analytics() {

  const [summary, setSummary] = useState(null);

  useEffect(() => {

    let mounted = true;

    const fetchSummary = async () => {

      try {

        const data = await getDashboardSummary();

        if (!mounted) return;

        setSummary(data);

      } catch (err) {

        console.error(err);

      }

    };

    fetchSummary();

    return () => {
      mounted = false;
    };

  }, []);

  return (

    <AdminLayout
      title="Analytics Dashboard"
      subtitle="Traffic analytics and AI insights"
    >

      <AnalyticsCards
        summary={summary}
      />

      <div
        style={{
          marginTop: "30px",
        }}
      >
        
        <CongestionPieChart />
      
      </div>

      <div
        style={{
          marginTop:"30px"
        }}
      >

        <BusyRoadChart/>

      </div>

      <div
        style={{
          marginTop:"30px"
        }}
      >

        <TrafficTrendChart/>

      </div>

      <div
          style={{
              marginTop: "30px"
          }}
      >

          <RoadRankingTable/>

      </div>

      <div
          style={{
              marginTop:"30px"
          }}
      >

          <AIInsights/>

      </div>

    </AdminLayout>

  );

}

export default Analytics;