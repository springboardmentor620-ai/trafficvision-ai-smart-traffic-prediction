import { useEffect, useState } from "react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import { predictTraffic } from "../services/predictionService";
import {
  getAreas,
  getAreaDetails,
} from "../services/trafficService";

import "../styles/dashboard.css";

function UserDashboard() {

  const [name, setName] = useState("");

  const [areas, setAreas] = useState([]);

  const [selectedArea, setSelectedArea] = useState("");

  const [trafficData, setTrafficData] = useState(null);

  const [prediction, setPrediction] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const userName = localStorage.getItem("name");

    if (userName) {
      setName(userName);
    }

    loadAreas();

  }, []);

  const loadAreas = async () => {

    try {

      const data = await getAreas();

      setAreas(data);

    } catch (error) {

      console.log(error);

      alert("Unable to load areas.");

    }

  };

  const fetchAreaDetails = async () => {

    if (!selectedArea) {

      alert("Please select an area.");

      return;

    }

    try {

      const data = await getAreaDetails(selectedArea);

      setTrafficData(data);

      setPrediction("");

    } catch (error) {

      console.log(error);

      alert("Unable to fetch traffic details.");

    }

  };

  const handlePrediction = async () => {

    if (!trafficData) {

      alert("Please fetch an area first.");

      return;

    }

    setLoading(true);

    try {

      const date = new Date(trafficData.Date);

      const request = {

        area_name: trafficData["Area Name"],

        road_name: trafficData["Road/Intersection Name"],

        traffic_volume: trafficData["Traffic Volume"],

        average_speed: trafficData["Average Speed"],

        travel_time_index: trafficData["Travel Time Index"],

        road_capacity_utilization:
          trafficData["Road Capacity Utilization"],

        incident_reports:
          trafficData["Incident Reports"],

        environmental_impact:
          trafficData["Environmental Impact"],

        public_transport_usage:
          trafficData["Public Transport Usage"],

        traffic_signal_compliance:
          trafficData["Traffic Signal Compliance"],

        parking_usage:
          trafficData["Parking Usage"],

        pedestrian_count:
          trafficData["Pedestrian and Cyclist Count"],

        weather_conditions:
          trafficData["Weather Conditions"],

        roadwork_activity:
          trafficData["Roadwork and Construction Activity"],

        year: date.getFullYear(),

        month: date.getMonth() + 1,

        day: date.getDate(),

      };

      const result = await predictTraffic(request);

      setPrediction(result.predicted_congestion_level);

    } catch (error) {

      console.log(error);

      alert("Prediction failed.");

    }

    setLoading(false);

  };
    return (

    <>

      <Navbar />

      <div className="dashboard">

        <div className="dashboard-header">

          <h1>Welcome, {name}</h1>

          <p>Traffic Operator Dashboard</p>

        </div>

        <div className="dashboard-cards">

          <div className="dashboard-card">
            <h2>{areas.length}</h2>
            <p>Total Areas</p>
          </div>

          <div className="dashboard-card">
            <h2>8936</h2>
            <p>Traffic Records</p>
          </div>

          <div className="dashboard-card">
            <h2>AI</h2>
            <p>Prediction Model</p>
          </div>

          <div className="dashboard-card">
            <h2>MongoDB</h2>
            <p>Database</p>
          </div>

        </div>

        <div className="dashboard-panel">

          <h2>Select Traffic Area</h2>

          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >

            <option value="">Select Area</option>

            {areas.map((area) => (

              <option
                key={area}
                value={area}
              >
                {area}
              </option>

            ))}

          </select>

          <br /><br />

          <button
            onClick={fetchAreaDetails}
          >
            Fetch Area Details
          </button>

          <button
            style={{ marginLeft: "10px" }}
            onClick={handlePrediction}
            disabled={loading}
          >

            {loading
              ? "Predicting..."
              : "Predict Traffic"}

          </button>

        </div>

        {

          trafficData && (

            <div className="dashboard-panel">

              <h2>Traffic Information</h2>

              <table>

                <tbody>

                  <tr>
                    <td><strong>Area</strong></td>
                    <td>{trafficData["Area Name"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Road</strong></td>
                    <td>{trafficData["Road/Intersection Name"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Date</strong></td>
                    <td>{trafficData["Date"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Traffic Volume</strong></td>
                    <td>{trafficData["Traffic Volume"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Average Speed</strong></td>
                    <td>{trafficData["Average Speed"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Travel Time Index</strong></td>
                    <td>{trafficData["Travel Time Index"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Congestion Level</strong></td>
                    <td>{trafficData["Congestion Level"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Road Capacity Utilization</strong></td>
                    <td>{trafficData["Road Capacity Utilization"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Incident Reports</strong></td>
                    <td>{trafficData["Incident Reports"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Weather</strong></td>
                    <td>{trafficData["Weather Conditions"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Parking Usage</strong></td>
                    <td>{trafficData["Parking Usage"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Public Transport Usage</strong></td>
                    <td>{trafficData["Public Transport Usage"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Traffic Signal Compliance</strong></td>
                    <td>{trafficData["Traffic Signal Compliance"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Pedestrian Count</strong></td>
                    <td>{trafficData["Pedestrian and Cyclist Count"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Environmental Impact</strong></td>
                    <td>{trafficData["Environmental Impact"]}</td>
                  </tr>

                  <tr>
                    <td><strong>Roadwork</strong></td>
                    <td>{trafficData["Roadwork and Construction Activity"]}</td>
                  </tr>

                </tbody>

              </table>

            </div>

          )

        }
                {

          prediction !== "" && (

            <div className="prediction-box">

              <h2>AI Prediction Result</h2>

              <h1>{prediction}</h1>

              <p>

                Predicted Congestion Level for

                <strong> {selectedArea}</strong>

              </p>

            </div>

          )

        }

      </div>

      <Footer />

    </>

  );

}

export default UserDashboard;