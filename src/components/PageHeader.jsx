import React from 'react';

/**
 * PageHeader Component
 * Standardized High-Density Enterprise Header
 */
export default function PageHeader({ title, subtitle, backButton, children }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-1 relative">
      <div className="min-w-0 text-center md:text-left flex items-center gap-4">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="h-5 w-1 bg-indigo-600 rounded-full hidden md:block" />
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase truncate leading-none">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mt-2 opacity-80 px-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3">
        {children}
        {backButton}
      </div>
    </div>
  );
}
