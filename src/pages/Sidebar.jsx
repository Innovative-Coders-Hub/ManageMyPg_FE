import React, { useEffect, useState, useMemo } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  Tag,
  CreditCard,
  Wallet,
  BarChart3,
  Shield,
  User,
  LogOut,
  Calendar,
  Briefcase,
  AlertCircle,
} from 'lucide-react'
import { ownerLogout, getAllPgs, getOwnerProfile } from '../api/ownerAuth'
import ConfirmModal from '../components/ConfirmModal'
import LogoImg from '../assets/managemypg.png'

/* ---------------- Nav Config ---------------- */
const NAV = [
  { to: '/home', label: 'Dashboard', icon: LayoutDashboard, color: 'text-sky-500', activeColor: 'text-sky-600', bg: 'bg-sky-500/20' },
  { to: '/my-pgs', label: 'My PGs', icon: Building2, color: 'text-indigo-400', activeColor: 'text-indigo-600', bg: 'bg-indigo-400/20' },
  { to: '/bookings', label: 'Bookings', icon: Calendar, color: 'text-purple-400', activeColor: 'text-purple-600', bg: 'bg-purple-400/20' },
  { to: '/tenants', label: 'Tenants', icon: Users, color: 'text-emerald-400', activeColor: 'text-emerald-600', bg: 'bg-emerald-400/20' },
  { to: '/rents', label: 'Rent Payments', icon: CreditCard, color: 'text-rose-400', activeColor: 'text-rose-600', bg: 'bg-rose-400/20' },
  { to: '/expenses', label: 'Expenses', icon: Wallet, color: 'text-amber-400', activeColor: 'text-amber-600', bg: 'bg-amber-400/20' },
  { to: '/workers', label: 'Workers', icon: Briefcase, color: 'text-cyan-400', activeColor: 'text-cyan-600', bg: 'bg-cyan-400/20' },
  { to: '/offers', label: 'Offers', icon: Tag, color: 'text-orange-400', activeColor: 'text-orange-600', bg: 'bg-orange-400/20' },
  { to: '/complaints', label: 'Complaints', icon: AlertCircle, color: 'text-red-400', activeColor: 'text-red-600', bg: 'bg-red-400/20' },
  { to: '/reports', label: 'Reports', icon: BarChart3, color: 'text-violet-400', activeColor: 'text-violet-600', bg: 'bg-violet-400/20' },
  { to: '/ownerProfile', label: 'Profile', icon: User, color: 'text-slate-400', activeColor: 'text-slate-600', bg: 'bg-slate-400/20' },
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
  const isWorkersRoute = location.pathname === '/workers'
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
  const [profile, setProfile] = useState(null)
  const [showTenantPgs, setShowTenantPgs] = useState(false)
  const [showWorkerPgs, setShowWorkerPgs] = useState(false)
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
  if (
    isTenantsRoute &&
    !selectedPgId &&
    pgs &&
    pgs.length > 0
  ) {
    navigate(`/tenants?pgId=${pgs[0].id}`, { replace: true })
  }
}, [isTenantsRoute, selectedPgId, pgs, navigate])

