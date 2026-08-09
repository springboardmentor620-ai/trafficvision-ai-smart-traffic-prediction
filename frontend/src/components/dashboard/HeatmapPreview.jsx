function getRiskStyle(risk) {

    const value = Number(risk);

    if (value >= 0.7) {

        return `
            bg-red-50
            text-red-600
            dark:bg-red-950/40
            dark:text-red-400
        `;

    }

    if (value >= 0.4) {

        return `
            bg-amber-50
            text-amber-600
            dark:bg-amber-950/40
            dark:text-amber-400
        `;

    }

    return `
        bg-emerald-50
        text-emerald-600
        dark:bg-emerald-950/40
        dark:text-emerald-400
    `;
}


function HeatmapPreview({ data = [] }) {

    return (

        <section
            className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm

                dark:border-slate-800
                dark:bg-slate-900
            "
        >

            {/* Header */}

            <div
                className="
                    flex
                    items-center
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
                        Traffic Risk Locations
                    </h2>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-500

                            dark:text-slate-400
                        "
                    >
                        Recent accident locations
                    </p>

                </div>

                <span
                    className="
                        rounded-full
                        bg-blue-50
                        px-2.5
                        py-1
                        text-xs
                        font-medium
                        text-blue-600

                        dark:bg-blue-950/40
                        dark:text-blue-400
                    "
                >
                    Live data
                </span>

            </div>


            {/* Table */}

            <div className="overflow-x-auto">

                {data.length === 0 ? (

                    <div
                        className="
                            px-5
                            py-10
                            text-center
                            text-sm
                            text-slate-400
                        "
                    >
                        No location data available.
                    </div>

                ) : (

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
                                        font-medium
                                        text-slate-500

                                        dark:text-slate-400
                                    "
                                >
                                    Location
                                </th>

                                <th
                                    className="
                                        px-5
                                        py-3
                                        font-medium
                                        text-slate-500

                                        dark:text-slate-400
                                    "
                                >
                                    State
                                </th>

                                <th
                                    className="
                                        px-5
                                        py-3
                                        font-medium
                                        text-slate-500

                                        dark:text-slate-400
                                    "
                                >
                                    Risk
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {data
                                .slice(0, 6)
                                .map((row, index) => (

                                    <tr
                                        key={index}
                                        className="
                                            border-b
                                            border-slate-100
                                            last:border-0
                                            hover:bg-slate-50
                                            transition-colors

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
                                            {row.city || "Unknown"}
                                        </td>

                                        <td
                                            className="
                                                px-5
                                                py-3.5
                                                text-slate-500

                                                dark:text-slate-400
                                            "
                                        >
                                            {row.state || "Unknown"}
                                        </td>

                                        <td className="px-5 py-3.5">

                                            <span
                                                className={`
                                                    inline-flex
                                                    rounded-full
                                                    px-2.5
                                                    py-1
                                                    text-xs
                                                    font-semibold
                                                    ${getRiskStyle(
                                                        row.risk_score
                                                    )}
                                                `}
                                            >
                                                {
                                                    row.risk_score
                                                    ?? "N/A"
                                                }
                                            </span>

                                        </td>

                                    </tr>

                                ))
                            }

                        </tbody>

                    </table>

                )}

            </div>

        </section>

    );
}

export default HeatmapPreview;