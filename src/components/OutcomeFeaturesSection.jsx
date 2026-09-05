import { motion } from "framer-motion"
import { Bed, CalendarDays, Users2, Banknote, LineChart, LockKeyhole } from "lucide-react"

const features = [
  {
    title: "Complete Bed Visibility",
    desc: "Instantly see which beds are filled, vacant, or becoming available soon — no manual tracking needed.",
    icon: <Bed className="w-5 h-5" />,
    color: "bg-blue-50 text-blue-600 border-blue-100"
  },
  {
    title: "Vacancy Forecasting",
    desc: "Know upcoming move-outs in advance so you can plan admissions without revenue gaps.",
    icon: <CalendarDays className="w-5 h-5" />,
    color: "bg-purple-50 text-purple-600 border-purple-100"
  },
  {
    title: "Centralized Tenant Data",
    desc: "Store profiles, KYC documents, stay history, and notes securely and access them from any device.",
    icon: <Users2 className="w-5 h-5" />,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100"
  },
  {
    title: "Rent & Dues Automation",
    desc: "Track collections, advances, refunds, and pending dues with complete transparency and automated logs.",
    icon: <Banknote className="w-5 h-5" />,
    color: "bg-amber-50 text-amber-600 border-amber-100"
  },
  {
    title: "Real-time Intelligence",
    desc: "See total occupancy, revenue trends, and operational health at a glance — always up to date.",
    icon: <LineChart className="w-5 h-5" />,
    color: "bg-rose-50 text-rose-600 border-rose-100"
  },
  {
    title: "Enterprise-Grade Security",
    desc: "Your data stays protected with bank-level encryption, role-based access, and modern authentication.",
    icon: <LockKeyhole className="w-5 h-5" />,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100"
  }
]

export default function OutcomeFeaturesSection() {
  return (
    <section className="w-full bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-[0.25em] text-indigo-600 font-black mb-3"
          >
            Powerful Capabilities
          </motion.div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Everything you need to <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500">run your PG at peak efficiency</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-bold leading-relaxed">
            Built to replace spreadsheets and guesswork with high-density information and actionable insights.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group p-7 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className={`mb-5 h-11 w-11 rounded-xl flex items-center justify-center border shadow-2xs transition-transform group-hover:scale-105 duration-300 ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2.5 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-bold">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
