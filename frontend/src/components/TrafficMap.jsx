import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { areaCoordinates } from "../data/areaCoordinates";

const trafficLocations = [
  {
    area: "Electronic City",
    congestion: "Heavy",
    speed: "20 km/h",
    traffic: 5100,
    color: "red"
  },
  {
    area: "Hebbal",
    congestion: "Moderate",
    speed: "32 km/h",
    traffic: 3300,
    color: "orange"
  },
  {
    area: "Indiranagar",
    congestion: "Low",
    speed: "46 km/h",
    traffic: 1800,
    color: "green"
  },
  {
    area: "Jayanagar",
    congestion: "Low",
    speed: "42 km/h",
    traffic: 1700,
    color: "green"
  },
  {
    area: "Koramangala",
    congestion: "Moderate",
    speed: "29 km/h",
    traffic: 2950,
    color: "orange"
  },
  {
    area: "M.G. Road",
    congestion: "Heavy",
    speed: "18 km/h",
    traffic: 4580,
    color: "red"
  },
  {
    area: "Whitefield",
    congestion: "Moderate",
    speed: "31 km/h",
    traffic: 3400,
    color: "orange"
  },
  {
    area: "Yeshwanthpur",
    congestion: "Low",
    speed: "45 km/h",
    traffic: 2100,
    color: "green"
  }
];

function TrafficMap() {

  return (

    <MapContainer
      center={[12.9716, 77.5946]}
      zoom={11}
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "18px"
      }}
    >

      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {trafficLocations.map((location, index) => {

        const coordinates = areaCoordinates[location.area];

        if (!coordinates) return null;

        return (

          <CircleMarker
            key={index}
            center={[coordinates.lat, coordinates.lng]}
            radius={12}
            pathOptions={{
              color: location.color,
              fillColor: location.color,
              fillOpacity: 0.8
            }}
          >

            <Popup>

              <h3>{location.area}</h3>

              <hr />

              <p>
                <strong>Congestion:</strong>{" "}
                {location.congestion}
              </p>

              <p>
                <strong>Average Speed:</strong>{" "}
                {location.speed}
              </p>

              <p>
                <strong>Traffic Volume:</strong>{" "}
                {location.traffic}
              </p>

            </Popup>

          </CircleMarker>

        );

      })}

    </MapContainer>

  );

}

export default TrafficMap;