import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import dayjs from 'dayjs'

function fmt(d) { return dayjs(d).isValid() ? dayjs(d).format('DD MMM YYYY') : '—' }

function useLocalOffers(key = 'offers') {
  const [offers, setOffers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? [] } catch { return [] }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(offers)) } catch {} }, [key, offers])
  return [offers, setOffers]
}

function OfferForm({ open, initial = null, onClose, onSave }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [mode, setMode] = useState(initial?.mode ?? 'text') // text | image
  const [content, setContent] = useState(initial?.content ?? '')
  const [expireAt, setExpireAt] = useState(initial?.expireAt ? dayjs(initial.expireAt).format('YYYY-MM-DD') : '')

  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setMode(initial?.mode ?? 'text')
    setContent(initial?.content ?? '')
    setExpireAt(initial?.expireAt ? dayjs(initial.expireAt).format('YYYY-MM-DD') : '')
  }, [open, initial])

  if (!open) return null

  return (
    <div className="space-y-6">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-xl mx-4 rounded-2xl border bg-white shadow-xl">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
          <div className="text-lg font-semibold">{initial ? 'Edit Offer' : 'Create Offer'}</div>
        </div>

        <div className="p-6 space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-gray-700">Title</span>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-gray-700">Type</span>
            <select value={mode} onChange={e=>setMode(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="text">Text</option>
              <option value="image">Image (URL)</option>
            </select>
          </label>

          {mode === 'text' ? (
            <label className="block text-sm"><span className="font-medium text-gray-700">Text</span>
              <textarea value={content} onChange={e=>setContent(e.target.value)} rows={4} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>
          ) : (
            <label className="block text-sm"><span className="font-medium text-gray-700">Image URL</span>
              <input value={content} onChange={e=>setContent(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>
          )}

          <label className="block text-sm">
            <span className="font-medium text-gray-700">Expiry date</span>
            <input type="date" value={expireAt} onChange={e=>setExpireAt(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>

          <div className="flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
            <button onClick={()=>onSave({ title: title.trim(), mode, content: content.trim(), expireAt: expireAt ? dayjs(expireAt).endOf('day').toISOString() : null })} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{initial ? 'Save' : 'Create'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Offers(){
  const [offers, setOffers] = useLocalOffers()
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [snack, setSnack] = useState(null)

  const showSnack = (t) => { setSnack(t); setTimeout(()=>setSnack(null), 2500) }

  function createOffer(payload){
    const now = new Date().toISOString()
    const offer = { id: `offer_${Date.now()}`, ...payload, createdAt: now }
    setOffers(prev => [offer, ...prev])
    setOpenForm(false); showSnack('Offer created')
  }

  function updateOffer(id, payload){
    setOffers(prev => prev.map(o => o.id === id ? { ...o, ...payload } : o))
    setEditing(null); setOpenForm(false); showSnack('Offer updated')
  }

  function repostOffer(id, payload){
    const now = new Date().toISOString()
    const offer = { id: `offer_${Date.now()}`, ...payload, createdAt: now }
    setOffers(prev => [offer, ...prev])
    showSnack('Offer reposted')
  }

  function deleteOffer(id){
    if (!confirm('Delete this offer?')) return
    setOffers(prev => prev.filter(o => o.id !== id))
    showSnack('Offer deleted')
  }

  const list = useMemo(()=>{
    return offers.map(o => {
      const exp = o.expireAt ? dayjs(o.expireAt) : null
      const now = dayjs()
      const expired = exp ? exp.isBefore(now, 'day') : false
      const days = exp ? exp.diff(now, 'day') : null
      return { ...o, expired, days }
    })
  }, [offers])

  return (
    <div className="w-full max-w-screen-2xl px-4 py-6 space-y-4">
      <PageHeader title="Tenant Offers" subtitle="Create and manage offers for tenants" />

      <div className="flex items-center justify-end">
        <button onClick={()=>{ setEditing(null); setOpenForm(true) }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Create Offer</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {list.length === 0 && (
          <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-600">No offers yet. Create your first offer.</div>
        )}

        {list.map(o=> (
          <div key={o.id} className={`rounded-2xl border p-4 ${o.expired ? 'opacity-70' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{o.title}</div>
                <div className="text-xs text-gray-500 mt-1">Expires: {o.expireAt ? fmt(o.expireAt) : '—'}</div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${o.expired ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>{o.expired ? 'Expired' : 'Active'}</div>
                <div className="text-xs text-gray-500 mt-2">{o.days !== null ? (o.days >= 0 ? `Expires in ${o.days}d` : `Expired ${Math.abs(o.days)}d ago`) : 'No expiry'}</div>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-700">
              {o.mode === 'image' ? (
                o.content ? <img src={o.content} alt={o.title} className="w-full rounded" /> : <div className="text-xs text-gray-400">No image URL</div>
              ) : (
                <div className="whitespace-pre-wrap">{o.content}</div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 justify-end">
              <button onClick={()=>{ setEditing(o); setOpenForm(true) }} className="px-3 py-1 rounded border text-sm hover:bg-gray-50">Edit</button>
              <button onClick={()=>{ setEditing({ ...o, __repost: true }); setOpenForm(true) }} className="px-3 py-1 rounded border text-sm hover:bg-gray-50">Repost</button>
              <button onClick={()=>deleteOffer(o.id)} className="px-3 py-1 rounded border text-sm text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <OfferForm
        open={openForm}
        initial={editing}
        onClose={() => { setOpenForm(false); setEditing(null) }}
        onSave={(payload) => {
           if (editing && editing.__repost) {
             // repost (create new based on existing data)
             repostOffer(editing.id, payload)
             setEditing(null)
             setOpenForm(false)
             return
           }
          // create new
          createOffer(payload)
        }}
      />

      {snack && <div className="fixed bottom-4 right-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm">{snack}</div>}
    </div>
  )
}
