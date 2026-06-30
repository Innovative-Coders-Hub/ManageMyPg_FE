import { motion } from "framer-motion"
import { ShieldCheck, Eye, Zap, ScrollText, Building2, HeartHandshake } from "lucide-react"

const trustPoints = [
  {
    title: "Secure Access & Authentication",
    desc: "Modern login, token-based authentication, and role-controlled access keep your PG data protected.",
    icon: <ShieldCheck className="w-5 h-5" />,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    title: "Transparent Data Access",
    desc: "We handle your PG data responsibly. Data access or export requests are supported in accordance with our policies.",
    icon: <Eye className="w-5 h-5" />,
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    title: "Designed for Daily Reliability",
    desc: "Built using proven architecture so the app remains stable even as your PG grows.",
    icon: <Zap className="w-5 h-5" />,
    color: "text-amber-600",
    bg: "bg-amber-50"
  },
  {
    title: "Audit-Friendly & Transparent",
    desc: "Every important action is traceable, helping you stay organized and accountable.",
    icon: <ScrollText className="w-5 h-5" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    title: "Own Your Business Identity",
    desc: "Register your PG and manage all operations under your business name, while ManageMyPg powers the backend.",
    icon: <Building2 className="w-5 h-5" />,
    color: "text-rose-600",
    bg: "bg-rose-50"
  },
  {
    title: "Support That Understands PGs",
    desc: "Get help from people who understand PG operations, not just software. We're here for you.",
    icon: <HeartHandshake className="w-5 h-5" />,
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  }
]

export default function TrustSection() {
  return (
    <section className="w-full bg-slate-900 py-24 overflow-hidden relative">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.2em] text-indigo-400 font-black mb-3"
          >
            Enterprise Security
          </motion.div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Built to run your PG with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">absolute confidence</span>
          </h2>
          <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto font-medium">
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
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-500/50 hover:bg-slate-800/60 transition-all group"
            >
              <div className={`mb-6 h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-black text-white mb-3">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

