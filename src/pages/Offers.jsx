import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import dayjs from 'dayjs'

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

/* =====================================================
   Offer Types
===================================================== */
const OFFER_TYPES = [
  { key: 'DISCOUNT', label: 'Rent Discount', color: 'bg-emerald-50 text-emerald-700' },
  { key: 'CASHBACK', label: 'Cashback', color: 'bg-indigo-50 text-indigo-700' },
  { key: 'FREEMONTH', label: 'Free Month', color: 'bg-amber-50 text-amber-700' },
  { key: 'REFERRAL', label: 'Referral Bonus', color: 'bg-purple-50 text-purple-700' },
  { key: 'CUSTOM', label: 'Custom Offer', color: 'bg-gray-100 text-gray-700' }
]

/* =====================================================
   Offer Form (Create / Edit)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
          <div className="text-lg font-semibold">{initial ? 'Edit Offer' : 'Create New Offer'}</div>
          <div className="text-xs text-gray-500">Design an attractive promotion for tenants</div>
        </div>

        <div className="p-6 space-y-4">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Offer title (eg. ₹2000 off on first month)"
            className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {OFFER_TYPES.map(t => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>

          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Explain the offer clearly to tenants"
            className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Value (eg. 2000, 10%, 1 month)"
            className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <input
            type="date"
            value={expireAt}
            onChange={e => setExpireAt(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button
              onClick={() => onSave({
                title: title.trim(),
                type,
                description: description.trim(),
                value,
                expireAt: expireAt ? dayjs(expireAt).endOf('day').toISOString() : null
              })}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {initial ? 'Save Changes' : 'Create Offer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

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

  function saveOffer(payload) {
    if (editing) {
      setOffers(prev => prev.map(o => o.id === editing.id ? { ...o, ...payload } : o))
    } else {
      setOffers(prev => [{ id: `offer_${Date.now()}`, createdAt: new Date().toISOString(), ...payload }, ...prev])
    }
    setEditing(null)
    setOpenForm(false)
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
      <PageHeader title="Promotions & Offers" subtitle="Create attractive deals to acquire and retain tenants" />

      <div className="flex justify-end">
        <button
          onClick={() => { setEditing(null); setOpenForm(true) }}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
        >
          + Create Offer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {enriched.length === 0 && (
          <div className="col-span-full border border-dashed rounded-xl p-8 text-center text-gray-500">
            No offers yet. Create your first promotion to attract tenants.
          </div>
        )}

        {enriched.map(o => {
          const t = OFFER_TYPES.find(x => x.key === o.type)
          return (
            <div key={o.id} className={`rounded-2xl border shadow-sm p-4 flex flex-col ${o.expired ? 'opacity-70' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-800">{o.title}</div>
                  <div className="text-xs text-gray-500 mt-1">Expires: {fmt(o.expireAt)}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t?.color}`}>{t?.label}</span>
              </div>

              <div className="mt-3 text-sm text-gray-700 flex-1">
                {o.description}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {o.expired
                    ? 'Expired'
                    : o.daysLeft !== null
                      ? `Expires in ${o.daysLeft} days`
                      : 'No expiry'}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditing(o); setOpenForm(true) }}
                    className="px-3 py-1 text-sm rounded border hover:bg-gray-50"
                  >Edit</button>
                  <button
                    onClick={() => setOffers(prev => prev.filter(x => x.id !== o.id))}
                    className="px-3 py-1 text-sm rounded border text-rose-600 hover:bg-rose-50"
                  >Delete</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <OfferForm
        open={openForm}
        initial={editing}
        onClose={() => { setOpenForm(false); setEditing(null) }}
        onSave={saveOffer}
      />
    </div>
  )
}
