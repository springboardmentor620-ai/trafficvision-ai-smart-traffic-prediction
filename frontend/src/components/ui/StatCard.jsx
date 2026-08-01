function StatCard({

    title,

    value,

    icon,

    color = "text-blue-600"

}) {

    return (

        <div

            className="

                bg-white

                rounded-2xl

                shadow-md

                border

                border-slate-200

                p-6

                hover:shadow-xl

                transition

            "

        >

            <div className="flex justify-between">

                <div>

                    <p className="text-slate-500">

                        {title}

                    </p>

                    <h2

                        className="

                            text-3xl

                            font-bold

                            mt-2

                        "

                    >

                        {value}

                    </h2>

                </div>

                <div

                    className={`

                        text-4xl

                        ${color}

                    `}

                >

                    {icon}

                </div>

            </div>

        </div>

    );

}

export default StatCard;