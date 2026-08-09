import {
    MapContainer,
    TileLayer,
    GeoJSON,
    CircleMarker,
    Popup,
    useMap
} from "react-leaflet";

import {
    useEffect
} from "react";

import "leaflet/dist/leaflet.css";


/*
=========================================================
MAP SIZE FIX
=========================================================
*/

function MapSizeFix() {

    const map = useMap();

    useEffect(() => {

        const refresh = () => {

            map.invalidateSize({
                animate: false
            });

        };


        // Initial Leaflet size calculation
        refresh();


        const timer1 = setTimeout(
            refresh,
            100
        );


        const timer2 = setTimeout(
            refresh,
            300
        );


        const timer3 = setTimeout(
            refresh,
            700
        );


        window.addEventListener(
            "resize",
            refresh
        );


        return () => {

            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);

            window.removeEventListener(
                "resize",
                refresh
            );

        };

    }, [map]);


    return null;

}


/*
=========================================================
MAP CONTROLLER
=========================================================
*/

function MapController({
    routes,
    source,
    destination
}) {

    const map = useMap();


    useEffect(() => {

        const coordinates = [];


        /*
        --------------------------------------------------
        ROUTE COORDINATES
        --------------------------------------------------
        */

        const features =
            routes?.features || [];


        features.forEach(
            (feature) => {

                const geometry =
                    feature?.geometry;


                if (!geometry) {

                    return;

                }


                if (
                    geometry.type ===
                    "LineString"
                ) {

                    geometry.coordinates.forEach(
                        ([lng, lat]) => {

                            coordinates.push([
                                lat,
                                lng
                            ]);

                        }
                    );

                }


                if (
                    geometry.type ===
                    "MultiLineString"
                ) {

                    geometry.coordinates.forEach(
                        (line) => {

                            line.forEach(
                                ([lng, lat]) => {

                                    coordinates.push([
                                        lat,
                                        lng
                                    ]);

                                }
                            );

                        }
                    );

                }

            }
        );


        /*
        --------------------------------------------------
        FALLBACK TO SOURCE + DESTINATION
        --------------------------------------------------
        */

        if (
            coordinates.length === 0
        ) {

            if (source) {

                coordinates.push([
                    source.lat,
                    source.lng
                ]);

            }


            if (destination) {

                coordinates.push([
                    destination.lat,
                    destination.lng
                ]);

            }

        }


        /*
        --------------------------------------------------
        FIT MAP
        --------------------------------------------------
        */

        if (
            coordinates.length === 1
        ) {

            map.setView(
                coordinates[0],
                14,
                {
                    animate: true
                }
            );

        }


        if (
            coordinates.length > 1
        ) {

            map.fitBounds(
                coordinates,
                {
                    padding: [
                        60,
                        60
                    ],

                    maxZoom: 15,

                    animate: true
                }
            );

        }


        /*
        --------------------------------------------------
        FINAL SIZE REFRESH
        --------------------------------------------------
        */

        const timer =
            setTimeout(() => {

                map.invalidateSize({
                    animate: false
                });

            }, 250);


        return () => {

            clearTimeout(timer);

        };

    }, [
        routes,
        source,
        destination,
        map
    ]);


    return null;

}


/*
=========================================================
ROUTE MAP
=========================================================
*/

function RouteMap({
    routes,
    source,
    destination,
    selectedRoute,
    onSelectRoute
}) {

    const defaultCenter = [
        23.2599,
        77.4126
    ];


    const routeFeatures =
        routes?.features || [];


    return (

        <div
            className="
                relative
                h-[560px]
                w-full
                min-w-0
                overflow-hidden
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
            "
        >

            <MapContainer

                center={
                    defaultCenter
                }

                zoom={12}

                scrollWheelZoom={true}

                zoomControl={true}

                className="
                    !h-full
                    !w-full
                "

                style={{
                    height: "100%",
                    width: "100%"
                }}

            >

                <TileLayer

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

                    maxZoom={19}

                    tileSize={256}

                    updateWhenIdle={true}

                    updateWhenZooming={false}

                />


                <MapSizeFix />


                <MapController

                    routes={routes}

                    source={source}

                    destination={
                        destination
                    }

                />


                {/* =================================================
                    ROUTES
                ================================================= */}

                {routeFeatures.map(
                    (
                        feature,
                        index
                    ) => {

                        const isSelected =
                            selectedRoute ===
                            index;


                        return (

                            <GeoJSON

                                key={
                                    `route-${index}`
                                }

                                data={
                                    feature
                                }

                                style={() => ({

                                    color:
                                        isSelected
                                            ? "#2563EB"
                                            : index ===
                                              0
                                                ? "#16A34A"
                                                : "#F59E0B",

                                    weight:
                                        isSelected
                                            ? 7
                                            : 5,

                                    opacity:
                                        isSelected
                                            ? 1
                                            : 0.7,

                                    lineCap:
                                        "round",

                                    lineJoin:
                                        "round"

                                })}

                                eventHandlers={{

                                    click: () => {

                                        if (
                                            onSelectRoute
                                        ) {

                                            onSelectRoute(
                                                index
                                            );

                                        }

                                    }

                                }}

                            />

                        );

                    }
                )}


                {/* =================================================
                    SOURCE MARKER
                ================================================= */}

                {source && (

                    <CircleMarker

                        center={[
                            source.lat,
                            source.lng
                        ]}

                        radius={9}

                        pathOptions={{

                            color:
                                "#ffffff",

                            weight: 3,

                            fillColor:
                                "#2563EB",

                            fillOpacity: 1

                        }}

                    >

                        <Popup>

                            <div
                                className="
                                    min-w-[100px]
                                    text-sm
                                "
                            >

                                <strong>
                                    Start
                                </strong>

                                <br />

                                {source.name}

                            </div>

                        </Popup>

                    </CircleMarker>

                )}


                {/* =================================================
                    DESTINATION MARKER
                ================================================= */}

                {destination && (

                    <CircleMarker

                        center={[
                            destination.lat,
                            destination.lng
                        ]}

                        radius={9}

                        pathOptions={{

                            color:
                                "#ffffff",

                            weight: 3,

                            fillColor:
                                "#DC2626",

                            fillOpacity: 1

                        }}

                    >

                        <Popup>

                            <div
                                className="
                                    min-w-[100px]
                                    text-sm
                                "
                            >

                                <strong>
                                    Destination
                                </strong>

                                <br />

                                {destination.name}

                            </div>

                        </Popup>

                    </CircleMarker>

                )}

            </MapContainer>

        </div>

    );

}


export default RouteMap;