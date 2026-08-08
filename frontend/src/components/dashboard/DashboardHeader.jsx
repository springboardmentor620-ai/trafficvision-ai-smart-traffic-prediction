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
          fontSize: "30px",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          color: "#666",
          fontSize: "16px",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

export default DashboardHeader;