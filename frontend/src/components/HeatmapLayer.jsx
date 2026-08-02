import { CircleMarker } from "react-leaflet";

function HeatmapLayer({ points }) {
    return (
        <>
            {points.map((point, index) => (
                <CircleMarker
                    key={index}
                    center={[point.lat, point.lng]}
                    radius={10 + point.intensity * 15}
                    pathOptions={{
                        color: "red",
                        fillColor: "red",
                        fillOpacity: point.intensity
                    }}
                />
            ))}
        </>
    );
}

export default HeatmapLayer;