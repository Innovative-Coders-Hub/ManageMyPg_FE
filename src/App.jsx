// src/App.jsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import { ownerLogout } from './api/ownerAuth'

import PageLoader from './components/PageLoader'
import useRouteLoader from './hooks/useRouteLoader'
import { Toaster } from 'react-hot-toast'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const SignInPage = lazy(() => import('./pages/SignInPage'))
const SignUpPage = lazy(() => import('./pages/SignUpPage'))

const Login = lazy(() => import('./pages/Login'))
const OwnerProfile = lazy(() => import('./pages/OwnerProfile'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminOwnersList = lazy(() => import('./pages/AdminOwnersList'))
const AdminOwnerDetails = lazy(() => import('./pages/AdminOwnerDetails'))
const AdminHeader = lazy(() => import('./components/AdminHeader'))
const Home = lazy(() => import('./pages/Home'))
const MyPgs = lazy(() => import('./pages/MyPgs'))
const PgDetail = lazy(() => import('./pages/PgDetail'))
const TenantRegistration = lazy(() => import('./pages/TenantRegistration'))
const BedDetail = lazy(() => import('./pages/BedDetail'))
const Reports = lazy(() => import('./pages/Reports'))
const Tenants = lazy(() => import('./pages/Tenants'))
const Offers = lazy(() => import('./pages/Offers'))
const OwnerComplaints = lazy(() => import('./pages/OwnerComplaints'))
const TenantDashboard = lazy(() => import('./pages/TenantDashboard'))
const SidebarFresh = lazy(() => import('./pages/Sidebar'))
const TenantTransfer = lazy(() => import('./pages/TenantTransfer'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'))
const TenantDetails = lazy(() => import('./pages/TenantDetails'))

const cx = (...c) => c.filter(Boolean).join(' ')

function Header() {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'

  // This component is now only used for the public landing page.
  // Other routes use role-specific headers or the sidebar.
  if (!isLanding) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow" />
            <span className="font-extrabold text-lg tracking-tight">ManageMyPg</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/home" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow">
            Home Page
          </Link>
          <Link to="/manage/mypg/signin" className="px-4 py-2 rounded-xl hover:bg-gray-100 text-sm font-medium">
            Sign in
          </Link>
          <Link to="/manage/mypg/signup" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow">
            Create account
          </Link>
        </div>
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
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/application/administrator')
  // const hideSidebar = ['/','/managemypg/signin','/managemypg/signup','/application/administrator/login','/mmp/register/:pgId'].includes(pathname) || (isAdmin && isAdminRoute)
  const hideSidebarRoutes = [
  '/',
  '/manage/mypg/signin',
  '/manage/mypg/signup',
  '/application/administrator/login',
  '/privacy-policy',
  '/terms-and-conditions'
]

const hideSidebar =
  hideSidebarRoutes.includes(pathname) ||
  pathname.startsWith('/mmp/register/') || 
  isTenant ||
  isAdminRoute // Hide sidebar for all admin routes

  // Show mobile hamburger when the sidebar exists but the header doesn't (non-landing pages)
  const showMobileHamburger = !hideSidebar && pathname !== '/' && !isAdminRoute

  const routeLoading = useRouteLoader()
  const resetTimerRef = React.useRef(null)

  useEffect(() => {
    if (!isOwner && !isTenant && !isAdmin) return

    let timer
    let cancelled = false

    resetTimerRef.current = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (cancelled) return

        // Use a non-blocking toast instead of alert if possible, or keep alert for critical visibility
        alert('Session expired due to inactivity')

        const isAdmin = localStorage.getItem('isAdmin') === 'true'
        localStorage.clear()

        // Ensure hard redirect to clear all states
        window.location.href = isAdmin
          ? '/application/administrator/login'
          : '/manage/mypg/signin'
      }, 60 * 60 * 1000)
    }

    const handler = () => resetTimerRef.current?.()

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(evt => window.addEventListener(evt, handler))

    handler()

    return () => {
      cancelled = true
      clearTimeout(timer)
      events.forEach(evt => window.removeEventListener(evt, handler))
    }
  }, [isOwner, isTenant, isAdmin])



  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Suspense fallback={<PageLoader show={true} />}>
        {/* Header behavior: AdminHeader for admin routes; Header ONLY for guest landing page. */}
        {isAdminRoute ? (
          isAdmin && <AdminHeader />
        ) : (
          <Header />
        )}
        <ScrollToHash />
        <PageLoader show={routeLoading} />

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

          <main className={cx(
            "flex-1 px-4 py-4 transition-all duration-200 relative",
            showMobileHamburger && "pt-14 md:pt-4"
          )}>
            {/* Mobile Hamburger Trigger (Visible when Header is hidden on Dashboard routes) */}
            {showMobileHamburger && (
              <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                  aria-label="Open navigation"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <span className="font-black text-slate-900 uppercase tracking-tighter">ManageMyPg</span>
              </div>
            )}
            <Routes>
              <Route path="/" element={<LandingWrapper />} />
              <Route path="/manage/mypg/signin" element={<SignInPage />} />
              <Route path="/manage/mypg/signup" element={<SignUpPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/application/administrator/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
              <Route path="/admin/owners" element={<RequireAdmin><AdminOwnersList /></RequireAdmin>} />
              <Route path="/admin/owner/:id" element={<RequireAdmin><AdminOwnerDetails /></RequireAdmin>} />
              <Route path="/home" element={<RequireOwner><Home /></RequireOwner>} />
              <Route path="/my-pgs" element={<RequireOwner><MyPgs /></RequireOwner>} />
              <Route path="/pg/:id" element={<RequireOwner><PgDetail /></RequireOwner>} />
              <Route path="/beds/:bedId" element={<RequireOwner><BedDetail /></RequireOwner>} />
              <Route path="/reports" element={<RequireOwner><Reports /></RequireOwner>} />
              <Route path="/offers" element={<RequireOwner><Offers /></RequireOwner>} />
              <Route path="/tenants" element={<RequireOwner><Tenants /></RequireOwner>} />
              <Route path="/complaints" element={<RequireOwner><OwnerComplaints /></RequireOwner>} />
              <Route path="/ownerProfile" element={<RequireOwner><OwnerProfile mode="profile" /></RequireOwner>} />
              <Route path="/owner/onboarding" element={<RequireOwner><OwnerProfile mode="onboarding" /></RequireOwner>} />
              <Route path="/mmp/register/:pgId" element={<TenantRegistration />} />
              <Route path="/tenant/dashboard" element={<RequireTenant><TenantDashboard /></RequireTenant>} />
              <Route path="/tenant-transfer" element={<RequireOwner><TenantTransfer /></RequireOwner>} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/tenant/:tenantId" element={<RequireOwner><TenantDetails /></RequireOwner>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Suspense>
    </>
  )
}

// Simple admin guard
function RequireAdmin({ children }){
  const { pathname } = useLocation()
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true'
  if (!isAdmin) return <Navigate to="/application/administrator/login" state={{ from: pathname }} replace />
  return children
}

function RequireOwner({ children }) {
  const { pathname } = useLocation()
  const isOwner = typeof window !== 'undefined' && localStorage.getItem('isOwner') === 'true'

  if (!isOwner) {
    return <Navigate to="/manage/mypg/signin" state={{ from: pathname }} replace />
  }

  return children
}
function RequireTenant({ children }) {
  const { pathname } = useLocation()
  const isTenant = typeof window !== 'undefined' && localStorage.getItem('isTenant') === 'true'

  if (!isTenant) {
    return <Navigate to="/manage/mypg/signin" state={{ from: pathname }} replace />
  }

  return children
}