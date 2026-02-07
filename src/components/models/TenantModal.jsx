import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

export default function TenantModal({ open, defaultRent, onClose, onSave, initial }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [start, setStart] = useState(initial?.start ? dayjs(initial.start).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))
  const [rent, setRent] = useState(initial?.rent ?? defaultRent ?? 5000)
  const [deposit, setDeposit] = useState(initial?.deposit ?? '')
  const [advance, setAdvance] = useState(0)
  const [mode, setMode] = useState('Cash')
  const [note, setNote] = useState(initial?.note ?? '')

  useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setPhone(initial?.phone ?? '')
    setEmail(initial?.email ?? '')
    setStart(initial?.start ? dayjs(initial.start).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'))
    setRent(initial?.rent ?? defaultRent ?? 5000)
    setDeposit(initial?.deposit ?? '')
    setAdvance(0)
    setMode('Cash')
    setNote(initial?.note ?? '')
  }, [open, initial, defaultRent])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-2xl border bg-white shadow-xl">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
          <div className="text-lg font-semibold">Assign tenant</div>
          <div className="text-xs text-gray-600">Create tenant + record optional advance payment</div>
        </div>

        <div className="p-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Name</span>
              <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Phone</span>
              <input value={phone} onChange={e=>setPhone(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Email</span>
              <input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Start date</span>
              <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Monthly Rent</span>
              <input type="number" value={rent} onChange={e=>setRent(Number(e.target.value||0))} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Deposit</span>
              <input type="number" value={deposit} onChange={e=>setDeposit(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>
          </div>

          <label className="block text-sm">
            <span className="font-medium text-gray-700">Advance payment (optional)</span>
            <input type="number" value={advance} onChange={e=>setAdvance(Number(e.target.value||0))} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Amount paid today as advance" />
            <div className="text-xs text-gray-500 mt-1">Advance will be allocated starting from the tenant's first billing period.</div>
          </label>

          <label className="block text-sm">
            <span className="font-medium text-gray-700">Payment mode</span>
            <select value={mode} onChange={(e)=>setMode(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Other</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="font-medium text-gray-700">Note (optional)</span>
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => {
                if (!name) { alert('Please enter tenant name'); return }
                // build tenant object
                const tenantObj = {
                  name: name.trim(),
                  phone: phone.trim() || undefined,
                  email: email.trim() || undefined,
                  start: dayjs(start).startOf('day').toISOString(),
                  rent: Number(rent) || defaultRent || 5000,
                  deposit: deposit ? Number(deposit) : undefined,
                  note: note || undefined,
                }
                onSave({ tenant: tenantObj, advanceAmount: Number(advance)||0, mode })
              }}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
            >Assign</button>
          </div>
        </div>
      </div>
    </div>
  )
}