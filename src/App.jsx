// src/App.jsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom'

import Login from './pages/Login'
import Home from './pages/Home'
import MyPgs from './pages/MyPgs'
import PgDetail from './pages/PgDetail'
import BedDetail from './pages/BedDetail'
import Reports from './pages/Reports'
import Tenants from './pages/Tenants'
import Complaints from './pages/Complaints' // <-- fixed import

// Import LandingPage plus named SignIn/SignUp exports
import LandingPage, { SignInPage, SignUpPage } from './pages/LandingPage'

import SidebarFresh from './pages/Sidebar'

function Header({ onMobileOpen }) {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'

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
            <Link to="/signin" className="px-4 py-2 rounded-xl hover:bg-gray-100 text-sm font-medium">
              Sign in
            </Link>
            <Link to="/signup" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow">
              Create account
            </Link>
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
  const hideSidebar = ['/','/signin','/signup'].includes(pathname)

  return (
    <>
      <Header onMobileOpen={() => setMobileOpen(true)} />
      <ScrollToHash />

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

        <main className="flex-1 mx-auto max-w-7xl px-4 py-6 transition-all duration-200">
          <Routes>
            <Route path="/" element={<LandingWrapper />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/my-pgs" element={<MyPgs />} />
            <Route path="/pg/:id" element={<PgDetail />} />
            <Route path="/beds/:bedId" element={<BedDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/complaints" element={<Complaints />} /> {/* <-- complaints route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </>
  )
}
