import {
    FaFileAlt,
    FaHistory,
    FaExclamationTriangle,
    FaChartLine
} from "react-icons/fa";


function ReportStats({
    totalReports = 0,
    highRiskReports = 0,
    averageRisk = 0,
    totalPredictions = 0
}) {

    const stats = [

        {
            title: "Total Reports",
            value: totalReports,
            description: "Generated prediction reports",
            icon: <FaFileAlt />,
            iconClass: "bg-blue-500/10 text-blue-400"
        },

        {
            title: "Prediction History",
            value: totalPredictions,
            description: "Recorded predictions",
            icon: <FaHistory />,
            iconClass: "bg-violet-500/10 text-violet-400"
        },

        {
            title: "High Risk",
            value: highRiskReports,
            description: "Predictions requiring attention",
            icon: <FaExclamationTriangle />,
            iconClass: "bg-red-500/10 text-red-400"
        },

        {
            title: "Average Risk",
            value: `${averageRisk}%`,
            description: "Across available predictions",
            icon: <FaChartLine />,
            iconClass: "bg-amber-500/10 text-amber-400"
        }

    ];


    return (

        <div
            className="
                grid
                grid-cols-1
                gap-5

                sm:grid-cols-2

                xl:grid-cols-4
            "
        >

            {stats.map((stat) => (

                <div
                    key={stat.title}

                    className="
                        min-h-[150px]

                        rounded-2xl

                        border
                        border-slate-700

                        bg-slate-900

                        p-6

                        transition-all
                        duration-200

                        hover:border-slate-600
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

                                    text-slate-500
                                "
                            >
                                {stat.title}
                            </p>


                            <p
                                className="
                                    mt-4

                                    text-3xl
                                    font-semibold

                                    text-white
                                "
                            >
                                {stat.value}
                            </p>

                        </div>


                        <div
                            className={`
                                flex
                                h-11
                                w-11
                                shrink-0

                                items-center
                                justify-center

                                rounded-xl

                                ${stat.iconClass}
                            `}
                        >

                            {stat.icon}

                        </div>

                    </div>


                    <p
                        className="
                            mt-4

                            text-xs

                            text-slate-500
                        "
                    >
                        {stat.description}
                    </p>

                </div>

            ))}

        </div>

    );

}


export default ReportStats;