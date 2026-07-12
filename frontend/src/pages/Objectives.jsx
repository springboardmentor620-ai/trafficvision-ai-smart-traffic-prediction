import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/objectives.css";

function Objectives() {
  return (
    <>
      <Navbar />

      <section className="objectives-page">

        <div className="page-title">
          <h1>Project Objectives</h1>
          <p>
            The Smart Traffic Prediction & Congestion Management System aims to
            improve urban transportation by using Artificial Intelligence and
            real-time traffic monitoring.
          </p>
        </div>

        <div className="objective-grid">

          <div className="objective-card">
            <div className="icon">🚦</div>
            <h2>Traffic Monitoring</h2>
            <p>
              Continuously monitor road traffic using cameras, sensors and IoT
              devices to collect live traffic information.
            </p>
          </div>

          <div className="objective-card">
            <div className="icon">🤖</div>
            <h2>AI Prediction</h2>
            <p>
              Predict future congestion using Artificial Intelligence and
              Machine Learning algorithms.
            </p>
          </div>

          <div className="objective-card">
            <div className="icon">🛣️</div>
            <h2>Route Optimization</h2>
            <p>
              Suggest better alternative routes to reduce travel time and
              improve traffic movement.
            </p>
          </div>

          <div className="objective-card">
            <div className="icon">📊</div>
            <h2>Data Analytics</h2>
            <p>
              Analyze traffic trends and generate reports for better decision
              making by traffic authorities.
            </p>
          </div>

          <div className="objective-card">
            <div className="icon">⚡</div>
            <h2>Quick Decision Support</h2>
            <p>
              Provide instant traffic alerts and recommendations for efficient
              traffic management.
            </p>
          </div>

          <div className="objective-card">
            <div className="icon">🌍</div>
            <h2>Smart City Development</h2>
            <p>
              Support smart city initiatives by improving transportation
              efficiency and reducing congestion.
            </p>
          </div>

        </div>

      </section>

      <Footer />
    </>
  );
}

export default Objectives;