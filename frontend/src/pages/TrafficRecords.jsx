import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTrafficRecords,
  searchTraffic,
} from "../services/trafficService";
import "../styles/TrafficRecords.css";

function TrafficRecords() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState("");
  const [condition, setCondition] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    async function filterTraffic() {
      try {
        if (weather === "" && condition === "") {
          const data = await getTrafficRecords();
          setRecords(data);
        } else {
          const data = await searchTraffic(weather, condition);
          setRecords(data);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error("Filter Error:", error);
      }
    }

    filterTraffic();
  }, [weather, condition]);

  // Search
  const filteredRecords = records.filter((item) =>
    String(item.Weather_Condition || "").toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalPages = Math.ceil(
    filteredRecords.length / recordsPerPage
  );

  return (
    <div className="records-container">
      <div className="records-header">
        <h1>Historical Traffic Records</h1>

        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search Weather..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* Filters */}
      <div className="filters">
        <select
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
        >
          <option value="">All Weather</option>
          <option value="Clear">Clear</option>
          <option value="Cloudy">Cloudy</option>
          <option value="Rainy">Rainy</option>
          <option value="Fog">Fog</option>
        </select>

        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="">All Traffic</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Vehicle Count</th>
            <th>Traffic Speed</th>
            <th>Weather</th>
            <th>Traffic Condition</th>
          </tr>
        </thead>

        <tbody>
          {currentRecords.map((item, index) => (
            <tr key={index}>
              <td>{item.Timestamp}</td>
              <td>{item.Vehicle_Count}</td>
              <td>{item.Traffic_Speed_kmh}</td>
              <td>{item.Weather_Condition}</td>
              <td>{item.Traffic_Condition}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default TrafficRecords;
