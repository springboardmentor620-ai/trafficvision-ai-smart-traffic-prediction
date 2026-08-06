import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

function HeatLayer({ markers }) {
    const map = useMap();

    useEffect(() => {
        if (!markers || markers.length === 0) return;

        // Convert marker data into heatmap points
        const heatPoints = markers
            .filter(
                (m) =>
                    m.latitude !== null &&
                    m.longitude !== null &&
                    !isNaN(m.latitude) &&
                    !isNaN(m.longitude)
            )
            .map((m) => [
                Number(m.latitude),
                Number(m.longitude),
                Math.max((m.vehicle_count || 1) / 300, 0.2),
            ]);

        if (heatPoints.length === 0) return;

        const heatLayer = L.heatLayer(heatPoints, {
            radius: 35,
            blur: 25,
            maxZoom: 17,
            minOpacity: 0.4,
            gradient: {
                0.2: "#00ff00",
                0.4: "#ffff00",
                0.7: "#ff9900",
                1.0: "#ff0000",
            },
        });

        heatLayer.addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [markers, map]);

    return null;
}

export default HeatLayer;