import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { minVacateDate, fmt } from '../utills/dateUtils'

export default function VacateTenantModal({
  open,
  tenant,
  onClose,
  onSave,
}) {
  const [date, setDate] = useState('')
  const [override, setOverride] = useState(false)     // ✅ added
  const [reason, setReason] = useState('')            // ✅ added

  useEffect(() => {
    if (!open) return

    if (tenant?.end) {
      setDate(dayjs(tenant.end).format('YYYY-MM-DD'))
    } else {
      setDate(dayjs(minVacateDate()).format('YYYY-MM-DD'))
    }

    // reset override state on open
    setOverride(false)
    setReason('')
  }, [tenant, open])

  if (!open) return null

  // ---------- VALIDATION LOGIC (ADDED) ----------
  const minDate = dayjs(minVacateDate())
  const selectedDate = dayjs(date)

const isEarlyVacate =  !tenant?.end && date && selectedDate.isBefore(minDate, 'day')
const isToday = tenant?.end && date && selectedDate.isSame(dayjs(), 'day')
  const canSave =
    !isEarlyVacate || (override && reason.trim().length >= 5)
  // --------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            {tenant?.end ? 'Update Vacating Date' : 'Set Vacating Date'}
          </h3>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">
          {tenant?.end && (
            <div className="text-sm text-gray-600">
              Current vacating date:{' '}
              <strong>{fmt(tenant.end)}</strong>
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700">
            Vacating Date
          </label>

          <input
            type="date"
            value={date}
           min={
            tenant?.end
              ? dayjs().format('YYYY-MM-DD')          // update → allow today
              : dayjs(minVacateDate()).format('YYYY-MM-DD') // first time → 30 days
          }
            onChange={e => {
              setDate(e.target.value)
              setOverride(false)
              setReason('')
            }}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
          {isToday && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
              You are marking current tenant is vacating today.
            </div>
          )}
          {/* ---------- EARLY VACATE WARNING ---------- */}
          {isEarlyVacate && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Selected date is less than 30 days from today.
            </div>
          )}

          {/* ---------- OVERRIDE SECTION ---------- */}
          {isEarlyVacate && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={override}
                  onChange={e => setOverride(e.target.checked)}
                  className="h-4 w-4"
                />
                Allow early vacating (override)
              </label>

              {override && (
                <>
                  <label className="block text-sm font-medium text-gray-700">
                    Reason for early vacating
                  </label>
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Medical emergency, job relocation, etc."
                  />
                  {reason.trim().length < 5 && (
                    <div className="text-xs text-red-600">
                      Please enter a valid reason (minimum 5 characters)
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            disabled={!canSave}
            onClick={() =>
             onSave({
                vacatingDate: date,   // ✅ MATCH BE FIELD
                reason: override ? reason.trim() : null,
              })
            }
            className={`px-4 py-2 rounded-lg text-sm text-white
              ${canSave
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-300 cursor-not-allowed'
              }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
