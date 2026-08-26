import {
    useEffect,
    useState
} from "react";

import {
    FaServer,
    FaDatabase,
    FaBrain,
    FaBell,
    FaTrafficLight,
    FaTools,
} from "react-icons/fa";

import DashboardLayout
    from "../../components/layout/DashboardLayout";

import SystemControlService
    from "../../services/systemControlService";


function SystemControls() {

    const [controls, setControls] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =====================================================
    // LOAD
    // =====================================================

    useEffect(() => {

        let cancelled = false;


        async function loadControls() {

            try {

                setError("");

                const data =
                    await SystemControlService
                        .getControls();


                if (!cancelled) {

                    setControls(data);

                }

            }
            catch (err) {

                console.error(err);

                if (!cancelled) {

                    setError(
                        err?.response?.data?.detail ||
                        "Unable to load system controls."
                    );

                }

            }
            finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }


        loadControls();


        return () => {

            cancelled = true;

        };

    }, []);


    // =====================================================
    // UPDATE
    // =====================================================

    async function handleToggle(
        field,
        value
    ) {

        if (!controls || saving) {
            return;
        }


        setSaving(true);

        setError("");

        setSuccess("");


        try {

            const updated =
                await SystemControlService
                    .updateControls({
                        [field]: value
                    });


            setControls(updated);

            setSuccess(
                "System control updated successfully."
            );


            setTimeout(() => {

                setSuccess("");

            }, 2500);

        }
        catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Unable to update system control."
            );

        }
        finally {

            setSaving(false);

        }

    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <DashboardLayout>

                <div
                    className="
                        flex
                        min-h-[70vh]
                        items-center
                        justify-center
                    "
                >

                    <div
                        className="
                            h-9
                            w-9
                            animate-spin
                            rounded-full
                            border-2
                            border-slate-200
                            border-t-blue-600

                            dark:border-slate-700
                            dark:border-t-blue-500
                        "
                    />

                </div>

            </DashboardLayout>

        );

    }


    return (

        <DashboardLayout>

            <div
                className="
                    mx-auto
                    w-full
                    max-w-6xl

                    px-5
                    py-8

                    sm:px-7

                    lg:px-10
                    lg:py-10
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <header
                    className="
                        mb-9

                        flex
                        flex-col
                        gap-5

                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                    "
                >

                    <div>

                        <p
                            className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-[0.18em]

                                text-blue-600

                                dark:text-blue-400
                            "
                        >
                            Administration
                        </p>


                        <h1
                            className="
                                mt-2

                                text-3xl
                                font-bold
                                tracking-tight

                                text-slate-900

                                dark:text-white
                            "
                        >
                            System Controls
                        </h1>


                        <p
                            className="
                                mt-2
                                max-w-2xl

                                text-sm
                                leading-6

                                text-slate-500

                                dark:text-slate-400
                            "
                        >
                            Manage the operational services
                            available across TrafficVisionAI.
                        </p>

                    </div>


                    <div
                        className="
                            inline-flex
                            items-center
                            gap-2

                            rounded-full

                            border
                            border-emerald-200

                            bg-emerald-50

                            px-3
                            py-1.5

                            text-xs
                            font-medium
                            text-emerald-700

                            dark:border-emerald-900/50
                            dark:bg-emerald-950/20
                            dark:text-emerald-400
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

                        Admin Control Center

                    </div>

                </header>


                {/* =================================================
                    MESSAGES
                ================================================= */}

                {error && (

                    <div
                        className="
                            mb-5

                            rounded-xl

                            border
                            border-red-200

                            bg-red-50

                            px-4
                            py-3

                            text-sm
                            text-red-700

                            dark:border-red-900/50
                            dark:bg-red-950/20
                            dark:text-red-400
                        "
                    >
                        {error}
                    </div>

                )}


                {success && (

                    <div
                        className="
                            mb-5

                            rounded-xl

                            border
                            border-emerald-200

                            bg-emerald-50

                            px-4
                            py-3

                            text-sm
                            text-emerald-700

                            dark:border-emerald-900/50
                            dark:bg-emerald-950/20
                            dark:text-emerald-400
                        "
                    >
                        {success}
                    </div>

                )}


                {/* =================================================
                    APPLICATION CONTROLS
                ================================================= */}

                <section>

                    <div className="mb-4">

                        <h2
                            className="
                                text-lg
                                font-semibold

                                text-slate-900

                                dark:text-white
                            "
                        >
                            Application Controls
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm

                                text-slate-500

                                dark:text-slate-400
                            "
                        >
                            Control services that directly affect
                            the TrafficVisionAI experience.
                        </p>

                    </div>


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4

                            md:grid-cols-2
                        "
                    >

                        <ControlCard
                            icon={<FaTrafficLight />}
                            title="Traffic Prediction Engine"
                            description="Allow users to generate new traffic predictions."
                            enabled={
                                controls?.prediction_enabled
                            }
                            disabled={saving}
                            onChange={(value) =>
                                handleToggle(
                                    "prediction_enabled",
                                    value
                                )
                            }
                        />


                        <ControlCard
                            icon={<FaBell />}
                            title="Traffic Alert System"
                            description="Allow the platform to create and process traffic alerts."
                            enabled={
                                controls?.alerts_enabled
                            }
                            disabled={saving}
                            onChange={(value) =>
                                handleToggle(
                                    "alerts_enabled",
                                    value
                                )
                            }
                        />


                        <ControlCard
                            icon={<FaBrain />}
                            title="AI Model Processing"
                            description="Allow AI models to process traffic intelligence requests."
                            enabled={
                                controls?.ai_processing_enabled
                            }
                            disabled={saving}
                            onChange={(value) =>
                                handleToggle(
                                    "ai_processing_enabled",
                                    value
                                )
                            }
                        />


                        <ControlCard
                            icon={<FaTools />}
                            title="Maintenance Mode"
                            description="Temporarily restrict normal application activity while maintenance is performed."
                            enabled={
                                controls?.maintenance_mode
                            }
                            disabled={saving}
                            onChange={(value) =>
                                handleToggle(
                                    "maintenance_mode",
                                    value
                                )
                            }
                            warning
                        />

                    </div>

                </section>


                {/* =================================================
                    SYSTEM STATUS
                ================================================= */}

                <section className="mt-10">

                    <div className="mb-4">

                        <h2
                            className="
                                text-lg
                                font-semibold

                                text-slate-900

                                dark:text-white
                            "
                        >
                            System Status
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm

                                text-slate-500

                                dark:text-slate-400
                            "
                        >
                            Read-only infrastructure health indicators.
                        </p>

                    </div>


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4

                            md:grid-cols-2
                        "
                    >

                        <StatusCard
                            icon={<FaServer />}
                            title="Backend API"
                            status="Online"
                        />


                        <StatusCard
                            icon={<FaDatabase />}
                            title="Database"
                            status="Connected"
                        />

                    </div>

                </section>


                {/* =================================================
                    FOOTER NOTE
                ================================================= */}

                <div
                    className="
                        mt-8

                        rounded-xl

                        border
                        border-slate-200

                        bg-slate-50

                        px-5
                        py-4

                        text-sm

                        text-slate-500

                        dark:border-slate-800
                        dark:bg-slate-900/50
                        dark:text-slate-400
                    "
                >

                    Changes made here apply to the platform
                    globally and are recorded in System Activity.

                </div>

            </div>

        </DashboardLayout>

    );

}


