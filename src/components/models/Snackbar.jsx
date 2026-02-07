import React from 'react';

export default function Snackbar({ snack }) {
  if (!snack) return null

  const tone =
    snack.type === 'error'
      ? 'bg-red-600'
      : snack.type === 'info'
      ? 'bg-gray-800'
      : 'bg-emerald-600'

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg text-white shadow-lg ${tone}`}
      role="status"
      aria-live="polite"
    >
      {snack.text}
    </div>
  )
}
