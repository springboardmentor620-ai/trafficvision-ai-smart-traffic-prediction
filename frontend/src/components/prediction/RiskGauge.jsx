function RiskGauge({ riskScore }) {

    if (riskScore === undefined || riskScore === null) {

        return null;

    }

    const percentage = Math.round(riskScore * 100);

    let color = "bg-green-500";

    if (percentage >= 70) {

        color = "bg-red-500";

    }

    else if (percentage >= 40) {

        color = "bg-yellow-500";

    }

    return (

        <div className="bg-white rounded-2xl shadow-lg p-8">

            <h2 className="text-2xl font-bold mb-8">

                Risk Meter

            </h2>

            <div className="w-full bg-gray-200 rounded-full h-6">

                <div

                    className={`${color} h-6 rounded-full transition-all duration-700`}

                    style={{

                        width: `${percentage}%`

                    }}

                />

            </div>

            <div className="mt-6 flex justify-between">

                <span>

                    Low

                </span>

                <span className="font-bold text-xl">

                    {percentage}%

                </span>

                <span>

                    High

                </span>

            </div>

        </div>

    );

}

export default RiskGauge;