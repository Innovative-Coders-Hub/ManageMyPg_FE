import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Sparkles, Zap, ShieldCheck, Globe, Rocket, ArrowRight, CheckCircle2 } from "lucide-react"

export default function FinalCTASection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-[#F8FAFC]">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-200/40 via-purple-200/30 to-pink-200/40 rounded-full blur-[140px] opacity-70" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl sm:rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl shadow-slate-900/30 text-white"
        >
          {/* Animated Background Glow Orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-[130px] animate-pulse" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
            
            {/* Social Proof Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-xs"
            >
              <div className="flex -space-x-2">
                {[12, 15, 23].map((imgId) => (
                  <div key={imgId} className="h-6 w-6 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden shrink-0">
                    <img src={`https://i.pravatar.cc/100?img=${imgId}`} alt="User Avatar" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                Join 500+ PG Owners
              </span>
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Ready to reclaim your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
                  Peace of Mind?
                </span>
              </h2>

              <p className="text-slate-300 text-sm sm:text-lg font-bold leading-relaxed max-w-2xl mx-auto">
                Stop fighting spreadsheets. Start building your empire with the most intuitive PG management OS.
              </p>
            </div>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/manage/mypg/signup"
                className="group relative w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-indigo-400/40"
              >
                <span>Register Now</span>
                <Rocket size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>

              <Link
                to="/manage/mypg/signin"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest border border-white/15 transition-all backdrop-blur-md active:scale-95 cursor-pointer shadow-xs"
              >
                Sign In
              </Link>
            </div>

            {/* 4 Glassmorphic Proof Cards */}
            <div className="pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
              <ProofCard label="Uptime" value="99.9%" icon={<Globe className="text-indigo-400" size={18} />} />
              <ProofCard label="Security" value="AES-256" icon={<ShieldCheck className="text-emerald-400" size={18} />} />
              <ProofCard label="Setup Time" value="< 5m" icon={<Zap className="text-amber-400" size={18} />} />
              <ProofCard label="Support" value="24/7" icon={<Sparkles className="text-purple-400" size={18} />} />
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}

function ProofCard({ label, value, icon }) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center gap-1.5 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base tracking-tight">
        {icon}
        <span>{value}</span>
      </div>
      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}
