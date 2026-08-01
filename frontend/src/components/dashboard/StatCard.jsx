function StatCard({

    title,

    value,

    color,

    icon

}) {

    return (

        <div
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300"
        >

            <div className="flex justify-between items-center">

                <div>

                    <p className="text-gray-500">

                        {title}

                    </p>

                    <h2
                        className={`text-4xl font-bold mt-4 ${color}`}
                    >

                        {value}

                    </h2>

                </div>

                <div
                    className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl"
                >

                    {icon}

                </div>

            </div>

        </div>

    );

}

export default StatCard;