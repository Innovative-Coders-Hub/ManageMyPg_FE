import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import {
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Tag,
  Info,
  Clock,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  X,
  Zap,
  Gift,
  ChevronDown
} from 'lucide-react'

/* =====================================================
   Helpers
===================================================== */
const fmt = (d) => dayjs(d).isValid() ? dayjs(d).format('DD MMM YYYY') : '—'

function useLocalOffers(key = 'offers_v2') {
  const [offers, setOffers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? [] } catch { return [] }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(offers)) } catch {}
  }, [offers])
  return [offers, setOffers]
}

function TopStat({ label, value, icon, isAccent = false }) {
  return (
    <div className={`px-4 py-1.5 rounded-xl border flex flex-col items-center justify-center transition-all min-w-[84px] ${isAccent ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
      <div className={`flex items-center gap-2 mb-0.5 ${isAccent ? 'text-indigo-100' : 'text-slate-400'}`}>
        {React.cloneElement(icon, { size: 10 })}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-black leading-none">{value}</div>
    </div>
  )
}

/* =====================================================
   Offer Types
===================================================== */
const OFFER_TYPES = [
  { key: 'DISCOUNT', label: 'Rent Discount', color: 'bg-emerald-50 text-emerald-700', icon: <Percent size={14} /> },
  { key: 'CASHBACK', label: 'Cashback', color: 'bg-indigo-50 text-indigo-700', icon: <Zap size={14} /> },
  { key: 'FREEMONTH', label: 'Free Month', color: 'bg-amber-50 text-amber-700', icon: <Gift size={14} /> },
  { key: 'REFERRAL', label: 'Referral Bonus', color: 'bg-purple-50 text-purple-700', icon: <TrendingUp size={14} /> },
  { key: 'CUSTOM', label: 'Custom Offer', color: 'bg-slate-100 text-slate-700', icon: <Tag size={14} /> }
]

/* =====================================================
   OFFERS PAGE
===================================================== */
export default function Offers() {
  const [offers, setOffers] = useLocalOffers()
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const enriched = useMemo(() => {
    return offers.map(o => {
      const exp = o.expireAt ? dayjs(o.expireAt) : null
      const now = dayjs()
      return {
        ...o,
        expired: exp ? exp.isBefore(now, 'day') : false,
        daysLeft: exp ? exp.diff(now, 'day') : null
      }
    })
  }, [offers])

  const stats = useMemo(() => {
    const total = enriched.length
    const active = enriched.filter(o => !o.expired).length
    const expired = enriched.filter(o => o.expired).length
    return { total, active, expired }
  }, [enriched])

  function saveOffer(payload) {
    if (editing) {
      setOffers(prev => prev.map(o => o.id === editing.id ? { ...o, ...payload } : o))
      toast.success('Promotion updated')
    } else {
      setOffers(prev => [{ id: `offer_${Date.now()}`, createdAt: new Date().toISOString(), ...payload }, ...prev])
      toast.success('Promotion launched')
    }
    setEditing(null)
    setOpenForm(false)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Promotions"
            subtitle="Strategic yield & occupancy management"
          >
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-1">
              <TopStat label="Total" value={stats.total} icon={<Tag />} />
              <TopStat label="Active" value={stats.active} icon={<Sparkles />} isAccent={stats.active > 0} />
              <TopStat label="Ended" value={stats.expired} icon={<Clock />} />

              <button
                onClick={() => { setEditing(null); setOpenForm(true) }}
                className="ml-2 flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                <Plus size={14} /> New Offer
              </button>
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {enriched.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full border-2 border-dashed border-slate-200 rounded-2xl p-24 text-center bg-white"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-6 border border-slate-100">
                  <Tag size={40} />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Zero Active Campaigns</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed">
                  Design attractive promotions to drive property occupancy and tenant retention.
                </p>
                <button
                  onClick={() => setOpenForm(true)}
                  className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Create First Offer
                </button>
              </motion.div>
            ) : (
              enriched.map((o, idx) => {
                const t = OFFER_TYPES.find(x => x.key === o.type)
                return (
                  <motion.div
                    key={o.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group relative flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 ${o.expired ? 'opacity-70' : ''}`}
                  >
                    {/* Header: Type Badge & Status */}
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-2.5 rounded-xl border ${t?.color.split(' ')[0]} ${t?.color.split(' ')[1]} border-current/10`}>
                        {t?.icon}
                      </div>
                      <div className={`px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-sm ${o.expired ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {o.expired ? 'Expired' : 'Active'}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-tight">{o.title}</h4>
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                          <Calendar size={11} className="text-slate-300" />
                          Till: {fmt(o.expireAt)}
                        </div>
                      </div>

                      <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2 italic">
                          "{o.description}"
                        </p>
                      </div>
                    </div>

                    {/* Footer: Timeline & Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-indigo-400" />
                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
                          {o.expired ? 'ENDED' : o.daysLeft !== null ? `${o.daysLeft}d left` : 'No Expiry'}
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { setEditing(o); setOpenForm(true) }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if(confirm('Permanently delete this promotion?')) {
                              setOffers(prev => prev.filter(x => x.id !== o.id))
                              toast.success('Offer removed')
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        <OfferForm
          open={openForm}
          initial={editing}
          onClose={() => { setOpenForm(false); setEditing(null) }}
          onSave={saveOffer}
        />
      </div>
    </div>
  )
}

/* =====================================================
   Offer Form Component
===================================================== */
function OfferForm({ open, initial, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('DISCOUNT')
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')
  const [expireAt, setExpireAt] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setType(initial?.type ?? 'DISCOUNT')
    setDescription(initial?.description ?? '')
    setValue(initial?.value ?? '')
    setExpireAt(initial?.expireAt ? dayjs(initial.expireAt).format('YYYY-MM-DD') : '')
  }, [open, initial])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{initial ? 'Modify Promotion' : 'Launch New Campaign'}</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Define offer parameters and lifecycle</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors bg-white rounded-xl border border-slate-100">
             <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Promotion Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Seasonal Discount 2024"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-xs font-bold text-slate-700 bg-slate-50/30 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Offer Type</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-xs font-black uppercase tracking-widest text-slate-700 bg-slate-50/30 appearance-none cursor-pointer transition-all"
                >
                  {OFFER_TYPES.map(t => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Yield Value</label>
              <input
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="e.g., 20% or ₹1500"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-xs font-bold text-slate-700 bg-slate-50/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Outline the terms and conditions..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-xs font-bold text-slate-700 bg-slate-50/30 transition-all resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Termination Date</label>
            <div className="relative">
              <input
                type="date"
                value={expireAt}
                onChange={e => setExpireAt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none text-xs font-bold text-slate-700 bg-slate-50/30 transition-all"
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
            >
              Discard
            </button>
            <button
              onClick={() => onSave({
                title: title.trim(),
                type,
                description: description.trim(),
                value,
                expireAt: expireAt ? dayjs(expireAt).endOf('day').toISOString() : null
              })}
              disabled={!title}
              className="flex-[2] px-4 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-100 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {initial ? 'Commit Updates' : 'Launch Campaign'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

