import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    FaClipboardList,
    FaUserShield,
    FaUserCheck,
    FaUserTimes,
    FaExchangeAlt,
    FaUserPlus,
    FaSyncAlt,
    FaCog,
    FaExclamationTriangle,
    FaTrash
} from "react-icons/fa";

import DashboardLayout
    from "../../components/layout/DashboardLayout";

import AuditLogService
    from "../../services/auditLogService";


function SystemActivity() {

    const [activities, setActivities] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [filter, setFilter] = useState("ALL");


    // =====================================================
    // LOAD ACTIVITY
    // =====================================================

    const loadActivity = useCallback(async () => {

        try {

            setError("");

            const data =
                await AuditLogService.getActivity();

            setActivities(
                Array.isArray(data)
                    ? data
                    : []
            );

        }
        catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.detail ||
                "Unable to load system activity."
            );

        }
        finally {

            setLoading(false);

        }

    }, []);


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        let cancelled = false;


        async function fetchActivity() {

            try {

                const data =
                    await AuditLogService.getActivity();


                if (!cancelled) {

                    setActivities(
                        Array.isArray(data)
                            ? data
                            : []
                    );

                }

            }
            catch (err) {

                console.error(err);


                if (!cancelled) {

                    setError(
                        err?.response?.data?.detail ||
                        "Unable to load system activity."
                    );

                }

            }
            finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }


        fetchActivity();


        return () => {

            cancelled = true;

        };

    }, []);


    // =====================================================
    // FILTER
    // =====================================================

    const filteredActivities = useMemo(() => {

        if (filter === "ALL") {

            return activities;

        }


        return activities.filter(
            (activity) =>
                activity.action === filter
        );

    }, [activities, filter]);


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <DashboardLayout>

            <main
                className="
                    min-h-screen
                    px-6
                    py-10

                    sm:px-8

                    lg:px-10
                    lg:py-12
                "
            >

                <div
                    className="
                        mx-auto
                        w-full
                        max-w-6xl
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
                            gap-5

                            lg:flex-row
                            lg:items-end
                            lg:justify-between
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
                                System Activity
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
                                Review important actions performed
                                across the TrafficVision platform.
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={loadActivity}
                            disabled={loading}

                            className="
                                inline-flex
                                w-fit

                                items-center
                                gap-2

                                rounded-xl

                                border
                                border-slate-200

                                bg-white

                                px-4
                                py-2.5

                                text-sm
                                font-medium

                                text-slate-600

                                shadow-sm

                                transition

                                hover:border-blue-300
                                hover:text-blue-600

                                disabled:opacity-50

                                dark:border-slate-800
                                dark:bg-slate-900
                                dark:text-slate-300
                            "
                        >

                            <FaSyncAlt
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh

                        </button>

                    </header>


                    {/* =================================================
                        SUMMARY
                    ================================================= */}

                    <section
                        className="
                            mb-8

                            grid
                            grid-cols-1
                            gap-4

                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >

                        <ActivityStat
                            icon={<FaClipboardList />}
                            label="Total Activity"
                            value={activities.length}
                        />

                        <ActivityStat
                            icon={<FaExchangeAlt />}
                            label="Role Changes"
                            value={
                                activities.filter(
                                    (item) =>
                                        item.action ===
                                        "ROLE_CHANGED"
                                ).length
                            }
                        />

                        <ActivityStat
                            icon={<FaUserCheck />}
                            label="Activations"
                            value={
                                activities.filter(
                                    (item) =>
                                        item.action ===
                                        "USER_ACTIVATED"
                                ).length
                            }
                        />

                        <ActivityStat
                            icon={<FaUserTimes />}
                            label="Deactivations"
                            value={
                                activities.filter(
                                    (item) =>
                                        item.action ===
                                        "USER_DEACTIVATED"
                                ).length
                            }
                        />

                    </section>


                    {/* =================================================
                        ACTIVITY PANEL
                    ================================================= */}

                    <section
                        className="
                            overflow-hidden

                            rounded-2xl

                            border
                            border-slate-200

                            bg-white

                            shadow-sm

                            dark:border-slate-800
                            dark:bg-slate-900
                        "
                    >

                        {/* FILTER BAR */}

                        <div
                            className="
                                flex
                                flex-col
                                gap-4

                                border-b
                                border-slate-200

                                p-5

                                sm:flex-row
                                sm:items-center
                                sm:justify-between

                                dark:border-slate-800
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-sm
                                        font-semibold

                                        text-slate-900

                                        dark:text-white
                                    "
                                >
                                    Recent Activity
                                </h2>


                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-slate-500

                                        dark:text-slate-400
                                    "
                                >
                                    Latest administrative actions
                                </p>

                            </div>


                            <select
                                value={filter}
                                onChange={(event) =>
                                    setFilter(
                                        event.target.value
                                    )
                                }

                                className="
                                    h-10

                                    rounded-xl

                                    border
                                    border-slate-200

                                    bg-white

                                    px-3

                                    text-sm
                                    text-slate-700

                                    outline-none

                                    focus:border-blue-500

                                    dark:border-slate-700
                                    dark:bg-slate-950
                                    dark:text-slate-300
                                "
                            >

                                <option value="ALL">
                                    All activity
                                </option>

                                <option value="ROLE_CHANGED">
                                    Role changes
                                </option>

                                <option value="USER_ACTIVATED">
                                    Activations
                                </option>

                                <option value="USER_DEACTIVATED">
                                    Deactivations
                                </option>

                                <option value="USER_REGISTERED">
                                    Registrations
                                </option>

                                <option value="SYSTEM_CONTROL_CHANGED">
                                    System Control Changes
                                </option>

                                <option value="ALERT_CREATED">
                                    Alert Created
                                </option>

                                <option value="ALERT_DELETED">
                                    Alert Deleted
                                </option>

                            </select>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div
                                className="
                                    m-5

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


                        {/* LOADING */}

                        {loading && (

                            <div
                                className="
                                    flex
                                    min-h-[360px]
                                    items-center
                                    justify-center
                                "
                            >

                                <div className="text-center">

                                    <div
                                        className="
                                            mx-auto

                                            h-8
                                            w-8

                                            animate-spin

                                            rounded-full

                                            border-2
                                            border-slate-200
                                            border-t-blue-600
                                        "
                                    />


                                    <p
                                        className="
                                            mt-4

                                            text-sm
                                            text-slate-500

                                            dark:text-slate-400
                                        "
                                    >
                                        Loading activity...
                                    </p>

                                </div>

                            </div>

                        )}


                        {/* EMPTY */}

                        {!loading &&
                            !error &&
                            filteredActivities.length === 0 && (

                                <div
                                    className="
                                        flex
                                        min-h-[360px]

                                        flex-col
                                        items-center
                                        justify-center

                                        px-6

                                        text-center
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            h-14
                                            w-14

                                            items-center
                                            justify-center

                                            rounded-2xl

                                            bg-slate-100

                                            text-xl
                                            text-slate-400

                                            dark:bg-slate-800
                                        "
                                    >
                                        <FaClipboardList />
                                    </div>


                                    <h3
                                        className="
                                            mt-5

                                            text-sm
                                            font-semibold

                                            text-slate-800

                                            dark:text-slate-200
                                        "
                                    >
                                        No activity found
                                    </h3>


                                    <p
                                        className="
                                            mt-1

                                            text-xs

                                            text-slate-500

                                            dark:text-slate-400
                                        "
                                    >
                                        Administrative actions will
                                        appear here.
                                    </p>

                                </div>

                            )}


                        {/* ACTIVITY LIST */}

                        {!loading &&
                            !error &&
                            filteredActivities.length > 0 && (

                                <div>

                                    {filteredActivities.map(
                                        (activity) => (

                                            <ActivityRow
                                                key={activity.id}
                                                activity={activity}
                                            />

                                        )
                                    )}

                                </div>

                            )}

                    </section>

                </div>

            </main>

        </DashboardLayout>

    );

}


