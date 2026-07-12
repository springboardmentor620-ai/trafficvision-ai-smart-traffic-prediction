import "../styles/trafficcard.css";

function TrafficCard({ title, value }) {
  return (
    <div className="traffic-card">
      <h3>{title}</h3>
      <h1>{value}</h1>
    </div>
  );
}

export default TrafficCard;