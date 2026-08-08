import AdminLayout from "../../components/dashboard/AdminLayout";

function TrafficMonitoring() {
  return (
    <AdminLayout
      title="Traffic Monitoring"
      subtitle="Monitor live traffic conditions"
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "30px",
          minHeight: "500px",
          boxShadow: "0 3px 12px rgba(0,0,0,.08)",
        }}
      >
        <h2>Traffic Monitoring Module</h2>

        <p>
          Live traffic monitoring dashboard will appear here.
        </p>
      </div>
    </AdminLayout>
  );
}

export default TrafficMonitoring;