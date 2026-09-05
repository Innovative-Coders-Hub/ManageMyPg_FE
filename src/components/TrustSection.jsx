import { motion } from "framer-motion"
import { ShieldCheck, Eye, Zap, ScrollText, Building2, HeartHandshake } from "lucide-react"

const trustPoints = [
  {
    title: "Secure Access & Authentication",
    desc: "Modern login, token-based authentication, and role-controlled access keep your PG data protected.",
    icon: <ShieldCheck className="w-5 h-5" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20"
  },
  {
    title: "Transparent Data Access",
    desc: "We handle your PG data responsibly. Data access or export requests are supported in accordance with our policies.",
    icon: <Eye className="w-5 h-5" />,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20"
  },
  {
    title: "Designed for Daily Reliability",
    desc: "Built using proven architecture so the app remains stable even as your PG grows.",
    icon: <Zap className="w-5 h-5" />,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20"
  },
  {
    title: "Audit-Friendly & Transparent",
    desc: "Every important action is traceable, helping you stay organized and accountable.",
    icon: <ScrollText className="w-5 h-5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20"
  },
  {
    title: "Own Your Business Identity",
    desc: "Register your PG and manage all operations under your business name, while ManageMyPg powers the backend.",
    icon: <Building2 className="w-5 h-5" />,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20"
  },
  {
    title: "Support That Understands PGs",
    desc: "Get help from people who understand PG operations, not just software. We're here for you.",
    icon: <HeartHandshake className="w-5 h-5" />,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20"
  }
]

export default function TrustSection() {
  return (
    <section className="w-full bg-slate-900 py-20 lg:py-28 overflow-hidden relative border-t border-slate-800">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-[0.25em] text-indigo-400 font-black mb-3"
          >
            Enterprise Security
          </motion.div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Built to run your PG with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300">absolute confidence</span>
          </h2>
          <p className="mt-5 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Your operations depend on this system. We’ve designed it to be secure, reliable, and transparent from day one.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustPoints.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="p-7 rounded-2xl bg-slate-850/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all group shadow-xs"
            >
              <div className={`mb-5 h-11 w-11 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 duration-300 ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
              <h3 className="text-base font-black text-white mb-2.5 tracking-tight">
                {item.title}
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
