import "../styles/HowItWorks.css";

function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Stream & Ingest Telemetry",
      description: "High-frequency IoT sensors stream vehicle volume, intersection velocity, and zone status to our time-series ingestion engine.",
    },
    {
      num: "02",
      title: "Neural Model Evaluation",
      description: "Trained Random Forest and regression models evaluate multi-variable environmental and geometric parameters in milliseconds.",
    },
    {
      num: "03",
      title: "Synthesize Predictions & Paths",
      description: "The platform dynamically forecasts future bottleneck hotspots and calculates optimal bypass corridors for the network.",
    },
    {
      num: "04",
      title: "Orchestrate & Dispatch",
      description: "Alerts, reroute plans, and real-time dashboard telemetry are dispatched seamlessly to city operators and public users.",
    },
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="section-header">
        <span className="section-tag">Architecture & Flow</span>
        <h2>How TrafficVision AI Operates</h2>
        <p>From road sensor telemetry to intelligent autonomous city routing in four coordinated steps.</p>
      </div>

      <div className="steps-container">
        {steps.map((step, idx) => (
          <div key={idx} className="step-card">
            <div className="step-number-badge">{step.num}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;