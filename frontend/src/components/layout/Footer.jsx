import "../../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-section">
          <h2>TrafficVision AI</h2>

          <p>
            Smart Traffic Prediction & Congestion Management System
            developed to improve urban transportation using Artificial
            Intelligence and Machine Learning.
          </p>
        </div>

        <div className="footer-section">

          <h3>Quick Links</h3>

          <ul>

            <li>Home</li>

            <li>Objectives</li>

            <li>Modules</li>

            <li>Workflow</li>

            <li>Technology Stack</li>

          </ul>

        </div>

        <div className="footer-section">

          <h3>Technologies</h3>

          <ul>

            <li>React.js</li>

            <li>FastAPI</li>

            <li>MongoDB</li>

            <li>Python</li>

            <li>Machine Learning</li>

          </ul>

        </div>

      </div>

      <hr />

      <div className="footer-bottom">

        © 2026 TrafficVision AI | Final Year Project | KITSW

      </div>

    </footer>
  );
}

export default Footer;