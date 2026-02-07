import React, { useMemo, useEffect, useState } from 'react'
import { fmt } from '../utills/dateUtils'
import { getTenantHistory } from '../../api/ownerAuth'
import {
  buildBillingPeriods,
  dueStatus
} from '../utills/billingUtils';
export default function HistoryDetailsModal({
  open,
  onClose,
  historyItem,
  paymentsForRange,
  defaultRent
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
    return {
      paid: 0,
      pending: 0,
      refunded: 0,
      charges: 0
    }
  }

  let paid = 0
  let pending = 0

  for (const r of rentEntries) {
    paid += Number(r.paidAmount) || 0
    pending += Number(r.pending) || 0
  }

  // common values (take from first record)
  const refunded = Number(rentEntries[0]?.refundAmount) || 0
  const charges = Number(rentEntries[0]?.charges) || 0

  return {
    paid,
    pending,
    refunded,
    charges
  }
}, [rentEntries])




  if (!open || !historyItem) return null
if (loading) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow">
        Loading tenant details...
      </div>
    </div>
  )
}
if (error) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow max-w-sm text-center">
        <div className="text-red-600 font-medium">
          Unable to load tenant details
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Showing basic history information only.
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 rounded-lg border"
        >
          Close
        </button>
      </div>
    </div>
  )
}

  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl mx-4 rounded-2xl border bg-white shadow-xl">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
          <div className="text-lg font-semibold">
            Tenant stay History
          </div>
          <div className="text-xs text-gray-600">
            {tenant?.name ?? historyItem.tenantName ?? '—'} • {fmt(historyItem.start)} — {fmt(historyItem.end)}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-gray-50 p-4">
              <div className="text-sm text-gray-600">Details</div>
              <div className="font-semibold">{tenant?.name ?? historyItem.tenantName ?? '—'}</div>
               <div className="font-semibold">{tenant?.mobileNumber ?? historyItem.tenantMobileNumber ?? '—'}</div>
            </div>
            <div className="rounded-xl border bg-gray-50 p-4">
              <div className="text-sm text-gray-600">Stay</div>
              <div className="font-semibold">
                {fmt(historyItem.start)} — {fmt(historyItem.end)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg border px-3 py-2 bg-gray-50">
              <div className="text-gray-600">Total Paid</div>
              <div className="font-semibold">₹{totals.paid}</div>
            </div>

            <div className="rounded-lg border px-3 py-2 bg-gray-50">
              <div className="text-gray-600">Pending</div>
              <div className="font-semibold">₹{totals.pending}</div>
            </div>

            <div className="rounded-lg border px-3 py-2 bg-gray-50">
              <div className="text-gray-600">Refunded</div>
              <div className="font-semibold">₹{totals.refunded}</div>
            </div>

            <div className="rounded-lg border px-3 py-2 bg-gray-50">
              <div className="text-gray-600">Charges</div>
              <div className="font-semibold">₹{totals.charges}</div>
            </div>
          </div>

          {rentEntries.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-sm text-gray-600">
              No billing periods available for this stay.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rentEntries.map(r => {
                  const badgeTone =
                    r.status === 'PAID'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : r.pending > 0
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700'

                  return (
                    <div key={r.id} className="rounded-xl border p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">
                          {r.rentMonth}
                        </div>
                        <div className={`px-2 py-0.5 rounded-lg text-xs border ${badgeTone}`}>
                          {r.status}
                        </div>
                      </div>

                      <div className="mt-1 text-xs text-gray-600">
                        Due: {fmt(r.dueDate)} • Paid: {fmt(r.paidDate)}
                      </div>

                      <div className="mt-2 text-xs">
                        <div>Rent: ₹{r.rentAmount}</div>
                        <div>Paid: ₹{r.paidAmount}</div>
                        {r.pending > 0 && (
                          <div className="text-amber-700">
                            Pending: ₹{r.pending}
                          </div>
                        )}
                        <div className="text-gray-500">
                          {r.modeOfPayment}
                        </div>
                      </div>
                    </div>
                  )
                })}               

            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
