import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorksSection";
import RoleShowcaseSection from "../components/RoleShowcaseSection";
import Logo from "../components/common/Logo";

import "../styles/Home.css";

function Home() {
  return (
    <>
      <PublicNavbar />
      <HeroSection />

      {/* Core Architectural Metrics Strip */}
      <section className="metrics-strip">
        <div className="metrics-container">
          <div className="metric-item">
            <h3>Random Forest</h3>
            <p>Trained ML Congestion Classifier</p>
          </div>
          <div className="metric-item">
            <h3>18 Corridors</h3>
            <p>Monitored Across Bengaluru</p>
          </div>
          <div className="metric-item">
            <h3>Sub-Second</h3>
            <p>Fast ML Inference Engine</p>
          </div>
          <div className="metric-item">
            <h3>Real-Time</h3>
            <p>IoT Sensor Telemetry Sync</p>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <HowItWorksSection />
      <RoleShowcaseSection />

      {/* Enterprise Public Footer */}
      <footer className="public-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <Logo size="md" to="/" />
            <p style={{ marginTop: "14px" }}>
              Next-generation autonomous urban traffic intelligence, real-time sensor streams, and AI-powered congestion forecasting platform.
            </p>
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#features">Capabilities</a></li>
              <li><a href="#how-it-works">Architecture</a></li>
              <li><a href="#roles">Role Portals</a></li>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Transit Solutions</h4>
            <ul>
              <li><Link to="/login">Live Congestion GIS Map</Link></li>
              <li><Link to="/login">AI Congestion Forecasting</Link></li>
              <li><Link to="/login">Corridor Bypass Routing</Link></li>
              <li><Link to="/login">Emergency Incident Dispatch</Link></li>
              <li><Link to="/login">Commuter Mobility Portal</Link></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Platform Intelligence</h4>
            <ul>
              <li>IoT Road Sensor Telemetry Mesh</li>
              <li>Multi-Variable Random Forest ML</li>
              <li>Dynamic Corridor Graph Routing</li>
              <li>Enterprise Role Governance</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} TrafficVision AI Platform. All rights reserved.</span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)" }}></span>
            <span>All Systems Operational</span>
          </span>
        </div>
      </footer>
    </>
  );
}

export default Home;