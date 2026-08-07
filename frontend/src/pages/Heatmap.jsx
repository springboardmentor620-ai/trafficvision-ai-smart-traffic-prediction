import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { getHeatmapData } from "../services/heatmapService";

function Heatmap() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    loadHeatmap();
  }, []);

  const loadHeatmap = async () => {
    const data = await getHeatmapData();
    setLocations(data);
  };

  const getColor = (value) => {
    if (value >= 80) return "red";
    if (value >= 60) return "orange";
    if (value >= 40) return "yellow";
    return "green";
  };

  const getRadius = (value) => {
    return 200 + value * 5;
  };

  return (
    <div style={{ padding: "20px" }}>

      <h2>🔥 Bengaluru Traffic Heatmap</h2>

      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={11}
        style={{
          height: "650px",
          width: "100%",
          borderRadius: "12px",
        }}
      >
        <TileLayer
          attribution="OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location, index) => (
          <Circle
            key={index}
            center={[location.lat, location.lng]}
            radius={getRadius(location.congestion)}
            pathOptions={{
              color: getColor(location.congestion),
              fillColor: getColor(location.congestion),
              fillOpacity: 0.55,
            }}
          >
            <Popup>

              <h3>{location.area}</h3>

              <p>
                <strong>Congestion:</strong>{" "}
                {location.congestion}%
              </p>

              <p>
                <strong>Traffic Volume:</strong>{" "}
                {location.traffic_volume}
              </p>

              <p>
                <strong>Average Speed:</strong>{" "}
                {location.average_speed} km/h
              </p>

              <p>
                <strong>Weather:</strong>{" "}
                {location.weather}
              </p>

            </Popup>
          </Circle>
        ))}
      </MapContainer>

    </div>
  );
}

export default Heatmap;