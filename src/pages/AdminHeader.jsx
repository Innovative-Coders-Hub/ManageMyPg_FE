import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { adminLogout } from '../api/adminAuth'

export default function AdminHeader(){
  const { pathname, search } = useLocation()
  const q = new URLSearchParams(search)
  const activeOwners = pathname === '/admin/owners'
  const activeApproved = activeOwners && q.get('filter') === 'approved'
  const activePending = activeOwners && q.get('filter') === 'pending'
  const navigate = useNavigate()
  async function signOut() {
    try {
      await adminLogout()
    } catch {}
    try {
      localStorage.removeItem('isAdmin')
      localStorage.removeItem('isOwner')
      localStorage.removeItem('admin_jwt')
    } catch {}
    navigate('/admin/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">A</div>
          <div className="text-lg font-bold">Admin Console</div>
        </div>
        <nav className="flex items-center gap-2 ml-4">
          <Link to="/admin/dashboard" className={`px-3 py-1 rounded ${activeOwners ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>Dashboard</Link>
          <Link to="/admin/owners" className={`px-3 py-1 rounded ${activeOwners ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>Owners</Link>
          <Link to="/admin/owners?filter=approved" className={`px-3 py-1 rounded ${activeApproved ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>Approved</Link>
          <Link to="/admin/owners?filter=pending" className={`px-3 py-1 rounded ${activePending ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>Pending</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">A</div>
            <div className="text-right">
              <div className="text-sm font-semibold">Admin</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
          </div>
          <button onClick={signOut} title="Sign out" className="p-2 rounded-md hover:bg-gray-100">
            <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
