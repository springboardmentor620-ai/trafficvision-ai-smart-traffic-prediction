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


function Dashboard() {

    const {
        summary,
        monthlyTrend,
        dangerousCities,
        loading,
        error
    } = useDashboard();


    // =========================
    // LOADING
    // =========================

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


    // =========================
    // ERROR
    // =========================

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


    // =========================
    // MAIN DASHBOARD
    // =========================

    return (

        <DashboardLayout>

            <div
                className="
                    flex
                    flex-col

                    gap-8
                "
            >

                {/* =========================
                    HEADER
                ========================= */}

                <DashboardHeader />


                {/* =========================
                    SUMMARY CARDS
                ========================= */}

                <section>

                    <SummaryCards
                        summary={summary}
                    />

                </section>


                {/* =========================
                    TRAFFIC + PREDICTIONS
                ========================= */}

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


                {/* =========================
                    HIGH RISK + ALERTS
                ========================= */}

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


                {/* =========================
                    BOTTOM BREATHING SPACE
                ========================= */}

                <div className="h-8" />

            </div>

        </DashboardLayout>

    );
}


export default Dashboard;