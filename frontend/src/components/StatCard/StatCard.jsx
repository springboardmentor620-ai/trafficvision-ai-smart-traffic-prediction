import "./StatCard.css";

function StatCard({ title, value }) {
  return (
    <div className="card">

      <p className="card-title">
        {title}
      </p>

      <h2 className="card-value">
        {value}
      </h2>

      <div className="card-footer">
        Live Data
      </div>

    </div>
  );
}

export default StatCard;