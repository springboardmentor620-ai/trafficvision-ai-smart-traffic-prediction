import Layout from "../components/Layout";

export default function HeatMap() {
  return (
    <Layout>
      <iframe
        title="Traffic Heatmap"
        src="http://localhost:8000/static/heatmap.html"
        width="100%"
        height="700"
        style={{
          border: "none",
          borderRadius: "12px"
        }}
      />
    </Layout>
  );
}