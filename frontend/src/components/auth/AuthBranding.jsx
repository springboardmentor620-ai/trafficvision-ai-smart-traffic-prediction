import { FaTrafficLight } from "react-icons/fa";

function AuthBranding() {

    return (

        <div
            className="
                hidden
                lg:flex
                flex-col
                justify-center
                items-center
                bg-gradient-to-br
                from-blue-700
                via-blue-600
                to-cyan-500
                text-white
                p-16
            "
        >

            <FaTrafficLight

                size={90}

                className="mb-8"

            />

            <h1
                className="
                    text-5xl
                    font-extrabold
                    text-center
                "
            >

                TrafficVision AI

            </h1>

            <p
                className="
                    text-xl
                    mt-8
                    text-center
                    leading-9
                    opacity-90
                "
            >

                AI Powered Smart Traffic Prediction,
                Risk Analysis and Intelligent Decision
                Support Platform.

            </p>

            <div
                className="
                    mt-16
                    grid
                    grid-cols-2
                    gap-8
                    w-full
                "
            >

                <div>

                    <h2 className="text-4xl font-bold">

                        95%

                    </h2>

                    <p>

                        Prediction Accuracy

                    </p>

                </div>

                <div>

                    <h2 className="text-4xl font-bold">

                        100+

                    </h2>

                    <p>

                        Supported Cities

                    </p>

                </div>

                <div>

                    <h2 className="text-4xl font-bold">

                        24/7

                    </h2>

                    <p>

                        Monitoring

                    </p>

                </div>

                <div>

                    <h2 className="text-4xl font-bold">

                        AI

                    </h2>

                    <p>

                        Risk Detection

                    </p>

                </div>

            </div>

        </div>

    );

}

export default AuthBranding;