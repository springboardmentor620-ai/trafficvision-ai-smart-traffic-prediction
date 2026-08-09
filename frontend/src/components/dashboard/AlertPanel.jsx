import {
    FaBell,
    FaCheckCircle,
    FaArrowRight
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";


function AlertPanel({ activeAlerts = 0 }) {

    const navigate = useNavigate();

    const hasAlerts =
        Number(activeAlerts) > 0;


    return (
        <section
            className="
                min-w-0
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
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
                    gap-4
                "
            >

                <div>

                    <div className="flex items-center gap-3">

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-amber-50
                                text-amber-500

                                dark:bg-amber-950/40
                                dark:text-amber-400
                            "
                        >
                            <FaBell />
                        </div>

                        <div>

                            <h2
                                className="
                                    text-base
                                    font-semibold
                                    text-slate-900
                                    dark:text-white
                                "
                            >
                                Active Alerts
                            </h2>

                            <p
                                className="
                                    mt-0.5
                                    text-xs
                                    text-slate-500
                                    dark:text-slate-400
                                "
                            >
                                Current traffic events
                            </p>

                        </div>

                    </div>

                </div>


                <span
                    className={`
                        rounded-full
                        px-2.5
                        py-1
                        text-xs
                        font-semibold
                        ${
                            hasAlerts
                                ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                        }
                    `}
                >
                    {activeAlerts} Active
                </span>

            </div>


            {hasAlerts ? (

                <div
                    className="
                        mt-5
                        rounded-xl
                        border
                        border-amber-100
                        bg-amber-50
                        p-4

                        dark:border-amber-900/40
                        dark:bg-amber-950/20
                    "
                >

                    <div className="flex gap-3">

                        <div
                            className="
                                mt-0.5
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-white
                                text-amber-500

                                dark:bg-slate-900
                            "
                        >
                            <FaBell />
                        </div>

                        <div>

                            <p
                                className="
                                    text-sm
                                    font-semibold
                                    text-slate-900
                                    dark:text-white
                                "
                            >
                                {activeAlerts} traffic alert
                                {activeAlerts !== 1 ? "s" : ""}
                                {" "}detected
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-xs
                                    leading-5
                                    text-slate-500
                                    dark:text-slate-400
                                "
                            >
                                Review the Alerts section
                                for detailed traffic events
                                and severity.
                            </p>

                        </div>

                    </div>

                </div>

            ) : (

                <div
                    className="
                        mt-5
                        flex
                        min-h-[210px]
                        flex-col
                        items-center
                        justify-center
                        rounded-xl
                        bg-emerald-50
                        px-6
                        text-center

                        dark:bg-emerald-950/20
                    "
                >

                    <div
                        className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                            text-emerald-500

                            dark:bg-slate-900
                        "
                    >
                        <FaCheckCircle />
                    </div>

                    <p
                        className="
                            mt-3
                            text-sm
                            font-semibold
                            text-slate-800
                            dark:text-slate-200
                        "
                    >
                        No active traffic alerts
                    </p>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-500
                            dark:text-slate-400
                        "
                    >
                        The system currently reports
                        normal alert status.
                    </p>

                </div>

            )}


            <button
                type="button"
                onClick={() => navigate("/alerts")}
                className="
                    mt-4
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:border-blue-200
                    hover:bg-blue-50
                    hover:text-blue-600

                    dark:border-slate-700
                    dark:text-slate-300
                    dark:hover:border-blue-800
                    dark:hover:bg-blue-950/30
                    dark:hover:text-blue-400
                "
            >

                View Alert Center

                <FaArrowRight size={12} />

            </button>

        </section>
    );
}

export default AlertPanel;