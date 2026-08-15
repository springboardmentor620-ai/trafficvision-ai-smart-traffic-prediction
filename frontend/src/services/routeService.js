import axios from "axios";

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

const ORS_URL =
    "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

const NOMINATIM_URL =
    "https://nominatim.openstreetmap.org/search";


// ======================================================
// HAVERSINE DISTANCE
// Returns distance between two [lng, lat] coordinates
// in meters.
// ======================================================

function haversineDistance(coord1, coord2) {

    const [lng1, lat1] = coord1;
    const [lng2, lat2] = coord2;

    const R = 6371000;

    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    const deltaLat =
        (lat2 - lat1) * Math.PI / 180;

    const deltaLng =
        (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(deltaLat / 2) *
        Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}


// ======================================================
// CHECK WHETHER TWO ROUTES ARE NEAR EACH OTHER
//
// We compare the geometry of the routes instead of
// comparing only their total distance.
//
// This prevents:
// Route 1 = 10.94 km
// Route 2 = 11.24 km
// Route 3 = 11.28 km
//
// from displaying two visually identical alternatives.
//
// A route is considered a duplicate when most of its
// geometry is within DUPLICATE_DISTANCE_METERS of another
// route.
// ======================================================

function calculateRouteSimilarity(
    routeA,
    routeB,
    thresholdMeters = 60
) {

    const coordsA =
        routeA?.geometry?.coordinates || [];

    const coordsB =
        routeB?.geometry?.coordinates || [];


    if (
        coordsA.length === 0 ||
        coordsB.length === 0
    ) {
        return 0;
    }


    // --------------------------------------------------
    // Sample coordinates so comparison stays efficient
    // --------------------------------------------------

    const sampleCount = 40;

    const sampleRoute = (coords) => {

        if (coords.length <= sampleCount) {
            return coords;
        }

        const sampled = [];

        for (
            let i = 0;
            i < sampleCount;
            i++
        ) {

            const index = Math.round(
                (i * (coords.length - 1)) /
                (sampleCount - 1)
            );

            sampled.push(
                coords[index]
            );

        }

        return sampled;
    };


    const sampledA =
        sampleRoute(coordsA);

    const sampledB =
        sampleRoute(coordsB);


    // --------------------------------------------------
    // Calculate percentage of A close to B
    // --------------------------------------------------

    function percentageNear(
        source,
        target
    ) {

        let nearCount = 0;


        for (const point of source) {

            let minimumDistance =
                Infinity;


            for (const targetPoint of target) {

                const distance =
                    haversineDistance(
                        point,
                        targetPoint
                    );


                if (
                    distance <
                    minimumDistance
                ) {

                    minimumDistance =
                        distance;

                }

            }


            if (
                minimumDistance <=
                thresholdMeters
            ) {

                nearCount++;

            }

        }


        return (
            nearCount /
            source.length
        );

    }


    const aNearB =
        percentageNear(
            sampledA,
            sampledB
        );


    const bNearA =
        percentageNear(
            sampledB,
            sampledA
        );


    // --------------------------------------------------
    // Both directions need to be similar.
    //
    // This is important because a short alternative
    // section should not automatically make two routes
    // duplicates.
    // --------------------------------------------------

    return Math.min(
        aNearB,
        bNearA
    );

}


// ======================================================
// REMOVE DUPLICATE / NEAR-DUPLICATE ROUTES
// ======================================================

function deduplicateRoutes(
    features,
    similarityThreshold = 0.85
) {

    if (
        !features ||
        features.length <= 1
    ) {

        return features || [];

    }


    const uniqueRoutes = [];


    for (
        const feature of features
    ) {

        let isDuplicate = false;


        for (
            const existingRoute of uniqueRoutes
        ) {

            const similarity =
                calculateRouteSimilarity(
                    feature,
                    existingRoute
                );


            console.log(
                "Route similarity:",
                `${(similarity * 100).toFixed(1)}%`
            );


            if (
                similarity >=
                similarityThreshold
            ) {

                console.log(
                    "Near-duplicate route removed."
                );

                isDuplicate = true;

                break;

            }

        }


        if (!isDuplicate) {

            uniqueRoutes.push(
                feature
            );

        }

    }


    return uniqueRoutes;

}


// ======================================================
// CONVERT PLACE NAME TO LATITUDE / LONGITUDE
// ======================================================

export async function getCoordinates(place) {

    const response =
        await axios.get(
            NOMINATIM_URL,
            {
                params: {
                    q: place,
                    format: "json",
                    limit: 1
                }
            }
        );


    if (
        response.data.length === 0
    ) {

        throw new Error(
            `Location not found: ${place}`
        );

    }


    return {

        lat:
            parseFloat(
                response.data[0].lat
            ),

        lng:
            parseFloat(
                response.data[0].lon
            )

    };

}


// ======================================================
// GET DRIVING ROUTES FROM OPENROUTESERVICE
// ======================================================

// Get driving routes from OpenRouteService
export async function getRoutes(start, end) {

    const coordinates = [
        [Number(start.lng), Number(start.lat)],
        [Number(end.lng), Number(end.lat)]
    ];

    const requestRoutes = async (includeAlternatives = true) => {

        const body = {
            coordinates
        };

        if (includeAlternatives) {
            body.alternative_routes = {
                target_count: 3,
                share_factor: 0.6
            };
        }

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
    };

    try {

        let data;

        try {

            data = await requestRoutes(true);

        } catch (err) {

            // ORS may reject alternative routes for long routes.
            if (
                err.response?.status === 400 &&
                err.response?.data?.error?.code === 2004
            ) {

                console.log(
                    "ORS rejected alternative routes. Retrying with one route..."
                );

                data = await requestRoutes(false);

            } else {

                throw err;

            }
        }


        if (
            !data ||
            !Array.isArray(data.features)
        ) {

            return {
                ...data,
                features: []
            };

        }


        console.log(
            "=========================================="
        );

        console.log(
            "OPENROUTESERVICE ROUTE RESPONSE"
        );

        console.log(
            "Total routes returned:",
            data.features.length
        );


        // ==================================================
        // REMOVE DUPLICATE / NEAR-DUPLICATE ROUTES
        // ==================================================

        const uniqueRoutes = [];


        for (const feature of data.features) {

            const summary =
                feature.properties?.summary;

            const geometry =
                feature.geometry?.coordinates;


            if (
                !summary ||
                !Array.isArray(geometry) ||
                geometry.length < 2
            ) {
                continue;
            }


            const distance =
                Number(summary.distance);

            const duration =
                Number(summary.duration);


            // ----------------------------------------------
            // Compare this route against existing routes
            // ----------------------------------------------

            const isDuplicate =
                uniqueRoutes.some(
                    existingRoute => {

                        const existingSummary =
                            existingRoute.properties.summary;

                        const existingGeometry =
                            existingRoute.geometry.coordinates;


                        const existingDistance =
                            Number(
                                existingSummary.distance
                            );

                        const existingDuration =
                            Number(
                                existingSummary.duration
                            );


                        // Difference in distance
                        const distanceDifference =
                            Math.abs(
                                distance -
                                existingDistance
                            ) /
                            Math.max(
                                distance,
                                existingDistance,
                                1
                            );


                        // Difference in duration
                        const durationDifference =
                            Math.abs(
                                duration -
                                existingDuration
                            ) /
                            Math.max(
                                duration,
                                existingDuration,
                                1
                            );


                        // ----------------------------------
                        // Geometry similarity
                        // ----------------------------------

                        const sampleCount = 10;

                        const getSamplePoints = (
                            coordinates
                        ) => {

                            const result = [];

                            for (
                                let i = 0;
                                i < sampleCount;
                                i++
                            ) {

                                const index =
                                    Math.floor(
                                        i *
                                        (
                                            coordinates.length -
                                            1
                                        ) /
                                        (
                                            sampleCount -
                                            1
                                        )
                                    );

                                result.push(
                                    coordinates[index]
                                );

                            }

                            return result;

                        };


                        const currentSamples =
                            getSamplePoints(
                                geometry
                            );

                        const existingSamples =
                            getSamplePoints(
                                existingGeometry
                            );


                        let closePoints = 0;


                        for (
                            let i = 0;
                            i < sampleCount;
                            i++
                        ) {

                            const [lng1, lat1] =
                                currentSamples[i];

                            const [lng2, lat2] =
                                existingSamples[i];


                            const coordinateDifference =
                                Math.sqrt(
                                    Math.pow(
                                        (lng1 - lng2) * 111,
                                        2
                                    ) +
                                    Math.pow(
                                        (lat1 - lat2) * 111,
                                        2
                                    )
                                );


                            // Approximately 150 metres
                            if (
                                coordinateDifference <
                                0.15
                            ) {

                                closePoints++;

                            }

                        }


                        const geometrySimilarity =
                            closePoints /
                            sampleCount;


                        // ----------------------------------
                        // Route is considered duplicate when
                        // distance + duration + geometry
                        // are all very similar.
                        // ----------------------------------

                        return (
                            distanceDifference < 0.05 &&
                            durationDifference < 0.05 &&
                            geometrySimilarity >= 0.8
                        );

                    }
                );


            if (!isDuplicate) {

                uniqueRoutes.push(
                    feature
                );

            }

        }


        // ==================================================
        // SORT BY TRAVEL TIME
        // ==================================================

        uniqueRoutes.sort(
            (a, b) =>
                Number(
                    a.properties.summary.duration
                ) -
                Number(
                    b.properties.summary.duration
                )
        );


        // ==================================================
        // LIMIT TO ACTUAL UNIQUE ROUTES
        // ==================================================

        const finalRoutes =
            uniqueRoutes;


        console.log(
            "Unique routes after deduplication:",
            finalRoutes.length
        );


        finalRoutes.forEach(
            (route, index) => {

                console.log(
                    `Route ${index + 1}:`
                );

                console.log(
                    "Distance:",
                    route.properties.summary.distance,
                    "meters"
                );

                console.log(
                    "Duration:",
                    route.properties.summary.duration,
                    "seconds"
                );

                console.log(
                    "Coordinates:",
                    route.geometry.coordinates.length
                );

                console.log(
                    "------------------------------------------"
                );

            }
        );


        console.log(
            "=========================================="
        );


        return {
            ...data,
            features: finalRoutes
        };


    } catch (error) {

        console.error(
            "OpenRouteService error:",
            error
        );

        throw error;

    }

}