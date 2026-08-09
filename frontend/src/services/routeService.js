import api from "./api";

import coordinates from "../data/coordinates";


class RouteService {

    getCoordinates(location) {

        return coordinates[location];

    }


    async getRoutes({
        source,
        destination
    }) {

        const response = await api.post(
            "/routes/",
            {
                source_lat:
                    source.lat,

                source_lng:
                    source.lng,

                destination_lat:
                    destination.lat,

                destination_lng:
                    destination.lng
            }
        );

        console.log("ROUTE API RESPONSE:", response.data);

        return response.data;
    }

}


export default new RouteService();