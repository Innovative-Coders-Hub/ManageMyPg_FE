import React, { useEffect, useState } from 'react'
import { fmt } from '../utills/dateUtils';

export default function PaymentModal({
  open,
  period,
  defaultRent,
  existingAdvance,
  onClose,
  onSave
}) {
  const FALLBACK_RENT = 10000

  const [mode, setMode] = useState('Cash')
  const [rent, setRent] = useState(defaultRent || FALLBACK_RENT)
  const [amountPaid, setAmountPaid] = useState(defaultRent || FALLBACK_RENT)
  const [note, setNote] = useState('')
  const [advance, setAdvance] = useState(1000)
  // reset when opened
 useEffect(() => {
  if (!open) return
  setMode('Cash')
  setRent(defaultRent || FALLBACK_RENT)
  setAmountPaid(defaultRent || FALLBACK_RENT)
   if (existingAdvance == null) {
    setAdvance(5000)        // first time default
  } else {
    setAdvance(existingAdvance) // from backend
  }
  setNote('')
}, [open, defaultRent,existingAdvance])

  // populate when editing existing payment
useEffect(() => {
  if (!open || !period?.__existing) return

  const p = period.__existing
  setMode(p.modeOfPayment || 'CASH')
  setRent(p.rent ?? defaultRent)
  setAmountPaid(p.amountPaid ?? defaultRent)
  setAdvance(existingAdvance ?? 5000)
  setNote(p.remarks || '')
}, [open, period, defaultRent, existingAdvance])


  if (!open || !period) return null
   const isFirstPayment = existingAdvance == null
  const pending = Math.max(
    0,
    (Number(rent) || 0) - (Number(amountPaid) || 0)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md mx-4 rounded-2xl border bg-white shadow-xl">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
          <div className="text-lg font-semibold">
            {period.__existing ? 'Edit Payment' : 'Mark as Paid'}
          </div>
          <div className="text-xs text-gray-600">
            {period.label} • {fmt(period.from)} – {fmt(period.to)}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Mode */}
          <label className="block text-sm">
            <span className="font-medium text-gray-700">Payment Mode</span>
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>UPI</option>
              <option>CASH</option>
              <option>CARD</option>
              <option>BANK_TRANSFER</option>
              <option>OTHER</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-700">
              Advance (one time)
            </span>
            <input
              type="number"
              value={advance}
              disabled={!isFirstPayment}
              onChange={e => setAdvance(e.target.value)}
              className={`mt-1 w-full px-3 py-2 rounded-lg border outline-none 
                ${!isFirstPayment ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-500'}`}
            />
            {!isFirstPayment && (
              <div className="text-xs text-gray-500 mt-1">
                Advance already collected
              </div>
            )}
          </label>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="font-medium text-gray-700">Monthly Rent</span>
              <input
                type="number"
                value={rent}
                onChange={e => setRent(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <label className="block text-sm">
              <span className="font-medium text-gray-700">Amount Paid</span>
              <input
                type="number"
                value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>

          {/* Pending */}
          <div className="rounded-lg bg-gray-50 border px-3 py-2 text-sm flex items-center justify-between">
            <div className="text-gray-600">Pending</div>
            <div
              className={`font-semibold ${
                pending > 0 ? 'text-amber-700' : 'text-green-700'
              }`}
            >
              ₹{pending}
            </div>
          </div>

          {/* Notes */}
          <label className="block text-sm">
            <span className="font-medium text-gray-700">Notes (optional)</span>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Any remarks…"
            />
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() =>
            onSave({
              rentMonth: period.key,
              rent: Number(rent) || 0,
              paidAmount: Number(amountPaid) || 0,
              advance: Number(advance) || 0,
              pending: Number(pending) || 0,
              modeOfPayment: mode || 'Cash',
              paidDate: new Date().toISOString().slice(0, 10),
              remarks: note || null
            })
              }
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
