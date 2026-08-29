import "../styles/traffictable.css";

function TrafficTable({ traffic }) {
  return (
    <div className="traffic-table">
      <h2>Recent Traffic Status</h2>

      <table>
        <thead>
          <tr>
            <th>Road</th>
            <th>Status</th>
            <th>Vehicles</th>
            <th>Average Speed</th>
          </tr>
        </thead>

        <tbody>
          {traffic.map((road, index) => (
            <tr key={road.id || index}>
              <td>
                {(road && typeof road.road === "object" && road.road !== null)
                  ? road.road.name
                  : (road?.road || road?.name || road?.road_name || "Corridor")}
              </td>
              <td>{road.status}</td>

              <td>{road.vehicles}</td>
              <td>{road.average_speed} km/h</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TrafficTable;