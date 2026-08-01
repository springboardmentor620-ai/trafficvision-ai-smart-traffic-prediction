import {
  FaRobot,
  FaMapMarkedAlt,
  FaChartLine,
  FaFileDownload,
} from "react-icons/fa";

const features = [
  {
    icon: <FaRobot size={40} className="text-blue-600" />,
    title: "AI Prediction",
    description:
      "Predict accident severity and traffic risk using Machine Learning."
  },
  {
    icon: <FaMapMarkedAlt size={40} className="text-green-600" />,
    title: "Heatmap",
    description:
      "Visualize accident-prone areas using interactive maps."
  },
  {
    icon: <FaChartLine size={40} className="text-red-500" />,
    title: "Analytics",
    description:
      "Interactive dashboard with traffic trends and charts."
  },
  {
    icon: <FaFileDownload size={40} className="text-purple-600" />,
    title: "Reports",
    description:
      "Download professional PDF, Excel and CSV reports."
  }
];

function Features() {
  return (
    <section className="py-24 bg-white">

      <h2 className="text-4xl font-bold text-center mb-14">

        Powerful Features

      </h2>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-10">

        {features.map((feature) => (

          <div
            key={feature.title}
            className="shadow-lg rounded-2xl p-8 hover:shadow-2xl transition duration-300 bg-white"
          >

            {feature.icon}

            <h3 className="text-xl font-bold mt-5">

              {feature.title}

            </h3>

            <p className="text-gray-600 mt-4">

              {feature.description}

            </p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Features;