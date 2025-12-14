import React from 'react'

export default function PageLoader({ show = false, message = 'Loading…' }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-10 w-10 text-indigo-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        <div className="text-sm text-gray-700">{message}</div>
      </div>
    </div>
  )
}
