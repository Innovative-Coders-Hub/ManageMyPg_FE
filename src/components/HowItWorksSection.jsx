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
    <section className="w-full bg-slate-50 py-24 relative overflow-hidden border-y border-slate-100">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[30%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-pink-100/40 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 relative">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-black mb-3"
          >
            Simple Process
          </motion.div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Manage your empire in <span className="text-indigo-600">3 steps</span>
          </h2>
          <p className="mt-6 text-slate-600 text-lg max-w-xl mx-auto font-medium">
            We've distilled complex PG operations into a streamlined workflow designed for busy owners.
          </p>
        </div>

        {/* Steps Container */}
        <div className="grid lg:grid-cols-3 gap-12 relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-slate-100 -translate-y-1/2 -z-10" />

          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="group relative flex flex-col items-center text-center px-6"
            >
              {/* Step Number Circle */}
              <div className={`mb-8 relative h-20 w-20 flex items-center justify-center rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 group-hover:shadow-indigo-100 group-hover:-translate-y-2 transition-all duration-300`}>
                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center border-4 border-white">
                  {item.step}
                </div>
                <div className="text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-4">
                {item.title}
              </h3>

              <p className="text-slate-500 font-medium leading-relaxed">
                {item.desc}
              </p>

              {index < 2 && (
                <div className="lg:hidden mt-8 text-slate-200">
                  <ArrowRight className="rotate-90 w-6 h-6" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
