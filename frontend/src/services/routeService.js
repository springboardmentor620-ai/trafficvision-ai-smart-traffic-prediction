import axios from "axios";

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

// Convert place name into latitude & longitude
export async function getCoordinates(place) {

    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: place,
                format: "json",
                limit: 1
            }
        }
    );

    if (response.data.length === 0) {
        throw new Error("Location not found");
    }

    return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
    };
}

// Get driving route from OpenRouteService
export async function getRoute(start, end) {

    const response = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",

        {
            coordinates: [
                [start.lng, start.lat],
                [end.lng, end.lat]
            ]
        },

        {
            headers: {
                Authorization: ORS_API_KEY,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
}