import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CreditCard,
  Banknote,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  IndianRupee
} from 'lucide-react'
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

  const isFirstPayment = existingAdvance == null
  const pending = Math.max(0, (Number(rent) || 0) - (Number(amountPaid) || 0))

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        rentMonth: period?.key,
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
    <AnimatePresence>
      {isOpen && period && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-Over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 relative z-10"
              onClick={e => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs border border-indigo-500/30">
                    <CreditCard size={20} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">
                      {period.__existing ? 'Edit Payment Record' : 'Record Rent Payment'}
                    </h3>
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-0.5 truncate">
                      {period.label} • {dayjs(period.from).format('DD MMM')} – {dayjs(period.to).format('DD MMM YYYY')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
                  title="Close Drawer"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Drawer Form / Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/40">
                
                {/* Payment Mode Selector */}
                <div>
                  <CustomDropdown
                    label="Payment Mode"
                    value={mode}
                    options={PAYMENT_MODES}
                    onChange={setMode}
                    icon={Banknote}
                    className="w-full"
                    labelBg="bg-white"
                  />
                </div>

                {/* Amounts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group">
                    <label className="absolute -top-2.5 left-4 bg-white px-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-10">
                      Monthly Rent
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <IndianRupee size={14} />
                      </div>
                      <input
                        type="number"
                        value={rent}
                        onChange={e => setRent(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-black uppercase tracking-tight text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="absolute -top-2.5 left-4 bg-white px-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-10">
                      Amount Paid
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-emerald-600 pointer-events-none">
                        <IndianRupee size={14} />
                      </div>
                      <input
                        type="number"
                        value={amountPaid}
                        onChange={e => setAmountPaid(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-black uppercase tracking-tight text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Advance (One Time) */}
                <div className="relative group">
                  <label className="absolute -top-2.5 left-4 bg-white px-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-10">
                    Security Advance (One-Time Deposit)
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-indigo-600 pointer-events-none">
                      <ShieldCheck size={16} />
                    </div>
                    <input
                      type="number"
                      value={advance}
                      disabled={!isFirstPayment}
                      onChange={e => setAdvance(e.target.value)}
                      className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-xs font-black uppercase tracking-tight outline-none transition-all ${
                        !isFirstPayment
                          ? 'bg-slate-100/60 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                  {!isFirstPayment && (
                    <p className="mt-1 ml-2 text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 size={10} /> Deposit Previously Settled
                    </p>
                  )}
                </div>

                {/* Pending Status Summary Card */}
                <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  pending > 0 ? 'bg-amber-50/80 border-amber-200' : 'bg-emerald-50/80 border-emerald-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {pending > 0 ? (
                      <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    )}
                    <span className={`text-[9px] font-black uppercase tracking-widest ${pending > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {pending > 0 ? 'Pending Balance' : 'Full Payment Cleared'}
                    </span>
                  </div>
                  <span className={`text-xs font-black tracking-tight ${pending > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                    ₹{pending.toLocaleString()}
                  </span>
                </div>

                {/* Remarks Field */}
                <div className="relative group">
                  <label className="absolute -top-2 left-4 bg-white px-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 z-10 flex items-center gap-1.5">
                    <MessageSquare size={10} strokeWidth={2.5} /> Remarks & Notes
                  </label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-200 rounded-xl p-3 pt-3.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all bg-slate-50/50 text-slate-800 placeholder:text-slate-400 resize-none"
                    placeholder="Payment transaction ID, reference notes, or remarks..."
                  />
                </div>

              </div>

              {/* Drawer Fixed Footer Bar */}
              <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-3 shadow-lg">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-40 shadow-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  {period.__existing ? 'Save Edits' : 'Confirm Payment'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
