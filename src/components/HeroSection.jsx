import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, Zap, Shield, BarChart3, Sparkles } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-28 bg-[#F8FAFC]">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/60 via-white to-purple-50/50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-purple-200/30 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-200/30 blur-[130px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Audience tag */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-black uppercase tracking-widest border border-indigo-100/80 shadow-2xs mb-6"
          >
            <Zap size={13} className="fill-indigo-600 text-indigo-600" />
            Built for Modern PG & Hostel Owners
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-slate-900">
            Automate your PG{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500">
              Operations
            </span>
            <br className="hidden sm:block" /> with zero friction.
          </h1>

          <p className="mt-5 text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl font-bold">
            The all-in-one operating system for PG owners. Track beds, automate rent collection, and manage tenants without the spreadsheet headache.
          </p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-3.5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              to="/manage/mypg/signup"
              className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              Get Started
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/manage/mypg/signin"
              className="px-7 py-3.5 rounded-xl border border-slate-300/80 bg-white text-slate-800 font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-slate-400 transition-all text-center cursor-pointer shadow-2xs active:scale-95"
            >
              Sign in
            </Link>
          </motion.div>

          {/* Trust markers */}
          <motion.div
            className="mt-10 pt-6 border-t border-slate-200/80 flex flex-wrap gap-6 text-xs font-black uppercase tracking-widest text-slate-500"
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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative lg:ml-6"
        >
          {/* Decorative backdrop */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-pink-500/20 rounded-[2.5rem] blur-2xl -z-10" />

          <div className="relative rounded-3xl border border-slate-200/90 bg-white p-2.5 shadow-2xl overflow-hidden group">
            {/* Fake Browser UI */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="h-4 w-36 rounded-md bg-slate-200/60 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center">
                app.managemypg.com
              </div>
              <div className="w-4" />
            </div>

            <div className="p-5 grid grid-cols-2 gap-3.5 bg-white">
              <DashboardTile
                title="Total Revenue"
                value="₹2,45,000"
                trend="+12%"
                color="bg-indigo-600 text-white"
                icon={<BarChart3 size={18} />}
              />
              <DashboardTile
                title="Occupancy"
                value="94%"
                trend="High"
                color="bg-emerald-500 text-white"
                icon={<CheckCircle2 size={18} />}
              />
              <DashboardTile
                title="Pending Dues"
                value="₹12,400"
                trend="3 Pending"
                color="bg-rose-500 text-white"
                icon={<Shield size={18} />}
              />
              <DashboardTile
                title="Vacancies"
                value="08"
                trend="Next 30d"
                color="bg-amber-500 text-white"
                icon={<Zap size={18} />}
              />
            </div>

            {/* Mock Chart Area */}
            <div className="px-5 pb-5 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="h-2 w-1/4 bg-slate-200/80 rounded-full" />
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Monthly Growth</span>
              </div>
              <div className="flex items-end gap-2 h-24 pt-2">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.8 + (i * 0.1) }}
                    className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-md hover:from-indigo-600 hover:to-indigo-500 transition-all cursor-pointer"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating Card */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="absolute -bottom-5 -left-5 bg-white p-3.5 px-4 rounded-2xl shadow-xl border border-slate-200/80 hidden sm:flex items-center gap-3.5 z-20"
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[8.5px] text-slate-400 font-black uppercase tracking-widest">RECENT PAYMENT</p>
              <p className="text-xs font-black text-slate-900">₹8,500 received</p>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}

function DashboardTile({ title, value, color, icon, trend }) {
  return (
    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-indigo-200 transition-all shadow-2xs">
      <div className={`flex items-center justify-center h-7 w-7 rounded-lg mb-2 shadow-2xs ${color}`}>
        {icon}
      </div>
      <div className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">{title}</div>
      <div className="text-lg font-black text-slate-900 mt-0.5">{value}</div>
      <div className="mt-1.5 text-[8.5px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100/80 inline-block px-1.5 py-0.5 rounded-md">
        {trend}
      </div>
    </div>
  )
}
