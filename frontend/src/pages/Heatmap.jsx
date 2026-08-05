import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import SummaryCard from "../components/SummaryCard";
import api from "../services/api";

import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

const DEFAULT_CENTER = [17.3850, 78.4867]; // Hyderabad - used only when there's no data yet
const DEFAULT_ZOOM = 11;

function HeatLayer({ points }) {
    const map = useMap();

    useEffect(() => {
        if (!points.length) return;

        const heatPoints = points.map((p) => [p.lat, p.lng, p.intensity]);

        const heat = L.heatLayer(heatPoints, {
            radius: 30,
            blur: 20,
            maxZoom: 17,
        }).addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [points, map]);

    return null;
}

// Fits the map to the actual data instead of always centering on a
// hardcoded city, per the "auto-fit to available points" requirement.
function FitToPoints({ points }) {
    const map = useMap();

    useEffect(() => {
        if (!points.length) return;

        const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }, [points, map]);

    return null;
}

function severityOf(congestion) {
    if (congestion >= 70) return { label: "High", color: "#dc2626" };
    if (congestion >= 40) return { label: "Medium", color: "#f59e0b" };
    return { label: "Low", color: "#16a34a" };
}

function Heatmap() {
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadHeatmap();
    }, []);

    const loadHeatmap = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/analytics/heatmap", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            setPoints(response.data);
        } catch (err) {
            console.log(err);
            setError("We couldn't load the heatmap. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const totalPoints = points.length;
    const high = points.filter((p) => p.congestion >= 70).length;
    const medium = points.filter((p) => p.congestion >= 40 && p.congestion < 70).length;
    const low = points.filter((p) => p.congestion < 40).length;
    const avgCongestion = totalPoints
        ? (points.reduce((sum, p) => sum + p.congestion, 0) / totalPoints).toFixed(1)
        : 0;

    return (
        <>
            <Navbar />

            <div
                style={{
                    padding: "30px",
                    background: "#f5f7fb",
                    minHeight: "100vh",
                }}
            >
                <h1 style={{ color: "#1e3a8a", marginBottom: "5px" }}>
                    🔥 Traffic Congestion Heatmap
                </h1>
                <p style={{ color: "#64748b", marginBottom: "25px" }}>
                    Congestion hotspots aggregated from your AI traffic predictions.
                </p>

                {!loading && !error && totalPoints > 0 && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "20px",
                            marginBottom: "25px",
                        }}
                    >
                        <SummaryCard title="Hotspots" value={totalPoints} color="#2563eb" />
                        <SummaryCard title="High Congestion" value={high} color="#dc2626" />
                        <SummaryCard title="Medium Congestion" value={medium} color="#f59e0b" />
                        <SummaryCard title="Low Congestion" value={low} color="#16a34a" />
                        <SummaryCard title="Avg Congestion" value={`${avgCongestion}%`} color="#7c3aed" />
                    </div>
                )}

                {loading && <Loader />}

                {!loading && error && (
                    <div style={panelStyle}>
                        <p style={{ color: "#dc2626", fontWeight: 600, textAlign: "center" }}>
                            {error}
                        </p>
                        <div style={{ textAlign: "center" }}>
                            <button onClick={loadHeatmap} style={retryButtonStyle}>
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && totalPoints === 0 && (
                    <div style={{ ...panelStyle, textAlign: "center", padding: "60px 20px" }}>
                        <div style={{ fontSize: "40px" }}>🗺️</div>
                        <h3 style={{ color: "#1e3a8a", margin: "10px 0 4px" }}>
                            No congestion data yet
                        </h3>
                        <p style={{ color: "#64748b", margin: 0 }}>
                            Run a few traffic predictions and hotspots will start showing up here.
                        </p>
                    </div>
                )}

                {!loading && !error && totalPoints > 0 && (
                    <div style={panelStyle}>
                        <MapContainer
                            center={DEFAULT_CENTER}
                            zoom={DEFAULT_ZOOM}
                            style={{ height: "650px", borderRadius: "15px" }}
                        >
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                            <HeatLayer points={points} />
                            <FitToPoints points={points} />

                            {points.map((point, index) => {
                                const severity = severityOf(point.congestion);

                                return (
                                    <CircleMarker
                                        key={index}
                                        center={[point.lat, point.lng]}
                                        radius={8}
                                        fillOpacity={0.8}
                                        color={severity.color}
                                    >
                                        <Popup>
                                            <b>Source:</b> {point.source}
                                            <br />
                                            <b>Destination:</b> {point.destination}
                                            <br />
                                            <b>Congestion:</b> {point.congestion.toFixed(1)}% ({severity.label})
                                            <br />
                                            <b>Predictions:</b> {point.prediction_count}
                                            <br />
                                            <b>Average Traffic:</b> {point.avg_traffic}
                                            <br />
                                            <b>Peak Traffic:</b> {point.max_traffic}
                                        </Popup>
                                    </CircleMarker>
                                );
                            })}
                        </MapContainer>

                        <div
                            style={{
                                marginTop: 20,
                                display: "flex",
                                gap: "30px",
                                justifyContent: "center",
                                fontWeight: "bold",
                            }}
                        >
                            <span>🟢 Low (&lt;40%)</span>
                            <span>🟠 Medium (40-70%)</span>
                            <span>🔴 High (&gt;70%)</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

const panelStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 8px 20px rgba(0,0,0,.08)",
};

const retryButtonStyle = {
    marginTop: "14px",
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
};

export default Heatmap;
