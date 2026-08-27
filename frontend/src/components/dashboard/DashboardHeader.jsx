function DashboardHeader({ title, subtitle }) {
  return (
    <div
      style={{
        marginBottom: "25px",
      }}
    >
      <h1
        style={{
          marginBottom: "5px",
          fontSize: "28px",
          fontWeight: "700",
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "15px",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

export default DashboardHeader;