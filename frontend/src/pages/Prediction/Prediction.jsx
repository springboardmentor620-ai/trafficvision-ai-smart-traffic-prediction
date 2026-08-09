import { useMemo, useState } from "react";

import {
    FaRoute,
    FaArrowRight,
    FaCalendarAlt,
    FaClock,
    FaSun,
    FaCloud,
    FaCloudRain,
    FaSmog,
    FaChartLine,
    FaCheckCircle,
    FaExclamationTriangle,
    FaShieldAlt
} from "react-icons/fa";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";

import api from "../../services/api";

import locations from "../../data/locations";


/* =========================================================
   FIND CITY / STATE FROM LOCATION NAME
========================================================= */

function findLocationDetails(locationName) {

    if (!locationName) {
        return null;
    }

    for (const [state, cities] of Object.entries(locations)) {

        for (const [city, places] of Object.entries(cities)) {

            if (places.includes(locationName)) {

                return {
                    state,
                    city
                };

            }

        }

    }

    return null;
}


/* =========================================================
   PARSE DISTANCE
========================================================= */

function parseDistance(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    if (typeof value === "number") {
        return value;
    }

    const text = String(value)
        .replace(",", ".")
        .trim();

    const match = text.match(
        /([\d.]+)\s*km/i
    );

    if (!match) {
        return null;
    }

    const distance = Number(match[1]);

    return Number.isFinite(distance)
        ? distance
        : null;
}


/* =========================================================
   PARSE DURATION
========================================================= */

function parseDuration(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    if (typeof value === "number") {
        return value;
    }

    const text = String(value)
        .toLowerCase()
        .trim();

    let minutes = 0;

    const hourMatch = text.match(
        /(\d+(?:\.\d+)?)\s*(?:hr|hrs|hour|hours)/i
    );

    const minuteMatch = text.match(
        /(\d+)\s*(?:min|mins|minute|minutes)/i
    );

    if (hourMatch) {

        minutes +=
            Number(hourMatch[1]) * 60;

    }

    if (minuteMatch) {

        minutes +=
            Number(minuteMatch[1]);

    }

    if (
        minutes > 0 &&
        Number.isFinite(minutes)
    ) {
        return minutes;
    }

    const simpleNumber = Number(text);

    return Number.isFinite(simpleNumber)
        ? simpleNumber
        : null;
}


/* =========================================================
   WEATHER CARD
========================================================= */

function WeatherOption({
    icon,
    label,
    description,
    selected,
    onClick
}) {

    return (

        <button
            type="button"
            onClick={onClick}
            className={`
                min-h-[125px]
                w-full
                rounded-2xl
                border
                px-5
                py-6
                transition-all
                duration-200

                flex
                flex-col
                items-center
                justify-center
                gap-3

                ${
                    selected
                        ? `
                            border-blue-500
                            bg-blue-500/10
                            text-blue-400
                            shadow-lg
                            shadow-blue-950/20
                        `
                        : `
                            border-slate-700
                            bg-slate-800/60
                            text-slate-400
                            hover:border-slate-600
                            hover:bg-slate-800
                            hover:text-slate-200
                        `
                }
            `}
        >

            <span className="text-2xl">
                {icon}
            </span>

            <span className="text-sm font-semibold">
                {label}
            </span>

            <span className="text-[11px] text-slate-500">
                {description}
            </span>

        </button>

    );
}


/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
    icon,
    label,
    value,
    subtitle
}) {

    return (

        <div
            className="
                min-h-[160px]
                rounded-2xl
                border
                border-slate-700
                bg-slate-950/70
                p-7
            "
        >

            <div
                className="
                    flex
                    items-center
                    gap-4
                "
            >

                <div
                    className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-500/10
                        text-blue-400
                    "
                >
                    {icon}
                </div>

                <p
                    className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-slate-500
                    "
                >
                    {label}
                </p>

            </div>

            <p
                className="
                    mt-7
                    text-2xl
                    font-semibold
                    text-white
                "
            >
                {value}
            </p>

            {subtitle && (

                <p
                    className="
                        mt-3
                        text-xs
                        leading-5
                        text-slate-500
                    "
                >
                    {subtitle}
                </p>

            )}

        </div>

    );
}


