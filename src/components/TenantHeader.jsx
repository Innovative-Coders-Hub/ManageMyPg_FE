import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Bell,
  Settings,
  ChevronDown,
  Building2,
  ShieldCheck,
  User,
  CreditCard,
  MessageSquare,
  UserCircle
} from 'lucide-react'
import LogoImg from '../assets/managemypg.png'

const BASE_URL = 'https://api.managemypg.com/managemypg'

export default function TenantHeader({ tenant }) {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function signOut() {
    try {
      await ownerLogout()
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      localStorage.clear()
      window.location.href = '/manage/mypg/signin'
    }
  }

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80 // header height
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  if (!tenant) return null

  const navItems = [
    { label: 'OVERVIEW', id: 'overview', icon: LayoutDashboard },
    { label: 'PAYMENTS', id: 'payments', icon: CreditCard },
    { label: 'COMPLAINTS', id: 'complaints', icon: MessageSquare },
    { label: 'PROFILE', id: 'profile', icon: UserCircle },
  ]

  return (
    <header className={`sticky top-0 z-[60] transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200' : 'bg-white border-b border-slate-100'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">

          {/* Left: Brand & PG Info */}
          <div className="flex items-center gap-6 lg:gap-10">
            <Link to="/tenant/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-100 p-0 shadow-xl shadow-indigo-100 transition-all group-hover:scale-105 group-hover:rotate-3 overflow-hidden">
                <img src={LogoImg} alt="ManageMyPg" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">ManageMyPg</span>
              </div>
            </Link>

            <div className="h-8 w-px bg-slate-200 hidden lg:block" />

            {/* PG Name Highlight - Professional Badge */}
            {tenant.pgName && (
              <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner group cursor-default">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm border border-slate-100 group-hover:text-indigo-700 transition-colors">
                  <Building2 size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Your Residence</p>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{tenant.pgName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-50/50 p-1 rounded-2xl border border-slate-100">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.id)}
                className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-black text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all uppercase tracking-widest group"
              >
                <item.icon size={14} className="group-hover:scale-110 transition-transform" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: Actions & User */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile PG Name - High Visibility on Small Screens */}
            {tenant.pgName && (
              <div className="md:hidden flex flex-col items-end">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1">Residence</p>
                <p className="text-[10px] font-black text-indigo-600 uppercase truncate max-w-[80px] text-right">
                  {tenant.pgName}
                </p>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-2 mr-2">
              <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative group">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
                  <div className="h-10 w-10 min-w-[40px] rounded-xl bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold overflow-hidden relative">
                    {tenant.profileImageUrl ? (
                      <img
                        src={`${BASE_URL}${tenant.profileImageUrl}`}
                        alt="Profile"
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="h-full w-full flex items-center justify-center bg-indigo-50"
                      style={{ display: tenant.profileImageUrl ? 'none' : 'flex' }}
                    >
                      <User size={22} strokeWidth={2.5} />
                    </div>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-900 transition-transform group-hover:rotate-180" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[70] origin-top-right transform scale-95 group-hover:scale-100">
                  <div className="p-3">
                    <div className="px-4 py-3 mb-2 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                       <p className="text-xs font-black text-slate-900 truncate">{tenant.email}</p>
                    </div>

                    <button
                      onClick={() => scrollToSection('profile')}
                      className="flex w-full items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all mb-1"
                    >
                      <User size={16} />
                      View Profile
                    </button>

                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-3 px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
