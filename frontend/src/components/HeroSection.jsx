import { Link } from "react-router-dom";
import "../styles/HeroSection.css";

function HeroSection() {
  return (
    <section className="hero">

        <div className="hero-left">

        <h1>
            Smart Traffic Monitoring
            <br />
            & Congestion Management
        </h1>

        <p>
            TrafficVision AI helps monitor traffic in real time,
            provides secure access for operators, and lays the
            foundation for AI-powered congestion prediction and
            smarter urban mobility.
        </p>

        <div className="hero-buttons">

            <Link to="/register">
            <button>Get Started</button>
            </Link>

            <Link to="/login">
            <button>Login</button>
            </Link>

        </div>

        </div>

        <div className="hero-right">

        <div className="dashboard-preview">

            <h3>📊 Dashboard Preview</h3>

            <div className="preview-card">
            🚗 Live Traffic Monitoring
            </div>

            <div className="preview-card">
            📈 Traffic Analytics
            </div>

            <div className="preview-card">
            🤖 AI Prediction (Coming Soon)
            </div>

        </div>

        </div>

    </section>
);
}

export default HeroSection;