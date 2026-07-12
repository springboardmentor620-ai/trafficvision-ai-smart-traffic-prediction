import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import Footer from "../components/layout/Footer";
import "../styles/home.css";

function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <section className="stats-section">
        <div className="stat-box">
          <h2>120+</h2>
          <p>Traffic Signals</p>
        </div>

        <div className="stat-box">
          <h2>35+</h2>
          <p>AI Cameras</p>
        </div>

        <div className="stat-box">
          <h2>92%</h2>
          <p>Prediction Accuracy</p>
        </div>

        <div className="stat-box">
          <h2>24×7</h2>
          <p>Traffic Monitoring</p>
        </div>
      </section>

      <section className="about-project">
        <div className="section-heading">
          <h2>About TrafficVision AI</h2>

          <p>
            TrafficVision AI predicts congestion using Artificial Intelligence
            and Machine Learning to improve urban transportation.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;