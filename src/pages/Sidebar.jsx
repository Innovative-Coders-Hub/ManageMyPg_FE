import React, { useEffect, useState, useMemo } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  Tag,
  CreditCard,
  BarChart3,
  Shield,
  User,
} from 'lucide-react'
import { ownerLogout, getAllPgs } from '../api/ownerAuth'
import ConfirmModal from '../components/ConfirmModal'

/* ---------------- Nav Config ---------------- */
const NAV = [
  { to: '/home', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/my-pgs', label: 'My PGs', icon: Building2 },
  { to: '/tenants', label: 'Tenants', icon: Users },
  { to: '/offers', label: 'Offers', icon: Tag },
  { to: '/complaints', label: 'Complaints', icon: CreditCard },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/ownerProfile', label: 'Profile', icon: User },
  { to: '/admin/dashboard', label: 'Admin', icon: Shield, adminOnly: true },
]

const cx = (...c) => c.filter(Boolean).join(' ')

export default function Sidebar({
  collapsed: collapsedProp,
  setCollapsed: setCollapsedProp,
  mobileOpen: mobileOpenProp,
  setMobileOpen: setMobileOpenProp,
}) {
  const navigate = useNavigate()
  const location = useLocation()

  /* ---------- URL state ---------- */
  const selectedPgId = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('pgId')
  }, [location.search])

  const isTenantsRoute = location.pathname === '/tenants'
  const isComplaintsRoute = location.pathname === '/complaints'
  /* ---------- Collapse ---------- */
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebar_collapsed')) ?? false
    } catch {
      return false
    }
  })

  const collapsed =
    typeof collapsedProp === 'boolean' ? collapsedProp : internalCollapsed

  const setCollapsed =
    setCollapsedProp ??
    ((v) => {
      setInternalCollapsed(v)
      localStorage.setItem('sidebar_collapsed', JSON.stringify(v))
    })

  /* ---------- Mobile ---------- */
  const [internalMobileOpen, setInternalMobileOpen] = useState(false)
  const mobileOpen =
    typeof mobileOpenProp === 'boolean' ? mobileOpenProp : internalMobileOpen
  const setMobileOpen = setMobileOpenProp ?? setInternalMobileOpen

  /* ---------- State ---------- */
  const [showConfirm, setShowConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [pgs, setPgs] = useState([])
  const [loadingPgs, setLoadingPgs] = useState(false)
  const [showTenantPgs, setShowTenantPgs] = useState(false)
  const [showComplaintPgs, setShowComplaintPgs] = useState(false)
  const [businessName, setBusinessName] = useState('ManageMyPg')

useEffect(() => {
  if (
    isComplaintsRoute &&
    !selectedPgId &&
    pgs &&
    pgs.length > 0
  ) {
    navigate(`/complaints?pgId=${pgs[0].id}`, { replace: true })
  }
}, [isComplaintsRoute, selectedPgId, pgs, navigate])

useEffect(() => {
  const syncName = () => {
    const name = localStorage.getItem('businessName')
    if (name) {
      setBusinessName(name)
    }
  }

  syncName() // initial load

  window.addEventListener('businessNameUpdated', syncName)
  return () =>
    window.removeEventListener('businessNameUpdated', syncName)
}, [])
  /* ---------- Load PGs ---------- */
  useEffect(() => {
    const loadPgs = async () => {
      try {
        setLoadingPgs(true)
        const data = await getAllPgs()
        setPgs(Array.isArray(data) ? data : [])
      } finally {
        setLoadingPgs(false)
      }
    }
    loadPgs()
  }, [])

  /* ---------- Auto-open Tenants ---------- */
  useEffect(() => {
    if (isTenantsRoute) setShowTenantPgs(true)
  }, [isTenantsRoute])

    useEffect(() => {
    if (isComplaintsRoute) setShowComplaintPgs(true)
  }, [isComplaintsRoute])
  /* ---------- Close mobile on resize ---------- */
  useEffect(() => {
    if (window.innerWidth >= 768 && mobileOpen) setMobileOpen(false)
  }, [mobileOpen, setMobileOpen])

  /* ================= NAV ITEM ================= */

  const NavItem = ({ to, label, Icon, adminOnly }) => {
    if (adminOnly && localStorage.getItem('isAdmin') !== 'true') return null

    return (
      <div>
        <NavLink
          to={to}
          className={({ isActive }) =>
            cx(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all',
              collapsed ? 'justify-center' : 'justify-start',
              isActive
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-200 hover:bg-white/10'
            )
          }
          onClick={() => {
            if (to === '/tenants') {
              setShowTenantPgs((v) => !v)
              setShowComplaintPgs(false)
              return
            }

            if (to === '/complaints') {
              setShowComplaintPgs((v) => !v)
              setShowTenantPgs(false)
              return
            }
            setShowTenantPgs(false)
            if (mobileOpen) setMobileOpen(false)
          }}
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/15 text-white">
            <Icon size={20} />
          </div>

          {!collapsed && (
            <span className="text-sm font-medium whitespace-nowrap">
              {label}
            </span>
          )}
        </NavLink>

        {/* -------- TENANTS → PG LIST -------- */}
        {to === '/tenants' && !collapsed && showTenantPgs && (
          <div className="ml-14 mt-1 space-y-1 border-l border-white/20 pl-3">
            {loadingPgs && (
              <div className="text-xs text-slate-300 px-2">
                Loading PGs...
              </div>
            )}

            {!loadingPgs &&
              pgs.map((pg) => {
                const isSelected = String(pg.id) === String(selectedPgId)

                return (
                  <button
                    key={pg.id}
                    onClick={() => {
                      navigate(`/tenants?pgId=${pg.id}`)
                      if (mobileOpen) setMobileOpen(false)
                    }}
                    className={cx(
                      'w-full text-left text-sm px-3 py-2 rounded-md transition',
                      isSelected
                        ? 'bg-white/20 text-white font-medium'
                        : 'text-slate-200 hover:bg-white/10'
                    )}
                  >
                    {pg.pgName}
                  </button>
                )
              })}

            {!loadingPgs && pgs.length === 0 && (
              <div className="text-xs text-slate-300 px-2">
                No PGs found
              </div>
            )}
          </div>
        )}

        {/* -------- COMPLAINTS → PG LIST -------- */}
          {to === '/complaints' && !collapsed && showComplaintPgs && (
            <div className="ml-14 mt-1 space-y-1 border-l border-white/20 pl-3">
              {loadingPgs && (
                <div className="text-xs text-slate-300 px-2">
                  Loading PGs...
                </div>
              )}

              {!loadingPgs &&
                pgs.map((pg) => {
                  const isSelected = String(pg.id) === String(selectedPgId)

                  return (
                    <button
                      key={pg.id}
                      onClick={() => {
                        navigate(`/complaints?pgId=${pg.id}`)
                        if (mobileOpen) setMobileOpen(false)
                      }}
                      className={cx(
                        'w-full text-left text-sm px-3 py-2 rounded-md transition',
                        isSelected
                          ? 'bg-white/20 text-white font-medium'
                          : 'text-slate-200 hover:bg-white/10'
                      )}
                    >
                      {pg.pgName}
                    </button>
                  )
                })}

              {!loadingPgs && pgs.length === 0 && (
                <div className="text-xs text-slate-300 px-2">
                  No PGs found
                </div>
              )}
            </div>
          )}

      </div>
    )
  }

  /* ================= RENDER ================= */

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

      {/* Desktop */}
      <aside
        className={cx(
          'hidden md:flex flex-col transition-all duration-300',
          collapsed ? 'w-20' : 'w-72',
          'sticky top-0 h-screen z-30',
          'bg-gradient-to-b from-indigo-700 via-indigo-800 to-slate-900'
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          {!collapsed && (
            <span className="text-lg font-bold text-white">
              {businessName}
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-white/10 text-white"
          >
            ☰
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} Icon={item.icon} />
          ))}
        </nav>

        <SidebarProfile
          collapsed={collapsed}
          onLogoutClick={() => setShowConfirm(true)}
        />
      </aside>

      {/* Mobile */}
      <aside
        className={cx(
          'fixed left-0 top-0 bottom-0 z-50 w-72 transition-transform',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'bg-gradient-to-b from-indigo-700 via-indigo-800 to-slate-900'
        )}
      >
        <div className="px-4 py-4 border-b border-white/10 font-bold text-white">
          {businessName}
        </div>

        <nav className="px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} Icon={item.icon} />
          ))}
        </nav>

        <div className="border-t border-white/10 px-3 py-3">
          <SidebarProfile
            mobile
            onLogoutClick={() => {
              setShowConfirm(true)
              setMobileOpen(false)
            }}
          />
        </div>
      </aside>

      <ConfirmModal
        open={showConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        loading={loggingOut}
        onCancel={() => setShowConfirm(false)}
        onConfirm={async () => {
          setLoggingOut(true)
          try {
            await ownerLogout()
          } finally {
            localStorage.clear()
            window.location.replace('/signin')
          }
        }}
      />
    </>
  )
}

/* ---------------- Profile ---------------- */

function SidebarProfile({ collapsed, mobile, onLogoutClick }) {
  const fullName = localStorage.getItem('fullName')
  const username = localStorage.getItem('username')
  const displayName = fullName || username || 'PG Owner'

  return (
    <div
      className={cx(
        'flex items-center gap-3 px-4 py-3 border-t border-white/10 hover:bg-white/10',
        collapsed && !mobile ? 'justify-center' : 'justify-start'
      )}
    >
      <div className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center font-semibold">
        {displayName.charAt(0).toUpperCase()}
      </div>

      {(!collapsed || mobile) && (
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">
            {displayName}
          </div>
          <button
            onClick={onLogoutClick}
            className="text-xs text-slate-300 hover:text-red-400"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
