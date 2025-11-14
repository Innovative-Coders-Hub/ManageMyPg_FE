// src/components/SidebarFresh.jsx
// Fresh, modern, fully-responsive sidebar designed to fit the ManageMyPg app.
// - Uses Tailwind CSS (v3+) utility classes
// - Desktop (md+): persistent left rail, collapsible (w-16 collapsed → w-72 expanded)
//   - Shows icons in collapsed mode with tooltips
// - Mobile (sm): hidden by default, opens as full-height overlay drawer
// - Sticky bottom area for Logout/profile
// - Accessible: keyboard focus, aria attributes
// - Zero external dependencies beyond React + react-router-dom + Tailwind

import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

// ---------- Config / nav items ----------
const NAV = [
  { to: '/home', label: 'Dashboard', emoji: '🏠' },
  { to: '/my-pgs', label: 'My PGs', emoji: '🏢' },
  { to: '/tenants', label: 'Tenants', emoji: '🧑‍🤝‍🧑' },
  { to: '/beds', label: 'Beds', emoji: '🛏️' },
  { to: '/complaints', label: 'Complaints', emoji: '💳' },
  { to: '/reports', label: 'Reports', emoji: '📊' },
  { to: '/settings', label: 'Settings', emoji: '⚙️' },
]

function Icon({ emoji }) {
  return (
    <div className="h-7 w-7 rounded-md flex items-center justify-center text-lg" aria-hidden>
      {emoji}
    </div>
  )
}

// Simple helper to join classes
function cx(...parts) { return parts.filter(Boolean).join(' ') }

export default function Sidebar({
  // controlled props (optional) so parent (App) may persist state
  collapsed: collapsedProp,
  setCollapsed: setCollapsedProp,
  mobileOpen: mobileOpenProp,
  setMobileOpen: setMobileOpenProp,
}) {
  // internal state fallback
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sidebar_collapsed')) ?? false } catch { return false }
  })
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)

  const collapsed = typeof collapsedProp === 'boolean' ? collapsedProp : internalCollapsed
  const setCollapsed = setCollapsedProp ?? ((v) => {
    setInternalCollapsed(v)
    try { localStorage.setItem('sidebar_collapsed', JSON.stringify(v)) } catch {}
  })

  const mobileOpen = typeof mobileOpenProp === 'boolean' ? mobileOpenProp : internalMobileOpen
  const setMobileOpen = setMobileOpenProp ?? setInternalMobileOpen

  // close mobile drawer on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768 && mobileOpen) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [mobileOpen, setMobileOpen])

  // classes
  const railBase = 'flex flex-col bg-white shadow-sm border-r transition-all duration-200'
  const railWidth = collapsed ? 'w-16' : 'w-72'
  const railCollapsedPadding = collapsed ? 'pt-3 pb-3' : 'pt-4 pb-4'

  // Overlay classes for mobile
  const backdropClass = cx('fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity', mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')
  const drawerClass = cx('fixed left-0 top-0 bottom-0 z-50 md:hidden bg-white shadow-xl transition-transform', mobileOpen ? 'translate-x-0' : '-translate-x-full')

  return (
    <>
      {/* Mobile backdrop */}
      <div className={backdropClass} onClick={() => setMobileOpen(false)} aria-hidden />

      {/* Desktop rail (part of flow on md+) */}
      <aside className={cx(railBase, railWidth, 'hidden md:flex', railCollapsedPadding)} style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* header area */}
        <div className="flex items-center justify-between px-3">
          <div className={cx('flex items-center gap-3', collapsed ? 'justify-center w-full' : '')}>
            {/* mini brand when expanded */}
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">M</div>
                <div className="text-lg font-bold">ManageMyPg</div>
              </div>
            ) : (
              <div className="h-9 w-9 flex items-center justify-center" aria-hidden>M</div>
            )}
          </div>
          {/* collapse toggle */}
          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* nav */}
        <nav className="mt-3 flex-1 px-1 overflow-y-auto">
          <ul className="space-y-1">
            {NAV.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => cx(
                    'group flex items-center gap-3 rounded-md px-2 py-2 transition-colors',
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                  )}
                  title={item.label}
                >
                  <div className="flex items-center justify-center h-8 w-8 text-xl rounded-md bg-gray-100">{item.emoji}</div>
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  {/* chevron on expanded to show more */}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* bottom area: sticky profile/logout */}
        <div className="px-3 pb-4">
          <div className="sticky bottom-0 bg-white pt-3">
            <div className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-50 cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">SB</div>
              {!collapsed && (
                <div>
                  <div className="text-sm font-semibold">Sudheer Babu</div>
                  <button className="text-xs text-gray-500 mt-0.5">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile drawer (overlay) */}
      <aside className={drawerClass} style={{ width: '280px' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">M</div>
            <div className="font-bold">ManageMyPg</div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-gray-100 focus:outline-none" aria-label="Close menu">
            <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="px-3 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {NAV.map(item => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => cx('flex items-center gap-3 px-3 py-2 rounded-md', isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50')} onClick={() => setMobileOpen(false)}>
                  <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center text-lg">{item.emoji}</div>
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-3 pb-6">
          <div className="border-t pt-3">
            <div className="flex items-center gap-3 px-2 py-2 rounded-md">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">SB</div>
              <div>
                <div className="text-sm font-semibold">Sudheer Babu</div>
                <button className="text-xs text-gray-500 mt-0.5">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