/* =============================================================
   ACTIVITY ROW
============================================================= */

function ActivityRow({ activity }) {

    const icon =
        getActionIcon(activity.action);


    const label =
        getActionLabel(activity.action);


    const time =
        activity.created_at
            ? new Date(
                activity.created_at
            ).toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
            : "—";


    return (

        <div
            className="
                flex
                flex-col
                gap-4

                border-b
                border-slate-100

                px-6
                py-5

                last:border-0

                sm:flex-row
                sm:items-start

                dark:border-slate-800
            "
        >

            {/* ICON */}

            <div
                className="
                    flex
                    h-10
                    w-10
                    shrink-0

                    items-center
                    justify-center

                    rounded-xl

                    bg-blue-50

                    text-blue-600

                    dark:bg-blue-500/10
                    dark:text-blue-400
                "
            >
                {icon}
            </div>


            {/* CONTENT */}

            <div className="min-w-0 flex-1">

                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                    "
                >

                    <span
                        className="
                            text-sm
                            font-semibold

                            text-slate-900

                            dark:text-white
                        "
                    >
                        {label}
                    </span>


                    <span
                        className="
                            rounded-full

                            bg-slate-100

                            px-2
                            py-0.5

                            text-[10px]
                            font-medium

                            text-slate-500

                            dark:bg-slate-800
                            dark:text-slate-400
                        "
                    >
                        {activity.action}
                    </span>

                </div>


                {/* ACTOR + TARGET */}

                <div
                    className="
                        mt-2

                        flex
                        flex-wrap
                        items-center
                        gap-x-2
                        gap-y-1

                        text-xs

                        text-slate-500

                        dark:text-slate-400
                    "
                >

                    <span>

                        Performed by{" "}

                        <strong
                            className="
                                font-semibold
                                text-slate-700
                                dark:text-slate-300
                            "
                        >
                            {activity.actor_name || "System"}
                        </strong>

                    </span>


                    {activity.target_user_name && (

                        <>
                            <span>
                                →
                            </span>

                            <span>

                                Affected user{" "}

                                <strong
                                    className="
                                        font-semibold
                                        text-slate-700
                                        dark:text-slate-300
                                    "
                                >
                                    {activity.target_user_name}
                                </strong>

                            </span>
                        </>

                    )}

                </div>


                {/* DESCRIPTION */}

                <p
                    className="
                        mt-2

                        text-sm
                        leading-6

                        text-slate-600

                        dark:text-slate-400
                    "
                >
                    {activity.description}
                </p>


                {/* TIME */}

                <p
                    className="
                        mt-2

                        text-[11px]

                        text-slate-400

                        dark:text-slate-500
                    "
                >
                    {time}
                </p>

            </div>

        </div>

    );

}


