import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'

/**
 * Enhanced ConfirmModal with enterprise visual style
 */
export default function ConfirmModal({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning' // 'warning', 'danger', 'info'
}) {
  if (!open) return null

  const getTheme = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-100',
          text: 'text-rose-600',
          icon: <AlertCircle size={20} strokeWidth={2.5} />,
          button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
        }
      case 'info':
        return {
          bg: 'bg-indigo-50',
          border: 'border-indigo-100',
          text: 'text-indigo-600',
          icon: <CheckCircle2 size={20} strokeWidth={2.5} />,
          button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
        }
      default:
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          text: 'text-amber-600',
          icon: <AlertTriangle size={20} strokeWidth={2.5} />,
          button: 'bg-slate-900 hover:bg-indigo-600 shadow-slate-100'
        }
    }
  }

  const theme = getTheme()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] overflow-y-auto"
      onClick={onCancel}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative border border-white/20 my-8"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onCancel}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-20"
          >
            <X size={20} strokeWidth={3} />
          </button>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border ${theme.bg} ${theme.border} ${theme.text}`}>
                {theme.icon}
              </div>
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 leading-none mb-1">
                  {title}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  Authentication Required
                </p>
              </div>
            </div>

            <p className="text-[12px] font-bold text-slate-600 leading-relaxed uppercase tracking-tight">
              {message}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onCancel}
                className="flex-1 h-[46px] bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-[2] h-[46px] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${theme.button}`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
