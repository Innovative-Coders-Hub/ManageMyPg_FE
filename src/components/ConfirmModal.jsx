import React from 'react'
import { AlertCircle } from 'lucide-react'

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm transform overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl transition-all border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50/50">
            <AlertCircle size={32} />
          </div>

          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {title}
          </h2>

          <p className="mt-3 text-slate-500 text-sm leading-relaxed font-medium">
            {message}
          </p>

          <div className="mt-8 flex w-full gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 active:scale-[0.98] disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 group relative flex items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-white transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-indigo-100"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