/* =============================================================
   ACTION ICON
============================================================= */

function getActionIcon(action) {

    switch (action) {

        case "ROLE_CHANGED":

            return <FaExchangeAlt />;

        case "USER_ACTIVATED":

            return <FaUserCheck />;

        case "USER_DEACTIVATED":

            return <FaUserTimes />;

        case "USER_REGISTERED":

            return <FaUserPlus />;

        case "SYSTEM_CONTROL_CHANGED":

            return <FaCog />;

        case "ALERT_CREATED":

            return <FaExclamationTriangle />;

        case "ALERT_DELETED":

            return <FaTrash />;

        default:

            return <FaUserShield />;

    }

}


/* =============================================================
   ACTION LABEL
============================================================= */

function getActionLabel(action) {

    switch (action) {

        case "ROLE_CHANGED":

            return "Role Changed";

        case "USER_ACTIVATED":

            return "User Activated";

        case "USER_DEACTIVATED":

            return "User Deactivated";

        case "USER_REGISTERED":

            return "User Registered";

        case "SYSTEM_CONTROL_CHANGED":

            return "System Control Changed";

        case "ALERT_CREATED":

            return "Alert Created";

        case "ALERT_DELETED":

            return "Alert Deleted";

        default:

            return "System Activity";

    }

}


/* =============================================================
   SUMMARY CARD
============================================================= */

function ActivityStat({
    icon,
    label,
    value
}) {

    return (

        <div
            className="
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
                    items-center
                    justify-between
                "
            >

                <div>

                    <p
                        className="
                            text-xs
                            font-medium

                            text-slate-500

                            dark:text-slate-400
                        "
                    >
                        {label}
                    </p>


                    <p
                        className="
                            mt-2

                            text-2xl
                            font-bold

                            text-slate-900

                            dark:text-white
                        "
                    >
                        {value}
                    </p>

                </div>


                <div
                    className="
                        flex
                        h-10
                        w-10

                        items-center
                        justify-center

                        rounded-xl

                        bg-blue-50

                        text-blue-600

                        dark:bg-blue-500/10
                        dark:text-blue-400
                    "
                >
                    {icon}
                </div>

            </div>

        </div>

    );

}


export default SystemActivity;