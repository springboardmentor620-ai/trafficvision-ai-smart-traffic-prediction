function DashboardHeader() {

    return (
        <header
            className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-end
                sm:justify-between
            "
        >

            <div>

                <p
                    className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        text-blue-600

                        dark:text-blue-400
                    "
                >
                    Traffic Intelligence
                </p>

                <h1
                    className="
                        mt-1
                        text-3xl
                        font-bold
                        tracking-tight
                        text-slate-900

                        dark:text-white
                    "
                >
                    Dashboard
                </h1>

                <p
                    className="
                        mt-1.5
                        text-sm
                        text-slate-500

                        dark:text-slate-400
                    "
                >
                    Traffic intelligence overview
                </p>

            </div>


            <div
                className="
                    inline-flex
                    w-fit
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-slate-600
                    shadow-sm

                    dark:border-slate-800
                    dark:bg-slate-900
                    dark:text-slate-300
                "
            >

                <span
                    className="
                        h-2
                        w-2
                        rounded-full
                        bg-emerald-500
                    "
                />

                System Online

            </div>

        </header>
    );
}

export default DashboardHeader;