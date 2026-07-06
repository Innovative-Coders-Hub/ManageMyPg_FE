import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogOut, Calendar, AlertCircle, CheckCircle2, Loader2, MessageSquare } from 'lucide-react'
import dayjs from 'dayjs'
import { minVacateDate } from '../utills/dateUtils'

export default function VacateTenantModal({
  open,
  tenant,
  onClose,
  onSave,
}) {
  const [date, setDate] = useState('')
  const [override, setOverride] = useState(false)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return

    if (tenant?.end) {
      setDate(dayjs(tenant.end).format('YYYY-MM-DD'))
    } else {
      setDate(dayjs(minVacateDate()).format('YYYY-MM-DD'))
    }

    setOverride(false)
    setReason('')
  }, [tenant, open])

  if (!open) return null

  const minDate = dayjs(minVacateDate())
  const selectedDate = dayjs(date)
  const isEarlyVacate = !tenant?.end && date && selectedDate.isBefore(minDate, 'day')
  const isToday = tenant?.end && date && selectedDate.isSame(dayjs(), 'day')
  const canSave = !isEarlyVacate || (override && reason.trim().length >= 5)

  const handleSave = async () => {
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
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500 rounded-t-[2.5rem]" />

          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-20"
          >
            <X size={20} strokeWidth={3} />
          </button>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
                <LogOut size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  {tenant?.end ? 'Update Departure' : 'Offboard Tenant'}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {tenant?.name} • Room {tenant?.roomName || 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Date Input */}
              <div className="relative group">
                <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">
                  Vacating Date
                </label>
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none z-10">
                  <Calendar size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="date"
                  value={date}
                  min={tenant?.end ? dayjs().format('YYYY-MM-DD') : dayjs(minVacateDate()).format('YYYY-MM-DD')}
                  onChange={e => {
                    setDate(e.target.value)
                    setOverride(false)
                    setReason('')
                  }}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all hover:bg-slate-100/50"
                />
              </div>

              {isToday && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                  <AlertCircle size={16} className="text-indigo-600 shrink-0" />
                  <p className="text-[10px] font-black text-indigo-700 uppercase tracking-tight">
                    Tenant is marked as vacating today. Account will be settled.
                  </p>
                </div>
              )}

              {/* Early Vacate Logic */}
              <AnimatePresence>
                {isEarlyVacate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                      <div className="flex items-center gap-2 text-rose-800 font-black text-[10px] uppercase tracking-widest mb-1">
                        <AlertCircle size={14} strokeWidth={3} /> Early Departure Warning
                      </div>
                      <p className="text-[9px] text-rose-700 font-bold uppercase tracking-tight leading-relaxed">
                        Notice period is less than 30 days. Administrative override required.
                      </p>
                    </div>

                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 cursor-pointer transition-all hover:bg-slate-100/50 group">
                      <input
                        type="checkbox"
                        checked={override}
                        onChange={e => setOverride(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900">Confirm Override</span>
                    </label>

                    {override && (
                      <div className="relative group">
                        <label className="absolute -top-2 left-5 bg-white px-2 text-[9px] font-black uppercase tracking-widest text-indigo-600 z-10 flex items-center gap-2">
                          <MessageSquare size={10} strokeWidth={3} />
                          Reason for Exception
                        </label>
                        <textarea
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          className="w-full border-2 border-slate-100 rounded-2xl p-5 pt-6 text-[11px] font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all bg-slate-50/30 min-h-[80px] text-slate-700"
                          placeholder="Document the reason for early offboarding..."
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 h-[46px] bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  disabled={!canSave || saving}
                  onClick={handleSave}
                  className={`flex-[2] h-[46px] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                    canSave ? 'bg-slate-900 hover:bg-rose-600 shadow-slate-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut size={16} />}
                  Confirm Offboarding
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
