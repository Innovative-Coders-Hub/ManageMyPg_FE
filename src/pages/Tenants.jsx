import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import SEO from '../components/SEO'
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
import CustomDropdown from '../components/CustomDropdown'

const WhatsAppIcon = ({ size = 16, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.43 5.623 1.43h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50' }) {
  return (
    <div className="bg-white p-2 sm:p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2 sm:gap-3 hover:shadow-md hover:scale-[1.02] transition-all cursor-default flex-1 min-w-0">
      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-2xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4 sm:w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</div>
        <div className="text-sm sm:text-lg font-black text-slate-900 leading-tight truncate">{value}</div>
      </div>
    </div>
  )
}


function FilterPill({ active, onClick, label, icon: Icon, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
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
      className={`shrink-0 relative w-10 h-10 sm:w-14 sm:h-14 overflow-hidden rounded-2xl border shadow-sm ${
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
          <span className="text-sm sm:text-lg font-black uppercase tracking-tight">
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

  const [pgs, setPgs] = useState([])
  const [tenantsRaw, setTenantsRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    active: true,
    vacated: false,
    newlyJoined: false
  })

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        const pgsData = await getAllPgs()
        setPgs(pgsData || [])

        if (!pgId) {
          if (pgsData && pgsData.length > 0) {
            navigate(`?pgId=${pgsData[0].id}`, { replace: true })
          } else {
            setLoading(false)
          }
          return
        }

        const data = await getAllTenants(pgId)
        setTenantsRaw(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to fetch data:', e)
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing Tenant Registry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <SEO
        title="Tenant Registry"
        description="Manage your PG residents, track active and vacated tenants, and view resident profiles."
        canonical="/tenants"
      />
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Tenant Registry"
            subtitle="Tenant resident management"
          >
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-3 w-full md:w-auto mt-4 md:mt-0">
              <TopStat label="Total Residents" value={stats.total} icon={Users} />
              <TopStat
                label="Active"
                value={stats.active}
                icon={UserCheck}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
              />
              <TopStat label="Vacated" value={stats.vacated} icon={UserMinus} colorClass="text-slate-600" bgClass="bg-slate-50" />
              <TopStat
                label="Newly Joined"
                value={stats.newJoins}
                icon={TrendingUp}
                colorClass="text-indigo-600"
                bgClass="bg-indigo-50"
              />
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col gap-8">
          {/* Toolbar */}
          <div className="bg-white border border-slate-200 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* PG Selector */}
            <CustomDropdown
              label="Property Scope"
              value={pgId || ''}
              options={pgs.map(pg => ({ id: pg.id, label: pg.pgName }))}
              onChange={(val) => navigate(`?pgId=${val}`)}
              icon={Building2}
              className="w-full md:w-72"
              labelBg="bg-white"
            />

            {/* Search Bar */}
            <div className="relative flex-1 group w-full">
              <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20 transition-all duration-300">Search Directory</label>
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none z-10">
                <Search size={18} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Name, Phone or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-rose-500 transition-colors z-10"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <FilterPill
                label="Active"
                icon={UserCheck}
                active={filters.active}
                onClick={() => setFilters({ active: true, vacated: false, newlyJoined: false })}
                activeClass="bg-emerald-600 border-emerald-500 text-white"
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
                activeClass="bg-indigo-600 border-indigo-500 text-white"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full md:col-span-3 xl:col-span-4 bg-white rounded-[2.5rem] border border-slate-200 py-32 text-center shadow-sm"
                >
                  <div className="mx-auto w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-8 border border-slate-100 shadow-inner">
                    <Users size={48} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Residents Found</h2>
                  <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest max-w-sm mx-auto px-4">
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
                    className="group bg-white rounded-[2rem] border border-slate-200 p-3.5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-stretch gap-3 cursor-pointer hover:border-indigo-200 active:scale-[0.99] h-full relative overflow-hidden"
                  >
                    {/* Status Badge - Floating */}
                    <div className="absolute top-0 right-0 z-10">
                      {t.rent && (
                        <div className={`px-3 py-1 rounded-bl-2xl text-[7px] font-black uppercase tracking-widest shadow-sm ${
                          t.rent.status === 'PAID'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}>
                          Rent: {t.rent.status}
                        </div>
                      )}
                    </div>

                    {/* Header Section: Avatar + Name + Status + Contact Info */}
                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <TenantAvatar
                            name={t.name}
                            profileImageUrl={t.profileImageUrl}
                            vacated={t.vacated}
                          />
                          {!t.vacated && (
                            <div className="absolute -bottom-1 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[14px] font-black text-slate-900 tracking-tight leading-none">{t.phone || '—'}</span>
                            <Phone size={13} className="text-emerald-500" />
                          </div>
                          <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-tight truncate leading-tight group-hover:text-indigo-600 transition-colors">
                            {t.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${
                              t.vacated
                                ? 'bg-slate-50 text-slate-400 border-slate-200'
                                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            }`}>
                              {t.vacated ? 'Vacated' : 'Active'}
                            </span>
                            {t.newlyJoined && !t.vacated && (
                              <span className="px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
                                New
                              </span>
                            )}
                            <div className="flex items-center gap-1 ml-1 opacity-60">
                              <Mail size={10} className="text-indigo-400" />
                              <span className="text-[8px] font-black text-slate-400 truncate max-w-[100px] tracking-tight">{t.email || '—'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info Grid: Accommodation & Duration */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-slate-50/50 rounded-xl p-1.5 border border-slate-100 group-hover:bg-white transition-colors">
                        <p className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Accommodation</p>
                        <div className="flex items-center gap-1">
                          <BedIcon size={10} className="text-amber-500" />
                          <span className="text-[8.5px] font-black text-slate-900 uppercase truncate tracking-tight">
                            {t.bedId || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-slate-50/50 rounded-xl p-1.5 border border-slate-100 group-hover:bg-white transition-colors">
                        <p className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Stay Duration</p>
                        <div className="flex items-center gap-1">
                          <Calendar size={10} className="text-indigo-500" />
                          <span className="text-[8.5px] font-black text-slate-900 uppercase tracking-tight">
                            {t.start ? dayjs(t.start).format('DD MMM YY') : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-auto pt-0.5 flex items-center gap-2">
                      <a
                        href={`https://wa.me/${t.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[8px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm flex items-center justify-center gap-2"
                        title="WhatsApp"
                      >
                        WhatsApp <WhatsAppIcon size={12} />
                      </a>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/tenant/${t.id}`); }}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[8px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
                      >
                        Profile <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </button>
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
