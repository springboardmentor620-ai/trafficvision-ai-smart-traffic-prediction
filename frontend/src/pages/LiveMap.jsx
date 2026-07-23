import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "../styles/LiveMap.css";

function LiveMap() {
  const navigate = useNavigate();

  // Bengaluru Coordinates
  const position = [12.9716, 77.5946];

  return (
    <div className="map-page">

      <div className="map-header">

        <h1> Bengaluru Live Traffic Map</h1>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>

      </div>

      <MapContainer
        center={position}
        zoom={12}
        className="leaflet-map"
      >

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={position}>
          <Popup>
            Bengaluru City Center
          </Popup>
        </Marker>

      </MapContainer>

    </div>
  );
}

export default LiveMap;