function ZoneCard({ zone, onEdit, onDelete }) {

  return (

    <div
      style={{
        background: "#fff",
        padding: "20px",
        marginBottom: "15px",
        borderRadius: "12px",
        boxShadow: "0 3px 10px rgba(0,0,0,.08)",
      }}
    >

      <h3>{zone.name}</h3>

      <p>

        {zone.city}, {zone.state}

      </p>

      <p>Status : {zone.status}</p>

      <p>Roads : {zone.roads}</p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "15px",
        }}
      >

        <button
          onClick={() => onEdit(zone)}
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(zone.id)}
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

export default ZoneCard;