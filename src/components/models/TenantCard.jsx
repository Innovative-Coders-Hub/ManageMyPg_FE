import React, { useMemo } from 'react'
import {
  fmt,
  vacatingBadge
} from '../utills/dateUtils'

/* local helper */
const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-1.5">
    <div className="text-sm text-gray-600">{label}</div>
    <div className="text-sm font-medium text-gray-900 text-right">
      {value ?? '—'}
    </div>
  </div>
)

export default function TenantCard({
  bed,
  current,
  totals,
  statusLabel,
  statusClasses,
  isVacated,
  onCreateTenant,
  onQuickAssign,
  onOpenVacateEdit,
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm relative col-span-1 xl:col-span-2 min-w-0">
      <div className="grid grid-cols-[auto,1fr] md:flex md:items-start gap-4">

        {/* Avatar */}
        <div className="flex-none h-14 w-14 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-lg font-semibold shrink-0">
          {(bed?.bedName || 'B')
            .split(' ')
            .map(s => s[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-[1fr,auto] gap-3 items-start">
            <div className="min-w-0">
              <div className="text-lg font-semibold truncate">
                {`Bed ${bed.bedName}`} / {bed.roomName} / {bed.floorName}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">
                {current ? (current.mobileNumber ?? '') : 'No tenant assigned'}
              </div>
            </div>

            {current && (
              <div className="flex flex-col items-end gap-1">
                {/* Status */}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${statusClasses}`}
                >
                  {isVacated ? 'Vacated' : statusLabel}
                </span>

                {/* Vacating badge */}
                {!isVacated && current?.end && (
                  <span className="inline-flex px-2 py-0.5 rounded text-[11px] bg-yellow-100 text-yellow-800 border border-yellow-200">
                    {vacatingBadge(current.end)}
                  </span>
                )}

                {/* Vacate action */}
                {!isVacated && (
                 <button
                        type="button"
                        onClick={onOpenVacateEdit}
                        className="mt-1 px-3 py-1.5 rounded-lg border text-xs font-medium text-indigo-700 hover:bg-indigo-50 whitespace-nowrap"
                        >
                    {current?.end ? 'Update Vacating Date' : 'Set Vacating Date'}
                  </button>
                )}
              </div>
            )}
          </div>

          {current ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {/* Contact */}
              <div className="rounded-lg border bg-gradient-to-br from-indigo-50 to-white p-3 border-indigo-100">
                <div className="text-xs font-semibold mb-2 text-indigo-700">Contact</div>
                <div className="space-y-2">
                  <InfoRow
                    label="Email"
                    value={
                      current.email ? (
                        <a
                          href={`mailto:${current.email}`}
                          className="text-sm text-indigo-700 hover:underline break-all"
                        >
                          {current.email}
                        </a>
                      ) : '—'
                    }
                  />
                  <InfoRow label="Phone" value={current.mobileNumber ?? '—'} />
                  <InfoRow label="Vehicle" value={current.vehicleNumber ?? '—'} />
                  <InfoRow label="Parent" value={current.parentNumber ?? '—'} />
                </div>
              </div>

              {/* Financial */}
              <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-white p-3 border-amber-100">
                <div className="text-xs font-semibold mb-2 text-amber-700">Financial</div>
                <div className="space-y-2">
                  <InfoRow label="Monthly Rent" value={`₹${current?.monthlyRent ?? 0}`} />
                  <InfoRow label="Deposit" value={current.advance ? `₹${current.advance}` : '—'} />
                  <InfoRow label="Pending" value={`₹${totals.pending ?? 0}`} />
                </div>
              </div>

              {/* Details */}
              <div className="sm:col-span-2 lg:col-span-1 rounded-lg border bg-gradient-to-br from-blue-50 to-white p-3 border-blue-100">
                <div className="text-xs font-semibold mb-2 text-blue-700">Details</div>
                <div className="space-y-2">
                  <InfoRow label="Date of Join" value={fmt(current.start)} />
                  <InfoRow label="Expected Vacate" value={fmt(current.end)} />
                  <InfoRow label="Age" value={current.age ?? '—'} />
                  <InfoRow label="Qualification" value={current.qualification ?? '—'} />
                  <InfoRow label="Works at" value={current.company ?? '—'} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed p-5 text-sm text-gray-600">
              <div>No one is currently assigned to this bed.</div>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                {/* <button
                  onClick={onCreateTenant}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 w-full sm:w-auto"
                >
                  Create New Tenant
                </button> */}
                <button
                  onClick={onQuickAssign}
                  className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 w-full sm:w-auto"
                >
                  Quick assign
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
