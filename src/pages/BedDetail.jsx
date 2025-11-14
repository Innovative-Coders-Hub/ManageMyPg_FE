
// src/pages/BedDetail.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import { sampleData } from '../sampleData'

/* ---------------- utilities ---------------- */

const fmt = (d, f = 'DD MMM YYYY') => (dayjs(d).isValid() ? dayjs(d).format(f) : '—')
// Short month-year like: Sep ’25
const fmtShort = (d) => (dayjs(d).isValid() ? dayjs(d).format("MMM ’YY") : '—')

function usePersistentMap(key, initialObj = {}) {
  const [state, setState] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initialObj } catch { return initialObj }
  })
  React.useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)) } catch {} }, [key, state])
  return [state, setState]
}

function downloadReceipt({ tenant, period, payment }) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`
    <pre style="font:14px/1.4 system-ui,Segoe UI,Arial">
Receipt
-------
Tenant   : ${tenant?.name ?? '-'}
Period   : ${fmt(period.from)} – ${fmt(period.to)}
Mode     : ${payment.mode}
Rent     : ₹${payment.rent}
Paid     : ₹${payment.amountPaid}
Pending  : ₹${payment.pending}
Paid At  : ${fmt(payment.paidAt, 'DD MMM YYYY, HH:mm')}
</pre>`)
  win.document.close()
  win.focus()
  win.print()
}

/* --- tiny inline icon --- */
const BackIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 6l-6 6 6 6" />
  </svg>
)

