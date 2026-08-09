import { useEffect, useState } from "react";

import PredictionHistoryService
    from "../../services/predictionHistoryService";


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


function RecentPredictions() {

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function loadHistory() {

            try {

                const response =
                    await PredictionHistoryService.getHistory();

                setHistory(
                    response.data || []
                );

            } catch (error) {

                console.error(
                    "Failed to load prediction history:",
                    error
                );

            } finally {

                setLoading(false);

            }
        }

        loadHistory();

    }, []);


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
                    border-b
                    border-slate-100
                    px-5
                    py-4

                    dark:border-slate-800
                "
            >

                <h2
                    className="
                        text-base
                        font-semibold
                        text-slate-900
                        dark:text-white
                    "
                >
                    Recent Predictions
                </h2>

                <p
                    className="
                        mt-1
                        text-xs
                        text-slate-500
                        dark:text-slate-400
                    "
                >
                    Latest AI traffic predictions
                </p>

            </div>


            {loading ? (

                <div
                    className="
                        flex
                        min-h-[300px]
                        items-center
                        justify-center
                        text-sm
                        text-slate-400
                    "
                >
                    Loading predictions...
                </div>

            ) : history.length === 0 ? (

                <div
                    className="
                        flex
                        min-h-[300px]
                        items-center
                        justify-center
                        px-5
                        text-center
                        text-sm
                        text-slate-400
                    "
                >
                    No prediction history available.
                </div>

            ) : (

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
                                    Severity
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
                                    Risk
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {history
                                .slice(0, 5)
                                .map((item, index) => (

                                    <tr
                                        key={
                                            item.id ??
                                            index
                                        }
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
                                            {item.city || "Unknown"}
                                        </td>

                                        <td className="px-5 py-3.5">

                                            <span
                                                className="
                                                    inline-flex
                                                    rounded-full
                                                    bg-slate-100
                                                    px-2.5
                                                    py-1
                                                    text-xs
                                                    font-medium
                                                    text-slate-600

                                                    dark:bg-slate-800
                                                    dark:text-slate-300
                                                "
                                            >
                                                {
                                                    item.predicted_severity ||
                                                    "N/A"
                                                }
                                            </span>

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
                                                        item.predicted_risk_score
                                                    )}
                                                `}
                                            >
                                                {
                                                    item.predicted_risk_score ??
                                                    "N/A"
                                                }
                                            </span>

                                        </td>

                                    </tr>

                                ))
                            }

                        </tbody>

                    </table>

                </div>

            )}

        </section>
    );
}

export default RecentPredictions;