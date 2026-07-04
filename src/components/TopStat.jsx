import React from 'react'

/**
 * TopStat Component
 * Standardized High-Density Stat Card for Page Headers
 */
export default function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50', percentage }) {
  return (
    <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md hover:scale-[1.02] transition-all cursor-default flex-1 min-w-[140px] sm:min-w-[180px]">
      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 h-6" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
          {percentage && (
            <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${bgClass} ${colorClass}`}>
              {percentage}
            </span>
          )}
        </div>
        <p className="text-base sm:text-xl font-black text-slate-900 leading-tight truncate">{value}</p>
      </div>
    </div>
  )
}
