import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  Tag,
  BedDouble,
  CreditCard,
  BarChart3,
  Shield,
  Settings,
  LogOut,
} from 'lucide-react'

// ---------- Nav config ----------
const NAV = [
  { to: '/home', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/my-pgs', label: 'My PGs', icon: Building2 },
  { to: '/tenants', label: 'Tenants', icon: Users },
  { to: '/offers', label: 'Offers', icon: Tag },
  { to: '/beds', label: 'Beds', icon: BedDouble },
  { to: '/complaints', label: 'Complaints', icon: CreditCard },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/dashboard', label: 'Admin', icon: Shield, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const cx = (...c) => c.filter(Boolean).join(' ')

export default function Sidebar({
  collapsed: collapsedProp,
  setCollapsed: setCollapsedProp,
  mobileOpen: mobileOpenProp,
  setMobileOpen: setMobileOpenProp,
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebar_collapsed')) ?? false
    } catch {
      return false
    }
  })
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)

  const collapsed =
    typeof collapsedProp === 'boolean' ? collapsedProp : internalCollapsed

  const setCollapsed =
    setCollapsedProp ??
    ((v) => {
      setInternalCollapsed(v)
      localStorage.setItem('sidebar_collapsed', JSON.stringify(v))
    })

  const mobileOpen =
    typeof mobileOpenProp === 'boolean' ? mobileOpenProp : internalMobileOpen
  const setMobileOpen = setMobileOpenProp ?? setInternalMobileOpen

  useEffect(() => {
    if (window.innerWidth >= 768 && mobileOpen) setMobileOpen(false)
  }, [mobileOpen, setMobileOpen])

  return (
    <>
      {/* Overlay */}
      <div
        className={cx(
          'fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Desktop sidebar */}
      <aside
        className={cx(
          'hidden md:flex flex-col bg-white border-r shadow-sm transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-72',
          'sticky top-0 h-screen'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">
              ManageMyPg
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1">
          {NAV.map(({ to, label, icon: Icon, adminOnly }) => {
            if (adminOnly && localStorage.getItem('isAdmin') !== 'true')
              return null

            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cx(
                    'relative group flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200',
                    collapsed ? 'justify-center' : 'justify-start',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )
                }
              >
                {/* Active indicator */}
                <span
                  className={cx(
                    'absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-indigo-600 transition-opacity',
                    'opacity-0 group-[.active]:opacity-100'
                  )}
                />

                <div className="h-10 w-10 flex items-center justify-center rounded-md bg-gray-100">
                  <Icon size={20} />
                </div>

                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {label}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Profile */}
        <SidebarProfile collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={cx(
          'fixed left-0 top-0 bottom-0 z-50 w-72 bg-white shadow-xl md:hidden transition-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-4 py-4 border-b font-bold">ManageMyPg</div>

        <nav className="px-3 py-4 space-y-2">
          {NAV.map(({ to, label, icon: Icon, adminOnly }) => {
            if (adminOnly && localStorage.getItem('isAdmin') !== 'true')
              return null

            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cx(
                    'flex items-center gap-3 px-3 py-2 rounded-md',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )
                }
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t px-3 py-3">
          <SidebarProfile mobile />
        </div>
      </aside>
    </>
  )
}

function SidebarProfile({ collapsed, mobile }) {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div
      className={cx(
        'flex items-center gap-3 px-3 py-3 hover:bg-gray-50 cursor-pointer',
        collapsed && !mobile ? 'justify-center' : 'justify-start'
      )}
    >
      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
        SB
      </div>

      {!collapsed && (
        <div className="flex-1">
          <div className="text-sm font-semibold">Sudheer Babu</div>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-xs text-gray-500 mt-0.5"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
