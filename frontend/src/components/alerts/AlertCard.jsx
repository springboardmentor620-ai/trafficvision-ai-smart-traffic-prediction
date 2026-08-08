function AlertCard({ alert, onResolve }) {

  const colors = {

    Critical: "#dc2626",

    High: "#f97316",

    Medium: "#eab308",

    Low: "#22c55e",

  };

  return (

    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "18px",
        boxShadow: "0 3px 10px rgba(0,0,0,.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >

      <div>

        <h3>{alert.title}</h3>

        <p>{alert.message}</p>

        <small>

          <strong>Road:</strong> {alert.road}

        </small>

      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >

        <div
          style={{
            background: colors[alert.severity],
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "8px",
            fontWeight: "bold",
            minWidth: "90px",
            textAlign: "center",
          }}
        >

          {alert.severity}

        </div>

        {

          alert.status === "Active" ? (

            <button
              onClick={() => onResolve(alert.id)}
              style={{
                padding: "8px 14px",
                border: "none",
                borderRadius: "8px",
                background: "#2563eb",
                color: "#fff",
                cursor: "pointer",
              }}
            >

              Resolve

            </button>

          ) : (

            <span
              style={{
                color: "#16a34a",
                fontWeight: "bold",
              }}
            >

              ✔ Resolved

            </span>

          )

        }

      </div>

    </div>

  );

}

export default AlertCard;