import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import { getRoute } from "../services/routeService";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline
} from "react-leaflet";

import L from "leaflet";

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

function TrafficMap({
    source,
    destination,
    congestion,
    onRouteLoaded
}) {
    const [routePoints, setRoutePoints] = useState([]);
    useEffect(() => {

        async function loadRoute() {

            if (!source || !destination) return;

            const data = await getRoute(source, destination);

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
                    height: "450px",
                    width: "100%"
                }}

            >

                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ChangeMapCenter center={center} />

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
                                ? "green"
                                : congestion.includes("Medium")
                                ? "orange"
                                : "red"
                        }
                        weight={6}
                    />
                )}


            </MapContainer>

        </div>

    );
}

export default TrafficMap;