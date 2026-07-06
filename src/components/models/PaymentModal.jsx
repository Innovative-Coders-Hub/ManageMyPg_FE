import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Banknote, Calendar, MessageSquare, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import dayjs from 'dayjs'
import CustomDropdown from '../CustomDropdown'

const PAYMENT_MODES = [
  { id: 'UPI', label: 'UPI' },
  { id: 'CASH', label: 'CASH' },
  { id: 'CARD', label: 'CARD' },
  { id: 'BANK_TRANSFER', label: 'BANK TRANSFER' },
  { id: 'OTHER', label: 'OTHER' }
]

export default function PaymentModal({
  isOpen,
  period,
  defaultRent,
  existingAdvance,
  onClose,
  onSave
}) {
  const [mode, setMode] = useState('CASH')
  const [rent, setRent] = useState(defaultRent || 0)
  const [amountPaid, setAmountPaid] = useState(defaultRent || 0)
  const [note, setNote] = useState('')
  const [advance, setAdvance] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setMode('CASH')
    setRent(defaultRent || 0)
    setAmountPaid(defaultRent || 0)
    if (existingAdvance == null) {
      setAdvance(0)
    } else {
      setAdvance(existingAdvance)
    }
    setNote('')

    if (period?.__existing) {
      const p = period.__existing
      setMode(p.modeOfPayment || 'CASH')
      setRent(p.rent ?? defaultRent)
      setAmountPaid(p.amountPaid ?? defaultRent)
      setNote(p.remarks || '')
    }
  }, [isOpen, defaultRent, existingAdvance, period])

  if (!isOpen || !period) return null

  const isFirstPayment = existingAdvance == null
  const pending = Math.max(0, (Number(rent) || 0) - (Number(amountPaid) || 0))

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        rentMonth: period.key,
        rent: Number(rent) || 0,
        paidAmount: Number(amountPaid) || 0,
        advance: Number(advance) || 0,
        pending: Number(pending) || 0,
        modeOfPayment: mode,
        paidDate: dayjs().format('YYYY-MM-DD'),
        remarks: note || null
      })
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
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative border border-white/20 my-8"
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
                <CreditCard size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  {period.__existing ? 'Edit Payment' : 'Mark as Paid'}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {period.label} • {dayjs(period.from).format('DD MMM')} – {dayjs(period.to).format('DD MMM YYYY')}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Payment Mode */}
              <CustomDropdown
                label="Payment Mode"
                value={mode}
                options={PAYMENT_MODES}
                onChange={setMode}
                icon={Banknote}
                className="w-full"
                labelBg="bg-white"
              />

              {/* Advance */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">
                  Security Advance (One Time)
                </label>
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none z-10">
                  <ShieldCheck size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="number"
                  value={advance}
                  disabled={!isFirstPayment}
                  onChange={e => setAdvance(e.target.value)}
                  className={`w-full border-2 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest outline-none transition-all ${
                    !isFirstPayment
                      ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 hover:bg-slate-100/50'
                  }`}
                />
                {!isFirstPayment && (
                  <p className="mt-1 ml-4 text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={10} /> Already Collected
                  </p>
                )}
              </div>

              {/* Amounts Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">Monthly Rent</label>
                  <input
                    type="number"
                    value={rent}
                    onChange={e => setRent(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all hover:bg-slate-100/50"
                  />
                </div>
                <div className="relative group">
                  <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">Amount Paid</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all hover:bg-slate-100/50"
                  />
                </div>
              </div>

              {/* Pending Indicator */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                pending > 0 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
              }`}>
                <div className="flex items-center gap-2">
                  {pending > 0 ? <AlertCircle size={16} className="text-amber-600" /> : <CheckCircle2 size={16} className="text-emerald-600" />}
                  <span className={`text-[10px] font-black uppercase tracking-widest ${pending > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {pending > 0 ? 'Pending Balance' : 'Fully Paid'}
                  </span>
                </div>
                <span className={`text-sm font-black ${pending > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  ₹{pending}
                </span>
              </div>

              {/* Notes */}
              <div className="relative group">
                <label className="absolute -top-2 left-5 bg-white px-2 text-[9px] font-black uppercase tracking-widest text-indigo-600 z-10 flex items-center gap-2 group-focus-within:text-indigo-700 transition-colors">
                  <MessageSquare size={10} strokeWidth={3} />
                  Remarks
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full border-2 border-slate-100 rounded-2xl p-5 pt-6 text-[11px] font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all bg-slate-50/30 min-h-[80px] text-slate-700 placeholder:text-slate-300"
                  placeholder="Payment reference or notes..."
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
                  disabled={saving}
                  className="flex-[2] h-[46px] bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-40 shadow-lg shadow-slate-100 active:scale-95 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
