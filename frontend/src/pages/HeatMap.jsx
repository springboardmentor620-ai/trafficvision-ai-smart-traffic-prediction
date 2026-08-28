import { useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { MdMap, MdSpeed } from "react-icons/md";

import { getHeatmap } from "../services/trafficService";
import "leaflet/dist/leaflet.css";
import "../styles/HeatMap.css";

const densityColors = {
  Low: "#4ade80",
  Medium: "#facc15",
  High: "#f97316",
  Critical: "#ef4444",
};

function MapAutoFit({ locations }) {
  const map = useMap();

  useEffect(() => {
    const bounds = locations.map(({ latitude, longitude }) => [latitude, longitude]);
    if (bounds.length) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
  }, [locations, map]);

  return null;
}

function HeatMap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadHeatmap() {
      try {
        const response = await getHeatmap();
        if (active) setData(response);
      } catch (requestError) {
        console.error("Unable to load heatmap:", requestError);
        if (active) setError("Traffic density data is temporarily unavailable.");
      } finally { if (active) setLoading(false); }
    }

    loadHeatmap();
    return () => { active = false; };
  }, []);

  const locations = useMemo(() => data?.locations ?? [], [data]);
  const markerLocations = useMemo(
    () => locations.filter((location) => Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude))),
    [locations],
  );

  if (loading) return <div className="heatmap-state">Loading traffic density data...</div>;
  if (error || !data || !locations.length) return <div className="heatmap-state heatmap-state--error">No heatmap data available.</div>;

  return (
    <main className="heatmap-page" aria-labelledby="heatmap-title">
      <header className="heatmap-page__header">
        <div>
          <p className="heatmap-page__eyebrow">Location intelligence</p>
          <h1 id="heatmap-title">Traffic Heatmap</h1>
          <p>Traffic density classified from average recorded traffic volume by area and road.</p>
        </div>
        <div className="heatmap-page__legend" aria-label="Traffic density legend">
          {Object.entries(densityColors).map(([density, color]) => <span key={density}><i style={{ backgroundColor: color }} />{density}</span>)}
        </div>
      </header>

      <section className="heatmap-summary" aria-label="Traffic density summary">
        {Object.entries(data.density_summary).map(([density, count]) => (
          <article key={density} className={`heatmap-summary__card heatmap-summary__card--${density.toLowerCase()}`}>
            <p>{density} density</p><strong>{count}</strong><span>roads/intersections</span>
          </article>
        ))}
      </section>

      {markerLocations.length > 0 ? (
        <section className="heatmap-map-shell" aria-label="OpenStreetMap traffic density markers">
          <MapContainer center={[Number(markerLocations[0].latitude), Number(markerLocations[0].longitude)]} zoom={12} className="heatmap-leaflet-map" zoomControl>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {markerLocations.map((location) => (
              <CircleMarker
                key={`${location.area}-${location.road}`}
                center={[Number(location.latitude), Number(location.longitude)]}
                radius={13}
                pathOptions={{ color: densityColors[location.density], fillColor: densityColors[location.density], fillOpacity: .78, weight: 2 }}
              >
                <Popup><div className="heatmap-popup"><b>{location.road}</b><span>{location.area}</span><small>{location.density} density · {location.traffic_volume.toLocaleString()} avg. vehicles</small></div></Popup>
              </CircleMarker>
            ))}
            <MapAutoFit locations={markerLocations} />
          </MapContainer>
        </section>
      ) : <section className="heatmap-unavailable">No heatmap data available.</section>}

      <section className="heatmap-density-list" aria-labelledby="density-list-title">
        <header><div><p className="heatmap-page__eyebrow">Available dataset view</p><h2 id="density-list-title">Road density ranking</h2></div><span><MdMap /> {locations.length} mapped dataset locations</span></header>
        <div className="heatmap-table-wrap">
          <table>
            <thead><tr><th>Density</th><th>Area</th><th>Road / Intersection</th><th>Average volume</th><th>Average speed</th><th>Records</th></tr></thead>
            <tbody>{locations.map((location) => <tr key={`${location.area}-${location.road}`}><td><span className="density-label"><i style={{ backgroundColor: densityColors[location.density] }} />{location.density}</span></td><td>{location.area}</td><td>{location.road}</td><td>{location.traffic_volume.toLocaleString()}</td><td><span className="speed-value"><MdSpeed />{location.average_speed} km/h</span></td><td>{location.records.toLocaleString()}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default HeatMap;
