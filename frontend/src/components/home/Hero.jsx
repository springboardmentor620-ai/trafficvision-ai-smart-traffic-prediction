import "../../styles/hero.css";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-left">

        <span className="badge">
          🚦 AI Powered Smart City Solution
        </span>

        <h1>
          Smart Traffic Prediction &
          <br />
          Congestion Management System
        </h1>

        <p>
          TrafficVision AI is an intelligent platform that helps city
          authorities monitor traffic, predict congestion using Artificial
          Intelligence, and optimize traffic flow through real-time analysis.
        </p>

        <div className="hero-buttons">

          <Link to="/dashboard">
            <button className="primary-btn">
              Explore Dashboard
            </button>
          </Link>

          <Link to="/workflow">
            <button className="secondary-btn">
              View Workflow
            </button>
          </Link>

        </div>

      </div>

      <div className="hero-right">

        <div className="hero-circle">

          🚦

        </div>

      </div>

    </section>
  );
}

export default Hero;