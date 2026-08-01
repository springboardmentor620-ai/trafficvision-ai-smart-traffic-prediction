import {
    FaDatabase,
    FaBrain,
    FaBell,
    FaChartBar
} from "react-icons/fa";

const steps = [

    {
        icon: <FaDatabase size={42} />,
        title: "Collect Data",
        description:
            "Traffic, weather, road conditions and accident data are collected from multiple sources."
    },

    {
        icon: <FaBrain size={42} />,
        title: "AI Prediction",
        description:
            "Machine learning models predict accident severity and traffic risk in real time."
    },

    {
        icon: <FaBell size={42} />,
        title: "Smart Alerts",
        description:
            "Generate intelligent traffic alerts and emergency recommendations instantly."
    },

    {
        icon: <FaChartBar size={42} />,
        title: "Analytics",
        description:
            "Interactive dashboards and reports help authorities make better decisions."
    }

];

function HowItWorks() {

    return (

        <section className="py-28 bg-slate-50">

            <div className="max-w-7xl mx-auto px-8">

                <h2 className="text-5xl font-bold text-center">

                    How TrafficVision Works

                </h2>

                <p className="text-center mt-5 text-gray-500 text-lg">

                    AI-powered workflow from data collection to intelligent traffic insights.

                </p>

                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10 mt-20">

                    {

                        steps.map((step, index) => (

                            <div

                                key={index}

                                className="relative bg-white rounded-3xl shadow-lg p-10 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"

                            >

                                <div className="text-blue-600">

                                    {step.icon}

                                </div>

                                <h3 className="mt-8 text-2xl font-bold">

                                    {step.title}

                                </h3>

                                <p className="mt-5 text-gray-600 leading-8">

                                    {step.description}

                                </p>

                                <div

                                    className="absolute top-6 right-6 text-5xl font-black text-slate-100"

                                >

                                    0{index + 1}

                                </div>

                            </div>

                        ))

                    }

                </div>

            </div>

        </section>

    );

}

export default HowItWorks;