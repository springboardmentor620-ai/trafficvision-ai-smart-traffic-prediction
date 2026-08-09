import httpx

from fastapi import HTTPException


# --------------------------------------------------
# OSRM ROUTING SERVICE
# --------------------------------------------------

OSRM_URL = (
    "https://router.project-osrm.org"
    "/route/v1/driving"
)


class RouteService:

    @staticmethod
    async def get_routes(
        source_lng: float,
        source_lat: float,
        destination_lng: float,
        destination_lat: float
    ):

        # --------------------------------------------------
        # BUILD COORDINATE STRING
        # OSRM uses longitude,latitude
        # --------------------------------------------------

        coordinates = (
            f"{source_lng},{source_lat};"
            f"{destination_lng},{destination_lat}"
        )

        url = f"{OSRM_URL}/{coordinates}"


        # --------------------------------------------------
        # REQUEST PARAMETERS
        # --------------------------------------------------

        params = {

            # Ask OSRM for alternative routes
            "alternatives": "2",

            # We need GeoJSON for Leaflet
            "geometries": "geojson",

            # Complete route geometry
            "overview": "full",

            # We don't need turn-by-turn steps yet
            "steps": "false"

        }


        try:

            # --------------------------------------------------
            # CALL OSRM
            # --------------------------------------------------

            async with httpx.AsyncClient(
                timeout=30.0
            ) as client:

                response = await client.get(
                    url,
                    params=params
                )


            # --------------------------------------------------
            # HTTP ERROR
            # --------------------------------------------------

            if response.status_code != 200:

                print(
                    "OSRM HTTP error:",
                    response.status_code,
                    response.text
                )

                raise HTTPException(

                    status_code=502,

                    detail=(
                        "Routing service returned "
                        "an error."
                    )

                )


            # --------------------------------------------------
            # PARSE RESPONSE
            # --------------------------------------------------

            data = response.json()


            # --------------------------------------------------
            # OSRM ROUTING ERROR
            # --------------------------------------------------

            if data.get("code") != "Ok":

                print(
                    "OSRM routing error:",
                    data
                )

                raise HTTPException(

                    status_code=502,

                    detail=(
                        data.get(
                            "message",
                            "No route found."
                        )
                    )

                )


            osrm_routes = data.get(
                "routes",
                []
            )


            if not osrm_routes:

                raise HTTPException(

                    status_code=404,

                    detail=(
                        "No routes were found "
                        "for these locations."
                    )

                )


            # --------------------------------------------------
            # CONVERT OSRM RESPONSE
            # INTO GEOJSON FEATURE COLLECTION
            #
            # This keeps the response compatible
            # with our existing RouteMap.jsx
            # --------------------------------------------------

            features = []


            for index, route in enumerate(
                osrm_routes
            ):

                distance_meters = route.get(
                    "distance",
                    0
                )

                duration_seconds = route.get(
                    "duration",
                    0
                )


                distance_km = (
                    distance_meters / 1000
                )


                duration_minutes = (
                    duration_seconds / 60
                )


                feature = {

                    "type": "Feature",

                    "properties": {

                        "route_index": index,

                        "distance": distance_meters,

                        "duration": duration_seconds,

                        "distance_km": round(
                            distance_km,
                            1
                        ),

                        "duration_minutes": round(
                            duration_minutes
                        ),

                        "is_recommended": (
                            index == 0
                        )

                    },

                    "geometry":
                        route.get(
                            "geometry"
                        )

                }


                features.append(
                    feature
                )


            # --------------------------------------------------
            # FINAL RESPONSE
            # --------------------------------------------------

            return {

                "type":
                    "FeatureCollection",

                "features":
                    features,

                "routes": [

                    {

                        "route_index": index,

                        "distance":
                            route.get(
                                "distance",
                                0
                            ),

                        "duration":
                            route.get(
                                "duration",
                                0
                            ),

                        "distance_km":
                            round(
                                route.get(
                                    "distance",
                                    0
                                ) / 1000,
                                1
                            ),

                        "duration_minutes":
                            round(
                                route.get(
                                    "duration",
                                    0
                                ) / 60
                            )

                    }

                    for index, route
                    in enumerate(
                        osrm_routes
                    )

                ]

            }


        # --------------------------------------------------
        # NETWORK ERROR
        # --------------------------------------------------

        except httpx.RequestError as error:

            print(
                "OSRM network error:",
                error
            )

            raise HTTPException(

                status_code=502,

                detail=(
                    "Routing service could "
                    "not be reached."
                )

            )