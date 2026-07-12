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
          {traffic.map((road) => (
            <tr key={road.id}>
              <td>{road.road}</td>
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