import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppScope } from '../context/AppScopeContext'
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO'
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
  Eye,
  ExternalLink,
  Sparkles,
  LayoutGrid,
  List,
  ChevronRight
} from 'lucide-react'
import { getAllTenants, getAllPgs } from '../api/ownerAuth'
import CustomDropdown from '../components/CustomDropdown'

/* =====================================================
   WHATSAPP ICON SVG
===================================================== */
const WhatsAppIcon = ({ size = 14, className = "" }) => (
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

/* =====================================================
   ANIMATION VARIANTS
===================================================== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
}

/* =====================================================
   SUB-COMPONENTS
===================================================== */
function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50' }) {
  return (
    <div className="bg-white p-3.5 px-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all cursor-default min-w-[120px]">
      <div className={`h-10 w-10 rounded-xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0`}>
        {React.isValidElement(Icon) ? Icon : <Icon className="w-5 h-5 stroke-[2.2]" />}
      </div>
      <div className="min-w-0">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate mb-0.5">{label}</div>
        <div className="text-lg font-black text-slate-900 leading-tight truncate">{value}</div>
      </div>
    </div>
  )
}

function FilterPill({ active, onClick, label, icon: Icon, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
        active
          ? `${activeClass} shadow-sm`
          : 'bg-white border-slate-200/80 text-slate-500 hover:border-slate-300 hover:text-slate-800'
      }`}
    >
      <Icon size={13} strokeWidth={2.5} />
      {label}
    </button>
  )
}

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('') || '?'

function TenantAvatar({ name, profileImageUrl, vacated, size = "w-12 h-12" }) {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [profileImageUrl])

  const showImage = Boolean(profileImageUrl) && !imageError

  return (
    <div
      className={`shrink-0 relative ${size} rounded-2xl border shadow-sm overflow-hidden ${
        vacated
          ? 'bg-slate-100 text-slate-400 border-slate-200'
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
          <span className="text-xs sm:text-sm font-black uppercase tracking-tight">
            {getInitials(name)}
          </span>
        </div>
      )}
    </div>
  )
}

