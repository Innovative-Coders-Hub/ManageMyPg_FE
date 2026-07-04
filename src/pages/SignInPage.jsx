import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Fingerprint,
  Activity,
  ShieldCheck
} from 'lucide-react'
import { ownerLogin } from '../api/ownerAuth'
import toast from 'react-hot-toast'
import LogoImg from '../assets/managemypg.png'

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

export default function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCapsLock, setIsCapsLock] = useState(false)

  const checkCapsLock = (e) => {
    if (e.getModifierState('CapsLock')) setIsCapsLock(true)
    else setIsCapsLock(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await ownerLogin({ email, password })

      const isBlocked = data.isBlocked === true || data.isBlocked === 'true'
      const isApproved = data.isApproved === true || data.isApproved === 'true'
      const role = data.role
      const businessName = data.pgName || ''

      if (isBlocked) {
        setError("Your account has been blocked. Please contact support.")
        return
      }

      if (role === 'OWNER' && !isApproved) {
        setError("Your account is under verification. Please wait until admin approval.")
        return
      }

      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('tokenType', data.tokenType || 'Bearer')
      localStorage.setItem('role', role)

      if (role === 'OWNER') {
        localStorage.setItem('isOwner', 'true')
        localStorage.setItem('isApproved', isApproved)
        localStorage.setItem('isBlocked', isBlocked)
        localStorage.setItem('businessName', businessName)

        const hasAddress = Boolean(data.hasAddress)
        if (hasAddress) {
          toast.success('Signed in successfully!')
          navigate('/home', { replace: true })
        } else {
          toast.success('Welcome! Please complete your onboarding.')
          navigate('/owner/onboarding', { replace: true })
        }
      }

      if (role === 'TENANT') {
        localStorage.setItem('tenantId', data.id)
        localStorage.setItem('isTenant', 'true')
        toast.success('Signed in successfully!')
        navigate('/tenant/dashboard', { replace: true })
      }
    } catch (err) {
      if (err.status === 401) {
        setError("Invalid email or password")
      } else if (err.status === 403) {
        setError("Your account has been blocked. Please contact support.")
      } else {
        setError(err.message || "Something went wrong. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans selection:bg-indigo-500/30">
      <style dangerouslySetInnerHTML={{ __html: `body { background-color: #020617 !important; }` }} />
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[460px] px-6 relative z-10"
      >
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-all group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Home</span>
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-slate-800/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />

          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div className="inline-flex relative mb-6">
              <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="h-24 w-24 rounded-full bg-white p-0 relative z-10 shadow-2xl flex items-center justify-center overflow-hidden">
                <img src={LogoImg} alt="ManageMyPg" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-xl z-20">
                <Fingerprint size={16} />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">Secure access to your PG Management portal</p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  required
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                  Password
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
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl pl-12 pr-12 py-4 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
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
              <div className="flex justify-end pr-1">
                <Link to="/forgot-password" title="Forgot Password" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors">
                  Forgot Security Key?
                </Link>
              </div>
            </motion.div>

            {/* Submit Button */}
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
                    Sign In
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 bg-[length:200%_100%] animate-[shimmer_2s_infinite] opacity-0 group-hover:opacity-20 transition-opacity" />
            </motion.button>
          </form>

          {/* New to platform */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              New to ManageMyPg?{" "}
              <Link to="/manage/mypg/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Create Account
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Branding Footer */}
        <motion.div variants={itemVariants} className="mt-10 flex items-center justify-center gap-4 text-slate-500">
           <div className="h-px w-8 bg-slate-800" />
           <span className="text-[9px] font-black uppercase tracking-[0.3em]">ManageMyPg Ecosystem</span>
           <div className="h-px w-8 bg-slate-800" />
        </motion.div>
      </motion.div>
    </div>
  )
}
