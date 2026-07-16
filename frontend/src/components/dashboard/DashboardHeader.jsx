function DashboardHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h1>{title}</h1>

      {subtitle && (
        <p
          style={{
            color: "#666",
            marginTop: "6px",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default DashboardHeader;