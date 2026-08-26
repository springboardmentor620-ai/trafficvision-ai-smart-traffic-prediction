import DashboardLayout from "../../components/layout/DashboardLayout";

import DashboardHeader
    from "../../components/dashboard/DashboardHeader";

import SummaryCards
    from "../../components/dashboard/SummaryCards";

import TrafficTrendChart
    from "../../components/dashboard/TrafficTrendChart";

import DangerousCities
    from "../../components/dashboard/DangerousCities";

import RecentPredictions
    from "../../components/dashboard/RecentPredictions";

import AlertPanel
    from "../../components/dashboard/AlertPanel";

import useDashboard
    from "../../hooks/useDashboard";

import AuthService
    from "../../services/authService";

import {
    FaShieldAlt,
    FaChartLine,
    FaUsers,
    FaCog
} from "react-icons/fa";


function Dashboard() {

    const {
        summary,
        monthlyTrend,
        dangerousCities,
        loading,
        error
    } = useDashboard();


    const role = AuthService.getRole();

    const isAdmin = role === "admin";


    // =========================================================
    // LOADING
    // =========================================================

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

                    <div className="text-center">

                        <div
                            className="
                                mx-auto
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

                        <p
                            className="
                                mt-4

                                text-sm

                                text-slate-500

                                dark:text-slate-400
                            "
                        >
                            Loading dashboard...
                        </p>

                    </div>

                </div>

            </DashboardLayout>

        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (

            <DashboardLayout>

                <div
                    className="
                        rounded-2xl

                        border
                        border-red-200

                        bg-red-50

                        p-6

                        text-red-700

                        dark:border-red-900/60
                        dark:bg-red-950/30
                        dark:text-red-400
                    "
                >

                    <h2 className="font-semibold">
                        Unable to load dashboard
                    </h2>

                    <p className="mt-1 text-sm">
                        Please check that the backend is running.
                    </p>

                </div>

            </DashboardLayout>

        );

    }


    return (

        <DashboardLayout>

            <div
                className="
                    flex
                    flex-col
                    gap-8
                "
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <DashboardHeader
                    isAdmin={isAdmin}
                />


                {/* =================================================
                    ADMIN OVERVIEW
                ================================================= */}

                {isAdmin && (

                    <section
                        className="
                            grid
                            grid-cols-1
                            gap-4

                            md:grid-cols-3
                        "
                    >

                        {/* ACCESS */}

                        <AdminInfoCard
                            icon={<FaShieldAlt />}
                            label="Account Access"
                            value="Administrator"
                            description="
                                Full administrative access is enabled.
                            "
                        />


                        {/* TRAFFIC */}

                        <AdminInfoCard
                            icon={<FaChartLine />}
                            label="Traffic Operations"
                            value="Available"
                            description="
                                Predictions, routes, maps and alerts are available.
                            "
                        />


                        {/* MANAGEMENT */}

                        <AdminInfoCard
                            icon={<FaUsers />}
                            label="Administration"
                            value="Enabled"
                            description="
                                User and system management tools are available.
                            "
                        />

                    </section>

                )}


                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                <section>

                    <SummaryCards
                        summary={summary}
                        isAdmin={isAdmin}
                    />

                </section>


                {/* =================================================
                    TRAFFIC + PREDICTIONS
                ================================================= */}

                <section
                    className="
                        grid
                        grid-cols-1
                        gap-6

                        xl:grid-cols-[1.45fr_1fr]
                    "
                >

                    <TrafficTrendChart
                        data={monthlyTrend}
                    />


                    <RecentPredictions />

                </section>


                {/* =================================================
                    HIGH RISK + ALERTS
                ================================================= */}

                <section
                    className="
                        grid
                        grid-cols-1
                        gap-6

                        xl:grid-cols-2
                    "
                >

                    <DangerousCities
                        data={dangerousCities}
                    />


                    <AlertPanel
                        activeAlerts={
                            summary?.active_alerts ?? 0
                        }
                    />

                </section>


                {/* =================================================
                    ADMIN NOTE
                ================================================= */}

                {isAdmin && (

                    <section
                        className="
                            rounded-2xl

                            border
                            border-blue-100

                            bg-blue-50

                            p-5

                            dark:border-blue-900/40
                            dark:bg-blue-950/20
                        "
                    >

                        <div
                            className="
                                flex
                                items-start
                                gap-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0

                                    items-center
                                    justify-center

                                    rounded-xl

                                    bg-blue-600

                                    text-white
                                "
                            >

                                <FaCog />

                            </div>


                            <div>

                                <h3
                                    className="
                                        text-sm
                                        font-semibold

                                        text-slate-900

                                        dark:text-white
                                    "
                                >
                                    Administrative workspace
                                </h3>


                                <p
                                    className="
                                        mt-1

                                        text-sm
                                        leading-6

                                        text-slate-600

                                        dark:text-slate-400
                                    "
                                >
                                    Use the Administration section in
                                    the sidebar to manage users, system
                                    activity and system controls.
                                </p>

                            </div>

                        </div>

                    </section>

                )}


                {/* =================================================
                    BOTTOM SPACE
                ================================================= */}

                <div className="h-8" />

            </div>

        </DashboardLayout>

    );

}


/* =============================================================
   ADMIN INFO CARD
============================================================= */

function AdminInfoCard({
    icon,
    label,
    value,
    description
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
                dark:shadow-none
            "
        >

            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-4
                "
            >

                <div>

                    <p
                        className="
                            text-xs
                            font-medium
                            uppercase
                            tracking-wide

                            text-slate-400
                        "
                    >
                        {label}
                    </p>


                    <p
                        className="
                            mt-2

                            text-lg
                            font-semibold

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

            </div>


            <p
                className="
                    mt-3

                    text-xs
                    leading-5

                    text-slate-500

                    dark:text-slate-400
                "
            >
                {description}
            </p>

        </div>

    );

}


export default Dashboard;