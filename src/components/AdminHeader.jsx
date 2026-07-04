import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  ChevronDown,
  ShieldCheck
} from 'lucide-react'
import { adminLogout } from '../api/adminAuth'
import LogoImg from '../assets/managemypg.png'

export default function AdminHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isDashboard = pathname === '/admin/dashboard'
  const isOwners = pathname.startsWith('/admin/owner')

  async function signOut() {
    try {
      await adminLogout()
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      localStorage.clear()
      window.location.href = '/application/administrator/login'
    }
  }

  const navItems = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, active: isDashboard },
    { label: 'All Owners', to: '/admin/owners', icon: Users, active: isOwners },
  ]

  return (
    <header className={`sticky top-0 z-[60] transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b' : 'bg-white border-b'
    }`}>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">

          {/* Left: Brand */}
          <div className="flex items-center gap-8">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white border border-slate-200 p-0 shadow-sm transition-all group-hover:shadow-md group-hover:scale-105 overflow-hidden">
                <img src={LogoImg} alt="ManageMyPg" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">ManageMyPg</span>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Admin Console</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-2xl ${
                    item.active
                      ? 'text-indigo-600 bg-indigo-50/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={18} className={item.active ? 'text-indigo-600' : 'text-slate-400'} />
                  {item.label}
                  {item.active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1 border-r pr-4 mr-2">
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                <Settings size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-xs font-black text-slate-900 leading-none">Super Admin</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest font-black">System Manager</p>
              </div>

              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
                  <div className="h-10 w-10 min-w-[40px] rounded-2xl bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold overflow-hidden relative">
                    <img
                      src="https://ui-avatars.com/api/?name=Super+Admin&background=6366f1&color=fff"
                      alt="Profile"
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-900 transition-transform group-hover:rotate-180" />
                </button>

                {/* Dropdown Menu (Simplified for now) */}
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[70]">
                  <div className="p-2">
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors"
              >
                {open ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {open && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl animate-in slide-in-from-top duration-200">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                onClick={() => setOpen(false)}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                  item.active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={signOut}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

