import Layout from "../components/Layout";

export default function HeatmapDashboard() {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Traffic Heatmap</h1>

        <iframe
          title="Traffic Heatmap"
          src="http://localhost:8000/static/heatmap.html"
          width="100%"
          height="700"
          style={{
            border: "none",
            borderRadius: "12px",
          }}
        />
      </div>
    </Layout>
  );
}