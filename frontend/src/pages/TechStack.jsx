import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import "../styles/techstack.css";

function TechStack() {

  const technologies = [
    {
      name: "React.js",
      role: "Frontend Development",
      description:
        "Builds an interactive and responsive user interface for traffic monitoring."
    },
    {
      name: "FastAPI",
      role: "Backend Development",
      description:
        "Provides high-performance REST APIs for communication between frontend and backend."
    },
    {
      name: "MongoDB",
      role: "Database",
      description:
        "Stores user information, traffic records and prediction results securely."
    },
    {
      name: "Python",
      role: "Programming Language",
      description:
        "Used for implementing Artificial Intelligence and Machine Learning models."
    },
    {
      name: "Machine Learning",
      role: "Prediction Engine",
      description:
        "Analyzes historical and real-time traffic data to predict congestion."
    },
    {
      name: "JWT Authentication",
      role: "Security",
      description:
        "Provides secure login and role-based authentication for users."
    }
  ];

  return (
    <>
      <Navbar />

      <section className="techstack-page">

        <div className="page-title">

          <h1>Technology Stack</h1>

          <p>
            TrafficVision AI is built using modern web technologies and
            Artificial Intelligence tools to deliver a scalable and efficient
            smart traffic management solution.
          </p>

        </div>

        <div className="tech-grid">

          {technologies.map((tech, index) => (

            <div className="tech-card" key={index}>

              <div className="tech-icon">
                💻
              </div>

              <h2>{tech.name}</h2>

              <h4>{tech.role}</h4>

              <p>{tech.description}</p>

            </div>

          ))}

        </div>

      </section>

      <Footer />
    </>
  );
}

export default TechStack;