/* =========================================================
   SECTION CARD
========================================================= */

function InfoCard({
    title,
    subtitle,
    children
}) {

    return (

        <section
            className="
                rounded-3xl
                border
                border-slate-700
                bg-slate-900/90
                p-7
                sm:p-8
            "
        >

            <div className="mb-7">

                <h2
                    className="
                        text-lg
                        font-semibold
                        text-white
                    "
                >
                    {title}
                </h2>

                {subtitle && (

                    <p
                        className="
                            mt-3
                            max-w-2xl
                            text-sm
                            leading-7
                            text-slate-400
                        "
                    >
                        {subtitle}
                    </p>

                )}

            </div>

            {children}

        </section>

    );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

function Prediction() {

    const location = useLocation();

    const navigate = useNavigate();


    /* =====================================================
       ROUTE DATA
    ===================================================== */

    const selectedRoute = useMemo(() => {

        if (location.state) {
            return location.state;
        }

        const savedRoute =
            localStorage.getItem(
                "trafficvision_selected_route"
            );

        if (!savedRoute) {
            return null;
        }

        try {

            return JSON.parse(savedRoute);

        } catch (error) {

            console.error(
                "Unable to load selected route:",
                error
            );

            return null;

        }

    }, [location.state]);


    /* =====================================================
       WEATHER
    ===================================================== */

    const [weather, setWeather] =
        useState("Clear");


    /* =====================================================
       PREDICTION
    ===================================================== */

    const [prediction, setPrediction] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [predictionError, setPredictionError] =
        useState("");


    /* =====================================================
       CURRENT DATE / TIME
    ===================================================== */

    const currentDateTime = useMemo(() => {

        const now = new Date();

        return {

            date:
                now.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                ),

            time:
                now.toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                    }
                ),

            hour:
                now.getHours(),

            day:
                now.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "long"
                    }
                ),

            month:
                now.getMonth() + 1,

            year:
                now.getFullYear()

        };

    }, []);


    /* =====================================================
       SOURCE / DESTINATION
    ===================================================== */

    const sourceName =
        selectedRoute?.sourceName ||
        selectedRoute?.source?.name ||
        selectedRoute?.source?.label ||
        "Source";


    const destinationName =
        selectedRoute?.destinationName ||
        selectedRoute?.destination?.name ||
        selectedRoute?.destination?.label ||
        "Destination";


    const routeIndex =
        Number(
            selectedRoute?.routeIndex ?? 0
        );


    const routeName =
        selectedRoute?.routeName ||
        (
            routeIndex === 0
                ? "Recommended Route"
                : "Alternative Route"
        );


    /* =====================================================
       DISTANCE
    ===================================================== */

    const routeDistanceKm = useMemo(() => {

        const summaryDistance =
            selectedRoute
                ?.route
                ?.properties
                ?.summary
                ?.distance;

        if (
            summaryDistance !== undefined &&
            summaryDistance !== null
        ) {

            const distance =
                Number(summaryDistance) / 1000;

            if (Number.isFinite(distance)) {
                return distance;
            }

        }

        return parseDistance(
            selectedRoute?.distance
        );

    }, [selectedRoute]);


    /* =====================================================
       DURATION
    ===================================================== */

    const routeDurationMinutes = useMemo(() => {

        const summaryDuration =
            selectedRoute
                ?.route
                ?.properties
                ?.summary
                ?.duration;

        if (
            summaryDuration !== undefined &&
            summaryDuration !== null
        ) {

            const duration =
                Number(summaryDuration) / 60;

            if (Number.isFinite(duration)) {
                return Math.round(duration);
            }

        }

        return Math.round(
            parseDuration(
                selectedRoute?.duration ||
                selectedRoute?.eta
            ) || 0
        );

    }, [selectedRoute]);


    /* =====================================================
       DISPLAY VALUES
    ===================================================== */

    const distanceText =
        routeDistanceKm
            ? `${routeDistanceKm.toFixed(1)} km`
            : (
                selectedRoute?.distance ||
                "—"
            );


    const durationText =
        routeDurationMinutes
            ? `${routeDurationMinutes} min`
            : (
                selectedRoute?.duration ||
                selectedRoute?.eta ||
                "—"
            );


    /* =====================================================
       LOCATION DETAILS
    ===================================================== */

    const sourceDetails =
        useMemo(
            () =>
                findLocationDetails(
                    sourceName
                ),
            [sourceName]
        );


    const destinationDetails =
        useMemo(
            () =>
                findLocationDetails(
                    destinationName
                ),
            [destinationName]
        );


    /* =====================================================
       PEAK HOUR
    ===================================================== */

    const isPeakHour =
        (
            currentDateTime.hour >= 7 &&
            currentDateTime.hour < 10
        ) ||
        (
            currentDateTime.hour >= 17 &&
            currentDateTime.hour < 21
        );


    /* =====================================================
       PREDICTION REQUEST
    ===================================================== */

    const handlePredict = async () => {

        if (!selectedRoute) {
            return;
        }

        setLoading(true);

        setPrediction(null);

        setPredictionError("");

        try {

            const response =
                await api.post(
                    "/prediction",
                    {

                        city:
                            sourceDetails?.city ||
                            destinationDetails?.city ||
                            "Bhopal",

                        state:
                            sourceDetails?.state ||
                            destinationDetails?.state ||
                            "Madhya Pradesh",

                        source:
                            sourceName,

                        destination:
                            destinationName,

                        route_distance_km:
                            routeDistanceKm,

                        route_duration_minutes:
                            routeDurationMinutes,

                        route_index:
                            routeIndex,


                        /* TIME */

                        hour:
                            currentDateTime.hour,

                        day_of_week:
                            currentDateTime.day,

                        is_weekend:
                            currentDateTime.day ===
                                "Saturday" ||
                            currentDateTime.day ===
                                "Sunday",


                        /* ROAD */

                        road_type:
                            "City Road",

                        lanes:
                            2,

                        traffic_signal:
                            true,


                        /* WEATHER */

                        weather:
                            weather,

                        visibility:
                            weather === "Fog"
                                ? "Poor"
                                : "Good",

                        temperature:
                            30,


                        /* MODEL REQUIRED FIELDS */

                        traffic_density:
                            isPeakHour
                                ? "High"
                                : "Low",

                        cause:
                            "None",

                        vehicles_involved:
                            0,

                        casualties:
                            0,

                        is_peak_hour:
                            isPeakHour,

                        festival:
                            "None"

                    }
                );


            setPrediction(
                response.data
            );

        } catch (error) {

            console.error(
                "Prediction failed:",
                error
            );

            const detail =
                error
                    ?.response
                    ?.data
                    ?.detail;

            setPredictionError(
                detail ||
                "Unable to generate traffic prediction. Please check that the backend prediction service is running."
            );

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       NO ROUTE
    ===================================================== */

    if (!selectedRoute) {

        return (

            <DashboardLayout>

                <div
                    className="
                        flex
                        min-h-[calc(100vh-120px)]
                        w-full
                        items-center
                        justify-center
                        px-5
                        py-16
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-xl
                            rounded-3xl
                            border
                            border-slate-700
                            bg-slate-900
                            p-10
                            text-center
                        "
                    >

                        <div
                            className="
                                mx-auto
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                bg-blue-500/10
                                text-blue-400
                            "
                        >

                            <FaRoute size={26} />

                        </div>


                        <p
                            className="
                                mt-7
                                text-xs
                                font-semibold
                                uppercase
                                tracking-[0.18em]
                                text-blue-400
                            "
                        >
                            Traffic Intelligence
                        </p>


                        <h2
                            className="
                                mt-4
                                text-2xl
                                font-semibold
                                text-white
                            "
                        >
                            No Route Selected
                        </h2>


                        <p
                            className="
                                mx-auto
                                mt-4
                                max-w-md
                                text-sm
                                leading-7
                                text-slate-400
                            "
                        >
                            Select a route from Maps &
                            Routes before running the
                            traffic prediction.
                        </p>


                        <button
                            type="button"
                            onClick={() =>
                                navigate("/maps")
                            }
                            className="
                                mt-9
                                inline-flex
                                min-h-[50px]
                                items-center
                                gap-3
                                rounded-xl
                                bg-blue-600
                                px-7
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-blue-500
                            "
                        >

                            <FaRoute />

                            Back to Maps

                        </button>

                    </div>

                </div>

            </DashboardLayout>

        );
    }


    /* =====================================================
       MAIN PAGE
    ===================================================== */

    return (

        <DashboardLayout>

            <div
                className="
                    w-full
                    pb-16
                    pt-6
                    sm:pb-20
                    sm:pt-8
                "
            >

                {/* =================================================
                   HEADER
                ================================================= */}

                <header
                    className="
                        mb-10
                        flex
                        flex-col
                        gap-6
                        xl:flex-row
                        xl:items-end
                        xl:justify-between
                    "
                >

                    <div>

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <FaChartLine
                                className="
                                    text-blue-400
                                "
                            />

                            <span
                                className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-[0.18em]
                                    text-blue-400
                                "
                            >
                                Traffic Intelligence
                            </span>

                        </div>


                        <h1
                            className="
                                mt-4
                                text-3xl
                                font-semibold
                                tracking-tight
                                text-white
                                sm:text-4xl
                            "
                        >
                            Traffic Prediction
                        </h1>


                        <p
                            className="
                                mt-4
                                max-w-2xl
                                text-sm
                                leading-7
                                text-slate-400
                            "
                        >
                            Analyze expected traffic conditions
                            and risk for your selected route
                            using the current travel time and
                            weather conditions.
                        </p>

                    </div>


                    <div
                        className="
                            flex
                            w-fit
                            items-center
                            gap-3
                            rounded-full
                            border
                            border-emerald-500/20
                            bg-emerald-500/5
                            px-5
                            py-3
                            text-xs
                            text-slate-300
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

                        Prediction System Ready

                    </div>

                </header>


                {/* =================================================
                   SELECTED ROUTE
                ================================================= */}

                <section
                    className="
                        mb-10
                        rounded-3xl
                        border
                        border-slate-700
                        bg-slate-900
                        p-8
                        shadow-xl
                        shadow-slate-950/20
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-8
                            xl:flex-row
                            xl:items-center
                            xl:justify-between
                        "
                    >

                        <div className="min-w-0">

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-4
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-500/10
                                        text-blue-400
                                    "
                                >

                                    <FaRoute />

                                </div>


                                <div>

                                    <p
                                        className="
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-[0.16em]
                                            text-blue-400
                                        "
                                    >
                                        Selected Route
                                    </p>


                                    <p
                                        className="
                                            mt-2
                                            text-xs
                                            text-slate-500
                                        "
                                    >
                                        Selected from Maps &
                                        Routes
                                    </p>

                                </div>

                            </div>


                            <div
                                className="
                                    mt-8
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-5
                                "
                            >

                                <span
                                    className="
                                        text-2xl
                                        font-semibold
                                        text-white
                                        sm:text-3xl
                                    "
                                >
                                    {sourceName}
                                </span>


                                <FaArrowRight
                                    className="
                                        text-blue-500
                                    "
                                />


                                <span
                                    className="
                                        text-2xl
                                        font-semibold
                                        text-white
                                        sm:text-3xl
                                    "
                                >
                                    {destinationName}
                                </span>

                            </div>


                            <div
                                className="
                                    mt-6
                                    flex
                                    flex-wrap
                                    gap-3
                                "
                            >

                                <span
                                    className="
                                        rounded-full
                                        bg-emerald-500/10
                                        px-4
                                        py-2
                                        text-xs
                                        font-semibold
                                        text-emerald-400
                                    "
                                >
                                    {routeName}
                                </span>


                                <span
                                    className="
                                        rounded-full
                                        bg-slate-800
                                        px-4
                                        py-2
                                        text-xs
                                        text-slate-300
                                    "
                                >
                                    Route {routeIndex + 1}
                                </span>

                            </div>

                        </div>


                        <div
                            className="
                                grid
                                w-full
                                grid-cols-2
                                gap-5
                                xl:w-[370px]
                            "
                        >

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-700
                                    bg-slate-800/70
                                    p-6
                                "
                            >

                                <p
                                    className="
                                        text-[11px]
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    "
                                >
                                    Distance
                                </p>


                                <p
                                    className="
                                        mt-4
                                        text-xl
                                        font-semibold
                                        text-white
                                    "
                                >
                                    {distanceText}
                                </p>

                            </div>


                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-700
                                    bg-slate-800/70
                                    p-6
                                "
                            >

                                <p
                                    className="
                                        text-[11px]
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        text-slate-500
                                    "
                                >
                                    ETA
                                </p>


                                <p
                                    className="
                                        mt-4
                                        text-xl
                                        font-semibold
                                        text-white
                                    "
                                >
                                    {durationText}
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                   CONTEXT
                ================================================= */}

                <div
                    className="
                        mb-10
                        grid
                        gap-7
                        xl:grid-cols-[0.85fr_1.15fr]
                    "
                >

                    {/* DATE / TIME */}

                    <InfoCard
                        title="Prediction Context"
                        subtitle="The system automatically uses the current date and time."
                    >

                        <div
                            className="
                                grid
                                gap-5
                                sm:grid-cols-2
                            "
                        >

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-700
                                    bg-slate-800/60
                                    p-6
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        text-slate-500
                                    "
                                >

                                    <FaCalendarAlt />

                                    <span
                                        className="
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wider
                                        "
                                    >
                                        Current Date
                                    </span>

                                </div>


                                <p
                                    className="
                                        mt-5
                                        text-lg
                                        font-semibold
                                        text-white
                                    "
                                >
                                    {currentDateTime.date}
                                </p>


                                <p
                                    className="
                                        mt-3
                                        text-xs
                                        text-slate-500
                                    "
                                >
                                    Automatically detected
                                </p>

                            </div>


                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-700
                                    bg-slate-800/60
                                    p-6
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        text-slate-500
                                    "
                                >

                                    <FaClock />

                                    <span
                                        className="
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-wider
                                        "
                                    >
                                        Current Time
                                    </span>

                                </div>


                                <p
                                    className="
                                        mt-5
                                        text-lg
                                        font-semibold
                                        text-white
                                    "
                                >
                                    {currentDateTime.time}
                                </p>


                                <p
                                    className="
                                        mt-3
                                        text-xs
                                        text-slate-500
                                    "
                                >
                                    Prediction time
                                </p>

                            </div>

                        </div>

                    </InfoCard>


                    {/* WEATHER */}

                    <InfoCard
                        title="Weather Conditions"
                        subtitle="Select the current weather condition before running prediction."
                    >

                        <div
                            className="
                                grid
                                grid-cols-2
                                gap-5
                                lg:grid-cols-4
                            "
                        >

                            <WeatherOption
                                icon={<FaSun />}
                                label="Clear"
                                description="Clear sky"
                                selected={
                                    weather === "Clear"
                                }
                                onClick={() =>
                                    setWeather("Clear")
                                }
                            />


                            <WeatherOption
                                icon={<FaCloud />}
                                label="Cloudy"
                                description="Cloud cover"
                                selected={
                                    weather === "Cloudy"
                                }
                                onClick={() =>
                                    setWeather("Cloudy")
                                }
                            />


                            <WeatherOption
                                icon={<FaCloudRain />}
                                label="Rain"
                                description="Rainfall"
                                selected={
                                    weather === "Rain"
                                }
                                onClick={() =>
                                    setWeather("Rain")
                                }
                            />


                            <WeatherOption
                                icon={<FaSmog />}
                                label="Fog"
                                description="Low visibility"
                                selected={
                                    weather === "Fog"
                                }
                                onClick={() =>
                                    setWeather("Fog")
                                }
                            />

                        </div>

                    </InfoCard>

                </div>


                {/* =================================================
                   PREDICT BUTTON
                ================================================= */}

                <section
                    className="
                        mb-10
                        rounded-3xl
                        border
                        border-blue-500/20
                        bg-blue-600/5
                        p-8
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-7
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >

                        <div
                            className="
                                flex
                                items-start
                                gap-5
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-12
                                    w-12
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-500/10
                                    text-blue-400
                                "
                            >

                                <FaChartLine />

                            </div>


                            <div>

                                <h2
                                    className="
                                        text-lg
                                        font-semibold
                                        text-white
                                    "
                                >
                                    Ready to Analyze This Route?
                                </h2>


                                <p
                                    className="
                                        mt-3
                                        max-w-2xl
                                        text-sm
                                        leading-7
                                        text-slate-400
                                    "
                                >
                                    The system will use the
                                    selected route, current
                                    time and weather to
                                    generate the traffic
                                    prediction.
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={handlePredict}
                            disabled={loading}
                            className="
                                flex
                                min-h-[56px]
                                w-full
                                items-center
                                justify-center
                                gap-3
                                rounded-xl
                                bg-blue-600
                                px-8
                                py-4
                                text-sm
                                font-semibold
                                text-white
                                shadow-lg
                                shadow-blue-950/20
                                transition
                                hover:bg-blue-500
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                lg:w-auto
                                lg:min-w-[260px]
                            "
                        >

                            {loading ? (

                                <>
                                    <span
                                        className="
                                            h-4
                                            w-4
                                            animate-spin
                                            rounded-full
                                            border-2
                                            border-white/30
                                            border-t-white
                                        "
                                    />

                                    Analyzing Route...
                                </>

                            ) : (

                                <>
                                    <FaChartLine />

                                    Predict Traffic Risk
                                </>

                            )}

                        </button>

                    </div>

                </section>


                {/* =================================================
                   ERROR
                ================================================= */}

                {predictionError && (

                    <section
                        className="
                            mb-10
                            rounded-3xl
                            border
                            border-amber-500/20
                            bg-amber-500/5
                            p-7
                        "
                    >

                        <div
                            className="
                                flex
                                items-start
                                gap-5
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-amber-500/10
                                    text-amber-400
                                "
                            >

                                <FaExclamationTriangle />

                            </div>


                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-white
                                    "
                                >
                                    Prediction service error
                                </p>


                                <p
                                    className="
                                        mt-3
                                        max-w-3xl
                                        text-sm
                                        leading-7
                                        text-slate-400
                                    "
                                >
                                    {predictionError}
                                </p>

                            </div>

                        </div>

                    </section>

                )}


                {/* =================================================
                   RESULTS
                ================================================= */}

                {prediction && (

                    <div
                        className="
                            flex
                            flex-col
                            gap-10
                        "
                    >

                        {/* =================================================
                           RESULT OVERVIEW
                        ================================================= */}

                        <section
                            className="
                                rounded-3xl
                                border
                                border-slate-700
                                bg-slate-900
                                p-8
                                shadow-xl
                                shadow-slate-950/20
                            "
                        >

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-5
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            text-xs
                                            font-semibold
                                            uppercase
                                            tracking-[0.16em]
                                            text-blue-400
                                        "
                                    >
                                        Prediction Result
                                    </p>


                                    <h2
                                        className="
                                            mt-4
                                            text-2xl
                                            font-semibold
                                            text-white
                                        "
                                    >
                                        Traffic Risk Analysis
                                    </h2>


                                    <p
                                        className="
                                            mt-3
                                            text-sm
                                            text-slate-400
                                        "
                                    >
                                        {sourceName}
                                        {" → "}
                                        {destinationName}
                                    </p>

                                </div>


                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-emerald-500/10
                                        text-emerald-400
                                    "
                                >

                                    <FaCheckCircle />

                                </div>

                            </div>


                            <div
                                className="
                                    mt-8
                                    grid
                                    gap-6
                                    md:grid-cols-3
                                "
                            >

                                <MetricCard
                                    icon={<FaShieldAlt />}
                                    label="Severity"
                                    value={
                                        prediction
                                            .predicted_severity ||
                                        "—"
                                    }
                                    subtitle="Predicted severity"
                                />


                                <MetricCard
                                    icon={<FaRoute />}
                                    label="Traffic Condition"
                                    value={
                                        prediction
                                            .traffic_status ||
                                        "—"
                                    }
                                    subtitle="Expected route condition"
                                />


                                <MetricCard
                                    icon={<FaChartLine />}
                                    label="Risk Score"
                                    value={
                                        `${Math.round(
                                            Number(
                                                prediction
                                                    .predicted_risk_score ||
                                                0
                                            ) * 100
                                        )}%`
                                    }
                                    subtitle="Model risk probability"
                                />

                            </div>

                        </section>


                        {/* =================================================
                           CONGESTION + TRAVEL IMPACT
                        ================================================= */}

                        <div
                            className="
                                grid
                                gap-7
                                lg:grid-cols-2
                            "
                        >

                            <InfoCard
                                title="Congestion Forecast"
                                subtitle="Expected traffic condition for the selected route."
                            >

                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-slate-700
                                        bg-slate-800/60
                                        p-6
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-end
                                            justify-between
                                            gap-5
                                        "
                                    >

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-slate-500
                                                "
                                            >
                                                Traffic Condition
                                            </p>


                                            <p
                                                className="
                                                    mt-3
                                                    text-2xl
                                                    font-semibold
                                                    text-white
                                                "
                                            >
                                                {
                                                    prediction
                                                        .traffic_status ||
                                                    "—"
                                                }
                                            </p>

                                        </div>


                                        <p
                                            className="
                                                text-xl
                                                font-semibold
                                                text-blue-400
                                            "
                                        >
                                            {
                                                Math.round(
                                                    Number(
                                                        prediction
                                                            .predicted_risk_score ||
                                                        0
                                                    ) * 100
                                                )
                                            }%
                                        </p>

                                    </div>


                                    <div
                                        className="
                                            mt-7
                                            h-3
                                            overflow-hidden
                                            rounded-full
                                            bg-slate-800
                                        "
                                    >

                                        <div
                                            className="
                                                h-full
                                                rounded-full
                                                bg-blue-500
                                                transition-all
                                            "
                                            style={{
                                                width:
                                                    `${Math.min(
                                                        100,
                                                        Math.max(
                                                            0,
                                                            Number(
                                                                prediction
                                                                    .predicted_risk_score ||
                                                                0
                                                            ) * 100
                                                        )
                                                    )}%`
                                            }}
                                        />

                                    </div>


                                    <div
                                        className="
                                            mt-3
                                            flex
                                            justify-between
                                            text-xs
                                            text-slate-500
                                        "
                                    >

                                        <span>
                                            Low
                                        </span>

                                        <span>
                                            High
                                        </span>

                                    </div>

                                </div>

                            </InfoCard>


                            <InfoCard
                                title="Travel Impact"
                                subtitle="Expected effect of predicted traffic on your journey."
                            >

                                <div
                                    className="
                                        grid
                                        gap-5
                                        sm:grid-cols-2
                                    "
                                >

                                    <div
                                        className="
                                            rounded-2xl
                                            border
                                            border-slate-700
                                            bg-slate-800/60
                                            p-6
                                        "
                                    >

                                        <p
                                            className="
                                                text-[11px]
                                                font-semibold
                                                uppercase
                                                tracking-wider
                                                text-slate-500
                                            "
                                        >
                                            Normal ETA
                                        </p>


                                        <p
                                            className="
                                                mt-5
                                                text-xl
                                                font-semibold
                                                text-white
                                            "
                                        >
                                            {durationText}
                                        </p>

                                    </div>


                                    <div
                                        className="
                                            rounded-2xl
                                            border
                                            border-slate-700
                                            bg-slate-800/60
                                            p-6
                                        "
                                    >

                                        <p
                                            className="
                                                text-[11px]
                                                font-semibold
                                                uppercase
                                                tracking-wider
                                                text-slate-500
                                            "
                                        >
                                            Estimated Delay
                                        </p>


                                        <p
                                            className="
                                                mt-5
                                                text-xl
                                                font-semibold
                                                text-white
                                            "
                                        >
                                            +
                                            {
                                                prediction
                                                    .estimated_delay_minutes ??
                                                0
                                            }
                                            {" min"}
                                        </p>

                                    </div>

                                </div>

                            </InfoCard>

                        </div>


                        {/* =================================================
                           PEAK HOUR
                        ================================================= */}

                        <InfoCard
                            title="Peak-Hour Insight"
                            subtitle="Peak-hour status is automatically calculated from the current time."
                        >

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-6
                                    rounded-2xl
                                    border
                                    border-slate-700
                                    bg-slate-800/60
                                    p-7
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-5
                                    "
                                >

                                    <div
                                        className={`
                                            flex
                                            h-12
                                            w-12
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl

                                            ${
                                                isPeakHour
                                                    ? "bg-amber-500/10 text-amber-400"
                                                    : "bg-emerald-500/10 text-emerald-400"
                                            }
                                        `}
                                    >

                                        <FaClock />

                                    </div>


                                    <div>

                                        <p
                                            className="
                                                text-lg
                                                font-semibold
                                                text-white
                                            "
                                        >
                                            {
                                                isPeakHour
                                                    ? "Peak Hour"
                                                    : "Off Peak"
                                            }
                                        </p>


                                        <p
                                            className="
                                                mt-2
                                                text-sm
                                                text-slate-500
                                            "
                                        >
                                            Current time:
                                            {" "}
                                            {currentDateTime.time}
                                        </p>

                                    </div>

                                </div>


                                <span
                                    className={`
                                        w-fit
                                        rounded-full
                                        px-5
                                        py-2.5
                                        text-xs
                                        font-semibold

                                        ${
                                            isPeakHour
                                                ? "bg-amber-500/10 text-amber-400"
                                                : "bg-emerald-500/10 text-emerald-400"
                                        }
                                    `}
                                >

                                    {
                                        isPeakHour
                                            ? "Higher traffic expected"
                                            : "Normal traffic period"
                                    }

                                </span>

                            </div>

                        </InfoCard>


                        {/* =================================================
                           SMART RECOMMENDATION
                        ================================================= */}

                        <InfoCard
                            title="Smart Recommendation"
                            subtitle="Actionable guidance generated from the traffic prediction."
                        >

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-6
                                    rounded-2xl
                                    border
                                    border-blue-500/20
                                    bg-blue-500/5
                                    p-7
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-start
                                        gap-5
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            h-12
                                            w-12
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-blue-500/10
                                            text-blue-400
                                        "
                                    >

                                        <FaCheckCircle />

                                    </div>


                                    <div>

                                        <p
                                            className="
                                                text-base
                                                font-semibold
                                                text-white
                                            "
                                        >
                                            Route Intelligence
                                        </p>


                                        <p
                                            className="
                                                mt-3
                                                max-w-4xl
                                                text-sm
                                                leading-7
                                                text-slate-400
                                            "
                                        >
                                            {
                                                prediction
                                                    .recommendation ||
                                                "No recommendation available."
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </InfoCard>


                        {/* =================================================
                           SUMMARY
                        ================================================= */}

                        <InfoCard
                            title="Prediction Summary"
                            subtitle="Quick overview of the completed traffic analysis."
                        >

                            <div
                                className="
                                    grid
                                    gap-6
                                    sm:grid-cols-2
                                    lg:grid-cols-3
                                "
                            >

                                <MetricCard
                                    icon={<FaShieldAlt />}
                                    label="Severity"
                                    value={
                                        prediction
                                            .predicted_severity ||
                                        "—"
                                    }
                                />


                                <MetricCard
                                    icon={<FaChartLine />}
                                    label="Risk"
                                    value={
                                        `${Math.round(
                                            Number(
                                                prediction
                                                    .predicted_risk_score ||
                                                0
                                            ) * 100
                                        )}%`
                                    }
                                />


                                <MetricCard
                                    icon={<FaCheckCircle />}
                                    label="Confidence"
                                    value={
                                        prediction.confidence !==
                                        undefined
                                            ? `${prediction.confidence}%`
                                            : "—"
                                    }
                                />

                            </div>

                        </InfoCard>

                    </div>

                )}

            </div>

        </DashboardLayout>

    );
}


export default Prediction;