import { MapContainer, TileLayer } from "react-leaflet";
import HeatmapLayer from "react-leaflet-heatmap-layer-v3";

function TrafficHeatmap({ points }) {

    return (

        <MapContainer
            center={[17.4435, 78.3772]}
            zoom={11}
            style={{
                height: "500px",
                width: "100%"
            }}
        >

            <TileLayer
                attribution="© OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <HeatmapLayer

                points={points}

                longitudeExtractor={m => m.lng}

                latitudeExtractor={m => m.lat}

                intensityExtractor={m => m.intensity}

            />

        </MapContainer>

    );

}

export default TrafficHeatmap;