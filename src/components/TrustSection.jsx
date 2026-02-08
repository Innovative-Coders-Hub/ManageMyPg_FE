import { motion } from "framer-motion"

const trustPoints = [
  {
    title: "Secure Access & Authentication",
    desc: "Modern login, token-based authentication, and role-controlled access keep your PG data protected.",
    icon: "🔐"
  },
  {
  title: "Transparent Data Access",
  desc: "We handle your PG data responsibly. Data access or export requests are supported in accordance with our terms and applicable policies.",
  icon: "📂"
  },
  {
    title: "Designed for Daily Reliability",
    desc: "Built using proven architecture so the app remains stable even as your PG grows.",
    icon: "🏗️"
  },
  {
    title: "Audit-Friendly & Transparent",
    desc: "Every important action is traceable, helping you stay organized and accountable.",
    icon: "🧾"
  },
  {
  title: "Operate Your PG Under Your Own Name",
  desc: "Register your PG and manage all operations under your business name, while ManageMyPg securely powers everything behind the scenes.",
  icon: "🏢"
},
  {
    title: "Support That Understands PGs",
    desc: "Get help from people who understand PG operations, not just software.",
    icon: "🤝"
  }
]

export default function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 bg-indigo-50 rounded-3xl">
      <div className="text-center mb-12">
        <div className="text-xs uppercase tracking-widest text-indigo-700 font-semibold">
          Trust & reliability
        </div>
        <h2 className="text-3xl font-extrabold mt-2">
          Built to run your PG with confidence
        </h2>
        <p className="mt-3 text-indigo-700 max-w-2xl mx-auto">
          Your operations depend on this system. We’ve designed it to be secure,
          reliable, and transparent from day one.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trustPoints.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="p-6 bg-white rounded-2xl border hover:shadow-lg transition"
          >
            <div className="mb-4 h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
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
