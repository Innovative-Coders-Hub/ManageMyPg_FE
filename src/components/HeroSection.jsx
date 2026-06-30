import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, Zap, Shield, BarChart3 } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-pink-50/40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full max-w-7xl">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-200/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Audience tag */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 shadow-sm mb-6"
          >
            <Zap size={14} className="fill-indigo-600" />
            Built for Modern PG & Hostel Owners
          </motion.div>

          <h1 className="text-4xl sm:text-6xl font-black leading-[1.1] tracking-tight text-slate-900">
            Automate your PG{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Operations
            </span>
            <br className="hidden sm:block" /> with zero friction.
          </h1>

          <p className="mt-6 text-slate-600 text-lg sm:text-xl leading-relaxed max-w-xl">
            The all-in-one operating system for PG owners. Track beds, automate rent collection, and manage tenants without the spreadsheet headache.
          </p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/manage/mypg/signup"
              className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-300"
            >
              Get Started
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/manage/mypg/signin"
              className="px-8 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-center"
            >
              Sign in
            </Link>
          </motion.div>

          {/* Trust markers */}
          <motion.div
            className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-6 text-sm font-medium text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-emerald-500" />
              Secure Data
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              99.9% Uptime
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-500" />
              Real-time Insights
            </div>
          </motion.div>
        </motion.div>

        {/* Right dashboard preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative lg:ml-10"
        >
          {/* Decorative backdrop */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 rounded-[3rem] blur-2xl -z-10" />

          <div className="relative rounded-[2rem] border border-slate-200 bg-white p-2 shadow-2xl overflow-hidden group">
            {/* Fake Browser UI */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <div className="ml-4 h-4 w-32 rounded bg-slate-200" />
            </div>

            <div className="p-6 grid grid-cols-2 gap-4 bg-white">
              <DashboardTile
                title="Total Revenue"
                value="₹2,45,000"
                trend="+12%"
                color="bg-indigo-600"
                icon={<BarChart3 size={20} />}
              />
              <DashboardTile
                title="Occupancy"
                value="94%"
                trend="High"
                color="bg-emerald-500"
                icon={<CheckCircle2 size={20} />}
              />
              <DashboardTile
                title="Pending Dues"
                value="₹12,400"
                trend="3 Pending"
                color="bg-rose-500"
                icon={<Shield size={20} />}
              />
              <DashboardTile
                title="Vacancies"
                value="08"
                trend="Next 30d"
                color="bg-amber-500"
                icon={<Zap size={20} />}
              />
            </div>

            {/* Mock Chart Area */}
            <div className="px-6 pb-6 space-y-3">
              <div className="h-2 w-1/4 bg-slate-100 rounded" />
              <div className="flex items-end gap-2 h-24">
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1 + (i * 0.1) }}
                    className="flex-1 bg-indigo-50 rounded-t-sm"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating Card */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden sm:flex items-center gap-4"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">RECENT PAYMENT</p>
              <p className="text-sm font-black">₹8,500 received</p>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}

function DashboardTile({ title, value, color, icon, trend }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
      <div className={`flex items-center justify-center h-8 w-8 rounded-lg text-white mb-3 shadow-md ${color}`}>
        {icon}
      </div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</div>
      <div className="text-xl font-black text-slate-900 mt-1">{value}</div>
      <div className="mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 inline-block px-1.5 py-0.5 rounded">
        {trend}
      </div>
    </div>
  )
}

