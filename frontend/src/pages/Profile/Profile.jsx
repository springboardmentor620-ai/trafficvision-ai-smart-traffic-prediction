import {
    FaUserCircle,
    FaCarCrash,
    FaRoute,
    FaFileAlt,
    FaExclamationTriangle,
    FaClock,
    FaChartLine,
    FaBell,
    FaMapMarkedAlt,
    FaArrowRight,
    FaShieldAlt
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";


function Profile() {

    const navigate = useNavigate();


    /*
     * =========================================================
     * TEMPORARY USER INFORMATION
     *
     * These values will later come from the authenticated
     * user / backend role system.
     *
     * We are intentionally keeping the structure ready for:
     *
     * Admin
     * Traffic Operator
     * =========================================================
     */

    const user = {

        name: "DIVYA THE DIVINE",

        role: "Traffic Operator",

        roleLabel: "Traffic Operations",

        status: "Active"

    };


    /*
     * =========================================================
     * ACTIVITY DATA
     *
     * These should eventually come from the backend.
     *
     * We are using zero values instead of fake statistics.
     * =========================================================
     */

    const activity = {

        predictions: 0,

        routes: 0,

        reports: 0,

        highRisk: 0

    };


    /*
     * =========================================================
     * PREDICTION SUMMARY
     * =========================================================
     */

    const predictionSummary = {

        low: 0,

        medium: 0,

        high: 0

    };


    /*
     * =========================================================
     * SAFETY SNAPSHOT
     * =========================================================
     */

    const safety = {

        averageRisk: "—",

        commonCondition: "No data",

        highRiskRoutes: 0

    };


    /*
     * =========================================================
     * RECENT ACTIVITY
     *
     * Empty until real backend history is connected.
     * =========================================================
     */

    const recentActivity = [];


    /*
     * =========================================================
     * FREQUENT ROUTES
     * =========================================================
     */

    const frequentRoutes = [];


    return (

        <DashboardLayout>

            <div
                className="
                    min-h-[calc(100vh-120px)]
                    w-full

                    pb-16
                    pt-6

                    sm:pb-20
                    sm:pt-8
                "
            >

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <header
                    className="
                        mb-10

                        flex
                        flex-col
                        gap-5

                        xl:flex-row
                        xl:items-end
                        xl:justify-between
                    "
                >

                    <div>

                        <p
                            className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-[0.18em]

                                text-blue-400
                            "
                        >
                            My TrafficVisionAI
                        </p>


                        <h1
                            className="
                                mt-2

                                text-3xl
                                font-semibold
                                tracking-tight

                                text-slate-900

                                dark:text-white
                            "
                        >
                            Profile
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
                            View your traffic activity,
                            prediction history and
                            personalized insights.
                        </p>

                    </div>

                </header>


                {/* =================================================
                    PROFILE OVERVIEW
                ================================================= */}

                <section
                    className="
                        mb-10

                        overflow-hidden

                        rounded-2xl

                        border
                        border-slate-200

                        bg-white

                        dark:border-slate-800
                        dark:bg-slate-900
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-6

                            p-6

                            sm:p-7

                            lg:flex-row
                            lg:items-center
                            lg:justify-between
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
                                className="
                                    flex
                                    h-16
                                    w-16
                                    shrink-0

                                    items-center
                                    justify-center

                                    rounded-2xl

                                    bg-blue-500/10

                                    text-4xl

                                    text-blue-500
                                "
                            >

                                <FaUserCircle />

                            </div>


                            <div>

                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-3
                                    "
                                >

                                    <h2
                                        className="
                                            text-xl
                                            font-semibold

                                            text-slate-900

                                            dark:text-white
                                        "
                                    >
                                        Welcome back, {user.name}
                                    </h2>


                                    <span
                                        className="
                                            inline-flex
                                            items-center
                                            gap-2

                                            rounded-full

                                            bg-emerald-500/10

                                            px-2.5
                                            py-1

                                            text-[10px]
                                            font-semibold
                                            uppercase
                                            tracking-wide

                                            text-emerald-500
                                        "
                                    >

                                        <span
                                            className="
                                                h-1.5
                                                w-1.5

                                                rounded-full

                                                bg-emerald-500
                                            "
                                        />

                                        {user.status}

                                    </span>

                                </div>


                                <p
                                    className="
                                        mt-1

                                        text-sm

                                        text-slate-500

                                        dark:text-slate-400
                                    "
                                >
                                    TrafficVisionAI User
                                </p>

                            </div>

                        </div>


                        {/* ROLE */}

                        <div
                            className="
                                flex
                                items-center
                                gap-4

                                rounded-xl

                                border
                                border-slate-200

                                bg-slate-50

                                px-5
                                py-4

                                dark:border-slate-800
                                dark:bg-slate-950
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10

                                    items-center
                                    justify-center

                                    rounded-lg

                                    bg-blue-500/10

                                    text-blue-400
                                "
                            >

                                <FaShieldAlt />

                            </div>


                            <div>

                                <p
                                    className="
                                        text-[10px]
                                        font-semibold
                                        uppercase
                                        tracking-wide

                                        text-slate-400
                                    "
                                >
                                    Access Role
                                </p>


                                <p
                                    className="
                                        mt-1

                                        text-sm
                                        font-semibold

                                        text-slate-900

                                        dark:text-white
                                    "
                                >
                                    {user.role}
                                </p>


                                <p
                                    className="
                                        mt-0.5

                                        text-[11px]

                                        text-slate-500
                                    "
                                >
                                    {user.roleLabel}
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    TRAFFIC ACTIVITY
                ================================================= */}

                <section
                    className="
                        mb-10
                    "
                >

                    <SectionHeading
                        title="Your Traffic Activity"
                        subtitle="A summary of your activity across TrafficVisionAI."
                    />


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4

                            sm:grid-cols-2

                            xl:grid-cols-4
                        "
                    >

                        <ActivityCard
                            icon={<FaCarCrash />}
                            label="Predictions"
                            value={activity.predictions}
                            description="Completed"
                            iconClass="text-blue-400"
                        />


                        <ActivityCard
                            icon={<FaRoute />}
                            label="Route Analyses"
                            value={activity.routes}
                            description="Completed"
                            iconClass="text-violet-400"
                        />


                        <ActivityCard
                            icon={<FaFileAlt />}
                            label="Reports"
                            value={activity.reports}
                            description="Generated"
                            iconClass="text-amber-400"
                        />


                        <ActivityCard
                            icon={<FaExclamationTriangle />}
                            label="High Risk"
                            value={activity.highRisk}
                            description="Predictions"
                            iconClass="text-red-400"
                        />

                    </div>

                </section>


                {/* =================================================
                    PREDICTION SUMMARY + SAFETY SNAPSHOT
                ================================================= */}

                <section
                    className="
                        mb-10

                        grid
                        grid-cols-1

                        gap-6

                        xl:grid-cols-2
                    "
                >

                    {/* PREDICTION SUMMARY */}

                    <div
                        className="
                            rounded-2xl

                            border
                            border-slate-200

                            bg-white

                            p-6

                            dark:border-slate-800
                            dark:bg-slate-900

                            sm:p-7
                        "
                    >

                        <SectionHeading
                            title="Prediction Summary"
                            subtitle="Your prediction severity distribution."
                        />


                        <div
                            className="
                                mt-8

                                grid
                                grid-cols-3

                                gap-4
                            "
                        >

                            <PredictionLevel
                                label="Low"
                                value={
                                    predictionSummary.low
                                }
                                className="
                                    border-emerald-500/20
                                    bg-emerald-500/5
                                    text-emerald-400
                                "
                            />


                            <PredictionLevel
                                label="Medium"
                                value={
                                    predictionSummary.medium
                                }
                                className="
                                    border-amber-500/20
                                    bg-amber-500/5
                                    text-amber-400
                                "
                            />


                            <PredictionLevel
                                label="High"
                                value={
                                    predictionSummary.high
                                }
                                className="
                                    border-red-500/20
                                    bg-red-500/5
                                    text-red-400
                                "
                            />

                        </div>

                    </div>


                    {/* SAFETY SNAPSHOT */}

                    <div
                        className="
                            rounded-2xl

                            border
                            border-slate-200

                            bg-white

                            p-6

                            dark:border-slate-800
                            dark:bg-slate-900

                            sm:p-7
                        "
                    >

                        <SectionHeading
                            title="Traffic Safety Snapshot"
                            subtitle="A quick view of your analyzed traffic conditions."
                        />


                        <div
                            className="
                                mt-7

                                divide-y
                                divide-slate-200

                                dark:divide-slate-800
                            "
                        >

                            <SnapshotRow
                                label="Average Risk Score"
                                value={
                                    safety.averageRisk
                                }
                            />


                            <SnapshotRow
                                label="Most Common Condition"
                                value={
                                    safety.commonCondition
                                }
                            />


                            <SnapshotRow
                                label="High-Risk Routes"
                                value={
                                    safety.highRiskRoutes
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* =================================================
                    RECENT ACTIVITY
                ================================================= */}

                <section
                    className="
                        mb-10
                    "
                >

                    <SectionHeading
                        title="Recent Activity"
                        subtitle="Your latest TrafficVisionAI actions."
                    />


                    <div
                        className="
                            overflow-hidden

                            rounded-2xl

                            border
                            border-slate-200

                            bg-white

                            dark:border-slate-800
                            dark:bg-slate-900
                        "
                    >

                        {recentActivity.length === 0 ? (

                            <EmptyActivity
                                icon={<FaClock />}
                                title="No recent activity"
                                description="
                                    Your predictions, route analyses and reports
                                    will appear here once you start using the platform.
                                "
                            />

                        ) : (

                            <div>

                                {recentActivity.map(
                                    (item, index) => (

                                        <ActivityRow
                                            key={index}
                                            item={item}
                                        />

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================================
                    FREQUENT ROUTES
                ================================================= */}

                <section
                    className="
                        mb-10
                    "
                >

                    <SectionHeading
                        title="Frequently Used Routes"
                        subtitle="Routes you analyze most often."
                    />


                    <div
                        className="
                            overflow-hidden

                            rounded-2xl

                            border
                            border-slate-200

                            bg-white

                            dark:border-slate-800
                            dark:bg-slate-900
                        "
                    >

                        {frequentRoutes.length === 0 ? (

                            <EmptyActivity
                                icon={<FaRoute />}
                                title="No route history yet"
                                description="
                                    Frequently analyzed routes will appear here
                                    after you perform route analysis.
                                "
                            />

                        ) : (

                            <div>

                                {frequentRoutes.map(
                                    (route, index) => (

                                        <RouteRow
                                            key={index}
                                            route={route}
                                        />

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section>

                    <SectionHeading
                        title="Quick Actions"
                        subtitle="Jump directly to the tools you use most."
                    />


                    <div
                        className="
                            grid
                            grid-cols-1

                            gap-4

                            sm:grid-cols-2

                            xl:grid-cols-4
                        "
                    >

                        <QuickAction
                            icon={<FaCarCrash />}
                            title="New Prediction"
                            description="Analyze traffic risk"
                            onClick={() =>
                                navigate(
                                    "/prediction"
                                )
                            }
                        />


                        <QuickAction
                            icon={<FaMapMarkedAlt />}
                            title="Analyze Route"
                            description="Find the best route"
                            onClick={() =>
                                navigate(
                                    "/maps"
                                )
                            }
                        />


                        <QuickAction
                            icon={<FaFileAlt />}
                            title="View Reports"
                            description="Review generated reports"
                            onClick={() =>
                                navigate(
                                    "/reports"
                                )
                            }
                        />


                        <QuickAction
                            icon={<FaBell />}
                            title="View Alerts"
                            description="Check active alerts"
                            onClick={() =>
                                navigate(
                                    "/alerts"
                                )
                            }
                        />

                    </div>

                </section>

            </div>

        </DashboardLayout>

    );

}


/*
 * =============================================================
 * SECTION HEADING
 * =============================================================
 */

function SectionHeading({
    title,
    subtitle
}) {

    return (

        <div>

            <h2
                className="
                    text-lg
                    font-semibold

                    text-slate-900

                    dark:text-white
                "
            >
                {title}
            </h2>


            <p
                className="
                    mt-1

                    text-xs
                    leading-5

                    text-slate-500

                    dark:text-slate-500
                "
            >
                {subtitle}
            </p>

        </div>

    );

}


/*
 * =============================================================
 * ACTIVITY CARD
 * =============================================================
 */

function ActivityCard({
    icon,
    label,
    value,
    description,
    iconClass
}) {

    return (

        <div
            className="
                rounded-2xl

                border
                border-slate-200

                bg-white

                p-6

                dark:border-slate-800
                dark:bg-slate-900
            "
        >

            <div
                className={`
                    flex
                    h-10
                    w-10

                    items-center
                    justify-center

                    rounded-xl

                    bg-slate-100

                    dark:bg-slate-800

                    ${iconClass}
                `}
            >

                {icon}

            </div>


            <div
                className="
                    mt-6
                "
            >

                <p
                    className="
                        text-2xl
                        font-semibold

                        text-slate-900

                        dark:text-white
                    "
                >
                    {value}
                </p>


                <p
                    className="
                        mt-1

                        text-sm
                        font-medium

                        text-slate-700

                        dark:text-slate-300
                    "
                >
                    {label}
                </p>


                <p
                    className="
                        mt-1

                        text-xs

                        text-slate-500
                    "
                >
                    {description}
                </p>

            </div>

        </div>

    );

}


/*
 * =============================================================
 * PREDICTION LEVEL
 * =============================================================
 */

function PredictionLevel({
    label,
    value,
    className
}) {

    return (

        <div
            className={`
                rounded-xl

                border

                p-5

                text-center

                ${className}
            `}
        >

            <p
                className="
                    text-2xl
                    font-semibold
                "
            >
                {value}
            </p>


            <p
                className="
                    mt-1

                    text-xs
                    font-medium
                "
            >
                {label}
            </p>

        </div>

    );

}


/*
 * =============================================================
 * SNAPSHOT ROW
 * =============================================================
 */

function SnapshotRow({
    label,
    value
}) {

    return (

        <div
            className="
                flex
                items-center
                justify-between

                gap-6

                py-4
            "
        >

            <span
                className="
                    text-sm

                    text-slate-500

                    dark:text-slate-400
                "
            >
                {label}
            </span>


            <span
                className="
                    text-sm
                    font-semibold

                    text-slate-900

                    dark:text-white
                "
            >
                {value}
            </span>

        </div>

    );

}


/*
 * =============================================================
 * EMPTY ACTIVITY
 * =============================================================
 */

function EmptyActivity({
    icon,
    title,
    description
}) {

    return (

        <div
            className="
                flex
                min-h-[220px]

                flex-col
                items-center
                justify-center

                px-6
                py-12

                text-center
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

                    bg-slate-100

                    text-slate-400

                    dark:bg-slate-800
                    dark:text-slate-500
                "
            >

                {icon}

            </div>


            <h3
                className="
                    mt-5

                    text-sm
                    font-semibold

                    text-slate-900

                    dark:text-white
                "
            >
                {title}
            </h3>


            <p
                className="
                    mt-2

                    max-w-md

                    text-xs
                    leading-6

                    text-slate-500
                "
            >
                {description}
            </p>

        </div>

    );

}


/*
 * =============================================================
 * ACTIVITY ROW
 * =============================================================
 */

function ActivityRow({
    item
}) {

    return (

        <div
            className="
                flex
                items-center
                gap-4

                border-b
                border-slate-200

                px-6
                py-5

                last:border-b-0

                dark:border-slate-800
            "
        >

            <div
                className="
                    flex
                    h-9
                    w-9

                    shrink-0

                    items-center
                    justify-center

                    rounded-lg

                    bg-blue-500/10

                    text-blue-400
                "
            >

                <FaChartLine />

            </div>


            <div
                className="
                    min-w-0
                    flex-1
                "
            >

                <p
                    className="
                        text-sm
                        font-medium

                        text-slate-900

                        dark:text-white
                    "
                >
                    {item.title}
                </p>


                <p
                    className="
                        mt-1

                        text-xs

                        text-slate-500
                    "
                >
                    {item.description}
                </p>

            </div>


            <span
                className="
                    shrink-0

                    text-[11px]

                    text-slate-500
                "
            >
                {item.time}
            </span>

        </div>

    );

}


/*
 * =============================================================
 * ROUTE ROW
 * =============================================================
 */

function RouteRow({
    route
}) {

    return (

        <div
            className="
                flex
                items-center
                gap-4

                border-b
                border-slate-200

                px-6
                py-5

                last:border-b-0

                dark:border-slate-800
            "
        >

            <div
                className="
                    flex
                    h-9
                    w-9

                    shrink-0

                    items-center
                    justify-center

                    rounded-lg

                    bg-violet-500/10

                    text-violet-400
                "
            >

                <FaRoute />

            </div>


            <div
                className="
                    flex-1
                "
            >

                <p
                    className="
                        text-sm
                        font-medium

                        text-slate-900

                        dark:text-white
                    "
                >
                    {route.name}
                </p>


                <p
                    className="
                        mt-1

                        text-xs

                        text-slate-500
                    "
                >
                    {route.count} analyses
                </p>

            </div>


            <FaArrowRight
                className="
                    text-xs

                    text-slate-500
                "
            />

        </div>

    );

}


/*
 * =============================================================
 * QUICK ACTION
 * =============================================================
 */

function QuickAction({
    icon,
    title,
    description,
    onClick
}) {

    return (

        <button
            type="button"

            onClick={onClick}

            className="
                group

                flex
                items-center
                gap-4

                rounded-2xl

                border
                border-slate-200

                bg-white

                p-5

                text-left

                transition

                hover:-translate-y-0.5
                hover:border-blue-500/40
                hover:shadow-lg

                dark:border-slate-800
                dark:bg-slate-900

                dark:hover:border-blue-500/40
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

                    transition

                    group-hover:bg-blue-500/15
                "
            >

                {icon}

            </div>


            <div
                className="
                    min-w-0
                    flex-1
                "
            >

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


                <p
                    className="
                        mt-1

                        text-xs

                        text-slate-500
                    "
                >
                    {description}
                </p>

            </div>


            <FaArrowRight
                className="
                    text-xs

                    text-slate-400

                    transition

                    group-hover:translate-x-1
                    group-hover:text-blue-400
                "
            />

        </button>

    );

}


export default Profile;