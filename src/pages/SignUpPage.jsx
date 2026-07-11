import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react'
import { registerOwner } from '../api/ownerAuth'
import SuccessPopup from '../components/SuccessPopup'
import SEO from '../components/SEO'
import LogoImg from '../assets/managemypg.png'

const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const [username, setUserName] = useState("")
  const [fullName, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [apiError, setApiError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordMatch, setPasswordMatch] = useState(false)

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
        navigate("/manage/mypg/signin")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess, navigate])

  const handlePasswordChange = (val) => {
    setPassword(val)
    if (confirmPassword && val !== confirmPassword) {
      setPasswordError("Passwords do not match")
      setPasswordMatch(false)
    } else if (confirmPassword && val === confirmPassword) {
      setPasswordError("")
      setPasswordMatch(true)
    }
  }

  const handleConfirmChange = (val) => {
    setConfirmPassword(val)
    if (val && password === val) {
      setPasswordError("")
      setPasswordMatch(true)
    } else if (val) {
      setPasswordError("Passwords do not match")
      setPasswordMatch(false)
    } else {
      setPasswordError("")
      setPasswordMatch(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError("")

    if (!agree) {
      setApiError("Please accept Terms & Privacy")
      return
    }
    if (!passwordMatch) return

    setLoading(true)
    try {
      const payload = { username, fullName, email, phone, password }
      const response = await registerOwner(payload)
      if (!response?.success) {
        setApiError(response?.message ?? "Registration failed")
        return
      }
      setShowSuccess(true)
    } catch (err) {
      setApiError(err?.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans selection:bg-indigo-500/30 py-12">
      <SEO
        title="Sign Up"
        description="Join ManageMyPg and start managing your PG portfolio efficiently with our comprehensive suite of tools."
      />
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[520px] px-6 relative z-10"
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

        {/* Signup Card */}
        <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-slate-800/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />

          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="inline-flex relative mb-4">
              <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="h-24 w-24 rounded-full bg-white p-0 relative z-10 shadow-2xl flex items-center justify-center overflow-hidden">
                <img src={LogoImg} alt="ManageMyPg" className="w-full h-full object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mb-1">Create Account</h1>
            <p className="text-slate-400 text-xs font-medium tracking-wide">Join the ManageMyPg network today</p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-200"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-xs font-bold tracking-tight">{apiError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Username</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                  <input
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="shiva_k"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                  <input
                    value={fullName}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Shiva Krishna"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    required
                  />
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9000000000"
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  required
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmChange(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/40 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    required
                  />
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col gap-2">
              {passwordError && <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tight ml-1">{passwordError}</span>}
              {passwordMatch && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tight ml-1 flex items-center gap-1"><CheckCircle2 size={12}/> Passwords Match</span>}
            </div>

            <motion.div variants={itemVariants} className="flex items-start gap-3 ml-1">
              <div className="relative flex items-center h-5">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950/40 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
              </div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-tight">
                I agree to the <Link to="/terms-and-conditions" className="text-indigo-400 hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-indigo-400 hover:underline">Privacy Policy</Link>
              </label>
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !passwordMatch}
              className="w-full relative group overflow-hidden rounded-xl bg-indigo-600 p-3.5 text-xs font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-indigo-500 shadow-[0_20px_40px_-12px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:shadow-none"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 bg-[length:200%_100%] animate-[shimmer_2s_infinite] opacity-0 group-hover:opacity-20 transition-opacity" />
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              Already have an account?{" "}
              <Link to="/manage/mypg/signin" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {showSuccess && <SuccessPopup />}
    </div>
  )
}
