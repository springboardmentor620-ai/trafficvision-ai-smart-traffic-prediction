function FeaturesSection() {
  return (
    <section className="features">

      <h2>Key Features</h2>

      <div className="feature-grid">

        <div className="feature-card">
          <h3>📡 Live Traffic Monitoring</h3>
          <p>
            Monitor real-time traffic conditions and congestion across different zones.
          </p>
        </div>

        <div className="feature-card">
          <h3>🔒 Secure Authentication</h3>
          <p>
            JWT-based authentication with Role-Based Access Control for secure access.
          </p>
        </div>

        <div className="feature-card">
          <h3>📊 Interactive Dashboard</h3>
          <p>
            Visualize traffic data using charts, summary cards, and live updates.
          </p>
        </div>

        <div className="feature-card">
          <h3>🤖 AI Prediction</h3>
          <p>
            Future enhancement for predicting congestion using machine learning.
          </p>
        </div>

      </div>

    </section>
  );
}

export default FeaturesSection;