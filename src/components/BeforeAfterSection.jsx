import { motion } from "framer-motion"
import { XCircle, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react"

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
    <section className="w-full bg-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section header */}
        <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-black mb-3"
        >
          The Transformation
        </motion.div>
         <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          From daily chaos to <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">complete operational clarity</span>
         </h2>
         <p className="mt-6 max-w-2xl mx-auto text-slate-600 text-lg">
          Managing a PG shouldn't feel like a second job. See how ManageMyPg reclaims your time and peace of mind.
         </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        {/* BEFORE CARD */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[2.5rem] border border-slate-200 bg-slate-50/50 p-8 md:p-12 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <AlertTriangle size={120} className="text-slate-400" />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-8">
              <XCircle size={14} />
              The Old Way
            </span>

            <ul className="space-y-5">
              {beforeItems.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 group-hover:bg-rose-50 group-hover:border-rose-200 group-hover:text-rose-500 transition-colors">
                    <XCircle size={14} />
                  </div>
                  <span className="text-slate-600 font-medium">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* AFTER CARD */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[2.5rem] border border-indigo-100 bg-white p-8 md:p-12 shadow-2xl shadow-indigo-100 overflow-hidden"
        >
          {/* Decorative Gradient Glow */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />

          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Sparkles size={120} className="text-indigo-400" />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider mb-8 shadow-lg shadow-indigo-200">
              <CheckCircle2 size={14} />
              The ManageMyPg Way
            </span>

            <ul className="space-y-5">
              {afterItems.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-slate-800 font-bold">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
)
}

