import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function TrafficChart() {
  const data = {
    labels: [
      "6 AM",
      "8 AM",
      "10 AM",
      "12 PM",
      "2 PM",
      "4 PM",
      "6 PM",
    ],
    datasets: [
      {
        label: "Traffic Volume",
        data: [120, 260, 430, 520, 480, 610, 700],
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.2)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return <Line data={data} options={options} />;
}

export default TrafficChart;