function StatCard({
    title,
    value,
    color,
    icon
}) {

    return (
        <div
            className="
                min-w-0
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-5
                py-5
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-md

                dark:border-slate-800
                dark:bg-slate-900
            "
        >

            <div className="flex items-center justify-between gap-4">

                <div className="min-w-0">

                    <p
                        className="
                            text-xs
                            font-medium
                            text-slate-500
                            dark:text-slate-400
                        "
                    >
                        {title}
                    </p>

                    <h2
                        className={`
                            mt-2
                            text-3xl
                            font-bold
                            tracking-tight
                            ${color}
                        `}
                    >
                        {value}
                    </h2>

                </div>


                <div
                    className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-lg
                        text-slate-600

                        dark:bg-slate-800
                        dark:text-slate-300
                    "
                >
                    {icon}
                </div>

            </div>

        </div>
    );
}

export default StatCard;