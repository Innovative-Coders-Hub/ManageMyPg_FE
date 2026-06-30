import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Sparkles, Zap, ShieldCheck, Globe, Rocket } from "lucide-react"

export default function FinalCTASection() {
  return (
    <section className="relative py-32 overflow-hidden bg-white">
      {/* Decorative background for the section itself */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] rounded-full bg-indigo-50/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] rounded-full bg-pink-50/50 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[4rem] bg-slate-900 px-8 py-20 md:px-20 md:py-24 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] shadow-indigo-900/20"
        >
          {/* Advanced Mesh Gradient */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[80%] rounded-full bg-gradient-to-tr from-pink-600 to-indigo-600 blur-[120px]" style={{ animationDuration: '4s' }} />
          </div>

          {/* Grain and Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

          <div className="relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-10"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 w-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                  Join 500+ PG Owners
                </span>
              </motion.div>

              <h2 className="text-4xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8">
                Ready to reclaim your <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Peace of Mind?</span>
              </h2>

              <p className="text-slate-400 text-lg md:text-2xl font-medium leading-relaxed mb-14 max-w-2xl mx-auto">
                Stop fighting spreadsheets. Start building your empire with the most intuitive PG management OS.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  to="/manage/mypg/signup"
                  className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-6 rounded-2xl bg-white text-slate-900 font-black text-xl hover:bg-indigo-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">Register Now</span>
                  <Rocket size={22} className="relative group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>

                <Link
                  to="/manage/mypg/signin"
                  className="w-full sm:w-auto flex items-center justify-center px-12 py-6 rounded-2xl bg-white/5 text-white font-black text-xl border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md active:scale-95"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Bottom Proof Bar */}
            <div className="mt-24 pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
               <CTAStat label="Uptime" value="99.9%" icon={<Globe className="text-indigo-400" />} />
               <CTAStat label="Security" value="AES-256" icon={<ShieldCheck className="text-emerald-400" />} />
               <CTAStat label="Setup Time" value="< 5m" icon={<Zap className="text-amber-400" />} />
               <CTAStat label="Support" value="24/7" icon={<Sparkles className="text-purple-400" />} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function CTAStat({ label, value, icon }) {
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
      <div className="flex items-center gap-2 text-white font-black text-lg tracking-tight">
        {icon}
        {value}
      </div>
      <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</div>
    </div>
  )
}
