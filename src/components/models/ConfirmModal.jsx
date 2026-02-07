import React from 'react'
export default function ConfirmModal({
  open,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md mx-4 rounded-2xl border bg-white shadow-xl">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
          <div className="text-lg font-semibold">{title}</div>
        </div>
        <div className="p-6 text-sm text-gray-700">{message}</div>
        <div className="flex justify-end gap-2 px-6 pb-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
