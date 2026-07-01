import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import {
  Users,
  UserCheck,
  UserMinus,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  CheckCircle2,
  X,
  Plus,
  Loader2,
  Building2,
  Bed as BedIcon,
  MessageSquare,
  Eye
} from 'lucide-react'
import { getAllTenants, getAllPgs } from '../api/ownerAuth'

function TopStat({ label, value, icon, isAccent = false }) {
  return (
    <div className={`flex-1 min-w-0 px-2 py-2 rounded-xl border flex flex-col items-center justify-center transition-all ${isAccent ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
      <div className={`flex items-center gap-1.5 mb-0.5 ${isAccent ? 'text-indigo-100' : 'text-slate-400'}`}>
        {React.cloneElement(icon, { size: 10 })}
        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest truncate">{label}</span>
      </div>
      <div className="text-xs sm:text-sm font-black leading-none">{value}</div>
    </div>
  )
}

function FilterPill({ active, onClick, label, icon: Icon, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
        active
          ? `${activeClass} shadow-md`
          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
      }`}
    >
      <Icon size={12} />
      {label}
    </button>
  )
}

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('') || '?'

function TenantAvatar({ name, profileImageUrl, vacated }) {
  const [imageError, setImageError] = useState(false)
  const showImage = Boolean(profileImageUrl) && !imageError

  return (
    <div
      className={`shrink-0 relative w-12 h-12 sm:w-16 sm:h-16 overflow-hidden rounded-full sm:rounded-2xl border shadow-sm ${
        vacated
          ? 'bg-slate-50 text-slate-400 border-slate-100'
          : 'bg-indigo-600 text-white border-indigo-500'
      }`}
    >
      {showImage ? (
        <img
          src={profileImageUrl}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base sm:text-xl font-black uppercase tracking-tight">
            {initials(name)}
          </span>
        </div>
      )}
    </div>
  )
}

