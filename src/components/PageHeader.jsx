import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, subtitle, showBack = true, children }){
  const navigate = useNavigate()
  return (
    <div className="mb-4 flex items-center gap-4">
      {showBack && (
        <button onClick={() => navigate(-1)} className="p-2 rounded-md hover:bg-gray-100">
          <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      )}
      <div>
        <div className="text-2xl font-bold">{title}</div>
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      </div>
      <div className="ml-auto">{children}</div>
    </div>
  )
}
