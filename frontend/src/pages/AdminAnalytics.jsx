import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function AdminAnalytics() {
  return (
    <>
      <Navbar />

      <div
        style={{
          padding: "30px",
          minHeight: "80vh",
          background: "#f5f7fb",
        }}
      >
        <h1>📊 Admin Analytics</h1>

        <p style={{ marginTop: "10px", color: "#666" }}>
          Analytics dashboard for all traffic predictions.
        </p>

        <div
          style={{
            marginTop: "30px",
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Analytics Module</h3>

          <p>
            This page will display:
          </p>

          <ul>
            <li>📈 Traffic Volume</li>
            <li>📉 Congestion Trend</li>
            <li>🥧 Alert Severity</li>
            <li>🚦 Peak Hours</li>
            <li>🗺 Heatmap Statistics</li>
          </ul>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default AdminAnalytics;