import { motion } from "framer-motion"

const beforeItems = [
  "Excel sheets and handwritten notes",
  "Unclear bed availability",
  "Missed or delayed rent tracking",
  "No visibility on upcoming vacating",
  "Too many WhatsApp messages to manage"
]

const afterItems = [
  "Single live dashboard for your PG",
  "Real-time bed and tenant visibility",
  "Clear rent, dues, and payment history",
  "Upcoming vacancies visible in advance",
  "Everything structured and organized"
]

export default function BeforeAfterSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      {/* Section header */}
      <div className="text-center mb-12">
        <div className="text-xs uppercase tracking-widest text-indigo-500 font-semibold">
          The difference
        </div>
         <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold">
          From daily confusion to complete clarity
         </h2>
         <p className="mt-4 max-w-2xl mx-auto text-gray-600">
          A clear comparison of how PG management feels before and after using ManageMyPg.
         </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* BEFORE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl border bg-gradient-to-br from-gray-50 to-white p-7"
        >
          {/* Header */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1.5 rounded-full bg-gray-700 text-white text-xs font-semibold">
              Before ManageMyPg
            </span>
          </div>

          <ul className="mt-5 space-y-3">
            {beforeItems.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="flex items-start gap-3 rounded-lg
                           bg-gray-100/80 px-3 py-2
                           text-sm text-gray-700"
              >
                <span className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full
                                 bg-red-100 text-red-500 text-xs">
                  ✕
                </span>
                <span className="leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* AFTER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="relative rounded-2xl border border-indigo-400
                     bg-gradient-to-br from-indigo-50 via-white to-white
                     p-7 shadow-sm"
        >
          {/* Subtle glow */}
          <div className="absolute inset-0 -z-10 rounded-2xl bg-indigo-400/10 blur-xl" />

          {/* Header */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold">
              After ManageMyPg
            </span>
          </div>

          <ul className="mt-5 space-y-3">
            {afterItems.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="flex items-start gap-3 rounded-lg
                           bg-indigo-100/70 px-3 py-2
                           text-sm text-indigo-900"
              >
                <span className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full
                                 bg-green-200 text-green-700 text-xs">
                  ✓
                </span>
                <span className="leading-relaxed font-medium">
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
