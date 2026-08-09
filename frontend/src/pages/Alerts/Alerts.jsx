import { useEffect, useMemo, useState } from "react";

import {
    FaBell,
    FaCarCrash,
    FaTrafficLight,
    FaRoute,
    FaAmbulance,
    FaSyncAlt,
    FaMapMarkerAlt,
    FaClock,
    FaExclamationTriangle,
    FaCheckCircle
} from "react-icons/fa";

import DashboardLayout from "../../components/layout/DashboardLayout";

import api from "../../services/api";


function Alerts() {

    const [alerts, setAlerts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [filter, setFilter] = useState("all");

    const [selectedId, setSelectedId] = useState(null);


    /*
     * =========================================================
     * LOAD ALERTS ON PAGE LOAD
     *
     * Important:
     * We do NOT call setState before the async request.
     * This avoids the React cascading-render warning.
     * =========================================================
     */

    useEffect(() => {

        let cancelled = false;


        async function fetchAlerts() {

            try {

                const response = await api.get(
                    "/alerts/active"
                );


                if (cancelled) {
                    return;
                }


                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : [];


                setAlerts(data);

                setError("");


            } catch (err) {

                if (cancelled) {
                    return;
                }


                console.error(
                    "Alert loading error:",
                    err
                );


                setError(
                    "Unable to load traffic alerts."
                );


            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }


        fetchAlerts();


        return () => {

            cancelled = true;

        };

    }, []);


    /*
     * =========================================================
     * MANUAL REFRESH
     * =========================================================
     */

    async function loadAlerts() {

        try {

            setLoading(true);

            setError("");


            const response = await api.get(
                "/alerts/active"
            );


            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            setAlerts(data);


        } catch (err) {

            console.error(
                "Alert loading error:",
                err
            );


            setError(
                "Unable to load traffic alerts."
            );


        } finally {

            setLoading(false);

        }

    }


    /*
     * =========================================================
     * ALERT TYPE
     * =========================================================
     */

    function getAlertType(alert) {

        const value = String(
            alert.traffic_alert || ""
        ).toLowerCase();


        if (
            value.includes("accident")
        ) {

            return "accident";

        }


        if (
            value.includes("emergency")
        ) {

            return "emergency";

        }


        if (
            value.includes("route") ||
            value.includes("delay")
        ) {

            return "delay";

        }


        if (
            value.includes("congestion") ||
            value.includes("traffic")
        ) {

            return "congestion";

        }


        return "congestion";

    }


    /*
     * =========================================================
     * FILTERED ALERTS
     * =========================================================
     */

    const filteredAlerts = useMemo(() => {

        if (filter === "all") {

            return alerts;

        }


        return alerts.filter(
            alert =>
                getAlertType(alert) === filter
        );

    }, [
        alerts,
        filter
    ]);


    /*
     * =========================================================
     * SELECTED ALERT
     * =========================================================
     */

    const selectedAlert =
        filteredAlerts.find(
            alert =>
                alert.id === selectedId
        ) ||
        filteredAlerts[0] ||
        null;


    /*
     * =========================================================
     * COUNTS
     * =========================================================
     */

    const activeCount =
        alerts.length;


    const criticalCount =
        alerts.filter(
            alert =>
                String(
                    alert.emergency_level || ""
                ).toUpperCase() === "CRITICAL"
        ).length;


    const warningCount =
        alerts.filter(
            alert =>
                String(
                    alert.emergency_level || ""
                ).toUpperCase() !== "CRITICAL"
        ).length;


    const accidentCount =
        alerts.filter(
            alert =>
                getAlertType(alert) === "accident"
        ).length;


    const congestionCount =
        alerts.filter(
            alert =>
                getAlertType(alert) === "congestion"
        ).length;


    const delayCount =
        alerts.filter(
            alert =>
                getAlertType(alert) === "delay"
        ).length;


    const emergencyCount =
        alerts.filter(
            alert =>
                getAlertType(alert) === "emergency"
        ).length;


    /*
     * =========================================================
     * ICON
     * =========================================================
     */

    function getIcon(type) {

        switch (type) {

            case "accident":

                return <FaCarCrash />;


            case "congestion":

                return <FaTrafficLight />;


            case "delay":

                return <FaRoute />;


            case "emergency":

                return <FaAmbulance />;


            default:

                return <FaBell />;

        }

    }


    /*
     * =========================================================
     * TYPE NAME
     * =========================================================
     */

    function getTypeName(type) {

        switch (type) {

            case "accident":

                return "Accident";


            case "congestion":

                return "Congestion";


            case "delay":

                return "Route Delay";


            case "emergency":

                return "Emergency";


            default:

                return "Alert";

        }

    }


    /*
     * =========================================================
     * TYPE COLOR
     * =========================================================
     */

    function getTypeColor(type) {

        switch (type) {

            case "accident":

                return "text-red-400";


            case "congestion":

                return "text-amber-400";


            case "delay":

                return "text-blue-400";


            case "emergency":

                return "text-orange-400";


            default:

                return "text-slate-400";

        }

    }


    /*
     * =========================================================
     * TYPE BACKGROUND
     * =========================================================
     */

    function getTypeBg(type) {

        switch (type) {

            case "accident":

                return "bg-red-500/10";


            case "congestion":

                return "bg-amber-500/10";


            case "delay":

                return "bg-blue-500/10";


            case "emergency":

                return "bg-orange-500/10";


            default:

                return "bg-slate-800";

        }

    }


    /*
     * =========================================================
     * STATUS
     * =========================================================
     */

    function getStatus(alert) {

        const emergency =
            String(
                alert.emergency_level || ""
            ).toUpperCase();


        if (
            emergency === "CRITICAL"
        ) {

            return "CRITICAL";

        }


        return "WARNING";

    }


    /*
     * =========================================================
     * FORMAT DATABASE TIMESTAMP
     *
     * No Date.now()
     * No state
     * No effect
     * =========================================================
     */

    function formatTime(value) {

        if (!value) {

            return "Time unavailable";

        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Time unavailable";

        }


        return date.toLocaleString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (

        <DashboardLayout>

            <div
                className="
                    w-full

                    pt-6
                    pb-16

                    sm:pt-8
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        mb-9

                        flex
                        flex-col
                        gap-5

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

                            <div
                                className="
                                    flex
                                    h-9
                                    w-9

                                    items-center
                                    justify-center

                                    rounded-lg

                                    bg-blue-500/10

                                    text-blue-400
                                "
                            >

                                <FaBell />

                            </div>


                            <span
                                className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-[0.16em]

                                    text-blue-400
                                "
                            >
                                Alert Center
                            </span>

                        </div>


                        <h1
                            className="
                                mt-4

                                text-3xl
                                font-semibold

                                text-white
                            "
                        >
                            Traffic Alerts
                        </h1>


                        <p
                            className="
                                mt-2

                                text-sm

                                text-slate-400
                            "
                        >
                            Monitor traffic incidents,
                            route delays and emergency
                            conditions.
                        </p>

                    </div>


                    <div
                        className="
                            flex
                            items-center
                            gap-4
                        "
                    >

                        <span
                            className="
                                flex
                                items-center
                                gap-2

                                text-sm

                                text-emerald-400
                            "
                        >

                            <span
                                className="
                                    h-2
                                    w-2

                                    rounded-full

                                    bg-emerald-400
                                "
                            />

                            Monitoring

                        </span>


                        <button
                            type="button"

                            onClick={
                                loadAlerts
                            }

                            className="
                                flex
                                items-center
                                gap-2

                                rounded-lg

                                border
                                border-slate-700

                                bg-slate-900

                                px-4
                                py-2

                                text-xs
                                font-medium

                                text-slate-300

                                transition

                                hover:border-slate-600
                                hover:text-white
                            "
                        >

                            <FaSyncAlt />

                            Refresh

                        </button>

                    </div>

                </div>


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div
                    className="
                        mb-10

                        grid
                        grid-cols-2
                        lg:grid-cols-4

                        gap-px

                        overflow-hidden

                        rounded-2xl

                        border
                        border-slate-800

                        bg-slate-800
                    "
                >

                    <Summary
                        icon={
                            <FaBell />
                        }

                        label="Active Alerts"

                        value={
                            activeCount
                        }

                        color="text-blue-400"
                    />


                    <Summary
                        icon={
                            <FaExclamationTriangle />
                        }

                        label="Critical"

                        value={
                            criticalCount
                        }

                        color="text-red-400"
                    />


                    <Summary
                        icon={
                            <FaTrafficLight />
                        }

                        label="Warnings"

                        value={
                            warningCount
                        }

                        color="text-amber-400"
                    />


                    <Summary
                        icon={
                            <FaCheckCircle />
                        }

                        label="Resolved"

                        value={0}

                        color="text-emerald-400"
                    />

                </div>


                {/* =================================================
                    ACTIVE ALERTS HEADER
                ================================================= */}

                <div
                    className="
                        mb-5

                        flex
                        flex-col
                        gap-4

                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <div>

                        <h2
                            className="
                                text-lg
                                font-semibold

                                text-white
                            "
                        >
                            Active Alerts
                        </h2>


                        <p
                            className="
                                mt-1

                                text-xs

                                text-slate-500
                            "
                        >
                            Select an alert to inspect
                            its details.
                        </p>

                    </div>


                    <select
                        value={filter}

                        onChange={
                            event =>
                                setFilter(
                                    event.target.value
                                )
                        }

                        className="
                            w-fit

                            rounded-lg

                            border
                            border-slate-700

                            bg-slate-900

                            px-4
                            py-2

                            text-xs

                            text-slate-300

                            outline-none

                            focus:border-blue-500
                        "
                    >

                        <option value="all">
                            All Alerts
                        </option>

                        <option value="accident">
                            Accident
                        </option>

                        <option value="congestion">
                            Congestion
                        </option>

                        <option value="delay">
                            Route Delay
                        </option>

                        <option value="emergency">
                            Emergency
                        </option>

                    </select>

                </div>


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1

                        gap-6

                        xl:grid-cols-[1.55fr_0.85fr]
                    "
                >

                    {/* =================================================
                        ALERT LIST
                    ================================================= */}

                    <div
                        className="
                            overflow-hidden

                            rounded-2xl

                            border
                            border-slate-800

                            bg-slate-900
                        "
                    >

                        {loading && (

                            <div
                                className="
                                    flex
                                    min-h-[320px]

                                    items-center
                                    justify-center

                                    text-sm

                                    text-slate-500
                                "
                            >
                                Loading alerts...
                            </div>

                        )}


                        {!loading &&
                        error && (

                            <div
                                className="
                                    flex
                                    min-h-[320px]

                                    items-center
                                    justify-center
                                "
                            >

                                <div
                                    className="
                                        max-w-sm

                                        px-6

                                        text-center
                                    "
                                >

                                    <FaExclamationTriangle
                                        className="
                                            mx-auto

                                            text-xl

                                            text-red-400
                                        "
                                    />


                                    <p
                                        className="
                                            mt-4

                                            text-sm

                                            text-red-400
                                        "
                                    >
                                        {error}
                                    </p>


                                    <button
                                        type="button"

                                        onClick={
                                            loadAlerts
                                        }

                                        className="
                                            mt-4

                                            rounded-lg

                                            border
                                            border-slate-700

                                            px-4
                                            py-2

                                            text-xs

                                            text-blue-400

                                            hover:text-white
                                        "
                                    >
                                        Try Again
                                    </button>

                                </div>

                            </div>

                        )}


                        {!loading &&
                        !error &&
                        filteredAlerts.length === 0 && (

                            <div
                                className="
                                    flex
                                    min-h-[320px]

                                    items-center
                                    justify-center

                                    px-8
                                "
                            >

                                <div
                                    className="
                                        max-w-sm

                                        text-center
                                    "
                                >

                                    <div
                                        className="
                                            mx-auto

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


                                    <p
                                        className="
                                            mt-5

                                            text-sm
                                            font-medium

                                            text-white
                                        "
                                    >
                                        No active alerts
                                    </p>


                                    <p
                                        className="
                                            mt-2

                                            text-xs
                                            leading-6

                                            text-slate-500
                                        "
                                    >
                                        No traffic conditions
                                        currently require
                                        attention.
                                    </p>

                                </div>

                            </div>

                        )}


                        {!loading &&
                        !error &&
                        filteredAlerts.length > 0 && (

                            <div>

                                {filteredAlerts.map(
                                    alert => {

                                        const type =
                                            getAlertType(
                                                alert
                                            );


                                        const status =
                                            getStatus(
                                                alert
                                            );


                                        return (

                                            <button
                                                key={
                                                    alert.id
                                                }

                                                type="button"

                                                onClick={() =>
                                                    setSelectedId(
                                                        alert.id
                                                    )
                                                }

                                                className={`
                                                    w-full

                                                    border-b
                                                    border-slate-800

                                                    p-5

                                                    text-left

                                                    transition

                                                    last:border-b-0

                                                    hover:bg-slate-800/40

                                                    ${
                                                        selectedAlert?.id ===
                                                        alert.id
                                                            ? "bg-slate-800/50"
                                                            : ""
                                                    }
                                                `}
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        gap-4
                                                    "
                                                >

                                                    <div
                                                        className={`
                                                            flex
                                                            h-11
                                                            w-11
                                                            shrink-0

                                                            items-center
                                                            justify-center

                                                            rounded-xl

                                                            ${getTypeBg(
                                                                type
                                                            )}

                                                            ${getTypeColor(
                                                                type
                                                            )}
                                                        `}
                                                    >

                                                        {
                                                            getIcon(
                                                                type
                                                            )
                                                        }

                                                    </div>


                                                    <div
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                flex-col
                                                                gap-2

                                                                sm:flex-row
                                                                sm:items-center
                                                                sm:justify-between
                                                            "
                                                        >

                                                            <p
                                                                className="
                                                                    text-sm
                                                                    font-semibold

                                                                    text-white
                                                                "
                                                            >
                                                                {
                                                                    alert.traffic_alert
                                                                }
                                                            </p>


                                                            <span
                                                                className={`
                                                                    w-fit

                                                                    rounded-full

                                                                    px-2.5
                                                                    py-1

                                                                    text-[10px]
                                                                    font-semibold

                                                                    ${
                                                                        status ===
                                                                        "CRITICAL"
                                                                            ? "bg-red-500/10 text-red-400"
                                                                            : "bg-amber-500/10 text-amber-400"
                                                                    }
                                                                `}
                                                            >
                                                                {
                                                                    status
                                                                }
                                                            </span>

                                                        </div>


                                                        <p
                                                            className="
                                                                mt-2

                                                                text-xs
                                                                leading-5

                                                                text-slate-500
                                                            "
                                                        >
                                                            {
                                                                alert.recommendation
                                                            }
                                                        </p>


                                                        <div
                                                            className="
                                                                mt-4

                                                                flex
                                                                flex-wrap
                                                                gap-x-5
                                                                gap-y-2

                                                                text-[11px]

                                                                text-slate-500
                                                            "
                                                        >

                                                            <span
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                "
                                                            >

                                                                <FaMapMarkerAlt />

                                                                {
                                                                    alert.city
                                                                }

                                                                {
                                                                    alert.state
                                                                        ? `, ${alert.state}`
                                                                        : ""
                                                                }

                                                            </span>


                                                            <span
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                "
                                                            >

                                                                <FaClock />

                                                                {
                                                                    formatTime(
                                                                        alert.created_at
                                                                    )
                                                                }

                                                            </span>

                                                        </div>

                                                    </div>

                                                </div>

                                            </button>

                                        );

                                    }
                                )}

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        DETAILS
                    ================================================= */}

                    <div
                        className="
                            rounded-2xl

                            border
                            border-slate-800

                            bg-slate-900
                        "
                    >

                        {!selectedAlert ? (

                            <div
                                className="
                                    flex
                                    min-h-[320px]

                                    items-center
                                    justify-center

                                    px-6
                                "
                            >

                                <div
                                    className="
                                        text-center
                                    "
                                >

                                    <FaBell
                                        className="
                                            mx-auto

                                            text-xl

                                            text-slate-600
                                        "
                                    />


                                    <p
                                        className="
                                            mt-4

                                            text-sm

                                            text-slate-500
                                        "
                                    >
                                        Select an alert
                                        to view details.
                                    </p>

                                </div>

                            </div>

                        ) : (

                            <div>

                                <div
                                    className="
                                        border-b
                                        border-slate-800

                                        px-6
                                        py-5
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                        "
                                    >

                                        <span
                                            className="
                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide

                                                text-slate-500
                                            "
                                        >
                                            Alert Details
                                        </span>


                                        <span
                                            className={`
                                                rounded-full

                                                px-2.5
                                                py-1

                                                text-[10px]
                                                font-semibold

                                                ${
                                                    getStatus(
                                                        selectedAlert
                                                    ) ===
                                                    "CRITICAL"
                                                        ? "bg-red-500/10 text-red-400"
                                                        : "bg-amber-500/10 text-amber-400"
                                                }
                                            `}
                                        >
                                            {
                                                getStatus(
                                                    selectedAlert
                                                )
                                            }
                                        </span>

                                    </div>

                                </div>


                                <div
                                    className="
                                        p-6
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
                                            className={`
                                                flex
                                                h-12
                                                w-12

                                                items-center
                                                justify-center

                                                rounded-xl

                                                ${getTypeBg(
                                                    getAlertType(
                                                        selectedAlert
                                                    )
                                                )}

                                                ${getTypeColor(
                                                    getAlertType(
                                                        selectedAlert
                                                    )
                                                )}
                                            `}
                                        >

                                            {
                                                getIcon(
                                                    getAlertType(
                                                        selectedAlert
                                                    )
                                                )
                                            }

                                        </div>


                                        <div>

                                            <p
                                                className="
                                                    text-xs

                                                    text-slate-500
                                                "
                                            >
                                                {
                                                    getTypeName(
                                                        getAlertType(
                                                            selectedAlert
                                                        )
                                                    )
                                                }
                                            </p>


                                            <h3
                                                className="
                                                    mt-1

                                                    text-base
                                                    font-semibold

                                                    text-white
                                                "
                                            >
                                                {
                                                    selectedAlert.traffic_alert
                                                }
                                            </h3>

                                        </div>

                                    </div>


                                    <div
                                        className="
                                            mt-7

                                            space-y-5
                                        "
                                    >

                                        <Detail
                                            label="Location"
                                            value={
                                                selectedAlert.state
                                                    ? `${selectedAlert.city}, ${selectedAlert.state}`
                                                    : selectedAlert.city
                                            }
                                        />


                                        <Detail
                                            label="Risk Score"
                                            value={
                                                `${Math.round(
                                                    Number(
                                                        selectedAlert.predicted_risk_score ||
                                                        0
                                                    ) * 100
                                                )}%`
                                            }
                                        />


                                        <Detail
                                            label="Severity"
                                            value={
                                                selectedAlert.predicted_severity
                                            }
                                        />


                                        <Detail
                                            label="Emergency Level"
                                            value={
                                                selectedAlert.emergency_level
                                            }
                                        />


                                        <Detail
                                            label="Detected"
                                            value={
                                                formatTime(
                                                    selectedAlert.created_at
                                                )
                                            }
                                        />

                                    </div>


                                    <div
                                        className="
                                            mt-7

                                            border-t
                                            border-slate-800

                                            pt-6
                                        "
                                    >

                                        <p
                                            className="
                                                text-[10px]
                                                font-semibold
                                                uppercase
                                                tracking-wide

                                                text-slate-500
                                            "
                                        >
                                            Recommended Action
                                        </p>


                                        <p
                                            className="
                                                mt-3

                                                text-sm
                                                leading-6

                                                text-slate-300
                                            "
                                        >
                                            {
                                                selectedAlert.recommendation
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                </div>


                {/* =================================================
                    ALERT TYPES
                ================================================= */}

                <section
                    className="
                        mt-10
                    "
                >

                    <h2
                        className="
                            text-lg
                            font-semibold

                            text-white
                        "
                    >
                        Alert Types
                    </h2>


                    <p
                        className="
                            mt-1
                            mb-5

                            text-xs

                            text-slate-500
                        "
                    >
                        Current distribution of active
                        traffic alerts.
                    </p>


                    <div
                        className="
                            grid
                            grid-cols-2
                            lg:grid-cols-4

                            gap-4
                        "
                    >

                        <TypeCard
                            icon={
                                <FaCarCrash />
                            }

                            title="Accident"

                            value={
                                accidentCount
                            }

                            color="text-red-400"
                        />


                        <TypeCard
                            icon={
                                <FaTrafficLight />
                            }

                            title="Congestion"

                            value={
                                congestionCount
                            }

                            color="text-amber-400"
                        />


                        <TypeCard
                            icon={
                                <FaRoute />
                            }

                            title="Route Delay"

                            value={
                                delayCount
                            }

                            color="text-blue-400"
                        />


                        <TypeCard
                            icon={
                                <FaAmbulance />
                            }

                            title="Emergency"

                            value={
                                emergencyCount
                            }

                            color="text-orange-400"
                        />

                    </div>

                </section>

            </div>

        </DashboardLayout>

    );

}


/*
 * =============================================================
 * SUMMARY
 * =============================================================
 */

function Summary({
    icon,
    label,
    value,
    color
}) {

    return (

        <div
            className="
                bg-slate-900

                px-5
                py-6
            "
        >

            <div
                className={`
                    mb-4
                    ${color}
                `}
            >

                {icon}

            </div>


            <p
                className="
                    text-2xl
                    font-semibold

                    text-white
                "
            >

                {value}

            </p>


            <p
                className="
                    mt-1

                    text-xs

                    text-slate-500
                "
            >

                {label}

            </p>

        </div>

    );

}


/*
 * =============================================================
 * DETAIL
 * =============================================================
 */

function Detail({
    label,
    value
}) {

    return (

        <div>

            <p
                className="
                    text-[10px]
                    uppercase
                    tracking-wide

                    text-slate-600
                "
            >

                {label}

            </p>


            <p
                className="
                    mt-1

                    text-sm

                    text-slate-300
                "
            >

                {value || "—"}

            </p>

        </div>

    );

}


/*
 * =============================================================
 * TYPE CARD
 * =============================================================
 */

function TypeCard({
    icon,
    title,
    value,
    color
}) {

    return (

        <div
            className="
                flex
                items-center
                gap-4

                rounded-xl

                border
                border-slate-800

                bg-slate-900

                px-5
                py-5
            "
        >

            <div
                className={`
                    text-lg
                    ${color}
                `}
            >

                {icon}

            </div>


            <div>

                <p
                    className="
                        text-xs

                        text-slate-500
                    "
                >

                    {title}

                </p>


                <p
                    className="
                        mt-1

                        text-xl
                        font-semibold

                        text-white
                    "
                >

                    {value}

                </p>

            </div>

        </div>

    );

}


export default Alerts;