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
    <section className="w-full bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-[0.25em] text-indigo-600 font-black mb-3"
          >
            The Transformation
          </motion.div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            From daily chaos to <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500">complete operational clarity</span>
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-slate-600 text-base sm:text-lg font-bold leading-relaxed">
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
            className="relative rounded-3xl border border-slate-200/80 bg-slate-50/70 p-7 md:p-10 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <AlertTriangle size={140} className="text-slate-400" />
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-black uppercase tracking-widest mb-8 border border-slate-300/60">
                <XCircle size={14} className="text-slate-500" />
                The Old Way
              </span>

              <ul className="space-y-4">
                {beforeItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-center gap-3.5 p-3 rounded-xl bg-white/70 border border-slate-200/60 hover:border-rose-200 transition-colors group"
                  >
                    <div className="h-6 w-6 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 shrink-0 border border-rose-100">
                      <XCircle size={14} />
                    </div>
                    <span className="text-slate-700 font-bold text-xs sm:text-sm">{item}</span>
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
            className="relative rounded-3xl border border-indigo-100 bg-white p-7 md:p-10 shadow-xl shadow-indigo-100/60 overflow-hidden"
          >
            {/* Decorative Gradient Glow */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles size={140} className="text-indigo-500" />
            </div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest mb-8 shadow-xs">
                <CheckCircle2 size={14} />
                The ManageMyPg Way
              </span>

              <ul className="space-y-4">
                {afterItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="flex items-center gap-3.5 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100/80 hover:border-indigo-200 transition-colors group"
                  >
                    <div className="h-6 w-6 flex items-center justify-center rounded-lg bg-indigo-600 text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-slate-900 font-black text-xs sm:text-sm">{item}</span>
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
