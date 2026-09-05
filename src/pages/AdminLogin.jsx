import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Activity,
  Fingerprint
} from 'lucide-react'
import { adminLogin } from '../api/adminAuth'
import LogoImg from '../assets/managemypg.png'
import SEO from '../components/SEO'

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isCapsLock, setIsCapsLock] = useState(false)

  // System Health Simulation
  const [systemStatus, setSystemStatus] = useState('Online')
  useEffect(() => {
    const statuses = ['Stable', 'Online', 'Secure', 'Synced']
    const interval = setInterval(() => {
      setSystemStatus(statuses[Math.floor(Math.random() * statuses.length)])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkCapsLock = (e) => {
    if (e.getModifierState('CapsLock')) setIsCapsLock(true)
    else setIsCapsLock(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await adminLogin({ email, password })
      const apiResponse = response.data
      const loginData = apiResponse.data || apiResponse

      if (!loginData?.accessToken) throw new Error('Invalid response format')

      const { accessToken, refreshToken, expiresIn } = loginData
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('tokenType', 'Bearer')
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      if (expiresIn) {
        const expiryMs = expiresIn > 10000 ? expiresIn : expiresIn * 1000
        localStorage.setItem('tokenExpiry', Date.now() + expiryMs)
      }

      localStorage.setItem('role', 'ADMIN')
      localStorage.setItem('isAdmin', 'true')

      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      const apiError = err?.response?.data
      setError(apiError?.message || err?.message || 'Authentication failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans selection:bg-indigo-500/30 p-4 sm:p-6">
      <SEO
        title="Admin Access"
        description="Secure administrator portal for ManageMyPg. Authorized access only."
        canonical="/admin/login"
      />
      <style dangerouslySetInnerHTML={{ __html: `body { background-color: #020617 !important; }` }} />
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[390px] relative z-10"
      >
        {/* Top Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-all group cursor-pointer"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Site</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{systemStatus}</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] border border-slate-800/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] p-6 sm:p-8 md:p-12 relative overflow-hidden group">
          {/* Subtle top light effect */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />

          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div className="inline-flex relative mb-6">
               <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
               <div className="h-24 w-24 rounded-full bg-white p-0 relative z-10 shadow-2xl flex items-center justify-center overflow-hidden">
                  <img src={LogoImg} alt="ManageMyPg" className="w-full h-full object-contain" />
               </div>
               <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-xl z-20">
                 <Fingerprint size={14} />
               </div>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Administrator Access</h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">Enter master credentials to login</p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-200"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-xs font-bold tracking-tight">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={submit} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">
                Operator ID
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@managemypg.com"
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                  Security Key
                </label>
                {isCapsLock && (
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    <Activity size={10} /> Caps Lock On
                  </span>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={checkCapsLock}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-12 pr-12 py-4 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 px-3 flex items-center text-slate-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-2xl bg-indigo-600 p-4 text-xs font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-indigo-500 shadow-[0_20px_40px_-12px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:shadow-none"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Login
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 bg-[length:200%_100%] animate-[shimmer_2s_infinite] opacity-0 group-hover:opacity-20 transition-opacity" />
            </motion.button>
          </form>

          {/* Footer Info */}
          <motion.div variants={itemVariants} className="mt-10 flex items-center justify-between border-t border-slate-800 pt-8">
             <div className="flex flex-col">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Protocol</span>
               <span className="text-[10px] font-bold text-slate-300">TLS 1.3 / AES-256</span>
             </div>
             <div className="flex flex-col text-right">
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Build ID</span>
               <span className="text-[10px] font-bold text-slate-300">ADMIN_v2.4.0</span>
             </div>
          </motion.div>
        </div>

        {/* Support Link */}
        {/* <motion.p variants={itemVariants} className="mt-8 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          Forgot credentials? Contact <a href="#" className="text-indigo-400 hover:underline">System Security</a>
        </motion.p> */}
      </motion.div>
    </div>
  )
}
