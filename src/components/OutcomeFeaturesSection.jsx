import { motion } from "framer-motion"

const features = [
  {
    title: "Complete Bed Visibility",
    desc: "Instantly see which beds are filled, vacant, or becoming available soon — no manual tracking needed.",
    icon: "🛏️"
  },
  {
    title: "Vacancy Forecasting",
    desc: "Know upcoming move-outs in advance so you can plan admissions without revenue gaps.",
    icon: "📅"
  },
  {
    title: "Tenant Information in One Place",
    desc: "Store tenant profiles, ID details, stay history, and notes securely and access them anytime.",
    icon: "👥"
  },
  {
    title: "Rent, Deposits & Dues",
    desc: "Track rent collection, advances, refunds, and pending dues with complete transparency.",
    icon: "💸"
  },
  {
    title: "Live Dashboard Insights",
    desc: "See total beds, occupancy, collections, and trends at a glance — always up to date.",
    icon: "📊"
  },
  {
    title: "Secure & Role-Based Access",
    desc: "Your data stays protected with controlled access, audit logs, and modern authentication.",
    icon: "🔒"
  }
]

export default function OutcomeFeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="text-center mb-12">
        <div className="text-xs uppercase tracking-widest text-indigo-600 font-semibold">
          What you can achieve
        </div>
        <h2 className="text-3xl font-extrabold mt-2">
          Everything you need to run your PG smoothly
        </h2>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          Built to replace spreadsheets, notebooks, and guesswork with clarity and control.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="p-6 rounded-2xl border bg-white hover:shadow-lg transition"
          >
            <div className="mb-4 h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">
              {item.icon}
            </div>
            <h3 className="font-semibold text-gray-800">
              {item.title}
            </h3>
            <p className="mt-2 text-gray-600 text-sm">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
