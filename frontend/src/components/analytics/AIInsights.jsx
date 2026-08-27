import { useEffect, useState } from "react";
import { getAIInsights } from "../../services/analytics";

function AIInsights() {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadInsights = async () => {
      try {
        const data = await getAIInsights();
        if (!mounted) return;
        setInsights(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadInsights();
    const timer = setInterval(loadInsights, 5000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        borderRadius: "14px",
        padding: "24px",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "var(--primary)", display: "flex", alignItems: "center", gap: "8px" }}>
        🤖 AI Traffic Insights
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
        {insights.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Analyzing live traffic patterns...</p>
        ) : (
          insights.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: "var(--bg-surface-secondary)",
                border: "1px solid var(--border-color)",
                fontSize: "14px",
                color: "var(--text-primary)",
                lineHeight: 1.5,
              }}
            >
              💡 {item}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AIInsights;