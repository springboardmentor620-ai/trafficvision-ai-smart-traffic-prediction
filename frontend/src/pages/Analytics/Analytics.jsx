import {
    FaChartLine,
    FaChartPie,
    FaCloudSun,
    FaExclamationTriangle
} from "react-icons/fa";

import DashboardLayout from "../../components/layout/DashboardLayout";

import TrafficTrendChart from "../../components/dashboard/TrafficTrendChart";
import SeverityChart from "../../components/dashboard/SeverityChart";
import WeatherChart from "../../components/dashboard/WeatherChart";
import DangerousCities from "../../components/dashboard/DangerousCities";

import useDashboard from "../../hooks/useDashboard";


function Analytics() {

    const {
        monthlyTrend,
        severityDistribution,
        weatherDistribution,
        dangerousCities,
        loading,
        error
    } = useDashboard();


    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {

        return (

            <DashboardLayout>

                <div
                    className="
                        flex
                        min-h-[calc(100vh-120px)]
                        w-full
                        items-center
                        justify-center
                        px-6
                        py-16
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            justify-center
                            rounded-3xl
                            border
                            border-slate-700
                            bg-slate-900
                            px-12
                            py-12
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
                                bg-blue-500/10
                                text-blue-400
                            "
                        >

                            <FaChartLine
                                size={22}
                            />

                        </div>


                        <p
                            className="
                                mt-6
                                text-base
                                font-semibold
                                text-white
                            "
                        >
                            Loading Analytics
                        </p>


                        <p
                            className="
                                mt-2
                                text-sm
                                text-slate-500
                            "
                        >
                            Preparing traffic insights...
                        </p>

                    </div>

                </div>

            </DashboardLayout>

        );

    }


    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {

        return (

            <DashboardLayout>

                <div
                    className="
                        flex
                        min-h-[calc(100vh-120px)]
                        w-full
                        items-center
                        justify-center
                        px-6
                        py-16
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-lg
                            rounded-3xl
                            border
                            border-red-500/20
                            bg-slate-900
                            p-10
                            text-center
                        "
                    >

                        <div
                            className="
                                mx-auto
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-2xl
                                bg-red-500/10
                                text-red-400
                            "
                        >

                            <FaExclamationTriangle />

                        </div>


                        <h2
                            className="
                                mt-6
                                text-lg
                                font-semibold
                                text-white
                            "
                        >
                            Unable to Load Analytics
                        </h2>


                        <p
                            className="
                                mt-3
                                text-sm
                                leading-7
                                text-slate-400
                            "
                        >
                            The analytics data could not be
                            loaded right now. Please try
                            again after the backend service
                            is available.
                        </p>

                    </div>

                </div>

            </DashboardLayout>

        );

    }


    /* =========================================================
       MAIN ANALYTICS PAGE
    ========================================================= */

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

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-500/10
                                    text-blue-400
                                "
                            >

                                <FaChartLine />

                            </div>


                            <span
                                className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-[0.18em]
                                    text-blue-400
                                "
                            >
                                Data Intelligence
                            </span>

                        </div>


                        <h1
                            className="
                                mt-5
                                text-3xl
                                font-semibold
                                tracking-tight
                                text-white

                                sm:text-4xl
                            "
                        >
                            Traffic Analytics
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
                            Explore traffic trends, accident
                            severity, weather patterns and
                            high-risk locations through
                            historical traffic data.
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
                            border-blue-500/20
                            bg-blue-500/5
                            px-5
                            py-3
                            text-xs
                            font-medium
                            text-blue-300
                        "
                    >

                        <FaChartPie />

                        Analytics Overview

                    </div>

                </header>


                {/* =================================================
                   ANALYTICS OVERVIEW
                ================================================= */}

                <section
                    className="
                        mb-10
                        rounded-3xl
                        border
                        border-slate-700
                        bg-slate-900
                        p-7

                        sm:p-8
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-3
                        "
                    >

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-white
                            "
                        >
                            Analytics Overview
                        </h2>


                        <p
                            className="
                                max-w-2xl
                                text-sm
                                leading-7
                                text-slate-400
                            "
                        >
                            Monitor important traffic patterns
                            and understand how road conditions,
                            weather and accident severity vary
                            across the available data.
                        </p>

                    </div>

                </section>


                {/* =================================================
                   TRAFFIC TREND + SEVERITY
                ================================================= */}

                <section
                    className="
                        mb-10
                    "
                >

                    <div
                        className="
                            mb-6
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


                        <div>

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    text-white
                                "
                            >
                                Traffic & Risk Trends
                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Analyze changes in traffic
                                activity and accident severity.
                            </p>

                        </div>

                    </div>


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-7

                            xl:grid-cols-2
                        "
                    >

                        <div
                            className="
                                min-h-[420px]
                                rounded-3xl
                                border
                                border-slate-700
                                bg-slate-900
                                p-7

                                sm:p-8
                            "
                        >

                            <TrafficTrendChart
                                data={monthlyTrend}
                            />

                        </div>


                        <div
                            className="
                                min-h-[420px]
                                rounded-3xl
                                border
                                border-slate-700
                                bg-slate-900
                                p-7

                                sm:p-8
                            "
                        >

                            <SeverityChart
                                data={severityDistribution}
                            />

                        </div>

                    </div>

                </section>


                {/* =================================================
                   WEATHER
                ================================================= */}

                <section
                    className="
                        mb-10
                    "
                >

                    <div
                        className="
                            mb-6
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-sky-500/10
                                text-sky-400
                            "
                        >

                            <FaCloudSun />

                        </div>


                        <div>

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    text-white
                                "
                            >
                                Weather Impact
                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Understand how weather
                                conditions relate to traffic
                                and accident patterns.
                            </p>

                        </div>

                    </div>


                    <div
                        className="
                            rounded-3xl
                            border
                            border-slate-700
                            bg-slate-900
                            p-7

                            sm:p-8
                        "
                    >

                        <WeatherChart
                            data={weatherDistribution}
                        />

                    </div>

                </section>


                {/* =================================================
                   HIGH RISK CITIES
                ================================================= */}

                <section
                    className="
                        mb-10
                    "
                >

                    <div
                        className="
                            mb-6
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-red-500/10
                                text-red-400
                            "
                        >

                            <FaExclamationTriangle />

                        </div>


                        <div>

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    text-white
                                "
                            >
                                High-Risk Locations
                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Locations showing higher
                                accident or traffic risk
                                within the available data.
                            </p>

                        </div>

                    </div>


                    <div
                        className="
                            rounded-3xl
                            border
                            border-slate-700
                            bg-slate-900
                            p-7

                            sm:p-8
                        "
                    >

                        <DangerousCities
                            data={dangerousCities}
                        />

                    </div>

                </section>


                {/* =================================================
                   BOTTOM SPACING
                ================================================= */}

                <div
                    className="
                        h-8
                        w-full
                    "
                />

            </div>

        </DashboardLayout>

    );

}


export default Analytics;