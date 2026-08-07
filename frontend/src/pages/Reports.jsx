import { useEffect, useState } from "react";
import "../styles/Reports.css";

function Reports() {

  const [report, setReport] = useState(null);

  useEffect(() => {

    const data = JSON.parse(
      localStorage.getItem("reportData")
    );

    setReport(data);

  }, []);

  const downloadPDF = () => {
    window.print();
  };

  if (!report) {
    return (
      <div className="report-container">
        <h2 style={{ textAlign: "center" }}>
          No report available.
        </h2>
        <p style={{ textAlign: "center" }}>
          Please generate a prediction first.
        </p>
      </div>
    );
  }

  return (

    <div className="report-container">

      <h1 className="report-title">
        📊 Smart Traffic Report
      </h1>

      <hr />

      {/* Journey Information */}

      <div className="journey-card">

        <h2>📍 Journey Information</h2>

        <div className="journey-grid">

          <div className="route-box">
            <h3>📍 Source</h3>
            <h2>{report.source}</h2>
          </div>

          <div className="route-box">
            <h3>🎯 Destination</h3>
            <h2>{report.destination}</h2>
          </div>

        </div>

      </div>

      <hr />

      {/* Recommended Route */}

      <div className="route-box">

        <h2>🟢 Recommended Route</h2>

        <h3>🛣 Route Timeline</h3>

        <div className="timeline-box">

          {report.route.timeline.map((road, index) => (

            <div key={index} className="timeline-item">

              {index === 0
                ? "📍 "
                : index === report.route.timeline.length - 1
                ? "🎯 "
                : "🚦 "
              }

              {road}

            </div>

          ))}

        </div>

        <h3>📊 Route Details</h3>

        <div className="report-table">

          <div className="table-row">
            <span>Distance</span>
            <span>{report.route.distance} km</span>
          </div>

          <div className="table-row">
            <span>Time</span>
            <span>{report.route.duration} mins</span>
          </div>

          <div className="table-row">
            <span>Traffic</span>
            <span>{report.route.traffic}</span>
          </div>

          <div className="table-row">
            <span>Congestion</span>
            <span>{report.predicted_congestion.toFixed(1)}%</span>
          </div>

          <div className="table-row">
            <span>Fuel</span>
            <span>{report.route.fuel} L</span>
          </div>

        </div>

      </div>

      <hr />

      {/* Alternate Route */}

      {report.alternate_route && (

        <div className="route-box">

          <h2>🔴 Alternate Route</h2>

          <h3>🛣 Route Timeline</h3>

          <div className="timeline-box">

            {report.alternate_route.timeline.map((road, index) => (

              <div key={index} className="timeline-item">

                {index === 0
                  ? "📍 "
                  : index === report.alternate_route.timeline.length - 1
                  ? "🎯 "
                  : "🚦 "
                }

                {road}

              </div>

            ))}

          </div>

          <h3>📊 Route Details</h3>

          <div className="report-table">

            <div className="table-row">
              <span>Distance</span>
              <span>{report.alternate_route.distance} km</span>
            </div>

            <div className="table-row">
              <span>Time</span>
              <span>{report.alternate_route.duration} mins</span>
            </div>

            <div className="table-row">
              <span>Traffic</span>
              <span>{report.alternate_route.traffic}</span>
            </div>

            <div className="table-row">
              <span>Congestion</span>
              <span>
                {report.alternate_route.predicted_congestion.toFixed(1)}%
              </span>
            </div>

            <div className="table-row">
              <span>Fuel</span>
              <span>{report.alternate_route.fuel} L</span>
            </div>

          </div>

        </div>

      )}

      <hr />

      {/* Traffic Alerts */}

      <div className="report-section">

        <h2>🚨 Traffic Alerts</h2>

        <ul className="roads-list">

          {report.alerts.map((item, index) => (
            <li key={index}>{item}</li>
          ))}

        </ul>

      </div>

      <hr />

      {/* AI Recommendations */}

      <div className="report-section">

        <h2>💡 AI Recommendations</h2>

        <ul className="roads-list">

          {report.recommendations.map((item, index) => (
            <li key={index}>{item}</li>
          ))}

        </ul>

      </div>

      <hr />

      {/* AI Summary */}

      <div className="summary-box">

        <h2>🤖 AI Summary</h2>

        <p>
          The recommended route from
          <b> {report.source}</b>
          to
          <b> {report.destination}</b>
          covers
          <b> {report.route.distance} km</b>
          with an estimated travel time of
          <b> {report.route.duration} minutes</b>.
        </p>

        <p>
          Traffic is
          <b> {report.route.traffic}</b>
          with
          <b> {report.predicted_congestion.toFixed(1)}%</b>
          congestion.
        </p>

        <p>
          Estimated fuel consumption is
          <b> {report.route.fuel} L</b>.
        </p>

        {report.alternate_route && (
          <p>
            An alternate route is available with a travel time of
            <b> {report.alternate_route.duration} minutes</b>.
          </p>
        )}

      </div>

      <hr />

      {/* Download */}

      <div className="download-buttons">

        <button
          className="pdf-btn"
          onClick={downloadPDF}
        >
          ⬇ Download PDF
        </button>

      </div>

    </div>
  );
}

export default Reports;