function FeaturesSection() {
  const features = [
    {
      icon: "🧠",
      title: "Predictive Neural Congestion Engine",
      description: "Multi-variable machine learning forecasting corridor bottlenecks and speed drops 15 to 60 minutes in advance.",
    },
    {
      icon: "🚦",
      title: "Autonomous Corridor Rerouting",
      description: "Dynamic graph optimization computing optimal bypass paths to balance urban flow and relieve choke points.",
    },
    {
      icon: "🗺️",
      title: "Geospatial GIS Live Mapping",
      description: "Interactive OpenStreetMap visualization detailing real-time vehicle densities, road statuses, and active city zones.",
    },
    {
      icon: "⚡",
      title: "Instant Incident Dispatch & Alerts",
      description: "Real-time alert notifications distributed automatically across municipal operators and public citizens.",
    },
    {
      icon: "📊",
      title: "Deep Historical Telemetry Analytics",
      description: "Comprehensive volume trends, busiest road rankings, speed distribution models, and downloadable PDF reports.",
    },
    {
      icon: "🛡️",
      title: "Zero-Trust Role-Based Governance",
      description: "Strict RBAC security providing specialized portals for System Administrators, Traffic Operators, and Public Users.",
    },
  ];

  return (
    <section id="features" className="features">
      <div className="section-header">
        <span className="section-tag">Core Capabilities</span>
        <h2>Built for Smart Cities & High-Velocity Transit</h2>
        <p>
          End-to-end intelligent infrastructure combining sensory telemetry, neural forecasting, and automated traffic dispatch.
        </p>
      </div>

      <div className="feature-grid">
        {features.map((feat, idx) => (
          <div key={idx} className="feature-card">
            <div>
              <div className="feature-card-icon">{feat.icon}</div>
              <h3>{feat.title}</h3>
              <p>{feat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;