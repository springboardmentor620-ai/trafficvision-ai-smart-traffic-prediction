import AdminLayout from "../../components/dashboard/AdminLayout";

function Settings() {
  return (
    <AdminLayout
      title="Settings"
      subtitle="Configure TrafficVision AI platform"
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
        <h2>Settings Module</h2>

        <p>
          System settings, user preferences and platform configuration will
          appear here.
        </p>
      </div>
    </AdminLayout>
  );
}

export default Settings;