import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

import {
    MapContainer,
    TileLayer,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

function HeatLayer({ points }) {

    const map = useMap();

    useEffect(() => {

        if (!points.length) return;

        const heat = L.heatLayer(points, {
            radius: 30,
            blur: 20,
            maxZoom: 17
        }).addTo(map);

        return () => map.removeLayer(heat);

    }, [points, map]);

    return null;
}

function Heatmap() {

    const [points, setPoints] = useState([]);

    useEffect(() => {

        loadHeatmap();

    }, []);

    const loadHeatmap = async () => {

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

            const formatted = response.data.map(item => [

                item.lat,
                item.lng,
                item.intensity

            ]);

            setPoints(formatted);

        } catch (err) {

            console.log(err);

        }

    };

    return (
        <>
            <Navbar />

            <div
                style={{
                    padding: "20px",
                    background: "#f5f7fb",
                    minHeight: "100vh"
                }}
            >

                <h1
                    style={{
                        color: "#1e3a8a",
                        marginBottom: "20px"
                    }}
                >
                    🔥 Traffic Congestion Heatmap
                </h1>

                <MapContainer
                    center={[17.3850, 78.4867]}
                    zoom={11}
                    style={{
                        height: "650px",
                        borderRadius: "15px"
                    }}
                >

                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <HeatLayer points={points} />

                </MapContainer>

            </div>
        </>
    );
}

export default Heatmap;