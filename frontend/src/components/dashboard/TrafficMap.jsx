import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { getTrafficData } from "../../services/traffic";
import { getRoads } from "../../services/roads";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function getColor(status) {
  switch (status) {
    case "Heavy":
      return "#ef4444";

    case "Moderate":
      return "#f59e0b";

    case "Normal":
      return "#22c55e";

    default:
      return "#3b82f6";
  }
}

function TrafficMap({

    predictionResult

}) {

  const [roads, setRoads] = useState([]);

  const displayRoads = roads.map((road) => {

      if (
          predictionResult &&
          road.road === predictionResult.road
      ) {

          return {

              ...road,

              ai: true,

              congestion: predictionResult.congestion_prediction,

              confidence: predictionResult.confidence,

              recommendation: predictionResult.recommended_action,

              alternate_route: predictionResult.alternate_route,

              status: predictionResult.prediction_level

          };

      }

      return road;

  });

  useEffect(() => {
    let mounted = true;

    const loadMap = async () => {

        try {

            const [traffic, roads] = await Promise.all([

                getTrafficData(),

                getRoads(),

            ]);

            if (!mounted) return;

            const mapped = traffic.map((item) => {

                const road = roads.find(

                    r => r.name === item.road

                );

                return {

                    ...item,

                    latitude: road?.latitude ?? 12.9716,

                    longitude: road?.longitude ?? 77.5946,

                };

            });

            setRoads(mapped);

        }

        catch (err) {

            console.error(err);

        }

    };
    
    loadMap();

    const timer = setInterval(loadMap, 5000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div
      style={{
        marginTop: "30px",
        background: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 3px 12px rgba(0,0,0,.08)",
      }}
    >
      <div
        style={{
          padding: "18px",
          borderBottom: "1px solid #eee",
        }}
      >
        <h2>Live Traffic Map</h2>

        <p style={{ color: "#666" }}>
          Interactive OpenStreetMap
        </p>
      </div>

      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={12}
        style={{
          height: "550px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {displayRoads.map((road) => (
          <CircleMarker
            key={road.id}
            center={[
              road.latitude,
              road.longitude,
            ]}
            radius={12}
            pathOptions={{
              color: getColor(road.status),
              fillColor: getColor(road.status),
              fillOpacity: 0.9,
            }}
          >
            <Popup>

                <h3>

                    {road.road}

                </h3>

                <hr />

                <b>Status :</b>

                {road.status}

                <br />

                <b>Vehicles :</b>

                {road.vehicles}

                <br />

                <b>Average Speed :</b>

                {road.average_speed} km/h

                {

                    road.ai && (

                        <>

                            <hr />

                            <b>AI Congestion :</b>

                            {road.congestion.toFixed(2)} %

                            <br />

                            <b>Confidence :</b>

                            {road.confidence} %

                            <br />

                            <b>Recommendation :</b>

                            <br />

                            {road.recommendation}

                            <br />

                            <br />

                            <b>Alternate Route :</b>

                            <br />

                            {road.alternate_route}

                        </>

                    )

                }

            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default TrafficMap;