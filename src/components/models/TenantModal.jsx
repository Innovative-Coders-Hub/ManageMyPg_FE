import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, User, Phone, Mail, Calendar, CreditCard, ShieldCheck, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react'
import dayjs from 'dayjs'
import CustomDropdown from '../CustomDropdown'

const PAYMENT_MODES = [
  { id: 'CASH', label: 'CASH' },
  { id: 'UPI', label: 'UPI' },
  { id: 'CARD', label: 'CARD' },
  { id: 'BANK_TRANSFER', label: 'BANK TRANSFER' },
  { id: 'OTHER', label: 'OTHER' }
]

export default function TenantModal({ open, defaultRent, onClose, onSave, initial }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [start, setStart] = useState(dayjs().format('YYYY-MM-DD'))
  const [rent, setRent] = useState(defaultRent || 5000)
  const [deposit, setDeposit] = useState('')
  const [advance, setAdvance] = useState(0)
  const [mode, setMode] = useState('CASH')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setPhone(initial?.phone ?? '')
    setEmail(initial?.email ?? '')
    setStart(initial?.start ? dayjs(initial.start).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))
    setRent(initial?.rent ?? defaultRent ?? 5000)
    setDeposit(initial?.deposit ?? '')
    setAdvance(0)
    setMode('CASH')
    setNote(initial?.note ?? '')
  }, [open, initial, defaultRent])

  if (!open) return null

  const handleSave = async () => {
    if (!name) return
    setSaving(true)
    try {
      const tenantObj = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        start: dayjs(start).startOf('day').toISOString(),
        rent: Number(rent) || defaultRent || 5000,
        deposit: deposit ? Number(deposit) : undefined,
        note: note || undefined,
      }
      await onSave({ tenant: tenantObj, advanceAmount: Number(advance) || 0, mode })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 relative border border-white/20 my-8"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-t-[2.5rem]" />

          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-20"
          >
            <X size={20} strokeWidth={3} />
          </button>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <UserPlus size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  Onboard Resident
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  New Tenancy Agreement & Initial Deposit
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Primary Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">Full Name</label>
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none z-10">
                    <User size={16} strokeWidth={2.5} />
                  </div>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                    placeholder="Enter resident name..."
                  />
                </div>
                <div className="relative group">
                  <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">Mobile Number</label>
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none z-10">
                    <Phone size={16} strokeWidth={2.5} />
                  </div>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                    placeholder="10-digit mobile..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">Email Address</label>
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none z-10">
                    <Mail size={16} strokeWidth={2.5} />
                  </div>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                    placeholder="official email..."
                  />
                </div>
                <div className="relative group">
                  <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">Commencement Date</label>
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none z-10">
                    <Calendar size={16} strokeWidth={2.5} />
                  </div>
                  <input
                    type="date"
                    value={start}
                    onChange={e => setStart(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Financials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="relative group">
                  <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">Monthly Rent</label>
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none z-10">
                    <CreditCard size={16} strokeWidth={2.5} />
                  </div>
                  <input
                    type="number"
                    value={rent}
                    onChange={e => setRent(Number(e.target.value || 0))}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="relative group">
                  <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">Security Deposit</label>
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none z-10">
                    <ShieldCheck size={16} strokeWidth={2.5} />
                  </div>
                  <input
                    type="number"
                    value={deposit}
                    onChange={e => setDeposit(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                    placeholder="Refundable amt..."
                  />
                </div>
              </div>

              {/* Advance Collection Section */}
              <div className="p-6 bg-slate-900 rounded-[2rem] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Initial Collection</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Instant Receipting</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <label className="absolute -top-2.5 left-5 bg-slate-900 px-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest z-20">Advance Paid</label>
                    <input
                      type="number"
                      value={advance}
                      onChange={e => setAdvance(Number(e.target.value || 0))}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <CustomDropdown
                    label="Payment Mode"
                    value={mode}
                    options={PAYMENT_MODES}
                    onChange={setMode}
                    icon={CreditCard}
                    className="w-full"
                    labelBg="bg-slate-900"
                    dark
                  />
                </div>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
                  * Any advance paid will be credited against the first month's invoice automatically.
                </p>
              </div>

              {/* Note */}
              <div className="relative group">
                <label className="absolute -top-2 left-5 bg-white px-2 text-[9px] font-black uppercase tracking-widest text-indigo-600 z-10 flex items-center gap-2">
                  <MessageSquare size={10} strokeWidth={3} />
                  Remarks / Internal Notes
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full border-2 border-slate-100 rounded-2xl p-5 pt-6 text-[11px] font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all bg-slate-50/30 min-h-[80px] text-slate-700"
                  placeholder="Additional details for management..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 h-[46px] bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!name || saving}
                  className="flex-[2] h-[46px] bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-40 shadow-lg shadow-slate-100 active:scale-95 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                  Confirm Onboarding
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