/* ---------- Small Confirm Modal (self-contained) ---------- */
function ConfirmModal({ open, title = 'Confirm', message = 'Are you sure?', confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md mx-4 rounded-2xl border bg-white shadow-xl">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
          <div className="text-lg font-semibold">{title}</div>
        </div>
        <div className="p-6 text-sm text-gray-700">{message}</div>
        <div className="flex justify-end gap-2 px-6 pb-6">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border hover:bg-gray-50">{cancelLabel}</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Snackbar ---------- */
function Snackbar({ snack }) {
  if (!snack) return null
  const tone =
    snack.type === 'error' ? 'bg-red-600' :
    snack.type === 'info'  ? 'bg-gray-800' :
                             'bg-emerald-600'
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg text-white shadow-lg ${tone}`}>
      {snack.text}
    </div>
  )
}

/* ---------- Payment Modal ---------- */
function PaymentModal({ open, period, defaultRent, onClose, onSave }) {
  const [mode, setMode] = useState('Cash')
  const [rent, setRent] = useState(defaultRent || 5000)
  const [amountPaid, setAmountPaid] = useState(defaultRent || 5000)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setMode('Cash')
      setRent(defaultRent || 5000)
      setAmountPaid(defaultRent || 5000)
      setNote('')
    }
  }, [open, defaultRent])

  useEffect(() => {
    if (open && period?.__existing) {
      const p = period.__existing
      setMode(p.mode || 'Cash')
      setRent(p.rent ?? (defaultRent || 5000))
      setAmountPaid(p.amountPaid ?? (defaultRent || 5000))
      setNote(p.note || '')
    }
  }, [open, period, defaultRent])

  if (!open || !period) return null
  const pending = Math.max(0, (Number(rent) || 0) - (Number(amountPaid) || 0))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-2xl border bg-white shadow-xl">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
          <div className="text-lg font-semibold">{period.__existing ? 'Edit Payment' : 'Mark as Paid'}</div>
          <div className="text-xs text-gray-600">{period.label} • {fmt(period.from)} – {fmt(period.to)}</div>
        </div>

        <div className="p-6 space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-gray-700">Payment Mode</span>
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option><option>Other</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Monthly Rent</span>
              <input type="number" value={rent} onChange={(e)=>setRent(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Amount Paid</span>
              <input type="number" value={amountPaid} onChange={(e)=>setAmountPaid(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" />
            </label>
          </div>

          <div className="rounded-lg bg-gray-50 border px-3 py-2 text-sm flex items-center justify-between">
            <div className="text-gray-600">Pending</div>
            <div className={`font-semibold ${pending > 0 ? 'text-amber-700' : 'text-green-700'}`}>₹{pending}</div>
          </div>

          <label className="block text-sm">
            <span className="font-medium text-gray-700">Notes (optional)</span>
            <textarea value={note} onChange={(e)=>setNote(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Any remarks…" />
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => onSave({ mode, rent: Number(rent)||0, amountPaid: Number(amountPaid)||0, pending, note, paidAt: new Date().toISOString() })}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
            >Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Tenant modal: assign tenant + optional advance payment ---------- */
function TenantModal({ open, defaultRent, onClose, onSave, initial }) {
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

/* ---------- History Details Modal ---------- */
function HistoryDetailsModal({ open, onClose, historyItem, paymentsForRange, defaultRent }) {
  if (!open || !historyItem) return null

  const periods = useMemo(() => buildBillingPeriods(historyItem.start, historyItem.end ?? undefined), [historyItem.start, historyItem.end])

  const totals = useMemo(() => {
    const rentPer = defaultRent || 0
    let due = 0, paid = 0, pending = 0
    for (const p of periods) {
      const pay = paymentsForRange[p.key]
      if (pay) { paid += Number(pay.amountPaid) || 0; pending += Number(pay.pending) || 0 }
      else { due += rentPer }
    }
    return { due, paid, pending }
  }, [periods, paymentsForRange, defaultRent])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-4 rounded-2xl border bg-white shadow-xl">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
          <div className="text-lg font-semibold">Tenant stay details</div>
          <div className="text-xs text-gray-600">{historyItem.tenantName ?? '—'} • {fmt(historyItem.start)} — {fmt(historyItem.end)}</div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-gray-50 p-4">
              <div className="text-sm text-gray-600">Tenant</div><div className="font-semibold">{historyItem.tenantName ?? '—'}</div>
            </div>
            <div className="rounded-xl border bg-gray-50 p-4">
              <div className="text-sm text-gray-600">Stay</div><div className="font-semibold">{fmt(historyItem.start)} — {fmt(historyItem.end)}</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border px-3 py-2 bg-gray-50"><div className="text-gray-600">Total Due</div><div className="font-semibold">₹{totals.due}</div></div>
            <div className="rounded-lg border px-3 py-2 bg-gray-50"><div className="text-gray-600">Total Paid</div><div className="font-semibold">₹{totals.paid}</div></div>
            <div className="rounded-lg border px-3 py-2 bg-gray-50"><div className="text-gray-600">Pending</div><div className="font-semibold">₹{totals.pending}</div></div>
          </div>

          {periods.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-gray-600">No billing periods available for this stay.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {periods.map(p => {
                const paid = paymentsForRange[p.key]
                const status = dueStatus(p)
                const badgeTone = paid ? 'bg-green-50 border-green-200 text-green-800'
                  : status.tone === 'red' ? 'bg-red-50 border-red-200 text-red-800'
                  : status.tone === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700'
                return (
                  <div key={p.key} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{p.label}</div>
                      <div className={`px-2 py-0.5 rounded-lg text-xs border ${badgeTone}`}>{paid ? 'Paid' : status.label}</div>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">{fmt(p.from, 'DD MMM')} – {fmt(p.to, 'DD MMM')}</div>
                    {paid ? (
                      <div className="mt-2 text-xs">
                        <div>Paid: ₹{paid.amountPaid}</div>
                        {paid.pending > 0 && <div className="text-amber-700">Pending: ₹{paid.pending}</div>}
                        <div className="text-gray-500">{paid.mode} • {fmt(paid.paidAt, 'DD MMM')}</div>
                      </div>
                    ) : <div className="mt-2 text-xs text-gray-500">Unpaid</div>}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- helpers: periods & dates ---------- */
function buildBillingPeriods(joinDateISO, endDateISO) {
  if (!joinDateISO) return []
  const start = dayjs(joinDateISO); if (!start.isValid()) return []
  const end = endDateISO ? dayjs(endDateISO) : dayjs().add(6, 'month'); if (!end.isValid()) return []

  const periods = []
  let from = start.startOf('day')
  let to = dayjs(from).add(1, 'month').subtract(1, 'day').startOf('day')

  let guard = 0
  while (end.diff(from, 'day') >= 0 && guard < 36) {
    periods.push({ key: from.format('YYYY-MM-DD'), from: from.toISOString(), to: to.toISOString(), label: from.format('MMM YYYY'), isFirst: periods.length === 0 })
    from = dayjs(from).add(1, 'month').startOf('day')
    to = dayjs(from).add(1, 'month').subtract(1, 'day').startOf('day')
    guard++
  }
  return periods
}

function dueStatus(period) {
  const today = dayjs().startOf('day')
  const to = dayjs(period?.to).startOf('day')
  if (!to.isValid()) return { label: 'Upcoming', tone: 'gray' }
  if (today.diff(to, 'day') > 0) return { label: `Overdue ${today.diff(to, 'day')}d`, tone: 'red' }
  const daysLeft = to.diff(today, 'day')
  if (daysLeft <= 5) return { label: `Due in ${daysLeft}d`, tone: 'amber' }
  return { label: 'Upcoming', tone: 'gray' }
}

function firstMonthProrationInfo(joinISO) {
  const d = dayjs(joinISO); if (!d.isValid()) return { daysProrated: 0, daysInMonth: 0 }
  const endOfMonth = d.endOf('month')
  return { daysProrated: endOfMonth.diff(d, 'day') + 1, daysInMonth: endOfMonth.daysInMonth() }
}

/* ==================== PAGE ==================== */
export default function BedDetail(){
  const { bedId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const passed = location.state?.bed

  const [bed, setBed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = usePersistentMap(`payments:${bedId}`, {})
  const [activePeriod, setActivePeriod] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyItem, setHistoryItem] = useState(null)

  const [confirm, setConfirm] = useState(null) // {title, message, onConfirm}
  const [snack, setSnack] = useState(null)    // {text, type}
  const showSnack = (text, type = 'success') => { setSnack({ text, type }); setTimeout(() => setSnack(null), 2500) }

  // NEW state for tenant modal
  const [tenantModalOpen, setTenantModalOpen] = useState(false)
  const [tenantDraft, setTenantDraft] = useState(null) // used by tenant form

  // Resolve bed (router state or sampleData)
  useEffect(() => {
    if (passed) {
      setBed(passed)
      const seed = Array.isArray(passed?.tenant?.payments) ? passed.tenant.payments : []
      if (seed.length && Object.keys(payments).length === 0) setPayments(Object.fromEntries(seed.map(p => [p.key, p])))
      setLoading(false)
      return
    }
    let found = null
    outer:
    for (const pg of (sampleData?.pgs || [])) {
      for (const floor of (pg.floors || [])) {
        for (const room of (floor.rooms || [])) {
          for (const b of (room.beds || [])) {
            if (String(b.id) === String(bedId)) { found = { ...b, _context: { pgId: pg.id, floor: floor.number, room: room.number } }; break outer }
          }
        }
      }
    }
    if (found) {
      const seed = Array.isArray(found?.tenant?.payments) ? found.tenant.payments : []
      if (seed.length && Object.keys(payments).length === 0) setPayments(Object.fromEntries(seed.map(p => [p.key, p])))
    }
    setBed(found); setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bedId, passed])

  // --------- compute ALL hooks BEFORE any return ----------

  const bedExists = !!bed
  const today = dayjs()
  const current = (bedExists && bed.occupied) ? bed.tenant : null
  const history = bedExists && Array.isArray(bed.history) ? bed.history : []

  // Sorted history (newest to oldest) and “Ongoing” handling
  const sortedHistory = useMemo(() => {
    const arr = Array.isArray(history) ? [...history] : []
    return arr.sort((a, b) => {
      const aKey = dayjs(a?.end || a?.start).valueOf()
      const bKey = dayjs(b?.end || b?.start).valueOf()
      return bKey - aKey
    })
  }, [history])

  const isVacatingSoon = !!(current?.end) && dayjs(current.end).isValid() && dayjs(current.end).diff(today, 'day') <= 7

  let statusLabel = 'Available'
  let statusClasses = 'bg-green-50 text-green-700 border border-green-200'
  if (bedExists && bed.occupied) {
    statusLabel = isVacatingSoon ? 'Vacating ≤ 7d' : 'Occupied'
    statusClasses = isVacatingSoon ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-red-50 text-red-800 border border-red-200'
  }

  const periods = useMemo(() => {
    const start = current?.start
    const end = current?.end ?? undefined
    return buildBillingPeriods(start, end)
  }, [current?.start, current?.end])

  const defaultRent = current?.rent || 5000

  const totals = useMemo(() => {
    const rentPer = defaultRent || 0
    let due = 0, paidSum = 0, pending = 0
    for (const p of periods) {
      const pay = payments[p.key]
      if (pay) { paidSum += Number(pay.amountPaid) || 0; pending += Number(pay.pending) || 0 }
      else { due += rentPer }
    }
    return { due, paid: paidSum, pending }
  }, [periods, payments, defaultRent])

  const paymentsForHistoryRange = useMemo(() => {
    if (!historyItem) return {}
    const keys = new Set(buildBillingPeriods(historyItem.start, historyItem.end).map(p => p.key))
    const subset = {}
    for (const k of Object.keys(payments)) if (keys.has(k)) subset[k] = payments[k]
    return subset
  }, [historyItem, payments])

  // ---- Bulk helpers / export / print ----
  function markAllPastDueAsPaid() {
    const pastDue = periods.filter(p => !payments[p.key] && dueStatus(p).tone === 'red')
    if (pastDue.length === 0) { showSnack('No past-due periods to mark', 'info'); return }
    setConfirm({
      title: 'Mark past due as paid',
      message: `Mark ${pastDue.length} period(s) as paid at ₹${defaultRent} each?`,
      onConfirm: () => {
        const now = new Date().toISOString()
        setPayments(prev => {
          const next = { ...prev }
          pastDue.forEach(p => {
            next[p.key] = { key: p.key, label: p.label, from: p.from, to: p.to, mode: 'Auto', rent: defaultRent, amountPaid: defaultRent, pending: 0, note: 'Bulk marked as paid', paidAt: now }
          })
          return next
        })
        setConfirm(null)
        showSnack(`Marked ${pastDue.length} period(s) as paid`, 'success')
      }
    })
  }

  function exportPaymentsCSV() {
    const rows = [['Bed ID', 'Tenant', 'Period', 'From', 'To', 'Status', 'Amount Paid', 'Pending', 'Mode', 'Paid At']]
    periods.forEach(p => {
      const pay = payments[p.key]
      rows.push([
        String(bed.id),
        current?.name || '-',
        p.label,
        fmt(p.from),
        fmt(p.to),
        pay ? 'Paid' : 'Unpaid',
        pay?.amountPaid ?? 0,
        pay?.pending ?? (pay ? 0 : defaultRent),
        pay?.mode ?? '-',
        pay?.paidAt ? fmt(pay.paidAt, 'DD MMM YYYY, HH:mm') : '-',
      ])
    })
    const csv = rows.map(r => r.map(x => (typeof x === 'string' && x.includes(',') ? `"${x.replace(/"/g,'""')}"` : x)).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments_${String(bed.id)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showSnack('CSV exported', 'success')
  }

  function printPayments() {
    const win = window.open('', '_blank'); if (!win) return
    const rows = periods.map(p => {
      const pay = payments[p.key]
      return `<tr><td>${p.label}</td><td>${fmt(p.from)}</td><td>${fmt(p.to)}</td><td>${pay ? 'Paid' : 'Unpaid'}</td><td>${pay?.amountPaid ?? 0}</td><td>${pay?.pending ?? (pay ? 0 : defaultRent)}</td><td>${pay?.mode ?? '-'}</td><td>${pay?.paidAt ? fmt(pay.paidAt, 'DD MMM YYYY, HH:mm') : '-'}</td></tr>`
    }).join('')
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Payments - Bed ${String(bed.id)}</title>
      <style>body{font:14px system-ui,Segoe UI,Arial;padding:16px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:6px;text-align:left} th{background:#f3f4f6}</style>
      </head><body>
      <h2>Payments — Bed ${String(bed.id)}</h2>
      <div>Tenant: ${current?.name ?? '-'}</div>
      <table><thead><tr><th>Period</th><th>From</th><th>To</th><th>Status</th><th>Amount Paid</th><th>Pending</th><th>Mode</th><th>Paid At</th></tr></thead><tbody>${rows}</tbody></table>
      <script>window.print()</script>
      </body></html>`)
    win.document.close(); win.focus()
  }

  // --------- safe early returns AFTER hooks ----------

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-6">Loading...</div>
  if (!bedExists) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="text-lg font-semibold">No bed found for id “{bedId}”.</div>
        <button onClick={()=>navigate(-1)} className="px-3 py-2 rounded-lg border hover:bg-gray-50">← Back</button>
      </div>
    )
  }

  const InfoRow = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-sm font-medium text-gray-900 text-right">{value ?? '—'}</div>
    </div>
  )

  function handleDeletePayment(key) {
    setConfirm({
      title: 'Delete payment',
      message: 'This will permanently remove the payment record for this period. Continue?',
      onConfirm: () => {
        setPayments(prev => { const next = { ...prev }; delete next[key]; return next })
        setConfirm(null)
        showSnack('Payment deleted', 'success')
      }
    })
  }

  function handleEditPayment(period) {
    setActivePeriod({ ...period, __existing: payments[period.key] })
    setModalOpen(true)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 border flex items-center justify-center text-indigo-700 font-extrabold">
            {String(bed.id).replace(/^Bed\s*/i,'')}
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">Bed {bed.id}</div>
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusClasses}`}>{statusLabel}</div>
          </div>
        </div>
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          <BackIcon /> Back
        </button>
      </div>

      {/* Context chips */}
      {bed._context && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 border text-gray-700"><span className="font-semibold">PG</span> {bed._context.pgId}</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 border text-gray-700"><span className="font-semibold">Floor</span> {bed._context.floor}</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 border text-gray-700"><span className="font-semibold">Room</span> {bed._context.room}</span>
        </div>
      )}

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Tenant card */}
        <div className="lg:col-span-1 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Tenant Details</h3>
            {!current && <span className="text-xs text-gray-500">No active tenant</span>}
          </div>

          {current ? (
            <div className="mt-3">
              <div className="rounded-xl bg-gray-50 border p-3">
                <div className="text-base font-semibold">{current.name ?? '—'}</div>
                <div className="text-xs text-gray-600">{current.phone ? `Phone: ${current.phone}` : 'Phone: —'}</div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <InfoRow label="Date of Join" value={fmt(current.start)} />
                <InfoRow label="Expected Vacate" value={fmt(current.end)} />
                <InfoRow label="Monthly Rent" value={current.rent ? `₹${current.rent}` : `₹${defaultRent}`} />
                <InfoRow label="Deposit" value={current.deposit ? `₹${current.deposit}` : '—'} />
                <InfoRow label="Email" value={current.email ?? '—'} />
                <InfoRow label="Vehicle No." value={current.vehicleNo ?? '—'} />
                <InfoRow label="Parent Name" value={current.parentName ?? '—'} />
                <InfoRow label="Age" value={current.age ?? '—'} />
                <InfoRow label="Qualification" value={current.qualification ?? '—'} />
                <InfoRow label="Works at" value={current.company ?? '—'} />
                <InfoRow label="Room No." value={bed._context?.room ?? '—'} />
              </div>

              {current.start && (
                <div className="mt-3 rounded-lg border bg-blue-50 text-blue-900 px-3 py-2 text-xs">
                  <div className="font-semibold">Billing rule</div>
                  <div>Monthly on join-date (anniversary). First month may be prorated.</div>
                </div>
              )}

              {/* Quick actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-sm"
                  onClick={() => {
                    const days = parseInt(prompt('Extend by how many days?', '30') || '0', 10)
                    if (!Number.isFinite(days) || days <= 0) return
                    const newEnd = current.end ? dayjs(current.end).add(days, 'day') : dayjs().add(days, 'day')
                    setBed(prev => ({ ...prev, tenant: { ...prev.tenant, end: newEnd.toISOString() } }))
                  }}
                >Extend stay</button>

                <button
                  className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-sm"
                  onClick={() => {
                    const d = prompt('Set vacate date (YYYY-MM-DD)', current.end ? dayjs(current.end).format('YYYY-MM-DD') : '')
                    if (!d) return
                    const iso = dayjs(d, 'YYYY-MM-DD', true)
                    if (!iso.isValid()) { alert('Invalid date'); return }
                    setBed(prev => ({ ...prev, tenant: { ...prev.tenant, end: iso.toISOString() } }))
                  }}
                >Set vacate date</button>

                <button
                  className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-sm"
                  onClick={() => {
                    const r = parseInt(prompt('New monthly rent', current.rent ?? defaultRent) || '', 10)
                    if (!Number.isFinite(r) || r <= 0) return
                    setBed(prev => ({ ...prev, tenant: { ...prev.tenant, rent: r } }))
                  }}
                >Change rent</button>

                <button
                  className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-sm"
                  onClick={() => {
                    const d = prompt('Mark last working day (YYYY-MM-DD)', dayjs().format('YYYY-MM-DD'))
                    if (!d) return
                    const iso = dayjs(d, 'YYYY-MM-DD', true)
                    if (!iso.isValid()) { alert('Invalid date'); return }
                    setBed(prev => {
                      const endISO = iso.toISOString()
                      const t = prev?.tenant || {}
                      return {
                        ...prev,
                        tenant: { ...t, end: endISO },
                        history: [
                          ...(prev?.history || []),
                          { tenantName: t.name || '—', start: t.start, end: endISO, note: 'Last working day marked' },
                        ],
                      }
                    })
                  }}
                  title="Marks the tenant's final day in this bed"
                >Mark last working day</button>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed p-4 text-sm text-gray-600">
              <div>No one is currently assigned to this bed.</div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => { setTenantDraft(null); setTenantModalOpen(true) }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                >Assign tenant</button>

                <button
                  onClick={() => {
                    // quick assign minimal tenant with today's start & default rent
                    const minimal = {
                      name: `Tenant ${String(bed.id)}`,
                      start: dayjs().startOf('day').toISOString(),
                      rent: defaultRent
                    }
                    setTenantDraft(minimal)
                    setTenantModalOpen(true)
                  }}
                  className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                  title="Quick assign minimal details (you can edit in form)"
                >Quick assign</button>
              </div>
            </div>
          )}
        </div>

        {/* Payments Schedule */}
        <div className="lg:col-span-2 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold">Payments</h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">{periods.length} period{periods.length !== 1 ? 's' : ''}</span>
              <button
                onClick={markAllPastDueAsPaid}
                className="px-2.5 py-1 rounded border text-xs hover:bg-gray-50"
                title="Mark all past-due unpaid periods as paid at current rent"
              >Mark past due paid</button>
              <button
                onClick={exportPaymentsCSV}
                className="px-2.5 py-1 rounded border text-xs hover:bg-gray-50"
              >Export CSV</button>
              <button
                onClick={printPayments}
                className="px-2.5 py-1 rounded border text-xs hover:bg-gray-50"
              >Print</button>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg border px-3 py-2 bg-gray-50"><div className="text-gray-600">Total Due</div><div className="font-semibold">₹{totals.due}</div></div>
            <div className="rounded-lg border px-3 py-2 bg-gray-50"><div className="text-gray-600">Total Paid</div><div className="font-semibold">₹{totals.paid}</div></div>
            <div className="rounded-lg border px-3 py-2 bg-gray-50"><div className="text-gray-600">Pending</div><div className="font-semibold">₹{totals.pending}</div></div>
          </div>

          {(!current || periods.length === 0) ? (
            <div className="mt-3 rounded-2xl border border-dashed p-4 text-sm text-gray-600">No periods to display.</div>
          ) : (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {periods.map((p) => {
                const paid = payments[p.key]
                const status = dueStatus(p)
                const badgeTone =
                  paid ? 'bg-green-50 border-green-200 text-green-800'
                  : status.tone === 'red' ? 'bg-red-50 border-red-200 text-red-800'
                  : status.tone === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-gray-50 border-gray-200 text-gray-700'

                return (
                  <div key={p.key} className="rounded-xl border p-3 hover:shadow-sm transition">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{p.label}</div>
                      <div className={`px-2 py-0.5 rounded-lg text-xs border ${badgeTone}`}>{paid ? 'Paid' : status.label}</div>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">{fmt(p.from, 'DD MMM')} – {fmt(p.to, 'DD MMM')}</div>

                    {p.isFirst && current?.start && dayjs(current.start).date() !== 1 && (
                      <div className="mt-2 text-[11px] rounded bg-blue-50 border border-blue-200 text-blue-800 px-2 py-1 inline-block">Prorated</div>
                    )}

                    <div className="mt-3 flex items-start justify-between text-sm">
                      {paid ? (
                        <div className="text-gray-700">
                          ₹{paid.amountPaid}{paid.pending>0 ? <span className="text-amber-700"> • Pending ₹{paid.pending}</span> : null}
                        </div>
                      ) : (
                        <div className="text-gray-500">Unpaid</div>
                      )}

                      {paid ? (
                        <div className="flex flex-col items-end gap-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => downloadReceipt({ tenant: current, period: p, payment: paid })}
                              className="px-2 py-1 rounded border hover:bg-gray-50"
                              title="Download receipt"
                            >
                              Receipt
                            </button>
                            <button
                              onClick={() => handleEditPayment(p)}
                              className="px-2 py-1 rounded border hover:bg-gray-50"
                              title="Edit payment"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="text-gray-500">{paid.mode} • {fmt(paid.paidAt, 'DD MMM')}</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setActivePeriod(p); setModalOpen(true) }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* History card */}
        <div className="lg:col-span-3 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">History</h3>
            <span className="text-xs text-gray-500">{sortedHistory.length} record{sortedHistory.length !== 1 ? 's' : ''}</span>
          </div>

          {sortedHistory.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed p-4 text-sm text-gray-600">No history records yet.</div>
          ) : (
            <ol className="mt-3 space-y-3">
              {sortedHistory.map((h, idx) => (
                <li key={idx} className="rounded-xl border p-3 bg-gradient-to-br from-gray-50 to-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" aria-hidden />
                      <div className="font-medium">{h.tenantName ?? '—'}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 border text-gray-700">
                        {fmtShort(h.start)} → {h.end ? fmtShort(h.end) : 'Ongoing'}
                      </span>
                      <button
                        className="px-2 py-1 rounded border text-xs hover:bg-gray-50"
                        onClick={() => { setHistoryItem(h); setHistoryOpen(true) }}
                      >View details</button>
                    </div>
                  </div>
                  {h.note && <div className="mt-1 text-xs text-gray-600">{h.note}</div>}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Payment modal */}
      <PaymentModal
        open={modalOpen}
        period={activePeriod}
        defaultRent={defaultRent}
        onClose={()=>setModalOpen(false)}
        onSave={(payload)=> {
          if (!activePeriod) return
          setPayments(prev => ({
            ...prev,
            [activePeriod.key]: { key: activePeriod.key, label: activePeriod.label, from: activePeriod.from, to: activePeriod.to, ...payload }
          }))
          setModalOpen(false)
          showSnack(activePeriod?.__existing ? 'Payment updated' : 'Payment recorded', 'success')
        }}
      />

      {/* Tenant assign modal */}
      <TenantModal
        open={tenantModalOpen}
        defaultRent={defaultRent}
        initial={tenantDraft}
        onClose={() => { setTenantModalOpen(false); setTenantDraft(null) }}
        onSave={({ tenant, advanceAmount, mode }) => {
          // defensive normalization
          const RENT_FALLBACK = 5000

          // validate & normalize start
          const startISO = tenant?.start ? dayjs(tenant.start).startOf('day') : null
          if (!startISO || !startISO.isValid()) {
            alert('Invalid start date — please pick a valid date.')
            return
          }
          const startIsoStr = startISO.toISOString()

          // normalize numeric fields
          const tenantRent = Math.max(0, Number(tenant.rent || defaultRent || RENT_FALLBACK))
          const advance = Math.max(0, Number(advanceAmount || 0))

          // build tenant object to set on bed
          const tenantToSave = {
            ...tenant,
            start: startIsoStr,
            rent: tenantRent,
          }

          // assign tenant on bed (preserve existing history if any)
          setBed(prev => {
            const prevHistory = Array.isArray(prev?.history) ? prev.history : []
            return { ...prev, occupied: true, tenant: tenantToSave, history: prevHistory }
          })

          // allocate advance only if > 0
          if (advance > 0) {
            const periodsToAllocate = buildBillingPeriods(startIsoStr)
            if (!Array.isArray(periodsToAllocate) || periodsToAllocate.length === 0) {
              // no periods — still notify and return
              showSnack('Tenant assigned but could not allocate advance (no billing periods)', 'info')
              setTenantModalOpen(false)
              setTenantDraft(null)
              return
            }

            const nowISO = new Date().toISOString()
            let remaining = advance

            setPayments(prev => {
              const next = { ...prev }

              for (const p of periodsToAllocate) {
                if (remaining <= 0) break

                // rent to use for this period: prefer tenantRent, fallbacks
                const rentPer = Number(tenantRent || p.rent || defaultRent || RENT_FALLBACK)

                // existing payment entry for this period
                const existing = next[p.key]

                // compute how much we still need to fill this period
                const alreadyPaid = existing ? (Number(existing.amountPaid) || 0) : 0
                const need = Math.max(0, rentPer - alreadyPaid)
                if (need <= 0) {
                  // already fully paid, continue
                  continue
                }

                const payHere = Math.min(remaining, need)
                const newAmountPaid = alreadyPaid + payHere
                const newPending = Math.max(0, rentPer - newAmountPaid)

                const base = {
                  key: p.key,
                  label: p.label,
                  from: p.from,
                  to: p.to,
                  rent: rentPer,
                }

                next[p.key] = {
                  ...base,
                  mode,
                  amountPaid: newAmountPaid,
                  pending: newPending,
                  paidAt: nowISO,
                  note: existing ? ((existing.note || '') + ' • Advance allocation') : 'Advance recorded on assign',
                }

                remaining -= payHere
              }

              return next
            })

            showSnack(`Assigned tenant and recorded advance ₹${advance}`, 'success')
          } else {
            showSnack('Tenant assigned', 'success')
          }

          setTenantModalOpen(false)
          setTenantDraft(null)
        }}
      />

      {/* History Details modal */}
      <HistoryDetailsModal
        open={historyOpen}
        onClose={() => { setHistoryOpen(false); setHistoryItem(null) }}
        historyItem={historyItem}
        paymentsForRange={paymentsForHistoryRange}
        defaultRent={defaultRent}
      />

      {/* Confirm + Snackbar */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
        confirmLabel="Yes, proceed"
        cancelLabel="Cancel"
      />
      <Snackbar snack={snack} />
    </div>
  )
}
