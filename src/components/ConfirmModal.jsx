import React from 'react'

export default function ConfirmModal({
  open,
  title = 'Confirm action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}) {

  // ✅ ADD THIS EXACTLY HERE
  React.useEffect(() => {
    if (!open) return

    const esc = (e) => {
      if (e.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-xl p-6">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>

        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Logging out…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
