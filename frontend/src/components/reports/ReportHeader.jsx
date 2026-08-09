import {
    FaFileAlt,
    FaDatabase
} from "react-icons/fa";


function ReportHeader() {

    return (

        <div
            className="
                flex
                flex-col
                gap-5

                lg:flex-row
                lg:items-end
                lg:justify-between
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
                            h-11
                            w-11
                            items-center
                            justify-center

                            rounded-xl

                            bg-blue-500/10

                            text-blue-400
                        "
                    >

                        <FaFileAlt size={18} />

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
                        Reporting Center
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
                    Traffic Reports
                </h1>


                <p
                    className="
                        mt-3
                        max-w-2xl

                        text-sm
                        leading-7

                        text-slate-400
                    "
                >
                    Review prediction history, analyze traffic
                    risk results and export reports for further
                    analysis.
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
                    border-emerald-500/20

                    bg-emerald-500/5

                    px-5
                    py-3

                    text-xs
                    font-medium

                    text-emerald-400
                "
            >

                <FaDatabase />

                Prediction Database Connected

            </div>

        </div>

    );

}


export default ReportHeader;