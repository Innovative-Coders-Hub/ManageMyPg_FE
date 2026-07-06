import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

/**
 * CustomDropdown Component
 * Standardized Dropdown with Border Label and Lucide Icon support
 */
export default function CustomDropdown({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  showAll = false,
  className = "min-w-[240px]",
  labelBg = "bg-white",
  direction = "down",
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Support for both simple array of strings and array of objects {id, label}
  const getLabel = (val) => {
    if (val === 'ALL' || val === '') return `ALL ${label}S`
    const opt = options.find(o => (typeof o === 'object' ? (o.id === val || o.value === val) : o === val))
    return typeof opt === 'object' ? opt.label : (opt || val)
  }

  if (disabled) {
    return (
      <div className={`relative ${className}`}>
        <div className={`absolute -top-2.5 left-5 px-2 ${labelBg} z-20`}>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
        </div>
        <div className="w-full flex items-center justify-between gap-3 px-5 py-2.5 bg-slate-100 border-2 border-slate-100 rounded-2xl opacity-60">
          <div className="flex items-center gap-3">
            {Icon && <Icon size={18} className="text-slate-400" strokeWidth={2.5} />}
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[150px]">
              {getLabel(value)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className} ${isOpen ? 'z-[100]' : ''}`} ref={containerRef}>
      <div className={`absolute -top-2.5 left-5 px-2 ${labelBg} z-20 transition-all duration-300`}>
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none">{label}</span>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-5 py-2.5 bg-slate-50 border-2 rounded-2xl transition-all duration-300 ${
          isOpen ? 'border-indigo-500 shadow-xl shadow-indigo-100/50' : 'border-slate-100 hover:border-indigo-300 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className="text-indigo-500" strokeWidth={2.5} />}
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest truncate max-w-[150px]">
            {getLabel(value)}
          </span>
        </div>
        <ChevronDown
          size={16}
          strokeWidth={3}
          className={`text-indigo-400 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: direction === 'up' ? -12 : 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === 'up' ? -8 : 8, scale: 0.95 }}
            className={`absolute z-[110] left-0 right-0 ${direction === 'up' ? 'bottom-full mb-4' : 'top-full mt-2'} bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-2`}
          >
            {showAll && (
              <button
                type="button"
                onClick={() => { onChange('ALL'); setIsOpen(false); }}
                className={`w-full px-7 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all ${
                  (value === 'ALL' || value === '') ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                ALL {label}S
              </button>
            )}
            {options.map((opt) => {
              const id = typeof opt === 'object' ? (opt.id || opt.value) : opt
              const labelText = typeof opt === 'object' ? opt.label : opt
              const isActive = value === id

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => { onChange(id); setIsOpen(false); }}
                  className={`w-full px-7 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {labelText}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
