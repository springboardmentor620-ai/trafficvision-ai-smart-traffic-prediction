import { useState } from "react";
import { getAreaReport } from "../services/reportService";
import "../styles/Reports.css";

const areas = [
  "Electronic City",
  "Hebbal",
  "Indiranagar",
  "Jayanagar",
  "Koramangala",
  "M.G. Road",
  "Whitefield",
  "Yeshwanthpur",
];

function Reports() {
  const [selectedArea, setSelectedArea] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (selectedArea === "") {
      alert("Please select an area.");
      return;
    }

    try {
      setLoading(true);

      const response = await getAreaReport(selectedArea);

      setReport(response.data);
    } catch (error) {
      console.log(error);
      alert("Unable to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  const downloadPPT = () => {
    alert("PPT Download will be added next.");
  };

  return (
    <div className="reports-page">

      <div className="report-container">

        <h1 className="report-title">
          📊 Traffic Report Generator
        </h1>

        <hr />

        <div className="report-selection">

          <label>Select Area</label>

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

          <button
            className="generate-btn"
            onClick={generateReport}
          >
            Generate Report
          </button>

        </div>

        {loading && (
          <h2 style={{ textAlign: "center" }}>
            Loading Report...
          </h2>
        )}

        {report && (

          <>

            <hr />

            <h2>
              Area : {report.area}
            </h2>

            <div className="report-table">

              <div className="table-row">
                <span>Average Speed</span>
                <span>{report.average_speed} km/h</span>
              </div>

              <div className="table-row">
                <span>Traffic Volume</span>
                <span>{report.traffic_volume}</span>
              </div>

              <div className="table-row">
                <span>Travel Time Index</span>
                <span>{report.travel_time_index}</span>
              </div>

              <div className="table-row">
                <span>Road Capacity</span>
                <span>{report.road_capacity}%</span>
              </div>

              <div className="table-row">
                <span>Incident Reports</span>
                <span>{report.incident_reports}</span>
              </div>

              <div className="table-row">
                <span>Environmental Impact</span>
                <span>{report.environmental_impact}</span>
              </div>

              <div className="table-row">
                <span>Signal Compliance</span>
                <span>{report.signal_compliance}%</span>
              </div>

              <div className="table-row">
                <span>Pedestrian Count</span>
                <span>{report.pedestrian_count}</span>
              </div>

              <div className="table-row">
                <span>Weather</span>
                <span>{report.weather}</span>
              </div>

              <div className="table-row">
                <span>Roadwork</span>
                <span>{report.roadwork}</span>
              </div>

            </div>

            <hr />

            <h2>
              🛣 Available Roads
            </h2>

            <ul className="roads-list">

              {report.roads.map((road) => (

                <li key={road}>
                  {road}
                </li>

              ))}

            </ul>

            <hr />

            <div className="summary-box">

              <h2>
                🤖 AI Summary
              </h2>

              <p>{report.summary.traffic}</p>

              <p>{report.summary.travel}</p>

              <p>{report.summary.roadwork}</p>

              <p>{report.summary.peak}</p>

            </div>

            <hr />

            <div className="download-buttons">

              <button
                className="pdf-btn"
                onClick={downloadPDF}
              >
                ⬇ Download PDF
              </button>

              

            </div>

          </>

        )}

      </div>

    </div>
  );
}

export default Reports;