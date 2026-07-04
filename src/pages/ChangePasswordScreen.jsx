import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
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
import { changePassword, verifyChangePassword } from '../api/ownerAuth'
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

const STEPS = {
  REQUEST: 'REQUEST',
  OTP: 'OTP'
}

export default function ChangePasswordScreen() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEPS.REQUEST)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    if (newPassword.length < 12) {
      setError('New password must be at least 12 characters long')
      return
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from the current one')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setLoading(true)
    try {
      await changePassword(currentPassword, newPassword, confirmPassword)
      toast.success('OTP sent to your registered email')
      setStep(STEPS.OTP)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to initiate password change')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyChangePassword(otp)
      toast.success('Password updated successfully. Please login again.')

      // Logout and redirect
      localStorage.clear()
      navigate('/manage/mypg/signin', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans selection:bg-indigo-500/30">
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
            onClick={() => step === STEPS.REQUEST ? navigate(-1) : setStep(STEPS.REQUEST)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-all group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {step === STEPS.REQUEST ? 'Go Back' : 'Change Password Step'}
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
                <Lock size={16} />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              {step === STEPS.REQUEST ? 'Change Password' : 'Verify Change'}
            </h1>
            <p className="text-slate-500 text-xs font-medium tracking-wide">
              {step === STEPS.REQUEST
                ? 'Keep your account secure by updating your password'
                : 'Enter the 6-digit code sent to your email'}
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
            {step === STEPS.REQUEST && (
              <motion.form
                key="step-request"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRequestSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                    Current Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                    New Password (Min 12 chars)
                  </label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
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
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-2xl bg-indigo-600 p-4 text-xs font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-indigo-700 shadow-[0_20px_40px_-12px_rgba(79,70,229,0.3)] disabled:opacity-50 mt-4"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Next Step <ArrowRight size={18} /></>}
                  </span>
                </button>
              </motion.form>
            )}

            {step === STEPS.OTP && (
              <motion.form
                key="step-otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifySubmit}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">
                    Verification Code
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
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-2xl bg-indigo-600 p-4 text-xs font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-indigo-700 shadow-[0_20px_40px_-12px_rgba(79,70,229,0.3)] disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify & Update <CheckCircle2 size={18} /></>}
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
