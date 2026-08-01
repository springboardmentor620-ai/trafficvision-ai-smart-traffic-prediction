import { motion } from "framer-motion";
import { FaArrowRight, FaChartLine, FaMapMarkedAlt, FaShieldAlt } from "react-icons/fa";
import Button from "../ui/Button";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">

      {/* Background Blur */}
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT */}

        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >

          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">

            AI Powered Traffic Intelligence

          </span>

          <h1 className="mt-8 text-6xl font-black leading-tight text-slate-900">

            Smarter Roads.

            <br />

            Safer Cities.

          </h1>

          <p className="mt-8 text-xl leading-9 text-gray-600">

            TrafficVision AI helps authorities and organizations
            predict accident severity, analyze traffic patterns,
            monitor congestion, and generate intelligent reports
            using Artificial Intelligence.

          </p>

          <div className="flex gap-5 mt-10">

            <Button>

              Get Started

            </Button>

            <Button variant="secondary">

              Live Demo

              <FaArrowRight className="inline ml-2" />

            </Button>

          </div>

          <div className="flex gap-10 mt-12">

            <div>

              <h2 className="text-4xl font-black text-blue-600">

                20K+

              </h2>

              <p className="text-gray-600">

                Records Analysed

              </p>

            </div>

            <div>

              <h2 className="text-4xl font-black text-blue-600">

                95%

              </h2>

              <p className="text-gray-600">

                Model Accuracy

              </p>

            </div>

            <div>

              <h2 className="text-4xl font-black text-blue-600">

                24×7

              </h2>

              <p className="text-gray-600">

                AI Monitoring

              </p>

            </div>

          </div>

        </motion.div>

        {/* RIGHT */}

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="relative"
        >

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">

            <div className="flex justify-between items-center">

              <div>

                <h2 className="font-bold text-2xl">

                  Traffic Dashboard

                </h2>

                <p className="text-gray-500">

                  Live Monitoring

                </p>

              </div>

              <span className="bg-green-100 text-green-600 px-3 py-2 rounded-full">

                ● Online

              </span>

            </div>

            <div className="mt-10 space-y-5">

              <div className="flex justify-between">

                <span>Risk Score</span>

                <strong className="text-red-500">

                  0.84

                </strong>

              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">

                <div className="bg-red-500 h-3 rounded-full w-4/5"></div>

              </div>

              <div className="grid grid-cols-3 gap-5 mt-8">

                <div className="bg-blue-50 rounded-2xl p-6 text-center">

                  <FaChartLine
                    size={30}
                    className="mx-auto text-blue-600"
                  />

                  <p className="mt-3">

                    Analytics

                  </p>

                </div>

                <div className="bg-cyan-50 rounded-2xl p-6 text-center">

                  <FaMapMarkedAlt
                    size={30}
                    className="mx-auto text-cyan-600"
                  />

                  <p className="mt-3">

                    Heatmap

                  </p>

                </div>

                <div className="bg-red-50 rounded-2xl p-6 text-center">

                  <FaShieldAlt
                    size={30}
                    className="mx-auto text-red-500"
                  />

                  <p className="mt-3">

                    Alerts

                  </p>

                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}

export default Hero;