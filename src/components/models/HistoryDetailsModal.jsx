import React, { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, History, User, Phone, Calendar, CreditCard, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import dayjs from 'dayjs'
import { getTenantHistory } from '../../api/ownerAuth'

export default function HistoryDetailsModal({
  open,
  onClose,
  historyItem,
}) {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || !historyItem?.tenantId) return

    setLoading(true)
    setTenant(null)
    setError(null)

    getTenantHistory(historyItem.tenantId)
      .then(res => setTenant(res))
      .catch(err => {
        console.error(err)
        setError('Failed to load tenant details')
      })
      .finally(() => setLoading(false))
  }, [open, historyItem?.tenantId])

  const rentEntries = useMemo(() => {
    return tenant?.rentResponse || []
  }, [tenant])

  const totals = useMemo(() => {
    if (!rentEntries.length) {
      return { paid: 0, pending: 0, refunded: 0, charges: 0 }
    }

    let paid = 0
    let pending = 0
    for (const r of rentEntries) {
      paid += Number(r.paidAmount) || 0
      pending += Number(r.pending) || 0
    }

    const refunded = Number(rentEntries[0]?.refundAmount) || 0
    const charges = Number(rentEntries[0]?.charges) || 0

    return { paid, pending, refunded, charges }
  }, [rentEntries])

  if (!open || !historyItem) return null

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
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl p-8 relative border border-white/20 my-8"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-t-[2.5rem]" />

          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-20"
          >
            <X size={20} strokeWidth={3} />
          </button>

          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <History size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  Tenancy Ledger Archive
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  Record of past stay and financial transactions
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retrieving Historical Data...</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center bg-rose-50 rounded-[2rem] border border-rose-100">
                <AlertCircle className="mx-auto text-rose-500 mb-2" size={32} />
                <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest">{error}</p>
                <button onClick={onClose} className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 underline">Close Window</button>
              </div>
            ) : (
              <>
                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 group hover:border-indigo-100 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                        <User size={14} strokeWidth={2.5} />
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resident Details</span>
                    </div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">
                      {tenant?.name ?? historyItem.tenantName ?? 'N/A'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone size={10} className="text-slate-400" />
                      <p className="text-[10px] font-bold text-slate-500 tracking-wider">
                        {tenant?.mobileNumber ?? historyItem.tenantMobileNumber ?? 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 group hover:border-emerald-100 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Calendar size={14} strokeWidth={2.5} />
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Occupancy Period</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                        {dayjs(historyItem.start).format('DD MMM YY')}
                      </p>
                      <ArrowRight size={12} className="text-slate-300" />
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                        {dayjs(historyItem.end).format('DD MMM YY')}
                      </p>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                      {dayjs(historyItem.end).diff(dayjs(historyItem.start), 'day')} Days Total Duration
                    </p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SummaryStat label="Total Paid" value={`₹${totals.paid}`} color="indigo" icon={<CreditCard />} />
                  <SummaryStat label="Outstanding" value={`₹${totals.pending}`} color="rose" icon={<AlertCircle />} />
                  <SummaryStat label="Refunds" value={`₹${totals.refunded}`} color="emerald" icon={<CheckCircle2 />} />
                  <SummaryStat label="Misc Charges" value={`₹${totals.charges}`} color="amber" icon={<CreditCard />} />
                </div>

                {/* Ledger Table */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    Transaction History
                  </h4>

                  {rentEntries.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No transaction logs available for this period</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rentEntries.map(r => (
                        <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md hover:border-indigo-100 transition-all group">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{r.rentMonth}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                              r.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {r.status}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <LedgerItem label="Due Date" value={dayjs(r.dueDate).format('DD MMM YYYY')} />
                            <LedgerItem label="Paid Date" value={r.paidDate ? dayjs(r.paidDate).format('DD MMM YYYY') : 'PENDING'} />
                            <div className="pt-2 mt-2 border-t border-slate-50 flex justify-between items-end">
                              <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Rent</p>
                                <p className="text-[11px] font-black text-slate-900 tracking-tight">₹{r.rentAmount}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</p>
                                <p className="text-[11px] font-black text-indigo-600 tracking-tight">₹{r.paidAmount}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
                  >
                    Close Ledger
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function SummaryStat({ label, value, color, icon }) {
  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100'
  }

  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-3 border ${colors[color]}`}>
        {React.cloneElement(icon, { size: 14, strokeWidth: 2.5 })}
      </div>
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-[11px] font-black text-slate-900 truncate">{value}</p>
    </div>
  )
}

function LedgerItem({ label, value }) {
  return (
    <div className="flex justify-between items-center text-[9px] font-bold">
      <span className="text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-slate-600 uppercase tracking-widest">{value}</span>
    </div>
  )
}
