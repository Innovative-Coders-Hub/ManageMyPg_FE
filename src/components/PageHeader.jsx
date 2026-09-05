import React from 'react';

/**
 * PageHeader Component
 * Executive Top Header Template for Owner Portal Pages
 */
export default function PageHeader({ title, subtitle, backButton, children, icon: Icon }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden mb-6 group">
      {/* Top Accent Gradient Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 opacity-90" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="min-w-0 flex items-center gap-3.5">
          {Icon && (
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-300">
              <Icon size={20} strokeWidth={2.2} />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs font-bold text-slate-500 tracking-wide mt-0.5 opacity-90">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 sm:gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          {children}
          {backButton}
        </div>
      </div>
    </div>
  );
}
