import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/workflow.css";

function Workflow() {
  const workflowSteps = [
    {
      step: "01",
      title: "Traffic Data Collection",
      description:
        "Collect traffic information from CCTV cameras, road sensors, GPS devices and IoT systems."
    },
    {
      step: "02",
      title: "Data Processing",
      description:
        "Clean, organize and preprocess the collected traffic data for further analysis."
    },
    {
      step: "03",
      title: "AI Prediction",
      description:
        "Machine Learning models analyze historical and live traffic data to predict future congestion."
    },
    {
      step: "04",
      title: "Congestion Analysis",
      description:
        "The system identifies high-traffic zones and determines congestion levels."
    },
    {
      step: "05",
      title: "Traffic Optimization",
      description:
        "Suggests alternative routes and optimizes signal timings to improve traffic flow."
    },
    {
      step: "06",
      title: "Dashboard & Reports",
      description:
        "Displays real-time traffic insights, prediction results and analytics for decision making."
    }
  ];

  return (
    <>
      <Navbar />

      <section className="workflow-page">

        <div className="page-title">
          <h1>System Workflow</h1>

          <p>
            The Smart Traffic Prediction & Congestion Management System follows
            a structured workflow to collect, process and analyze traffic data
            for intelligent traffic management.
          </p>
        </div>

        <div className="workflow-container">

          {workflowSteps.map((item) => (
            <div className="workflow-card" key={item.step}>

              <div className="step-circle">
                {item.step}
              </div>

              <div className="workflow-content">

                <h2>{item.title}</h2>

                <p>{item.description}</p>

              </div>

            </div>
          ))}

        </div>

      </section>

      <Footer />
    </>
  );
}

export default Workflow;