import "../styles/HowItWorks.css";

function HowItWorksSection() {
  return (
    <section className="how-it-works">

      <h2>How It Works</h2>

      <div className="steps">

        <div className="step">
          <div className="step-number">1</div>
          <h3>Register</h3>
          <p>Create your TrafficVision AI account.</p>
        </div>

        <div className="step">
          <div className="step-number">2</div>
          <h3>Login</h3>
          <p>Securely authenticate using JWT.</p>
        </div>

        <div className="step">
          <div className="step-number">3</div>
          <h3>Monitor Traffic</h3>
          <p>View live traffic information and congestion data.</p>
        </div>

        <div className="step">
          <div className="step-number">4</div>
          <h3>Analyze</h3>
          <p>Use dashboards and reports to make informed decisions.</p>
        </div>

      </div>

    </section>
  );
}

export default HowItWorksSection;