export default function Tenants() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pgId = searchParams.get('pgId')

  const [tenantsRaw, setTenantsRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    active: true,
    vacated: false,
    newlyJoined: false
  })

  useEffect(() => {
    async function init() {
      if (!pgId) {
        try {
          setLoading(true)
          const pgs = await getAllPgs()
          if (pgs && pgs.length > 0) {
            // Select the first PG by default and redirect
            navigate(`?pgId=${pgs[0].id}`, { replace: true })
          } else {
            setLoading(false)
          }
        } catch (e) {
          console.error('Failed to fetch initial PGs:', e)
          setLoading(false)
        }
        return
      }

      // If pgId is available, fetch tenants
      try {
        setLoading(true)
        const data = await getAllTenants(pgId)
        setTenantsRaw(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
        setTenantsRaw([])
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [pgId, navigate])

  const [searchQuery, setSearchQuery] = useState('')

  const tenants = useMemo(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.managemypg.com/managemypg'
    return tenantsRaw.map(t => {
      const isVacated = t.vacated === true
      const isNewlyJoined = dayjs().diff(dayjs(t.dateOfJoining), 'day') <= 7

      return {
        id: t.id,
        name: t.name,
        phone: t.mobileNumber,
        email: t.email,
        start: t.dateOfJoining,
        end: t.dateOfVacate,
        bedId: t.bedDetail,
        vacated: isVacated,
        newlyJoined: isNewlyJoined,
        profileImageUrl: t.profileImageUrl
          ? (t.profileImageUrl.startsWith('http') ? t.profileImageUrl : `${API_BASE_URL.replace(/\/$/, '')}/${t.profileImageUrl.replace(/^\//, '')}`)
          : null,
        rent: t.rentResponse?.[0] || null,
      }
    })
  }, [tenantsRaw])

  const filtered = useMemo(() => {
    return tenants.filter(t => {
      // 1. Apply Status Filter (Mutual Exclusive)
      let matchesFilter = true
      if (filters.active) matchesFilter = !t.vacated
      else if (filters.vacated) matchesFilter = t.vacated
      else if (filters.newlyJoined) matchesFilter = t.newlyJoined

      if (!matchesFilter) return false

      // 2. Apply Search Filter (Name, Email, or Mobile)
      if (!searchQuery.trim()) return true

      const query = searchQuery.toLowerCase()
      return (
        t.name?.toLowerCase().includes(query) ||
        t.email?.toLowerCase().includes(query) ||
        t.phone?.includes(query)
      )
    })
  }, [tenants, filters, searchQuery])

  const stats = useMemo(() => {
    const total = tenants.length
    const active = tenants.filter(t => !t.vacated).length
    const vacated = tenants.filter(t => t.vacated).length
    const newJoins = tenants.filter(t => t.newlyJoined).length

    return { total, active, vacated, newJoins }
  }, [tenants])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Tenant Registry"
            subtitle="Enterprise resident community management"
          >
            <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 w-full md:w-auto mt-4 md:mt-0">
              <TopStat label="Total" value={stats.total} icon={<Users />} />
              <TopStat label="Active" value={stats.active} icon={<UserCheck />} isAccent />
              <TopStat label="Vacated" value={stats.vacated} icon={<UserMinus />} />
              <TopStat label="New" value={stats.newJoins} icon={<TrendingUp />} />
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex flex-col gap-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search name, email, or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-slate-400 mr-1">
                <Filter size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">Filters</span>
              </div>
              <FilterPill
                label="Active"
                icon={UserCheck}
                active={filters.active}
                onClick={() => setFilters({ active: true, vacated: false, newlyJoined: false })}
                activeClass="bg-indigo-600 border-indigo-500 text-white"
              />
              <FilterPill
                label="Vacated"
                icon={UserMinus}
                active={filters.vacated}
                onClick={() => setFilters({ active: false, vacated: true, newlyJoined: false })}
                activeClass="bg-slate-900 border-slate-800 text-white"
              />
              <FilterPill
                label="Newly Joined"
                icon={TrendingUp}
                active={filters.newlyJoined}
                onClick={() => setFilters({ active: false, vacated: false, newlyJoined: true })}
                activeClass="bg-emerald-600 border-emerald-500 text-white"
              />
              {(filters.active || filters.vacated || filters.newlyJoined || searchQuery) && (
                <button
                  onClick={() => {
                    setFilters({ active: false, vacated: false, newlyJoined: false });
                    setSearchQuery('');
                  }}
                  className="text-[10px] font-black text-rose-500 bg-rose-50 px-4 py-2.5 rounded-xl uppercase tracking-widest hover:bg-rose-100 transition-colors ml-2 border border-rose-100"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full lg:col-span-2 2xl:col-span-3 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 py-32 text-center"
                >
                  <div className="mx-auto w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
                    <Users size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Residents Found</h2>
                  <p className="mt-4 text-slate-500 font-medium max-w-sm mx-auto px-4">
                    Adjust your filters to see more tenants or register new ones via the PG view.
                  </p>
                </motion.div>
              ) : (
                filtered.map(t => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    onClick={() => navigate(`/tenant/${t.id}`)}
                    className="group bg-white rounded-[1.25rem] sm:rounded-2xl border border-slate-100 p-3 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 cursor-pointer hover:border-indigo-100 active:scale-[0.99] h-full"
                  >
                    {/* Mobile Top View / Desktop Avatar View */}
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <TenantAvatar
                          name={t.name}
                          profileImageUrl={t.profileImageUrl}
                          vacated={t.vacated}
                        />
                        {!t.vacated && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full sm:hidden" />
                        )}
                      </div>

                      {/* Name & Room (Mobile Only) */}
                      <div className="flex-1 min-w-0 sm:hidden">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">
                          {t.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <BedIcon size={10} className="text-amber-500" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase truncate">
                            {t.bedId || 'Not Assigned'}
                          </span>
                        </div>
                      </div>

                      {/* Status & Phone (Mobile Only - Right) */}
                      <div className="flex flex-col items-end gap-1.5 sm:hidden">
                        <span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border ${
                          t.vacated ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {t.vacated ? 'Vacated' : 'Active'}
                        </span>
                        <div className="flex items-center gap-1 text-indigo-600">
                          <Phone size={10} />
                          <span className="text-[10px] font-black tracking-tight">{t.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Content View */}
                    <div className="hidden sm:flex flex-1 min-w-0 flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">
                            {t.name}
                          </h3>
                        </div>
                        <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          t.vacated ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {t.vacated ? 'Vacated' : 'Active'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2.5 text-slate-400">
                          <Phone size={12} className="shrink-0 text-slate-300" />
                          <span className="text-sm font-bold text-slate-600 tracking-tight">{t.phone || 'No Phone'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-400">
                          <Mail size={12} className="shrink-0 text-slate-300" />
                          <span className="text-sm font-bold text-slate-500 truncate">{t.email || 'No Email'}</span>
                        </div>
                      </div>

                      {/* Info Highlights - Gray Box */}
                      <div className="bg-slate-50/80 rounded-xl px-4 py-2 border border-slate-100 flex items-center justify-between mt-1">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Joined</span>
                          <span className="text-sm font-black text-slate-900 uppercase">{t.start ? dayjs(t.start).format('DD MMM YYYY') : '—'}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Bed Allocation</span>
                          <span className="text-sm font-black text-slate-900 uppercase truncate">
                            {t.bedId || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button - Desktop Only */}
                      <div className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
                        PROFILE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Mobile Action Buttons (Match Image Reference) */}
                    <div className="flex sm:hidden items-center gap-2 pt-1">
                      <a
                        href={`tel:${t.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                        <Phone size={12} className="text-indigo-600" /> Call
                      </a>
                      <a
                        href={`https://wa.me/${t.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                        <MessageSquare size={12} className="text-emerald-500" /> WhatsApp
                      </a>
                      <div
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900/5 text-slate-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                        <Eye size={12} className="text-amber-500" /> Profile
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
