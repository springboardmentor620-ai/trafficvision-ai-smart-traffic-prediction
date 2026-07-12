import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/modules.css";

function Modules() {

  const modules = [
    {
      icon: "👤",
      title: "User Management",
      description:
        "Provides secure authentication and role-based access for administrators and traffic operators."
    },
    {
      icon: "📡",
      title: "Traffic Data Collection",
      description:
        "Collects real-time traffic information from sensors, CCTV cameras and IoT devices."
    },
    {
      icon: "🤖",
      title: "AI Prediction Engine",
      description:
        "Uses Machine Learning algorithms to predict traffic congestion before it occurs."
    },
    {
      icon: "🚦",
      title: "Traffic Monitoring",
      description:
        "Continuously monitors traffic conditions and identifies congestion hotspots."
    },
    {
      icon: "📊",
      title: "Dashboard & Reports",
      description:
        "Displays traffic statistics, congestion reports and prediction results through interactive dashboards."
    },
    {
      icon: "🔔",
      title: "Alert & Notification System",
      description:
        "Generates traffic alerts and recommendations to improve traffic flow and reduce delays."
    }
  ];

  return (
    <>
      <Navbar />

      <section className="modules-page">

        <div className="page-title">

          <h1>System Modules</h1>

          <p>
            The Smart Traffic Prediction & Congestion Management System is
            divided into multiple functional modules that work together to
            collect, analyze and manage traffic efficiently.
          </p>

        </div>

        <div className="modules-grid">

          {modules.map((module, index) => (

            <div className="module-card" key={index}>

              <div className="module-icon">
                {module.icon}
              </div>

              <h2>{module.title}</h2>

              <p>{module.description}</p>

            </div>

          ))}

        </div>

      </section>

      <Footer />
    </>
  );
}

export default Modules;