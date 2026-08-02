import { useEffect, useState } from "react";
import { getRoutes } from "../services/routeService";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    CircleMarker,
    useMap
} from "react-leaflet";

import L from "leaflet";

import HeatmapLayer from "./HeatmapLayer";
import api from "../services/api";

import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});


function ChangeMapCenter({ center }) {

    const map = useMap();

    useEffect(() => {

        map.setView(center, 12);

    }, [center, map]);

    return null;
}

function FitRoute({ routePoints }) {

    const map = useMap();

    useEffect(() => {

        if (routePoints.length > 0) {

            map.fitBounds(routePoints, {
                padding: [50, 50]
            });

        }

    }, [routePoints]);

    return null;

}

function TrafficMap({
    source,
    destination,
    congestion,
    heatmap = [],
    onRouteLoaded
}) {
    const [routePoints, setRoutePoints] = useState([]);
    const [heatPoints, setHeatPoints] = useState([]);

    useEffect(() => {

        async function loadHeatmap() {

            try {

                const response = await api.get(
                    "/analytics/heatmap",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${localStorage.getItem("access_token")}`
                        }
                    }
                );

                setHeatPoints(response.data);

            } catch (err) {

                console.error("Heatmap Error:", err);

            }

        }

        loadHeatmap();

    }, []);

    useEffect(() => {

        async function loadRoute() {

            if (!source || !destination) return;

            const data = await getRoutes(source, destination);

            const coords =
                data.features[0].geometry.coordinates.map(
                    ([lng, lat]) => [lat, lng]
                );

            setRoutePoints(coords);

            if (onRouteLoaded) {
                onRouteLoaded(
                    data.features[0].properties.summary
                );
            }
        }

        loadRoute();

    }, [source, destination]);
    const center = source
        ? [source.lat, source.lng]
        : [17.3850, 78.4867];

    return (

        <div
            style={{
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow: "0 8px 20px rgba(0,0,0,.15)"
            }}
        >

            <MapContainer

                center={center}

                zoom={12}

                style={{
                    height: "550px",
                    width: "100%"
                }}

            >

                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitRoute routePoints={routePoints} />

                {source && (

                    <Marker
                        position={[source.lat, source.lng]}
                        icon={markerIcon}
                    >

                        <Popup>
                            📍 Source
                            <br />
                            {source.name}
                        </Popup>

                    </Marker>

                )}

                {destination && (

                    <Marker
                        position={[destination.lat, destination.lng]}
                        icon={markerIcon}
                    >

                        <Popup>
                            📍 Destination
                            <br />
                            {destination.name}
                        </Popup>

                    </Marker>

                )}

                {routePoints.length > 0 && (
                    <Polyline
                        positions={routePoints}
                        color={
                            congestion.includes("Low")
                                ? "#16a34a"
                                : congestion.includes("Medium")
                                ? "#f59e0b"
                                : "#dc2626"
                        }
                        weight={7}
                        opacity={0.9}
                    >

                        {heatmap.map((point, index) => (

                            <CircleMarker
                                key={index}
                                center={[point.lat, point.lng]}
                                radius={6 + point.intensity * 12}
                                color={
                                    point.intensity > 0.7
                                        ? "#dc2626"
                                        : point.intensity > 0.4
                                        ? "#f59e0b"
                                        : "#22c55e"
                                }
                                fillOpacity={0.8}
                            >
                                <Popup>
                                    <b>Traffic Hotspot</b>
                                    <br />
                                    Intensity: {(point.intensity * 100).toFixed(0)}%
                                </Popup>
                            </CircleMarker>

                        ))}
                        <Popup>

                            <b>Recommended Route</b>

                            <br />

                            Traffic :
                            {" "}
                            {congestion}

                        </Popup>

                    </Polyline>
                )}

                {heatPoints.length > 0 && (
                    <HeatmapLayer points={heatPoints} />
                )}


            </MapContainer>

        </div>

    );
}

export default TrafficMap;