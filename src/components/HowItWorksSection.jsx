import { motion } from "framer-motion"
import { ClipboardList, UserPlus, BarChart3, ArrowRight } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Onboard your PG",
    desc: "Set up your floors, rooms, and beds in under 5 minutes. Our intuitive builder makes it effortless.",
    icon: <ClipboardList className="w-6 h-6" />,
    color: "indigo"
  },
  {
    step: "02",
    title: "Digital Enrollment",
    desc: "Register tenants, capture KYC documents, and assign beds with a single click. No more paper forms.",
    icon: <UserPlus className="w-6 h-6" />,
    color: "purple"
  },
  {
    step: "03",
    title: "Automate & Scale",
    desc: "Track occupancy, manage dues, and monitor vacancies. Watch your business grow with zero stress.",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "pink"
  }
]

export default function HowItWorksSection() {
  return (
    <section className="w-full bg-slate-50/70 py-20 lg:py-28 relative overflow-hidden border-y border-slate-200/80">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[30%] h-[40%] rounded-full bg-indigo-100/50 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-pink-100/50 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] uppercase tracking-[0.25em] text-indigo-600 font-black mb-3"
          >
            Simple Process
          </motion.div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Manage your empire in <span className="text-indigo-600">3 steps</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base sm:text-lg max-w-xl mx-auto font-bold leading-relaxed">
            We've distilled complex PG operations into a streamlined workflow designed for busy owners.
          </p>
        </div>

        {/* Steps Container */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 border-t-2 border-dashed border-slate-200 -translate-y-8 -z-0" />

          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="group relative flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 z-10"
            >
              {/* Step Number Circle */}
              <div className="mb-6 relative h-16 w-16 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs group-hover:scale-110 transition-transform duration-300">
                <div className="absolute -top-2.5 -right-2.5 h-7 w-7 rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                  {item.step}
                </div>
                {item.icon}
              </div>

              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-3">
                {item.title}
              </h3>

              <p className="text-slate-600 font-bold text-xs sm:text-sm leading-relaxed">
                {item.desc}
              </p>

              {index < 2 && (
                <div className="lg:hidden mt-6 text-slate-300">
                  <ArrowRight className="rotate-90 w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
