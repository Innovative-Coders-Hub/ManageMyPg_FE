import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogOut, Calendar, AlertCircle, CheckCircle2, Loader2, MessageSquare, Clock, Sparkles } from 'lucide-react'
import dayjs from 'dayjs'
import { minVacateDate } from '../utills/dateUtils'

export default function VacateTenantModal({
  open,
  tenant,
  currentDate,
  onClose,
  onSave,
}) {
  const [date, setDate] = useState('')
  const [override, setOverride] = useState(false)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const effectiveEnd = tenant?.end || currentDate

  useEffect(() => {
    if (!open) return

    if (effectiveEnd) {
      setDate(dayjs(effectiveEnd).format('YYYY-MM-DD'))
    } else {
      setDate(dayjs(minVacateDate()).format('YYYY-MM-DD'))
    }

    setOverride(false)
    setReason('')
  }, [effectiveEnd, open])

  if (!open) return null

  const minDate = dayjs(minVacateDate())
  const selectedDate = dayjs(date)
  const isEarlyVacate = !effectiveEnd && date && selectedDate.isBefore(minDate, 'day')
  const isToday = date && selectedDate.isSame(dayjs(), 'day')
  const canSave = Boolean(date) && (!isEarlyVacate || (override && reason.trim().length >= 5))

  const handlePreset = (type) => {
    if (type === 'today') {
      setDate(dayjs().format('YYYY-MM-DD'))
    } else if (type === 'endOfMonth') {
      setDate(dayjs().endOf('month').format('YYYY-MM-DD'))
    } else if (type === '30days') {
      setDate(dayjs().add(30, 'day').format('YYYY-MM-DD'))
    }
    setOverride(false)
    setReason('')
  }

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      await onSave({
        vacatingDate: date,
        reason: override ? reason.trim() : null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
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
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative border border-slate-100 my-8 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-500" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 h-9 w-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <X size={18} />
            </button>

            <div className="space-y-6">
              {/* Header Context */}
              <div className="flex items-center gap-3.5 pr-8">
                <div className="h-11 w-11 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-black shrink-0 shadow-xs">
                  <Clock size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 leading-tight">
                    {effectiveEnd ? 'Update Vacating Schedule' : 'Set Vacating Date'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    {tenant?.name ? tenant.name : 'Resident Departure Schedule'}
                  </p>
                </div>
              </div>

              {/* Resident Quick Badge if tenant is passed */}
              {tenant?.name && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      {tenant.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase truncate">{tenant.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{tenant.mobileNumber || tenant.company || 'Active Resident'}</p>
                    </div>
                  </div>
                  {effectiveEnd && (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[8px] font-black uppercase tracking-widest">
                      Currently: {dayjs(effectiveEnd).format('DD MMM YYYY')}
                    </span>
                  )}
                </div>
              )}

              {/* Quick Date Presets */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Quick Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreset('today')}
                    className={`py-2 px-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      date === dayjs().format('YYYY-MM-DD')
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset('endOfMonth')}
                    className={`py-2 px-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      date === dayjs().endOf('month').format('YYYY-MM-DD')
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    End of Month
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePreset('30days')}
                    className={`py-2 px-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      date === dayjs().add(30, 'day').format('YYYY-MM-DD')
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    30 Days Notice
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Date Input */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest block">Selected Vacating Date</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={e => {
                        setDate(e.target.value)
                        setOverride(false)
                        setReason('')
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs font-black uppercase tracking-widest text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {isToday && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center gap-2.5 text-amber-900">
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    <p className="text-[9px] font-bold uppercase tracking-tight leading-relaxed">
                      Vacating date set for today. Account settlement and vacate logs will apply immediately.
                    </p>
                  </div>
                )}

                {/* Early Vacate Warning & Override */}
                {isEarlyVacate && (
                  <div className="space-y-3 p-4 bg-rose-50/80 border border-rose-100 rounded-2xl">
                    <div className="flex items-center gap-2 text-rose-800 font-black text-[10px] uppercase tracking-widest">
                      <AlertCircle size={15} /> Short Notice Period
                    </div>
                    <p className="text-[9px] text-rose-700 font-medium uppercase leading-relaxed">
                      The selected date provides less than 30 days notice. Administrative override required.
                    </p>

                    <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={override}
                        onChange={e => setOverride(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Authorize Early Departure</span>
                    </label>

                    {override && (
                      <div className="space-y-1 pt-1">
                        <label className="text-[8px] font-black uppercase text-slate-600 flex items-center gap-1">
                          <MessageSquare size={10} /> Override Reason / Note
                        </label>
                        <textarea
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-3 text-[10px] font-bold focus:bg-white focus:border-indigo-600 outline-none bg-white text-slate-900 min-h-[60px]"
                          placeholder="State reason for waiving 30-day notice..."
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-slate-50 border border-slate-200/80 text-slate-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!canSave || saving}
                    onClick={handleSave}
                    className={`flex-[2] py-3 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                      canSave ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    Save Vacating Date
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

