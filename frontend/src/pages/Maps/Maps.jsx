import {
    useMemo,
    useState
} from "react";

import {
    FaRoute,
    FaMapMarkerAlt,
    FaArrowRight
} from "react-icons/fa";

import {
    useNavigate
} from "react-router-dom";

import DashboardLayout
    from "../../components/layout/DashboardLayout";

import RouteMap
    from "../../components/maps/RouteMap";

import RouteService
    from "../../services/routeService";

import locations
    from "../../data/locations";


function Maps() {

    const navigate = useNavigate();


    /*
    =========================================================
    SOURCE
    =========================================================
    */

    const [
        sourceState,
        setSourceState
    ] = useState("");

    const [
        sourceCity,
        setSourceCity
    ] = useState("");

    const [
        sourceLocation,
        setSourceLocation
    ] = useState("");


    /*
    =========================================================
    DESTINATION
    =========================================================
    */

    const [
        destinationState,
        setDestinationState
    ] = useState("");

    const [
        destinationCity,
        setDestinationCity
    ] = useState("");

    const [
        destinationLocation,
        setDestinationLocation
    ] = useState("");


    /*
    =========================================================
    ROUTE STATE
    =========================================================
    */

    const [
        routes,
        setRoutes
    ] = useState(null);

    const [
        selectedRoute,
        setSelectedRoute
    ] = useState(0);

    const [
        loading,
        setLoading
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");


    /*
    =========================================================
    CITIES
    =========================================================
    */

    const sourceCities =
        useMemo(() => {

            if (!sourceState) {

                return [];

            }

            return Object.keys(
                locations[
                    sourceState
                ] || {}
            );

        }, [
            sourceState
        ]);


    const destinationCities =
        useMemo(() => {

            if (!destinationState) {

                return [];

            }

            return Object.keys(
                locations[
                    destinationState
                ] || {}
            );

        }, [
            destinationState
        ]);


    /*
    =========================================================
    LOCATIONS
    =========================================================
    */

    const sourceLocations =
        useMemo(() => {

            if (
                !sourceState ||
                !sourceCity
            ) {

                return [];

            }

            return (
                locations[
                    sourceState
                ]?.[sourceCity] || []
            );

        }, [
            sourceState,
            sourceCity
        ]);


    const destinationLocations =
        useMemo(() => {

            if (
                !destinationState ||
                !destinationCity
            ) {

                return [];

            }

            return (
                locations[
                    destinationState
                ]?.[destinationCity] || []
            );

        }, [
            destinationState,
            destinationCity
        ]);


    /*
    =========================================================
    SOURCE OBJECT
    =========================================================
    */

    const source =
        useMemo(() => {

            if (!sourceLocation) {

                return null;

            }

            const coordinates =
                RouteService.getCoordinates(
                    sourceLocation
                );


            if (
                !coordinates ||
                coordinates.lat === 0
            ) {

                return null;

            }


            return {

                name:
                    sourceLocation,

                lat:
                    coordinates.lat,

                lng:
                    coordinates.lng

            };

        }, [
            sourceLocation
        ]);


    /*
    =========================================================
    DESTINATION OBJECT
    =========================================================
    */

    const destination =
        useMemo(() => {

            if (!destinationLocation) {

                return null;

            }

            const coordinates =
                RouteService.getCoordinates(
                    destinationLocation
                );


            if (
                !coordinates ||
                coordinates.lat === 0
            ) {

                return null;

            }


            return {

                name:
                    destinationLocation,

                lat:
                    coordinates.lat,

                lng:
                    coordinates.lng

            };

        }, [
            destinationLocation
        ]);


    /*
    =========================================================
    RESET ROUTES
    =========================================================
    */

    const resetRoutes = () => {

        setRoutes(null);

        setSelectedRoute(0);

        setError("");

    };


    /*
    =========================================================
    SOURCE STATE
    =========================================================
    */

    const handleSourceStateChange =
        (value) => {

            setSourceState(value);

            setSourceCity("");

            setSourceLocation("");

            resetRoutes();

        };


    /*
    =========================================================
    SOURCE CITY
    =========================================================
    */

    const handleSourceCityChange =
        (value) => {

            setSourceCity(value);

            setSourceLocation("");

            resetRoutes();

        };


    /*
    =========================================================
    DESTINATION STATE
    =========================================================
    */

    const handleDestinationStateChange =
        (value) => {

            setDestinationState(value);

            setDestinationCity("");

            setDestinationLocation("");

            resetRoutes();

        };


    /*
    =========================================================
    DESTINATION CITY
    =========================================================
    */

    const handleDestinationCityChange =
        (value) => {

            setDestinationCity(value);

            setDestinationLocation("");

            resetRoutes();

        };


    /*
    =========================================================
    FIND ROUTES
    =========================================================
    */

    const handleFindRoutes =
        async () => {

            setError("");

            setRoutes(null);

            setSelectedRoute(0);


            if (!source) {

                setError(
                    "Please select a valid source location."
                );

                return;

            }


            if (!destination) {

                setError(
                    "Please select a valid destination location."
                );

                return;

            }


            if (
                source.lat ===
                    destination.lat &&
                source.lng ===
                    destination.lng
            ) {

                setError(
                    "Source and destination cannot be the same."
                );

                return;

            }


            setLoading(true);


            try {

                const response =
                    await RouteService.getRoutes({

                        source,

                        destination

                    });


                if (
                    !response ||
                    !response.features ||
                    response.features.length === 0
                ) {

                    setError(
                        "No routes were found for these locations."
                    );

                    return;

                }


                setRoutes(
                    response
                );

                setSelectedRoute(
                    0
                );

            }

            catch (err) {

                console.error(
                    "Route calculation error:",
                    err
                );


                setError(
                    err?.response?.data?.detail ||
                    err?.message ||
                    "Unable to calculate route."
                );

            }

            finally {

                setLoading(false);

            }

        };


    /*
    =========================================================
    ROUTES
    =========================================================
    */

    const routeFeatures =
        routes?.features || [];


    /*
    =========================================================
    ROUTE SUMMARY
    =========================================================
    */

    const getRouteSummary =
        (feature) => {

            if (!feature) {

                return {
                    distance: "--",
                    duration: "--"
                };

            }


            /*
            -------------------------------------------------
            Support the normal GeoJSON structure:
            feature.properties.summary.distance
            feature.properties.summary.duration
            -------------------------------------------------
            */

            const summary =
                feature
                    ?.properties
                    ?.summary || {};


            /*
            -------------------------------------------------
            Also support direct properties:
            feature.properties.distance
            feature.properties.duration
            -------------------------------------------------
            */

            const properties =
                feature?.properties || {};


            /*
            -------------------------------------------------
            Also support direct feature values.
            -------------------------------------------------
            */

            const distanceValue =
                summary?.distance ??
                properties?.distance ??
                feature?.distance ??
                null;


            const durationValue =
                summary?.duration ??
                properties?.duration ??
                feature?.duration ??
                null;


            /*
            -------------------------------------------------
            DISTANCE
            -------------------------------------------------
            */

            let distance = "--";


            if (
                distanceValue !== null &&
                distanceValue !== undefined &&
                distanceValue !== ""
            ) {

                const numericDistance =
                    Number(
                        distanceValue
                    );


                if (
                    Number.isFinite(
                        numericDistance
                    )
                ) {

                    /*
                     * Routing APIs normally return
                     * distance in metres.
                     *
                     * If the value is already very
                     * small, treat it as kilometres.
                     */

                    if (
                        numericDistance > 100
                    ) {

                        distance =
                            `${(
                                numericDistance /
                                1000
                            ).toFixed(1)} km`;

                    }

                    else {

                        distance =
                            `${numericDistance.toFixed(
                                1
                            )} km`;

                    }

                }

            }


            /*
            -------------------------------------------------
            ETA / DURATION
            -------------------------------------------------
            */

            let duration = "--";


            if (
                durationValue !== null &&
                durationValue !== undefined &&
                durationValue !== ""
            ) {

                const numericDuration =
                    Number(
                        durationValue
                    );


                if (
                    Number.isFinite(
                        numericDuration
                    )
                ) {

                    /*
                     * Routing APIs normally return
                     * duration in seconds.
                     */

                    const minutes =
                        Math.max(
                            1,
                            Math.round(
                                numericDuration /
                                60
                            )
                        );


                    if (
                        minutes < 60
                    ) {

                        duration =
                            `${minutes} min`;

                    }

                    else {

                        const hours =
                            Math.floor(
                                minutes /
                                60
                            );


                        const remaining =
                            minutes %
                            60;


                        duration =
                            remaining > 0
                                ? `${hours} hr ${remaining} min`
                                : `${hours} hr`;

                    }

                }

            }


            return {
                distance,
                duration
            };

        };


    /*
    =========================================================
    SELECTED ROUTE
    =========================================================
    */

    const selectedFeature =
        routeFeatures[
            selectedRoute
        ];


    /*
    =========================================================
    SELECTED ROUTE SUMMARY
    =========================================================
    */

    const selectedSummary =
        getRouteSummary(
            selectedFeature
        );


    /*
    =========================================================
    ANALYZE RISK
    =========================================================
    */

    const handleAnalyzeRisk =
        () => {

            if (!selectedFeature) {

                return;

            }


            navigate(
                "/prediction",
                {

                    state: {

                        source,

                        destination,

                        route:
                            selectedFeature,

                        routeIndex:
                            selectedRoute,

                        distance:
                            selectedSummary
                                .distance,

                        eta:
                            selectedSummary
                                .duration

                    }

                }
            );

        };


    return (

        <DashboardLayout>

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div
                className="
                    mb-8
                    pt-4
                    sm:pt-6
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                    "
                >

                    <div>

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <FaRoute
                                className="
                                    text-blue-500
                                "
                            />

                            <p
                                className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-[0.16em]
                                    text-blue-400
                                "
                            >
                                Route Intelligence
                            </p>

                        </div>


                        <h1
                            className="
                                mt-2
                                text-3xl
                                font-semibold
                                tracking-tight
                                text-white
                            "
                        >
                            Maps & Routes
                        </h1>


                        <p
                            className="
                                mt-2
                                text-sm
                                leading-6
                                text-slate-400
                            "
                        >
                            Find and compare routes before
                            running traffic risk analysis.
                        </p>

                    </div>


                    <div
                        className="
                            hidden
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-slate-700
                            bg-slate-900/70
                            px-3
                            py-1.5
                            text-xs
                            text-slate-400
                            sm:flex
                        "
                    >

                        <span
                            className="
                                h-2
                                w-2
                                rounded-full
                                bg-emerald-500
                            "
                        />

                        System Online

                    </div>

                </div>

            </div>


            {/* =================================================
                JOURNEY PLANNER
            ================================================= */}

            <section
                className="
                    mb-8
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-900/80
                    p-6
                "
            >

                <div
                    className="
                        mb-7
                        flex
                        items-center
                        gap-3
                    "
                >

                    <div
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-600/15
                            text-blue-400
                        "
                    >

                        <FaRoute />

                    </div>


                    <div>

                        <h2
                            className="
                                text-base
                                font-semibold
                                text-white
                            "
                        >
                            Plan your journey
                        </h2>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-slate-400
                            "
                        >
                            Select your starting point and
                            destination.
                        </p>

                    </div>

                </div>


                <div
                    className="
                        grid
                        grid-cols-1
                        gap-8
                        xl:grid-cols-[1fr_48px_1fr]
                        xl:items-end
                    "
                >

                    {/* SOURCE */}

                    <div>

                        <LocationHeading
                            letter="A"
                            title="Source"
                            subtitle="Starting location"
                            color="blue"
                        />


                        <div
                            className="
                                mt-5
                                grid
                                grid-cols-1
                                gap-4
                                sm:grid-cols-3
                            "
                        >

                            <SelectField
                                label="State"
                                value={
                                    sourceState
                                }
                                onChange={
                                    handleSourceStateChange
                                }
                                options={
                                    Object.keys(
                                        locations
                                    )
                                }
                                placeholder="Select State"
                            />


                            <SelectField
                                label="City"
                                value={
                                    sourceCity
                                }
                                onChange={
                                    handleSourceCityChange
                                }
                                options={
                                    sourceCities
                                }
                                placeholder="Select City"
                                disabled={
                                    !sourceState
                                }
                            />


                            <SelectField
                                label="Location"
                                value={
                                    sourceLocation
                                }
                                onChange={
                                    setSourceLocation
                                }
                                options={
                                    sourceLocations
                                }
                                placeholder="Select Location"
                                disabled={
                                    !sourceCity
                                }
                            />

                        </div>

                    </div>


                    {/* ARROW */}

                    <div
                        className="
                            hidden
                            items-center
                            justify-center
                            pb-1
                            text-slate-500
                            xl:flex
                        "
                    >

                        <FaArrowRight
                            size={20}
                        />

                    </div>


                    {/* DESTINATION */}

                    <div>

                        <LocationHeading
                            letter="B"
                            title="Destination"
                            subtitle="Where you want to go"
                            color="green"
                        />


                        <div
                            className="
                                mt-5
                                grid
                                grid-cols-1
                                gap-4
                                sm:grid-cols-3
                            "
                        >

                            <SelectField
                                label="State"
                                value={
                                    destinationState
                                }
                                onChange={
                                    handleDestinationStateChange
                                }
                                options={
                                    Object.keys(
                                        locations
                                    )
                                }
                                placeholder="Select State"
                            />


                            <SelectField
                                label="City"
                                value={
                                    destinationCity
                                }
                                onChange={
                                    handleDestinationCityChange
                                }
                                options={
                                    destinationCities
                                }
                                placeholder="Select City"
                                disabled={
                                    !destinationState
                                }
                            />


                            <SelectField
                                label="Location"
                                value={
                                    destinationLocation
                                }
                                onChange={
                                    setDestinationLocation
                                }
                                options={
                                    destinationLocations
                                }
                                placeholder="Select Location"
                                disabled={
                                    !destinationCity
                                }
                            />

                        </div>

                    </div>

                </div>


                {/* ACTION */}

                <div
                    className="
                        mt-7
                        border-t
                        border-slate-800
                        pt-5
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >

                        <div
                            className="
                                min-h-[24px]
                            "
                        >

                            {error && (

                                <p
                                    className="
                                        text-xs
                                        font-medium
                                        leading-5
                                        text-red-400
                                    "
                                >
                                    {error}
                                </p>

                            )}

                        </div>


                        <button
                            type="button"
                            onClick={
                                handleFindRoutes
                            }
                            disabled={
                                loading
                            }
                            className="
                                min-h-[44px]
                                min-w-[150px]
                                rounded-xl
                                bg-blue-600
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-blue-500
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >

                            {loading
                                ? "Calculating..."
                                : "Find Routes"
                            }

                        </button>

                    </div>

                </div>

            </section>


            {/* =================================================
                MAP + ROUTE OPTIONS
            ================================================= */}

            <section
                className="
                    grid
                    grid-cols-1
                    gap-7
                    xl:grid-cols-[minmax(0,1fr)_380px]
                    xl:items-start
                "
            >

                {/* =================================================
                    MAP
                ================================================= */}

                <div
                    className="
                        min-w-0
                    "
                >

                    <RouteMap

                        routes={
                            routes
                        }

                        source={
                            source
                        }

                        destination={
                            destination
                        }

                        selectedRoute={
                            selectedRoute
                        }

                        onSelectRoute={
                            setSelectedRoute
                        }

                    />

                </div>


                {/* =================================================
                    ROUTE OPTIONS
                ================================================= */}

                <aside
                    className="
                        min-w-0
                    "
                >

                    <div
                        className="
                            rounded-2xl
                            border
                            border-slate-800
                            bg-slate-900
                            p-5
                        "
                    >

                        {/* HEADER */}

                        <div
                            className="
                                mb-5
                            "
                        >

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    text-white
                                "
                            >
                                Route Options
                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    leading-5
                                    text-slate-400
                            "
                            >
                                Compare available routes
                                and choose one for analysis.
                            </p>

                        </div>


                        {routeFeatures.length > 0 ? (

                            /*
                            =================================================
                            THREE CARDS WITH CLEAR BREATHING SPACE
                            =================================================
                            */

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-5
                                "
                            >

                                {/* =================================================
                                    RECOMMENDED ROUTE
                                ================================================= */}

                                {routeFeatures[0] && (

                                    <RouteOptionCard

                                        feature={
                                            routeFeatures[0]
                                        }

                                        index={0}

                                        selected={
                                            selectedRoute ===
                                            0
                                        }

                                        onSelect={() =>
                                            setSelectedRoute(
                                                0
                                            )
                                        }

                                        getRouteSummary={
                                            getRouteSummary
                                        }

                                    />

                                )}


                                {/* =================================================
                                    ALTERNATIVE ROUTE
                                ================================================= */}

                                {routeFeatures[1] && (

                                    <RouteOptionCard

                                        feature={
                                            routeFeatures[1]
                                        }

                                        index={1}

                                        selected={
                                            selectedRoute ===
                                            1
                                        }

                                        onSelect={() =>
                                            setSelectedRoute(
                                                1
                                            )
                                        }

                                        getRouteSummary={
                                            getRouteSummary
                                        }

                                    />

                                )}


                                {/* =================================================
                                    SELECTED ROUTE
                                ================================================= */}

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-slate-700
                                        bg-slate-800/70
                                        p-5
                                    "
                                >

                                    <p
                                        className="
                                            text-[10px]
                                            font-semibold
                                            uppercase
                                            tracking-[0.16em]
                                            text-blue-400
                                        "
                                    >
                                        Selected Route
                                    </p>


                                    <div
                                        className="
                                            mt-3
                                            flex
                                            items-start
                                            justify-between
                                            gap-4
                                        "
                                    >

                                        <div>

                                            <h3
                                                className="
                                                    text-base
                                                    font-semibold
                                                    text-white
                                                "
                                            >
                                                Route{" "}
                                                {selectedRoute +
                                                    1}
                                            </h3>


                                            <p
                                                className="
                                                    mt-2
                                                    text-sm
                                                    font-medium
                                                    text-slate-300
                                                "
                                            >
                                                {
                                                    selectedSummary
                                                        .distance
                                                }

                                                {" • "}

                                                {
                                                    selectedSummary
                                                        .duration
                                                }
                                            </p>

                                        </div>


                                        <span
                                            className="
                                                shrink-0
                                                rounded-full
                                                bg-blue-500/10
                                                px-2.5
                                                py-1
                                                text-[10px]
                                                font-semibold
                                                text-blue-400
                                            "
                                        >
                                            Ready
                                        </span>

                                    </div>


                                    {/* =================================================
                                        ANALYZE RISK
                                    ================================================= */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleAnalyzeRisk
                                        }
                                        disabled={
                                            !selectedFeature
                                        }
                                        className="
                                            mt-5
                                            flex
                                            min-h-[46px]
                                            w-full
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-blue-600
                                            px-5
                                            py-3
                                            text-sm
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-blue-500
                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                    >
                                        Analyze Risk
                                    </button>

                                </div>

                            </div>

                        ) : (

                            /* =================================================
                               EMPTY STATE
                            ================================================= */

                            <div
                                className="
                                    flex
                                    min-h-[480px]
                                    flex-col
                                    items-center
                                    justify-center
                                    px-5
                                    text-center
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-slate-800
                                        text-slate-500
                                    "
                                >

                                    <FaMapMarkerAlt />

                                </div>


                                <p
                                    className="
                                        mt-4
                                        text-sm
                                        font-semibold
                                        text-slate-300
                                    "
                                >
                                    No routes calculated
                                </p>


                                <p
                                    className="
                                        mt-2
                                        max-w-[230px]
                                        text-xs
                                        leading-5
                                        text-slate-500
                                    "
                                >
                                    Select a source and
                                    destination above to
                                    compare available routes.
                                </p>

                            </div>

                        )}

                    </div>

                </aside>

            </section>


            {/* =================================================
                BOTTOM BREATHING SPACE
            ================================================= */}

            <div
                className="
                    h-10
                "
            />

        </DashboardLayout>

    );

}


/*
=========================================================
LOCATION HEADING
=========================================================
*/

function LocationHeading({
    letter,
    title,
    subtitle,
    color
}) {

    const colorClasses =
        color === "green"
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-blue-500/15 text-blue-400";


    return (

        <div
            className="
                flex
                items-center
                gap-3
            "
        >

            <span
                className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    text-xs
                    font-bold
                    ${colorClasses}
                `}
            >
                {letter}
            </span>


            <div>

                <p
                    className="
                        text-sm
                        font-semibold
                        text-white
                    "
                >
                    {title}
                </p>


                <p
                    className="
                        mt-0.5
                        text-[11px]
                        text-slate-500
                    "
                >
                    {subtitle}
                </p>

            </div>

        </div>

    );

}


/*
=========================================================
ROUTE OPTION CARD
=========================================================
*/

function RouteOptionCard({
    feature,
    index,
    selected,
    onSelect,
    getRouteSummary
}) {

    const summary =
        getRouteSummary(
            feature
        );


    return (

        <button
            type="button"
            onClick={
                onSelect
            }
            className={`
                w-full
                rounded-xl
                border
                p-5
                text-left
                transition-all
                duration-200

                ${
                    selected
                        ? "border-blue-500 bg-blue-950/40 shadow-sm"
                        : "border-slate-700 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800"
                }
            `}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-3
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <span
                        className={`
                            h-3
                            w-3
                            shrink-0
                            rounded-full

                            ${
                                index === 0
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                            }
                        `}
                    />


                    <span
                        className="
                            text-sm
                            font-semibold
                            text-white
                        "
                    >
                        {index === 0
                            ? "Recommended Route"
                            : "Alternative Route"}
                    </span>

                </div>


                {selected && (

                    <span
                        className="
                            shrink-0
                            rounded-full
                            bg-blue-500/10
                            px-2
                            py-1
                            text-[10px]
                            font-semibold
                            text-blue-400
                        "
                    >
                        Selected
                    </span>

                )}

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <p
                className="
                    mt-2
                    text-xs
                    leading-5
                    text-slate-400
                "
            >
                {index === 0
                    ? "Fastest available option"
                    : "Another available route"}
            </p>


            {/* =================================================
                DISTANCE + ETA
            ================================================= */}

            <div
                className="
                    mt-5
                    grid
                    grid-cols-2
                    gap-3
                "
            >

                <RouteMetric
                    label="Distance"
                    value={
                        summary.distance
                    }
                />


                <RouteMetric
                    label="ETA"
                    value={
                        summary.duration
                    }
                />

            </div>


            {/* =================================================
                SELECT TEXT
            ================================================= */}

            <p
                className="
                    mt-4
                    text-xs
                    font-medium
                    text-blue-400
                "
            >
                Select this route for risk analysis →
            </p>

        </button>

    );

}


/*
=========================================================
ROUTE METRIC
=========================================================
*/

function RouteMetric({
    label,
    value
}) {

    return (

        <div
            className="
                min-w-0
                rounded-xl
                bg-slate-800
                px-4
                py-3
            "
        >

            <p
                className="
                    text-[11px]
                    font-medium
                    text-slate-500
                "
            >
                {label}
            </p>


            <p
                className="
                    mt-1
                    whitespace-nowrap
                    text-base
                    font-semibold
                    text-white
                "
            >
                {value}
            </p>

        </div>

    );

}


/*
=========================================================
SELECT FIELD
=========================================================
*/

function SelectField({
    label,
    value,
    onChange,
    options = [],
    placeholder,
    disabled = false
}) {

    return (

        <label className="block">

            <span
                className="
                    mb-2
                    block
                    text-[11px]
                    font-medium
                    text-slate-400
                "
            >
                {label}
            </span>


            <select
                value={
                    value
                }
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                disabled={
                    disabled
                }
                className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-800
                    px-3
                    text-sm
                    text-slate-200
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-1
                    focus:ring-blue-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            >

                <option
                    value=""
                    className="
                        bg-slate-900
                    "
                >
                    {placeholder}
                </option>


                {options.map(
                    (option) => (

                        <option
                            key={
                                option
                            }
                            value={
                                option
                            }
                            className="
                                bg-slate-900
                            "
                        >
                            {option}
                        </option>

                    )
                )}

            </select>

        </label>

    );

}


export default Maps;