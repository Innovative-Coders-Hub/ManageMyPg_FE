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
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { ownerLogout, getAllPgs, getOwnerProfile } from '../api/ownerAuth'
import { useAppScope } from '../context/AppScopeContext'
import ConfirmModal from '../components/ConfirmModal'
import LogoImg from '../assets/managemypg.png'

/* ---------------- Nav Config ---------------- */
const NAV = [
  { to: '/home', label: 'Dashboard', icon: LayoutDashboard, color: 'text-sky-400', activeColor: 'text-sky-600', bg: 'bg-sky-500/20' },
  { to: '/my-pgs', label: 'My PGs', icon: Building2, color: 'text-indigo-400', activeColor: 'text-indigo-600', bg: 'bg-indigo-400/20' },
  { to: '/bookings', label: 'Bookings', icon: Calendar, color: 'text-purple-400', activeColor: 'text-purple-600', bg: 'bg-purple-400/20' },
  { to: '/tenants', label: 'Tenants', icon: Users, color: 'text-emerald-400', activeColor: 'text-emerald-600', bg: 'bg-emerald-400/20', hasSubmenu: true },
  { to: '/rents', label: 'Rent Payments', icon: CreditCard, color: 'text-rose-400', activeColor: 'text-rose-600', bg: 'bg-rose-400/20' },
  { to: '/expenses', label: 'Expenses', icon: Wallet, color: 'text-amber-400', activeColor: 'text-amber-600', bg: 'bg-amber-400/20' },
  { to: '/workers', label: 'Workers', icon: Briefcase, color: 'text-cyan-400', activeColor: 'text-cyan-600', bg: 'bg-cyan-400/20', hasSubmenu: true },
  { to: '/offers', label: 'Offers', icon: Tag, color: 'text-orange-400', activeColor: 'text-orange-600', bg: 'bg-orange-400/20' },
  { to: '/complaints', label: 'Complaints', icon: AlertCircle, color: 'text-red-400', activeColor: 'text-red-600', bg: 'bg-red-400/20', hasSubmenu: true },
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
  const { activePgId, setActivePgId } = useAppScope()
  const selectedPgId = activePgId
  const [loadingPgs, setLoadingPgs] = useState(false)
  const [profile, setProfile] = useState(null)
  const [showTenantPgs, setShowTenantPgs] = useState(false)
  const [showWorkerPgs, setShowWorkerPgs] = useState(false)
  const [showComplaintPgs, setShowComplaintPgs] = useState(false)
  const [businessName, setBusinessName] = useState('ManageMyPg')

  useEffect(() => {
    if (isComplaintsRoute && !selectedPgId && pgs && pgs.length > 0) {
      setActivePgId(pgs[0].id)
    }
  }, [isComplaintsRoute, selectedPgId, pgs])

  useEffect(() => {
    if (isTenantsRoute && !selectedPgId && pgs && pgs.length > 0) {
      setActivePgId(pgs[0].id)
    }
  }, [isTenantsRoute, selectedPgId, pgs])

  useEffect(() => {
    if (isWorkersRoute && !selectedPgId && pgs && pgs.length > 0) {
      setActivePgId(pgs[0].id)
    }
  }, [isWorkersRoute, selectedPgId, pgs])

  useEffect(() => {
    const syncName = () => {
      const name = localStorage.getItem('businessName')
      if (name) {
        setBusinessName(name)
      }
    }
    syncName()
    window.addEventListener('businessNameUpdated', syncName)
    return () => window.removeEventListener('businessNameUpdated', syncName)
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

  /* ---------- Auto-open submenus ---------- */
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
  const NavItem = ({ to, label, Icon, color, activeColor, bg, hasSubmenu, adminOnly }) => {
    if (adminOnly && localStorage.getItem('isAdmin') !== 'true') return null

    const isSubmenuOpen =
      (to === '/tenants' && showTenantPgs) ||
      (to === '/workers' && showWorkerPgs) ||
      (to === '/complaints' && showComplaintPgs)

    return (
      <div title={collapsed ? label : undefined}>
        <NavLink
          to={to}
          className={({ isActive }) =>
            cx(
              'group flex items-center gap-2.5 rounded-xl px-2.5 py-1 sm:py-1.5 transition-all duration-150',
              collapsed ? 'justify-center' : 'justify-start',
              isActive
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-200 hover:bg-white/10 hover:text-white'
            )
          }
          onClick={() => {
            if (to === '/tenants') {
              if (collapsed) setCollapsed(false)
              setShowTenantPgs((v) => !v)
              setShowWorkerPgs(false)
              setShowComplaintPgs(false)
              return
            }

            if (to === '/workers') {
              if (collapsed) setCollapsed(false)
              setShowWorkerPgs((v) => !v)
              setShowTenantPgs(false)
              setShowComplaintPgs(false)
              return
            }

            if (to === '/complaints') {
              if (collapsed) setCollapsed(false)
              setShowComplaintPgs((v) => !v)
              setShowTenantPgs(false)
              setShowWorkerPgs(false)
              return
            }
            setShowTenantPgs(false)
            setShowWorkerPgs(false)
            setShowComplaintPgs(false)
            if (mobileOpen) setMobileOpen(false)
          }}
        >
          {({ isActive }) => (
            <>
              <div
                className={cx(
                  'h-8 w-8 flex items-center justify-center rounded-lg transition-all duration-150 shrink-0',
                  isActive
                    ? 'bg-white shadow-xs'
                    : `${bg} group-hover:bg-white/20`
                )}
              >
                <Icon
                  size={17}
                  strokeWidth={2.3}
                  className={isActive ? activeColor : color}
                />
              </div>

              {!collapsed && (
                <span className="text-xs font-bold tracking-tight whitespace-nowrap flex-1">
                  {label}
                </span>
              )}

              {!collapsed && hasSubmenu && (
                <ChevronDown
                  size={13}
                  className={cx(
                    'transition-transform duration-200 text-slate-400 shrink-0',
                    isSubmenuOpen && 'rotate-180 text-white'
                  )}
                />
              )}
            </>
          )}
        </NavLink>

        {/* -------- TENANTS → PG LIST -------- */}
        {to === '/tenants' && !collapsed && showTenantPgs && (
          <div className="ml-8 mt-0.5 space-y-0.5 border-l-2 border-emerald-400/30 pl-2.5 py-0.5">
            {loadingPgs && (
              <div className="text-[10px] font-bold text-slate-300 px-2 py-0.5">
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
                      setActivePgId(pg.id)
                      navigate('/tenants')
                      if (mobileOpen) setMobileOpen(false)
                    }}
                    className={cx(
                      'w-full text-left text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all truncate block',
                      isSelected
                        ? 'bg-white/20 text-white shadow-xs font-black'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {pg.pgName}
                  </button>
                )
              })}

            {!loadingPgs && pgs.length === 0 && (
              <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5">
                No PGs found
              </div>
            )}
          </div>
        )}

        {/* -------- WORKERS → PG LIST -------- */}
        {to === '/workers' && !collapsed && showWorkerPgs && (
          <div className="ml-8 mt-0.5 space-y-0.5 border-l-2 border-cyan-400/30 pl-2.5 py-0.5">
            {loadingPgs && (
              <div className="text-[10px] font-bold text-slate-300 px-2 py-0.5">
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
                      setActivePgId(pg.id)
                      navigate('/workers')
                      if (mobileOpen) setMobileOpen(false)
                    }}
                    className={cx(
                      'w-full text-left text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all truncate block',
                      isSelected
                        ? 'bg-white/20 text-white shadow-xs font-black'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {pg.pgName}
                  </button>
                )
              })}

            {!loadingPgs && pgs.length === 0 && (
              <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5">
                No PGs found
              </div>
            )}
          </div>
        )}

        {/* -------- COMPLAINTS → PG LIST -------- */}
        {to === '/complaints' && !collapsed && showComplaintPgs && (
          <div className="ml-8 mt-0.5 space-y-0.5 border-l-2 border-rose-400/30 pl-2.5 py-0.5">
            {loadingPgs && (
              <div className="text-[10px] font-bold text-slate-300 px-2 py-0.5">
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
                      setActivePgId(pg.id)
                      navigate('/complaints')
                      if (mobileOpen) setMobileOpen(false)
                    }}
                    className={cx(
                      'w-full text-left text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all truncate block',
                      isSelected
                        ? 'bg-white/20 text-white shadow-xs font-black'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {pg.pgName}
                  </button>
                )
              })}

            {!loadingPgs && pgs.length === 0 && (
              <div className="text-[10px] font-bold text-slate-400 px-2 py-0.5">
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

      {/* Desktop Sidebar */}
      <aside
        className={cx(
          'hidden md:flex flex-col transition-all duration-300 shrink-0 h-screen fixed top-0 left-0 bottom-0 z-30 shadow-xl overflow-hidden',
          collapsed ? 'w-16' : 'w-52',
          'bg-gradient-to-b from-indigo-700 via-indigo-800 to-slate-900'
        )}
      >
        {/* HEADER BRAND & TOGGLE */}
        <div
          className={cx(
            'flex items-center border-b border-white/10 px-3 py-2.5 transition-all duration-300 h-14 shrink-0',
            collapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="h-9 w-9 rounded-xl bg-white p-0.5 border border-white/20 shadow-xs shrink-0 overflow-hidden">
                  <img src={LogoImg} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-base font-black text-white tracking-tight uppercase truncate">
                  {businessName}
                </span>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 shrink-0 cursor-pointer shadow-xs active:scale-95 ml-1"
                title="Collapse Sidebar"
              >
                <ChevronLeft size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setCollapsed(false)}
              className="relative h-9 w-9 rounded-xl bg-white p-0.5 border border-white/20 shadow-xs flex items-center justify-center shrink-0 hover:ring-2 hover:ring-indigo-400 transition-all cursor-pointer group"
              title="Click to Expand Sidebar"
            >
              <img src={LogoImg} alt="Logo" className="w-full h-full object-contain" />
              <div className="absolute -right-1.5 -bottom-1.5 bg-indigo-600 text-white rounded-full p-0.5 border border-white shadow-xs group-hover:scale-110 transition-transform">
                <ChevronRight size={10} strokeWidth={3} />
              </div>
            </button>
          )}
        </div>

        {/* NAVIGATION LINKS - FIT ALL 11 ITEMS WITHOUT SCROLLBAR */}
        <nav className="flex-1 px-2.5 py-2 flex flex-col justify-between overflow-y-auto no-scrollbar">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} Icon={item.icon} />
          ))}
        </nav>

        {/* PROFILE FOOTER */}
        <SidebarProfile
          collapsed={collapsed}
          onLogoutClick={() => setShowConfirm(true)}
          profile={profile}
        />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cx(
          'fixed left-0 top-0 bottom-0 z-50 w-64 transition-transform shadow-2xl flex flex-col',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'bg-gradient-to-b from-indigo-700 via-indigo-800 to-slate-900'
        )}
      >
        <div className="px-3 py-2.5 border-b border-white/10 text-white flex items-center justify-between min-w-0 h-14 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-white p-0.5 border border-white/10 overflow-hidden shrink-0 shadow-xs">
              <img src={LogoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="truncate text-base font-black tracking-tight uppercase">{businessName}</span>
          </div>
        </div>

        <nav className="flex-1 px-2.5 py-2 flex flex-col justify-between overflow-y-auto no-scrollbar">
          {NAV.map((item) => (
            <NavItem key={item.to} {...item} Icon={item.icon} />
          ))}
        </nav>

        <div className="border-t border-white/10 px-2.5 py-2 shrink-0">
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

/* ---------------- Profile Footer ---------------- */
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
        'flex items-center gap-2.5 px-3 py-2 border-t border-white/10 hover:bg-white/10 transition-colors h-14 shrink-0',
        collapsed && !mobile ? 'justify-center' : 'justify-start'
      )}
      title={collapsed && !mobile ? displayName : undefined}
    >
      <div className="h-8 w-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-white/20 shrink-0 shadow-xs">
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
            <div className="text-xs font-bold text-white uppercase tracking-tight truncate">
              {displayName}
            </div>
            <div className="text-[8px] font-black text-indigo-300 uppercase tracking-widest opacity-90">
              PG Owner
            </div>
          </div>
          <button
            onClick={onLogoutClick}
            className="p-1.5 text-rose-300 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all shrink-0"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </>
      )}
    </div>
  )
}
