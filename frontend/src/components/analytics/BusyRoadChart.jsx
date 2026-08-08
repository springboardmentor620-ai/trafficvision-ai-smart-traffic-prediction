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

        setRoads(data);

      }

      catch (err) {

        console.error(err);

      }

    };

    fetchRoads();

    const timer = setInterval(fetchRoads,5000);

    return () => {

      mounted = false;

      clearInterval(timer);

    };

  },[]);

  return (

    <div
      style={{
        background:"#fff",
        borderRadius:"12px",
        padding:"20px",
        boxShadow:"0 3px 12px rgba(0,0,0,.08)",
        height:"420px"
      }}
    >

      <h2>Top Busy Roads</h2>

      <ResponsiveContainer
        width="100%"
        height="90%"
      >

        <BarChart
          data={roads}
          layout="vertical"
        >

          <CartesianGrid strokeDasharray="3 3"/>

          <XAxis
            type="number"
          />

          <YAxis
            type="category"
            dataKey="road"
          />

          <Tooltip/>

          <Bar
            dataKey="vehicles"
            fill="#2563eb"
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  );

}

export default BusyRoadChart;