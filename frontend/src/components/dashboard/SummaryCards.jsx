import {
    FaCarCrash,
    FaBell,
    FaChartLine,
    FaMapMarkedAlt
} from "react-icons/fa";

import StatCard from "./StatCard";


function SummaryCards({
    summary,
    isAdmin = false
}) {

    if (!summary) {

        return (

            <div
                className="
                    grid
                    grid-cols-1
                    gap-4

                    sm:grid-cols-2
                    xl:grid-cols-4
                "
            >

                {[1, 2, 3, 4].map((item) => (

                    <div
                        key={item}

                        className="
                            h-28

                            animate-pulse

                            rounded-2xl

                            border
                            border-slate-200

                            bg-white

                            dark:border-slate-800
                            dark:bg-slate-900
                        "
                    />

                ))}

            </div>

        );

    }


    const riskValue =
        summary.average_risk_score !== null &&
        summary.average_risk_score !== undefined

            ? Number(
                summary.average_risk_score
            ).toFixed(2)

            : "—";


    return (

        <div>

            <div
                className="
                    mb-4
                    flex
                    items-center
                    justify-between
                "
            >

                <div>

                    <h2
                        className="
                            text-sm
                            font-semibold

                            text-slate-800

                            dark:text-slate-200
                        "
                    >
                        {isAdmin
                            ? "Traffic Operations"
                            : "Traffic Overview"
                        }
                    </h2>


                    <p
                        className="
                            mt-1

                            text-xs

                            text-slate-500

                            dark:text-slate-400
                        "
                    >
                        {isAdmin
                            ? "Current traffic intelligence across the platform."
                            : "Current traffic intelligence at a glance."
                        }
                    </p>

                </div>

            </div>


            <div
                className="
                    grid
                    grid-cols-1
                    gap-4

                    sm:grid-cols-2
                    xl:grid-cols-4
                "
            >

                <StatCard
                    title="Total Accidents"
                    value={
                        summary.total_accidents ?? 0
                    }
                    color="
                        text-blue-600
                        dark:text-blue-400
                    "
                    icon={<FaCarCrash />}
                />


                <StatCard
                    title="Average Risk"
                    value={riskValue}
                    color="
                        text-amber-500
                        dark:text-amber-400
                    "
                    icon={<FaChartLine />}
                />


                <StatCard
                    title="Active Alerts"
                    value={
                        summary.active_alerts ?? 0
                    }
                    color="
                        text-red-500
                        dark:text-red-400
                    "
                    icon={<FaBell />}
                />


                <StatCard
                    title="Cities Covered"
                    value={
                        summary.total_cities ?? 0
                    }
                    color="
                        text-cyan-600
                        dark:text-cyan-400
                    "
                    icon={<FaMapMarkedAlt />}
                />

            </div>

        </div>

    );

}


export default SummaryCards;