/* =====================================================
   MAIN TENANTS REGISTRY PAGE
===================================================== */
export default function Tenants() {
  const navigate = useNavigate()
  const { activePgId: pgId, setActivePgId, setActiveTenantId } = useAppScope()

  const [pgs, setPgs] = useState([])
  const [tenantsRaw, setTenantsRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const [filters, setFilters] = useState({
    active: true,
    vacated: false,
    newlyJoined: false
  })
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function init() {
      try {
        setLoading(true)
        const pgsData = await getAllPgs()
        setPgs(pgsData || [])

        if (!pgId) {
          if (pgsData && pgsData.length > 0) {
            setActivePgId(pgsData[0].id)
          } else {
            setLoading(false)
          }
          return
        }

        const data = await getAllTenants(pgId)
        setTenantsRaw(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to fetch tenants:', e)
        setTenantsRaw([])
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [pgId, setActivePgId])

  const tenants = useMemo(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.managemypg.com/managemypg'
    return tenantsRaw.map(t => {
      const isVacated = t.vacated === true
      const isNewlyJoined = dayjs().diff(dayjs(t.dateOfJoining), 'day') <= 7

      const rawImg = t.profileImageUrl || t.imageUrl || t.photoUrl || t.tenantProfileImageUrl || t.image
      const profileImageUrl = rawImg
        ? (rawImg.startsWith('http') ? rawImg : `${API_BASE_URL.replace(/\/$/, '')}/${rawImg.replace(/^\//, '')}`)
        : null

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
        profileImageUrl,
        rent: t.rentResponse?.[0] || null,
      }
    })
  }, [tenantsRaw])

  const filtered = useMemo(() => {
    return tenants.filter(t => {
      let matchesFilter = true
      if (filters.active) matchesFilter = !t.vacated
      else if (filters.vacated) matchesFilter = t.vacated
      else if (filters.newlyJoined) matchesFilter = t.newlyJoined

      if (!matchesFilter) return false

      if (!searchQuery.trim()) return true

      const query = searchQuery.toLowerCase()
      return (
        (t.name || '').toLowerCase().includes(query) ||
        (t.email || '').toLowerCase().includes(query) ||
        (t.phone || '').includes(query)
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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Accessing Resident Registry...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SEO
        title="Tenant Directory - Resident Management"
        description="Manage your PG residents, monitor active/vacated tenants, and inspect individual profiles."
      />

      {/* STICKY HEADER & PORTFOLIO STATS BAR */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="shrink-0">
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <Users size={14} />
                <span>Resident Management</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 whitespace-nowrap">
                Tenant Registry
              </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
              <TopStat label="Total Residents" value={stats.total} icon={Users} />
              <TopStat
                label="Active Stay"
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
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* TOOLBAR: PROPERTY SCOPE, SEARCH, STATUS FILTERS & VIEW MODE SWITCHER */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* PROPERTY DROPDOWN & SEARCH */}
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 w-full">
            <CustomDropdown
              label="Property Scope"
              value={pgId || ''}
              options={pgs.map(pg => ({ id: pg.id, label: pg.pgName }))}
              onChange={(val) => setActivePgId(val)}
              icon={Building2}
              className="w-full sm:w-64"
            />

            <div className="relative flex-1 w-full">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search resident name, phone or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* STATUS FILTERS & VIEW TOGGLE */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            {/* STATUS FILTER PILLS */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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

            {/* VIEW MODE TOGGLE BUTTONS */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Cards View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* TENANTS MAIN DISPLAY (GRID OR TABLE) */}
        <div>
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-24 text-center px-6 shadow-sm"
              >
                <div className="mx-auto w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                  <Users size={36} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Residents Match Criteria</h3>
                <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-sm mx-auto">
                  Try adjusting search query or active filter criteria.
                </p>
              </motion.div>
            ) : viewMode === 'grid' ? (
              
              /* VIEW 1: CARDS GRID VIEW */
              <motion.div
                key="grid-view"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filtered.map(t => (
                  <motion.div
                    key={t.id}
                    layout
                    variants={itemVariants}
                    onClick={() => { setActiveTenantId(t.id); navigate('/tenant-details'); }}
                    className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden h-full"
                  >
                    <div>
                      {/* RENT STATUS BADGE */}
                      {t.rent && (
                        <div className="absolute top-0 right-0 z-10">
                          <span className={`px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase tracking-widest shadow-2xs ${
                            t.rent.status === 'PAID'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-rose-500 text-white'
                          }`}>
                            Rent: {t.rent.status}
                          </span>
                        </div>
                      )}

                      {/* CARD HEADER: AVATAR & NAME */}
                      <div className="flex items-start gap-3.5 mb-4 pr-12">
                        <div className="relative shrink-0">
                          <TenantAvatar
                            name={t.name}
                            profileImageUrl={t.profileImageUrl}
                            vacated={t.vacated}
                            size="w-12 h-12"
                          />
                          {!t.vacated && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate leading-tight group-hover:text-indigo-600 transition-colors">
                            {t.name}
                          </h3>

                          <div className="flex items-center gap-1 mt-1 text-slate-600">
                            <Phone size={12} className="text-emerald-500 shrink-0" />
                            <span className="text-[11px] font-black tracking-tight">{t.phone || '—'}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                              t.vacated
                                ? 'bg-slate-100 text-slate-500 border-slate-200'
                                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            }`}>
                              {t.vacated ? 'Vacated' : 'Active'}
                            </span>
                            {t.newlyJoined && !t.vacated && (
                              <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ACCOMMODATION & STAY DETAILS */}
                      <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Bed Allocation</span>
                          <div className="flex items-center gap-1 text-slate-900 font-black text-[10px] uppercase truncate">
                            <BedIcon size={12} className="text-amber-500 shrink-0" />
                            <span className="truncate">{t.bedId || 'Unassigned'}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Joined Date</span>
                          <div className="flex items-center gap-1 text-slate-900 font-black text-[10px] uppercase truncate">
                            <Calendar size={12} className="text-indigo-500 shrink-0" />
                            <span>{t.start ? dayjs(t.start).format('DD MMM YY') : '—'}</span>
                          </div>
                        </div>
                      </div>

                      {/* EMAIL ROW */}
                      <div className="flex items-center gap-1.5 text-slate-400 px-0.5 mb-4">
                        <Mail size={12} className="shrink-0 text-slate-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest truncate">{t.email || 'No Email Recorded'}</span>
                      </div>
                    </div>

                    {/* CARD FOOTER ACTIONS */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <a
                        href={`https://wa.me/${t.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-2xs flex items-center justify-center gap-1.5"
                        title="Chat on WhatsApp"
                      >
                        <WhatsAppIcon size={13} /> WhatsApp
                      </a>

                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveTenantId(t.id); navigate('/tenant-details'); }}
                        className="py-2 px-4 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0"
                      >
                        Profile <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (

              /* VIEW 2: TABLE VIEW WITH PROFILE AVATAR */
              <motion.div
                key="table-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/80 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="py-4 px-6">Resident Profile</th>
                        <th className="py-4 px-6">Contact Info</th>
                        <th className="py-4 px-6">Bed Allocation</th>
                        <th className="py-4 px-6">Joining Date</th>
                        <th className="py-4 px-6">Rent Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-900">
                      {filtered.map(t => (
                        <tr
                          key={t.id}
                          onClick={() => { setActiveTenantId(t.id); navigate('/tenant-details'); }}
                          className="hover:bg-slate-50/70 transition-all cursor-pointer group"
                        >
                          {/* RESIDENT PROFILE WITH AVATAR IMAGE */}
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              <TenantAvatar
                                name={t.name}
                                profileImageUrl={t.profileImageUrl}
                                vacated={t.vacated}
                                size="w-10 h-10"
                              />
                              <div>
                                <div className="font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                  {t.name}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                    t.vacated
                                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                                      : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                  }`}>
                                    {t.vacated ? 'Vacated' : 'Active'}
                                  </span>
                                  {t.newlyJoined && !t.vacated && (
                                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
                                      New
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* CONTACT INFO */}
                          <td className="py-3.5 px-6">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-slate-900 font-black">
                                <Phone size={12} className="text-emerald-500" />
                                <span>{t.phone || '—'}</span>
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 truncate max-w-[180px]">
                                {t.email || 'No email recorded'}
                              </div>
                            </div>
                          </td>

                          {/* BED ALLOCATION */}
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-1.5 font-black text-slate-800 uppercase">
                              <BedIcon size={14} className="text-amber-500" />
                              <span>{t.bedId || 'Unassigned'}</span>
                            </div>
                          </td>

                          {/* JOINING DATE */}
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                              <Calendar size={13} className="text-indigo-500" />
                              <span>{t.start ? dayjs(t.start).format('DD MMM YYYY') : '—'}</span>
                            </div>
                          </td>

                          {/* RENT STATUS */}
                          <td className="py-3.5 px-6">
                            {t.rent ? (
                              <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                                t.rent.status === 'PAID'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                  : 'bg-rose-50 text-rose-600 border-rose-100'
                              }`}>
                                {t.rent.status}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">—</span>
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td className="py-3.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <a
                                href={`https://wa.me/${t.phone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                                title="Chat on WhatsApp"
                              >
                                <WhatsAppIcon size={14} />
                              </a>
                              <button
                                onClick={() => { setActiveTenantId(t.id); navigate('/tenant-details'); }}
                                className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xs flex items-center gap-1"
                              >
                                Profile <ChevronRight size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
