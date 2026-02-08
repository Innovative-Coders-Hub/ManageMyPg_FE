import { motion } from "framer-motion"

const steps = [
  {
    step: "01",
    title: "Set up your PG",
    desc: "Add your PG, rooms, floors, and total beds in a few minutes. No technical knowledge required.",
    bg: "bg-blue-50",
    badge: "bg-blue-600 text-white"
  },
  {
    step: "02",
    title: "Add tenants & assign beds",
    desc: "Register tenants, assign beds, and store their details securely in one place.",
    bg: "bg-purple-50",
    badge: "bg-purple-600 text-white"
  },
  {
    step: "03",
    title: "Track rent, dues & vacancies",
    desc: "Monitor payments, pending dues, and upcoming vacancies from a live dashboard.",
    bg: "bg-green-50",
    badge: "bg-green-600 text-white"
  }
]

export default function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 rounded-3xl
                        bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-xs uppercase tracking-widest text-indigo-600 font-semibold">
          How it works
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
          Manage your PG in 3 simple steps
        </h2>
        <p className="mt-3 text-sm text-gray-600 max-w-xl mx-auto">
          Designed for PG owners — simple to start, powerful as you grow.
        </p>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((item, index) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12, duration: 0.45 }}
            className={`rounded-2xl border p-6 ${item.bg}
                        hover:shadow-md transition`}
          >
            {/* Step badge */}
            <div
              className={`inline-flex items-center justify-center
                          h-9 w-9 rounded-full text-sm font-extrabold
                          ${item.badge}`}
            >
              {item.step}
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-800">
              {item.title}
            </h3>

            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
