import { motion } from "framer-motion";

const stats = [
  {
    value: "20,000+",
    label: "Accident Records"
  },
  {
    value: "95%",
    label: "Prediction Accuracy"
  },
  {
    value: "100+",
    label: "Cities Covered"
  },
  {
    value: "24x7",
    label: "AI Monitoring"
  }
];

function Stats() {

  return (

    <section className="bg-slate-900 text-white py-20">

      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">

        {stats.map((item) => (

          <motion.div

            whileHover={{ scale: 1.05 }}

            key={item.label}

            className="text-center"

          >

            <h2 className="text-5xl font-black text-blue-400">

              {item.value}

            </h2>

            <p className="mt-4 text-lg">

              {item.label}

            </p>

          </motion.div>

        ))}

      </div>

    </section>

  );

}

export default Stats;