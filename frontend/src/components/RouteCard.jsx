import "../styles/RouteCard.css";

function RouteCard({ routes, selectedRouteId, onSelectRoute }) {
  if (!routes?.length) return null;
  return <section className="route-results">
    {routes.map((route) => <button type="button" key={route.id} className={`route-card ${route.status.toLowerCase()} ${route.id === selectedRouteId ? "selected" : ""}`} onClick={() => onSelectRoute(route.id)}>
      <div className="route-card-heading"><span className="route-color" style={{ backgroundColor: route.color }} /><h2>{route.route_name}</h2><em>{route.id === selectedRouteId ? "Selected" : route.status}</em></div>
      <div className="route-details"><p><strong>Distance</strong>{route.distance}</p><p><strong>Estimated time</strong>{route.estimated_time}</p><p><strong>Traffic / congestion</strong>{route.traffic} · {route.congestion}</p><p><strong>Average speed</strong>{route.average_speed}</p><p><strong>Weather</strong>{route.weather}</p><p><strong>Road condition</strong>{route.road_condition}</p></div>
    </button>)}
  </section>;
}

export default RouteCard;
