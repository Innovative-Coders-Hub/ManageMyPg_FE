import React from 'react'
import dayjs from 'dayjs'

/**
 * Right-side tenant status column
 * - Status badge
 * - Vacating countdown (animated when near)
 * - Vacate action button
 */
export default function TenantStatusColumn({
  current,
  isVacated,
  statusLabel,
  statusClasses,
  onEditVacate,
}) {
  if (!current) return null

  const isVacatingSoon =
    !!current?.end &&
    dayjs(current.end).isValid() &&
    dayjs(current.end).diff(dayjs(), 'day') <= 7

  const vacatingText = (() => {
    if (!current?.end) return null
    const days = dayjs(current.end).diff(dayjs(), 'day')
    if (days < 0) return null
    return `Vacating in ${days} day${days !== 1 ? 's' : ''}`
  })()

  return (
    <div className="flex flex-col items-end gap-[2px] sm:gap-1">
      {/* Status */}
      <span
        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${statusClasses}`}
      >
        {isVacated ? 'Vacated' : statusLabel}
      </span>

      {/* Vacating badge */}
      {!isVacated && vacatingText && (
        <span
          className={`
            inline-flex px-2 py-0.5 rounded text-[11px]
            bg-yellow-100 text-yellow-800 border border-yellow-200
            ${isVacatingSoon ? 'animate-pulse' : ''}
          `}
        >
          {vacatingText}
        </span>
      )}

      {/* Action button */}
      {!isVacated && (
        <button
          onClick={onEditVacate}
          className="
            mt-[2px]
            px-3 py-1.5
            rounded-lg border
            text-xs font-medium text-indigo-700
            hover:bg-indigo-50
            whitespace-nowrap
          "
        >
          {current?.end ? 'Update Vacating Date' : 'Set Vacating Date'}
        </button>
      )}
    </div>
  )
}
