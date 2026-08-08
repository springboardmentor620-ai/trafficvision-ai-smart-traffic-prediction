function RoadCard({ road, onEdit, onDelete }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "15px",
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      }}
    >
      <h3>{road.name}</h3>

      <p>
        {road.city}, {road.state}
      </p>

      <p>Status: {road.status}</p>

      <p>Speed Limit: {road.speed_limit} km/h</p>

      <div
        style={{
          marginTop: "15px",
          display: "flex",
          gap: "10px",
        }}
      >
        <button onClick={() => onEdit(road)}>
          Edit
        </button>

        <button
          onClick={() => onDelete(road.id)}
          style={{
            background: "#dc2626",
            color: "#fff",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default RoadCard;