// src/App.jsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { ownerLogout } from './api/ownerAuth'

import Login from './pages/Login'
import OwnerProfile from './pages/OwnerProfile'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminOwnersList from './pages/AdminOwnersList'
import AdminOwnerDetails from './pages/AdminOwnerDetails'
import Home from './pages/Home'
import MyPgs from './pages/MyPgs'
import PgDetail from './pages/PgDetail'
import TenantRegistration from './pages/TenantRegistration'
import BedDetail from './pages/BedDetail'
import Reports from './pages/Reports'
import Tenants from './pages/Tenants'
import Offers from './pages/Offers'
import Complaints from './pages/Complaints' // <-- fixed import
import TenantDashboard from './pages/TenantDashboard'

// Import LandingPage plus named SignIn/SignUp exports
import LandingPage, { SignInPage, SignUpPage } from './pages/LandingPage'

import SidebarFresh from './pages/Sidebar'
import AdminHeader from './pages/AdminHeader'
import PageLoader from './components/PageLoader'
import useRouteLoader from './hooks/useRouteLoader'

function Header({ onMobileOpen }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isOwnerLocal = typeof window !== 'undefined' && localStorage.getItem('isOwner') === 'true'
  const isLanding = pathname === '/home'

  // Hide header on admin login; admin pages will render AdminHeader when admin
  if (pathname === '/admin/login') return null

  // Hide hamburger / show landing CTA only on the actual landing page.
  // Sidebar visibility is controlled by the parent (App) using `hideSidebar`.
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* hamburger for logged-in pages only (not shown on landing / auth pages) */}
          {/* parent determines hideSidebar; header shows hamburger only when not landing/auth */}
          {!isLanding && (
            <button
              onClick={onMobileOpen}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none"
              aria-label="Open sidebar"
            >
              <svg className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow" />
            <span className="font-extrabold text-lg tracking-tight">ManegeMyPg</span>
          </div>
        </div>

        {/* For Landing Page only: show sign-in / create account buttons as Links to routes */}
        {isLanding && (
          <div className="flex items-center gap-2">
             <Link to="/home" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow">
              Home Page
            </Link>
            <Link to="/signin" className="px-4 py-2 rounded-xl hover:bg-gray-100 text-sm font-medium">
              Sign in
            </Link>
            <Link to="/signup" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow">
              Create account
            </Link>
          </div>
        )}

        {/* Show sign out button for owner when logged in */}
        {!isLanding && isOwnerLocal && (
          <div className="flex items-center gap-2">
           <button
              onClick={async () => {
                await ownerLogout()
                navigate('/signin', { replace: true })
              }}
              className="px-3 py-1 rounded-md border hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function ScrollToHash() {
  const { hash } = useLocation()
  React.useEffect(() => {
    if (!hash) return
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])
  return null
}

// Wrapper to trigger redirect from landing after sign-in success
function LandingWrapper() {
  const navigate = useNavigate()
  return <LandingPage onSignedIn={() => navigate('/home', { replace: true })} />
}

export default function App() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sidebar_collapsed')) ?? false } catch { return false }
  })
  useEffect(() => {
    try { localStorage.setItem('sidebar_collapsed', JSON.stringify(collapsed)) } catch {}
  }, [collapsed])

  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  // Hide sidebar on landing and auth pages
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true'
  const isOwner = typeof window !== 'undefined' && localStorage.getItem('isOwner') === 'true'
  const isTenant  = typeof window !== 'undefined' && localStorage.getItem('isTenant') === 'true'
  // Hide sidebar for landing and auth pages. When admin is logged in, hide only on admin routes.
  const isAdminRoute = pathname.startsWith('/admin')
  // const hideSidebar = ['/','/signin','/signup','/admin/login','/mmp/register/:pgId'].includes(pathname) || (isAdmin && isAdminRoute)
  const hideSidebarRoutes = [
  '/',
  '/signin',
  '/signup',
  '/admin/login'
]

const hideSidebar =
  hideSidebarRoutes.includes(pathname) ||
  pathname.startsWith('/mmp/register/') || isTenant

  // Show mobile hamburger when the sidebar exists but the header doesn't (non-landing pages)
  const showMobileHamburger = !hideSidebar && pathname !== '/' && !isAdminRoute

  const routeLoading = useRouteLoader()
        const resetTimerRef = React.useRef(null)

useEffect(() => {
  if (!isOwner && !isTenant) return

  let timer
  let cancelled = false

    resetTimerRef.current = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (cancelled) return
        alert('Session expired due to inactivity')
        localStorage.clear()
        window.location.href = '/signin'
      }, 60 * 60 * 1000)
    }

    const handler = () => resetTimerRef.current?.()

    ;['mousemove', 'keydown', 'click'].forEach(evt =>
      window.addEventListener(evt, handler)
    )

    handler()

      return () => {
        cancelled = true
        clearTimeout(timer)
        ;['mousemove', 'keydown', 'click'].forEach(evt =>
          window.removeEventListener(evt, handler)
        )
      }
  }, [isOwner, isTenant])



  return (
    <>
      {/* Header behaviour: AdminHeader for admin routes; landing page shows the regular Header only. Sidebar handles navigation elsewhere. */}
      {isAdminRoute && isAdmin ? (
        <AdminHeader />
      ) : (
        pathname === '/' ? <Header onMobileOpen={() => setMobileOpen(true)} /> : null
      )}
      <ScrollToHash />
      <PageLoader show={routeLoading} />

      {/* Floating mobile hamburger for pages without Header */}
      {showMobileHamburger && (
        <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-white border shadow hover:bg-gray-50">
          <svg className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      )}

      <div className="min-h-[calc(100vh-64px)] flex">
        {/* Sidebar hidden on landing and auth pages */}
        {!hideSidebar && (
          <SidebarFresh
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
        )}

        <main className="flex-1 px-4 py-6 transition-all duration-200">
          <Routes>
            <Route path="/" element={<LandingWrapper />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/admin/owners" element={<RequireAdmin><AdminOwnersList /></RequireAdmin>} />
            <Route path="/admin/owner/:id" element={<RequireAdmin><AdminOwnerDetails /></RequireAdmin>} />
            <Route path="/home" element={<RequireOwner><Home /></RequireOwner>} />
            <Route path="/my-pgs" element={<MyPgs />} />
            <Route path="/pg/:id" element={<PgDetail />} />
            <Route path="/beds/:bedId" element={<BedDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/complaints" element={<Complaints />} /> {/* <-- complaints route */}
            <Route path="/ownerProfile"  element={<RequireOwner><OwnerProfile /></RequireOwner>} />
            <Route path="/mmp/register/:pgId" element={<TenantRegistration />} />
            <Route path="/tenant/dashboard" element={<RequireTenant><TenantDashboard /></RequireTenant>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

// Simple admin guard
function RequireAdmin({ children }){
  const { pathname } = useLocation()
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true'
  if (!isAdmin) return <Navigate to="/admin/login" state={{ from: pathname }} replace />
  return children
}

function RequireOwner({ children }) {
  const { pathname } = useLocation()
  const isOwner = typeof window !== 'undefined' && localStorage.getItem('isOwner') === 'true'

  if (!isOwner) {
    return <Navigate to="/signin" state={{ from: pathname }} replace />
  }

  return children
}
function RequireTenant({ children }) {
  const { pathname } = useLocation()
  const isTenant = typeof window !== 'undefined' && localStorage.getItem('isTenant') === 'true'

  if (!isTenant) {
    return <Navigate to="/signin" state={{ from: pathname }} replace />
  }

  return children
}