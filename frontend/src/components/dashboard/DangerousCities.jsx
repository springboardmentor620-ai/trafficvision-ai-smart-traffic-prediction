function DangerousCities({ data = [] }) {

    return (
        <section
            className="
                min-w-0
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

            <div
                className="
                    flex
                    items-start
                    justify-between
                    border-b
                    border-slate-100
                    px-5
                    py-4

                    dark:border-slate-800
                "
            >

                <div>

                    <h2
                        className="
                            text-base
                            font-semibold
                            text-slate-900
                            dark:text-white
                        "
                    >
                        High-Risk Cities
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-500
                            dark:text-slate-400
                        "
                    >
                        Cities with highest average risk
                    </p>

                </div>

                <span
                    className="
                        rounded-lg
                        bg-red-50
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                        text-red-600

                        dark:bg-red-950/40
                        dark:text-red-400
                    "
                >
                    Top 5
                </span>

            </div>


            <div className="overflow-x-auto">

                <table className="w-full text-sm">

                    <thead>

                        <tr
                            className="
                                border-b
                                border-slate-100
                                text-left

                                dark:border-slate-800
                            "
                        >

                            <th
                                className="
                                    px-5
                                    py-3
                                    text-xs
                                    font-medium
                                    text-slate-500
                                    dark:text-slate-400
                                "
                            >
                                City
                            </th>

                            <th
                                className="
                                    px-5
                                    py-3
                                    text-xs
                                    font-medium
                                    text-slate-500
                                    dark:text-slate-400
                                "
                            >
                                Accidents
                            </th>

                            <th
                                className="
                                    px-5
                                    py-3
                                    text-right
                                    text-xs
                                    font-medium
                                    text-slate-500
                                    dark:text-slate-400
                                "
                            >
                                Avg Risk
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {data.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="3"
                                    className="
                                        px-5
                                        py-12
                                        text-center
                                        text-sm
                                        text-slate-400
                                    "
                                >
                                    No city data available
                                </td>

                            </tr>

                        ) : (

                            data
                                .slice(0, 5)
                                .map((city, index) => (

                                    <tr
                                        key={index}
                                        className="
                                            border-b
                                            border-slate-100
                                            last:border-0
                                            transition-colors
                                            hover:bg-slate-50

                                            dark:border-slate-800
                                            dark:hover:bg-slate-800/50
                                        "
                                    >

                                        <td
                                            className="
                                                px-5
                                                py-3.5
                                                font-medium
                                                text-slate-800
                                                dark:text-slate-200
                                            "
                                        >
                                            {city.city}
                                        </td>

                                        <td
                                            className="
                                                px-5
                                                py-3.5
                                                text-slate-500
                                                dark:text-slate-400
                                            "
                                        >
                                            {city.total_accidents}
                                        </td>

                                        <td
                                            className="
                                                px-5
                                                py-3.5
                                                text-right
                                            "
                                        >

                                            <span
                                                className="
                                                    inline-flex
                                                    rounded-full
                                                    bg-red-50
                                                    px-2.5
                                                    py-1
                                                    text-xs
                                                    font-semibold
                                                    text-red-600

                                                    dark:bg-red-950/40
                                                    dark:text-red-400
                                                "
                                            >
                                                {
                                                    city.average_risk_score
                                                }
                                            </span>

                                        </td>

                                    </tr>

                                ))

                        )}

                    </tbody>

                </table>

            </div>

        </section>
    );
}

export default DangerousCities;