/* =============================================================
   CONTROL CARD
============================================================= */

function ControlCard({
    icon,
    title,
    description,
    enabled,
    disabled,
    onChange,
    warning = false
}) {

    return (

        <div
            className="
                flex
                min-h-[150px]

                items-center
                gap-5

                rounded-2xl

                border
                border-slate-200

                bg-white

                p-5

                shadow-sm

                transition

                hover:shadow-md

                dark:border-slate-800
                dark:bg-slate-900
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

                    bg-blue-50

                    text-lg
                    text-blue-600

                    dark:bg-blue-500/10
                    dark:text-blue-400
                "
            >
                {icon}
            </div>


            <div className="min-w-0 flex-1">

                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <h3
                        className="
                            text-sm
                            font-semibold

                            text-slate-900

                            dark:text-white
                        "
                    >
                        {title}
                    </h3>

                </div>


                <p
                    className="
                        mt-1

                        text-xs
                        leading-5

                        text-slate-500

                        dark:text-slate-400
                    "
                >
                    {description}
                </p>


                <p
                    className={`
                        mt-3
                        text-xs
                        font-semibold
                        ${
                            warning && enabled
                                ? "text-amber-600 dark:text-amber-400"
                                : enabled
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-slate-400 dark:text-slate-500"
                        }
                    `}
                >
                    {enabled ? "Enabled" : "Disabled"}
                </p>

            </div>


            <Toggle
                enabled={enabled}
                disabled={disabled}
                onChange={onChange}
            />

        </div>

    );

}


/* =============================================================
   TOGGLE
============================================================= */

function Toggle({
    enabled,
    disabled,
    onChange
}) {

    return (

        <button
            type="button"

            role="switch"

            aria-checked={enabled}

            disabled={disabled}

            onClick={() =>
                onChange(!enabled)
            }

            className={`
                relative
                h-7
                w-12
                shrink-0

                rounded-full

                transition

                focus:outline-none
                focus:ring-4
                focus:ring-blue-500/20

                disabled:cursor-not-allowed
                disabled:opacity-50

                ${
                    enabled
                        ? "bg-blue-600"
                        : "bg-slate-300 dark:bg-slate-700"
                }
            `}
        >

            <span
                className={`
                    absolute
                    top-1/2

                    h-5
                    w-5

                    -translate-y-1/2

                    rounded-full

                    bg-white

                    shadow-sm

                    transition-transform

                    ${
                        enabled
                            ? "translate-x-6"
                            : "translate-x-1"
                    }
                `}
            />

        </button>

    );

}


/* =============================================================
   STATUS CARD
============================================================= */

function StatusCard({
    icon,
    title,
    status
}) {

    return (

        <div
            className="
                flex
                items-center
                gap-4

                rounded-2xl

                border
                border-slate-200

                bg-white

                p-5

                shadow-sm

                dark:border-slate-800
                dark:bg-slate-900
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

                    bg-emerald-50

                    text-emerald-600

                    dark:bg-emerald-500/10
                    dark:text-emerald-400
                "
            >
                {icon}
            </div>


            <div>

                <p
                    className="
                        text-sm
                        font-semibold

                        text-slate-900

                        dark:text-white
                    "
                >
                    {title}
                </p>


                <div
                    className="
                        mt-1

                        flex
                        items-center
                        gap-2
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

                    <span
                        className="
                            text-xs
                            font-medium

                            text-emerald-600

                            dark:text-emerald-400
                        "
                    >
                        {status}
                    </span>

                </div>

            </div>

        </div>

    );

}


export default SystemControls;