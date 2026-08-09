import { useState, useEffect } from "react";

import {
    FaHistory,
    FaExclamationTriangle,
    FaRoute,
    FaClock
} from "react-icons/fa";

import DashboardLayout from "../../components/layout/DashboardLayout";

import ReportHeader from "../../components/reports/ReportHeader";
import ReportStats from "../../components/reports/ReportStats";
import ExportButtons from "../../components/reports/ExportButtons";

import PredictionHistoryService
    from "../../services/predictionHistoryService";


function Reports() {

    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [downloadCount, setDownloadCount] =
        useState(() => {

            return Number(
                localStorage.getItem(
                    "trafficvision_report_downloads"
                ) || 0
            );

        });


    useEffect(() => {

        loadHistory();

    }, []);


    async function loadHistory() {

        try {

            setLoading(true);

            setError(null);


            const response =
                await PredictionHistoryService.getHistory(
                    1,
                    100
                );


            let records = [];


            if (Array.isArray(response)) {

                records = response;

            }

            else if (Array.isArray(response?.items)) {

                records = response.items;

            }

            else if (Array.isArray(response?.data)) {

                records = response.data;

            }

            else if (Array.isArray(response?.results)) {

                records = response.results;

            }


            setHistory(records);

        }

        catch (err) {

            console.error(
                "Unable to load prediction history:",
                err
            );

            setError(
                "Unable to load prediction history."
            );

        }

        finally {

            setLoading(false);

        }

    }


    function handleExport() {

        const nextCount =
            downloadCount + 1;


        setDownloadCount(nextCount);


        localStorage.setItem(

            "trafficvision_report_downloads",

            String(nextCount)

        );

    }


    const totalPredictions =
        history.length;


    const highRiskReports =
        history.filter((item) => {

            const risk =
                Number(
                    item.predicted_risk_score || 0
                );


            return risk >= 0.5;

        }).length;


    const averageRisk =
        history.length > 0

            ? Math.round(

                (
                    history.reduce(

                        (sum, item) => {

                            return (
                                sum +
                                Number(
                                    item.predicted_risk_score || 0
                                )
                            );

                        },

                        0

                    ) / history.length
                ) * 100

            )

            : 0;


    function formatDate(value) {

        if (!value) {

            return "-";

        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);

        }


        return date.toLocaleString();

    }


    function getRisk(item) {

        const value =
            Number(
                item.predicted_risk_score || 0
            );


        return Math.round(
            value * 100
        );

    }


    function getRiskLabel(risk) {

        if (risk >= 80) {

            return "High";

        }

        if (risk >= 50) {

            return "Medium";

        }

        return "Low";

    }


    function getRiskClass(risk) {

        if (risk >= 80) {

            return `
                bg-red-500/10
                text-red-400
                border-red-500/20
            `;

        }

        if (risk >= 50) {

            return `
                bg-amber-500/10
                text-amber-400
                border-amber-500/20
            `;

        }

        return `
            bg-emerald-500/10
            text-emerald-400
            border-emerald-500/20
        `;

    }


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

                <div
                    className="
                        mb-10
                    "
                >

                    <ReportHeader />

                </div>


                {/* =================================================
                    REPORT OVERVIEW
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

                                bg-blue-500/10

                                text-blue-400
                            "
                        >

                            <FaHistory />

                        </div>


                        <div>

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    text-white
                                "
                            >
                                Report Overview
                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Summary of recorded prediction
                                activity.
                            </p>

                        </div>

                    </div>


                    <ReportStats

                        totalReports={
                            totalPredictions
                        }

                        totalPredictions={
                            totalPredictions
                        }

                        highRiskReports={
                            highRiskReports
                        }

                        averageRisk={
                            averageRisk
                        }

                    />

                </section>


                {/* =================================================
                    PREDICTION HISTORY
                ================================================= */}

                <section
                    className="
                        mb-10

                        overflow-hidden

                        rounded-3xl

                        border
                        border-slate-700

                        bg-slate-900
                    "
                >

                    {/* SECTION HEADER */}

                    <div
                        className="
                            border-b
                            border-slate-700

                            p-7

                            sm:p-8
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <FaRoute
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
                                    Recent Prediction Reports
                                </h2>


                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-slate-500
                                    "
                                >
                                    Predictions recorded by
                                    the TrafficVision system.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* LOADING */}

                    {loading && (

                        <div
                            className="
                                flex
                                min-h-[280px]
                                items-center
                                justify-center
                                p-8
                            "
                        >

                            <div
                                className="
                                    text-center
                                "
                            >

                                <FaHistory
                                    className="
                                        mx-auto
                                        text-2xl
                                        text-blue-400
                                    "
                                />


                                <p
                                    className="
                                        mt-4
                                        text-sm
                                        font-medium
                                        text-white
                                    "
                                >
                                    Loading prediction history...
                                </p>


                                <p
                                    className="
                                        mt-2
                                        text-xs
                                        text-slate-500
                                    "
                                >
                                    Fetching recorded reports.
                                </p>

                            </div>

                        </div>

                    )}


                    {/* ERROR */}

                    {!loading && error && (

                        <div
                            className="
                                flex
                                min-h-[280px]
                                items-center
                                justify-center
                                p-8
                            "
                        >

                            <div
                                className="
                                    max-w-md
                                    text-center
                                "
                            >

                                <FaExclamationTriangle
                                    className="
                                        mx-auto
                                        text-2xl
                                        text-red-400
                                    "
                                />


                                <p
                                    className="
                                        mt-4
                                        text-sm
                                        font-semibold
                                        text-white
                                    "
                                >
                                    {error}
                                </p>


                                <button
                                    type="button"
                                    onClick={loadHistory}

                                    className="
                                        mt-5

                                        rounded-xl

                                        bg-blue-600

                                        px-5
                                        py-2.5

                                        text-sm
                                        font-medium

                                        text-white

                                        transition

                                        hover:bg-blue-500
                                    "
                                >
                                    Try Again
                                </button>

                            </div>

                        </div>

                    )}


                    {/* EMPTY STATE */}

                    {!loading &&
                    !error &&
                    history.length === 0 && (

                        <div
                            className="
                                flex
                                min-h-[300px]
                                items-center
                                justify-center
                                p-8
                            "
                        >

                            <div
                                className="
                                    max-w-md
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

                                        bg-slate-800

                                        text-slate-500
                                    "
                                >

                                    <FaHistory />

                                </div>


                                <h3
                                    className="
                                        mt-5
                                        text-base
                                        font-semibold
                                        text-white
                                    "
                                >
                                    No Prediction Reports Yet
                                </h3>


                                <p
                                    className="
                                        mt-3
                                        text-sm
                                        leading-7
                                        text-slate-500
                                    "
                                >
                                    Once traffic predictions
                                    are generated, their results
                                    will appear here automatically.
                                </p>

                            </div>

                        </div>

                    )}


                    {/* HISTORY TABLE */}

                    {!loading &&
                    !error &&
                    history.length > 0 && (

                        <div
                            className="
                                overflow-x-auto
                            "
                        >

                            <table
                                className="
                                    w-full
                                    min-w-[900px]
                                    border-collapse
                                "
                            >

                                <thead>

                                    <tr
                                        className="
                                            border-b
                                            border-slate-700
                                        "
                                    >

                                        <th
                                            className="
                                                px-7
                                                py-5

                                                text-left

                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide

                                                text-slate-500
                                            "
                                        >
                                            Date
                                        </th>


                                        <th
                                            className="
                                                px-7
                                                py-5

                                                text-left

                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide

                                                text-slate-500
                                            "
                                        >
                                            City
                                        </th>


                                        <th
                                            className="
                                                px-7
                                                py-5

                                                text-left

                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide

                                                text-slate-500
                                            "
                                        >
                                            Severity
                                        </th>


                                        <th
                                            className="
                                                px-7
                                                py-5

                                                text-left

                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide

                                                text-slate-500
                                            "
                                        >
                                            Risk
                                        </th>


                                        <th
                                            className="
                                                px-7
                                                py-5

                                                text-left

                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide

                                                text-slate-500
                                            "
                                        >
                                            Alert
                                        </th>


                                        <th
                                            className="
                                                px-7
                                                py-5

                                                text-left

                                                text-xs
                                                font-semibold
                                                uppercase
                                                tracking-wide

                                                text-slate-500
                                            "
                                        >
                                            Emergency
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {history.map(
                                        (item, index) => {

                                            const risk =
                                                getRisk(item);


                                            return (

                                                <tr
                                                    key={
                                                        item.id ||
                                                        item._id ||
                                                        index
                                                    }

                                                    className="
                                                        border-b
                                                        border-slate-800

                                                        transition

                                                        hover:bg-slate-800/40
                                                    "
                                                >

                                                    {/* DATE */}

                                                    <td
                                                        className="
                                                            px-7
                                                            py-6

                                                            text-sm
                                                            text-slate-300
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-3
                                                            "
                                                        >

                                                            <FaClock
                                                                className="
                                                                    text-slate-500
                                                                "
                                                            />

                                                            {formatDate(
                                                                item.created_at ||
                                                                item.createdAt ||
                                                                item.date
                                                            )}

                                                        </div>

                                                    </td>


                                                    {/* CITY */}

                                                    <td
                                                        className="
                                                            px-7
                                                            py-6
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                text-sm
                                                                font-medium
                                                                text-white
                                                            "
                                                        >
                                                            {item.city || "-"}
                                                        </p>


                                                        <p
                                                            className="
                                                                mt-1
                                                                text-xs
                                                                text-slate-500
                                                            "
                                                        >
                                                            {item.state || "-"}
                                                        </p>

                                                    </td>


                                                    {/* SEVERITY */}

                                                    <td
                                                        className="
                                                            px-7
                                                            py-6
                                                        "
                                                    >

                                                        <span
                                                            className="
                                                                text-sm
                                                                font-medium
                                                                capitalize
                                                                text-slate-200
                                                            "
                                                        >
                                                            {
                                                                item.predicted_severity ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* RISK */}

                                                    <td
                                                        className="
                                                            px-7
                                                            py-6
                                                        "
                                                    >

                                                        <span
                                                            className={`
                                                                inline-flex
                                                                items-center

                                                                rounded-full

                                                                border

                                                                px-3
                                                                py-1.5

                                                                text-xs
                                                                font-semibold

                                                                ${getRiskClass(
                                                                    risk
                                                                )}
                                                            `}
                                                        >

                                                            {risk}% ·{" "}
                                                            {getRiskLabel(
                                                                risk
                                                            )}

                                                        </span>

                                                    </td>


                                                    {/* ALERT */}

                                                    <td
                                                        className="
                                                            px-7
                                                            py-6

                                                            text-sm
                                                            text-slate-300
                                                        "
                                                    >

                                                        {
                                                            item.traffic_alert ||
                                                            "-"
                                                        }

                                                    </td>


                                                    {/* EMERGENCY */}

                                                    <td
                                                        className="
                                                            px-7
                                                            py-6

                                                            text-sm
                                                            text-slate-300
                                                        "
                                                    >

                                                        {
                                                            item.emergency_level ||
                                                            "-"
                                                        }

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* =================================================
                    EXPORT REPORTS
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
                            gap-7

                            xl:flex-row
                            xl:items-center
                            xl:justify-between
                        "
                    >

                        <div>

                            <h2
                                className="
                                    text-lg
                                    font-semibold
                                    text-white
                                "
                            >
                                Export Reports
                            </h2>


                            <p
                                className="
                                    mt-3
                                    max-w-2xl

                                    text-sm
                                    leading-7

                                    text-slate-400
                                "
                            >
                                Download the currently available
                                prediction history as PDF, Excel
                                or CSV.
                            </p>


                            <p
                                className="
                                    mt-3
                                    text-xs
                                    text-slate-500
                                "
                            >
                                {downloadCount} export
                                {downloadCount === 1
                                    ? ""
                                    : "s"} completed.
                            </p>

                        </div>


                        <div
                            className="
                                w-full
                                xl:w-auto
                            "
                        >

                            <ExportButtons

                                data={history}

                                onExport={
                                    handleExport
                                }

                            />

                        </div>

                    </div>

                </section>


                {/* =================================================
                    BOTTOM BREATHING SPACE
                ================================================= */}

                <div
                    className="
                        h-10
                        w-full
                    "
                />

            </div>

        </DashboardLayout>

    );

}


export default Reports;