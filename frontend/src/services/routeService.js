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
        throw new Error(`Location not found: ${place}`);
    }

    return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
    };
}

// Get driving routes from OpenRouteService
export async function getRoutes(start, end) {

    const body = {
        coordinates: [
            [Number(start.lng), Number(start.lat)],
            [Number(end.lng), Number(end.lat)]
        ]
    };

    try {

        // First try with alternative routes
        body.alternative_routes = {
            target_count: 3,
            share_factor: 0.6
        };

        const response = await axios.post(
            "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
            body,
            {
                headers: {
                    Authorization: ORS_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (err) {

        // If ORS rejects because route is too long,
        // retry without alternative routes.
        if (
            err.response?.status === 400 &&
            err.response?.data?.error?.code === 2004
        ) {

            console.log(
                "Long distance route detected. Retrying without alternatives..."
            );

            const response = await axios.post(
                "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
                {
                    coordinates: [
                        [Number(start.lng), Number(start.lat)],
                        [Number(end.lng), Number(end.lat)]
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

        throw err;
    }
}