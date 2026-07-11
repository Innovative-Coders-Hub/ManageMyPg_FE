import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react'
import { forgotPassword, verifyForgotPasswordOtp, resetPassword } from '../api/ownerAuth'
import toast from 'react-hot-toast'
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

const STEPS = {
  IDENTIFIER: 'IDENTIFIER',
  OTP: 'OTP',
  RESET: 'RESET'
}

export default function ForgotPasswordScreen() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEPS.IDENTIFIER)
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(120)
  const timerRef = useRef(null)

  useEffect(() => {
    if (step === STEPS.OTP && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [step, timer])

  const handleIdentifierSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(identifier)
      toast.success('OTP sent successfully')
      setStep(STEPS.OTP)
      setTimer(120)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP. Please check your identifier.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (timer === 0) {
      setError('OTP expired. Please request a new one.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await verifyForgotPasswordOtp(identifier, otp)
      toast.success('OTP verified')
      setStep(STEPS.RESET)
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setLoading(true)
    try {
      // API expects { identifier, token, newPassword, confirmPassword }
      // 'otp' from our state is passed as the 'token' argument
      await resetPassword(identifier, otp, newPassword, confirmPassword)
      toast.success('Password reset successfully! Please login.')
      navigate('/manage/mypg/signin')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setError('')
    setLoading(true)
    try {
      await forgotPassword(identifier)
      setTimer(120)
      toast.success('New OTP sent')
    } catch (err) {
      setError('Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans selection:bg-indigo-500/30">
      <SEO
        title="Forgot Password"
        description="Recover your ManageMyPg account password. Enter your email or mobile to receive a secure verification code."
        canonical="/forgot-password"
      />
      <style dangerouslySetInnerHTML={{ __html: `body { background-color: #F8FAFC !important; }` }} />

      {/* Subtle Light Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[460px] px-6 relative z-10"
      >
        <div className="mb-6">
          <button
            onClick={() => step === STEPS.IDENTIFIER ? navigate('/manage/mypg/signin') : setStep(prev => prev === STEPS.RESET ? STEPS.OTP : STEPS.IDENTIFIER)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-all group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {step === STEPS.IDENTIFIER ? 'Back to Login' : 'Previous Step'}
            </span>
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

          <motion.div variants={itemVariants} className="text-center mb-10">
            <div className="inline-flex relative mb-6">
              <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-10" />
              <div className="h-20 w-20 rounded-full bg-white p-0 relative z-10 shadow-xl flex items-center justify-center overflow-hidden border border-slate-100">
                <img src={LogoImg} alt="ManageMyPg" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-lg z-20">
                <ShieldCheck size={16} />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              {step === STEPS.IDENTIFIER && 'Forgot Password?'}
              {step === STEPS.OTP && 'Verify Identity'}
              {step === STEPS.RESET && 'Set New Password'}
            </h1>
            <p className="text-slate-500 text-xs font-medium tracking-wide">
              {step === STEPS.IDENTIFIER && 'Enter your email or mobile to receive an OTP'}
              {step === STEPS.OTP && `We've sent a 6-digit code to ${identifier}`}
              {step === STEPS.RESET && 'Create a strong password for your account'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-xs font-bold tracking-tight">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === STEPS.IDENTIFIER && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleIdentifierSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                    Email or Mobile Number
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. owner@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-2xl bg-indigo-600 p-4 text-xs font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-indigo-700 shadow-[0_20px_40px_-12px_rgba(79,70,229,0.3)] disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Send OTP <ArrowRight size={18} /></>}
                  </span>
                </button>
              </motion.form>
            )}

            {step === STEPS.OTP && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleOtpSubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                    6-Digit Code
                  </label>
                  <div className="relative group">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-center text-xl font-bold tracking-[0.5em] text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${timer < 30 ? 'text-rose-500' : 'text-slate-400'}`}>
                      Expires in: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={timer > 0 || loading}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-2xl bg-indigo-600 p-4 text-xs font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-indigo-700 shadow-[0_20px_40px_-12px_rgba(79,70,229,0.3)] disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify OTP <CheckCircle2 size={18} /></>}
                  </span>
                </button>
              </motion.form>
            )}

            {step === STEPS.RESET && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleResetSubmit}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                      New Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                      Confirm New Password
                    </label>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-2xl bg-indigo-600 p-4 text-xs font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-indigo-700 shadow-[0_20px_40px_-12px_rgba(79,70,229,0.3)] disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Reset Password <Lock size={18} /></>}
                  </span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
