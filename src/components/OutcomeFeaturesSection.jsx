import { motion } from "framer-motion"
import { Bed, CalendarDays, Users2, Banknote, LineChart, LockKeyhole } from "lucide-react"

const features = [
  {
    title: "Complete Bed Visibility",
    desc: "Instantly see which beds are filled, vacant, or becoming available soon — no manual tracking needed.",
    icon: <Bed className="w-5 h-5" />,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Vacancy Forecasting",
    desc: "Know upcoming move-outs in advance so you can plan admissions without revenue gaps.",
    icon: <CalendarDays className="w-5 h-5" />,
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "Centralized Tenant Data",
    desc: "Store profiles, KYC documents, stay history, and notes securely and access them from any device.",
    icon: <Users2 className="w-5 h-5" />,
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    title: "Rent & Dues Automation",
    desc: "Track collections, advances, refunds, and pending dues with complete transparency and automated logs.",
    icon: <Banknote className="w-5 h-5" />,
    color: "bg-amber-50 text-amber-600"
  },
  {
    title: "Real-time Intelligence",
    desc: "See total occupancy, revenue trends, and operational health at a glance — always up to date.",
    icon: <LineChart className="w-5 h-5" />,
    color: "bg-rose-50 text-rose-600"
  },
  {
    title: "Enterprise-Grade Security",
    desc: "Your data stays protected with bank-level encryption, role-based access, and modern authentication.",
    icon: <LockKeyhole className="w-5 h-5" />,
    color: "bg-indigo-50 text-indigo-600"
  }
]

export default function OutcomeFeaturesSection() {
  return (
    <section className="w-full bg-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-black mb-3"
          >
            Powerful Capabilities
          </motion.div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Everything you need to <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">run your PG at peak efficiency</span>
          </h2>
          <p className="mt-6 text-slate-600 text-lg max-w-2xl mx-auto font-medium">
            Built to replace spreadsheets and guesswork with high-density information and actionable insights.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group p-8 rounded-[2rem] border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300"
            >
              <div className={`mb-6 h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${item.color}`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
