import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { getTrafficTrend } from "../../services/analytics";

function TrafficTrendChart() {

  const [trend, setTrend] = useState([]);

  useEffect(() => {

    let mounted = true;

    const fetchTrend = async () => {

      try {

        const data = await getTrafficTrend();

        if (!mounted) return;

        setTrend(data);

      }

      catch (err) {

        console.error(err);

      }

    };

    fetchTrend();

    const timer = setInterval(fetchTrend,5000);

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
        height:"420px",
        boxShadow:"0 3px 12px rgba(0,0,0,.08)"
      }}
    >

      <h2>Traffic Trend</h2>

      <ResponsiveContainer
        width="100%"
        height="90%"
      >

        <LineChart data={trend}>

          <CartesianGrid strokeDasharray="3 3"/>

          <XAxis dataKey="label"/>

          <YAxis/>

          <Tooltip/>

          <Line
            type="monotone"
            dataKey="vehicles"
            stroke="#2563eb"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );

}

export default TrafficTrendChart;