useEffect(() => {
  if (
    isWorkersRoute &&
    !selectedPgId &&
    pgs &&
    pgs.length > 0
  ) {
    navigate(`/workers?pgId=${pgs[0].id}`, { replace: true })
  }
}, [isWorkersRoute, selectedPgId, pgs, navigate])

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
  /* ---------- Load Sidebar Data ---------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingPgs(true)
        const isAdmin = localStorage.getItem('isAdmin') === 'true'
        if (!isAdmin) {
          const [pgsData, profileData] = await Promise.all([
            getAllPgs().catch(() => []),
            getOwnerProfile().catch(() => null)
          ])
          setPgs(Array.isArray(pgsData) ? pgsData : [])
          setProfile(profileData)

          if (profileData?.businessName) {
            setBusinessName(profileData.businessName)
            localStorage.setItem('businessName', profileData.businessName)
          }
        }
      } finally {
        setLoadingPgs(false)
      }
    }
    
    loadData()
  }, [])

  /* ---------- Auto-open Tenants ---------- */
  useEffect(() => {
    if (isTenantsRoute) setShowTenantPgs(true)
  }, [isTenantsRoute])

  useEffect(() => {
    if (isWorkersRoute) setShowWorkerPgs(true)
  }, [isWorkersRoute])

    useEffect(() => {
    if (isComplaintsRoute) setShowComplaintPgs(true)
  }, [isComplaintsRoute])
  /* ---------- Close mobile on resize ---------- */
  useEffect(() => {
    if (window.innerWidth >= 768 && mobileOpen) setMobileOpen(false)
  }, [mobileOpen, setMobileOpen])

  /* ================= NAV ITEM ================= */

  const NavItem = ({ to, label, Icon, color, activeColor, bg, adminOnly }) => {
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
              setShowWorkerPgs(false)
              setShowComplaintPgs(false)
              return
            }

            if (to === '/workers') {
              setShowWorkerPgs((v) => !v)
              setShowTenantPgs(false)
              setShowComplaintPgs(false)
              return
            }

            if (to === '/complaints') {
              setShowComplaintPgs((v) => !v)
              setShowTenantPgs(false)
              setShowWorkerPgs(false)
              return
            }
            setShowTenantPgs(false)
            setShowWorkerPgs(false)
            if (mobileOpen) setMobileOpen(false)
          }}
        >
          {({ isActive }) => (
            <>
              <div
                className={cx(
                  'h-10 w-10 flex items-center justify-center rounded-lg transition-all duration-300',
                  isActive
                    ? 'bg-white shadow-sm'
                    : `${bg} group-hover:bg-white/20`
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={2.5}
                  className={isActive ? activeColor : color}
                />
              </div>

              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {label}
                </span>
              )}
            </>
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
                      'w-full text-left text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition',
                      isSelected
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-white/10'
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

        {/* -------- WORKERS → PG LIST -------- */}
        {to === '/workers' && !collapsed && showWorkerPgs && (
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
                      navigate(`/workers?pgId=${pg.id}`)
                      if (mobileOpen) setMobileOpen(false)
                    }}
                    className={cx(
                      'w-full text-left text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition',
                      isSelected
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-white/10'
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
                        'w-full text-left text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl transition',
                        isSelected
                          ? 'bg-white/20 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-white/10'
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
        <div className={cx(
          "flex items-center border-b border-white/10 px-4 py-4 transition-all duration-300",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div className={cx("flex items-center min-w-0 flex-1", collapsed ? "justify-center" : "gap-3")}>
            <div className={cx(
              "rounded-full bg-white p-0 border border-white/10 transition-all duration-300 overflow-hidden shrink-0",
              collapsed ? "h-10 w-10" : "h-12 w-12"
            )}>
              <img src={LogoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <span className="text-xl font-black text-white tracking-tighter truncate">
                {businessName}
              </span>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-xl hover:bg-white/10 text-indigo-400 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>

        {collapsed && (
          <div className="px-4 py-2 flex justify-center border-b border-white/5">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-xl hover:bg-white/10 text-indigo-400 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} Icon={item.icon} />
          ))}
        </nav>

        <SidebarProfile
          collapsed={collapsed}
          onLogoutClick={() => setShowConfirm(true)}
          profile={profile}
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
        <div className="px-4 py-4 border-b border-white/10 font-bold text-white flex items-center gap-3 min-w-0">
          <div className="h-12 w-12 rounded-full bg-white p-0 border border-white/10 overflow-hidden shrink-0">
            <img src={LogoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="truncate text-xl font-black tracking-tighter">{businessName}</span>
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
            profile={profile}
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
            window.location.replace('/manage/mypg/signin')
          }
        }}
      />
    </>
  )
}

/* ---------------- Profile ---------------- */

function SidebarProfile({ collapsed, mobile, onLogoutClick, profile }) {
  const [imgError, setImgError] = useState(false)
  const fullName = profile?.fullName || localStorage.getItem('fullName')
  const username = localStorage.getItem('username')
  const displayName = fullName || username || 'PG Owner'

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.managemypg.com/managemypg'
  const imageUrl = profile?.profileImageUrl
  const fullImageUrl = imageUrl
    ? (imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}`)
    : null

  return (
    <div
      className={cx(
        'flex items-center gap-3 px-4 py-3 border-t border-white/10 hover:bg-white/10',
        collapsed && !mobile ? 'justify-center' : 'justify-start'
      )}
    >
      <div className="h-10 w-10 rounded-full bg-white/20 text-white flex items-center justify-center font-semibold overflow-hidden border border-white/10 shrink-0">
        {fullImageUrl && !imgError ? (
          <img
            src={fullImageUrl}
            alt={displayName}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          displayName.charAt(0).toUpperCase()
        )}
      </div>

      {(!collapsed || mobile) && (
        <>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-white uppercase tracking-tight truncate">
              {displayName}
            </div>
            <div className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em] opacity-80">
              PG Admin
            </div>
          </div>
          <button
            onClick={onLogoutClick}
            className="p-2.5 text-rose-400 hover:text-rose-500 transition-colors group/btn shrink-0"
            title="Logout"
          >
            <LogOut size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}
    </div>
  )
}
