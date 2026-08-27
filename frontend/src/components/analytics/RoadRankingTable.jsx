import { useEffect, useState } from "react";
import { getBusiestRoads } from "../../services/analytics";

function RoadRankingTable() {
  const [roads, setRoads] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadRoads = async () => {
      try {
        const data = await getBusiestRoads();
        if (!mounted) return;
        setRoads(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadRoads();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        borderRadius: "14px",
        padding: "24px",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "var(--text-primary)" }}>Road Congestion Ranking</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "12px",
        }}
      >
        <thead>
          <tr>
            <th>#</th>
            <th>Road</th>
            <th>Status</th>
            <th>Vehicles</th>
            <th>Average Speed</th>
          </tr>
        </thead>

        <tbody>
          {roads.map((road, index) => (
            <tr key={road.id || index}>
              <td>{index + 1}</td>
              <td style={{ fontWeight: "600" }}>
                {typeof road.road === "object"
                  ? road.road?.name
                  : road.road || road.name || road.road_name || `Road #${index + 1}`}
              </td>
              <td>

                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor:
                      road.status === "Heavy"
                        ? "var(--danger-light)"
                        : road.status === "Moderate"
                        ? "var(--warning-light)"
                        : "var(--success-light)",
                    color:
                      road.status === "Heavy"
                        ? "var(--danger)"
                        : road.status === "Moderate"
                        ? "var(--warning)"
                        : "var(--success)",
                  }}
                >
                  {road.status}
                </span>
              </td>
              <td>{road.vehicles}</td>
              <td>{road.average_speed} km/h</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RoadRankingTable;