import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import RouteRecommendation from "../components/RouteRecommendation";
import { getAreas } from "../services/trafficService";
import { useEffect, useState } from "react";

function Recommendations() {
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const data = await getAreas();
      setAreas(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Navbar />

      <div className="dashboard">
        <h1 style={{ textAlign: "center", color: "#1e3a8a" }}>
          🛣 Smart Route Recommendations
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "35px",
          }}
        >
          Find the fastest route using OpenStreetMap and AI.
        </p>

        <RouteRecommendation areas={areas} />
      </div>

      <Footer />
    </>
  );
}

export default Recommendations;