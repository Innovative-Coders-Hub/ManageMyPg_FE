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
  Bed as BedIcon
} from 'lucide-react'
import { getAllTenants, getAllPgs } from '../api/ownerAuth'

function TopStat({ label, value, icon, isAccent = false }) {
  return (
    <div className={`px-4 py-2 rounded-xl border flex flex-col items-center justify-center transition-all min-w-[84px] ${isAccent ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
      <div className={`flex items-center gap-2 mb-0.5 ${isAccent ? 'text-indigo-100' : 'text-slate-400'}`}>
        {React.cloneElement(icon, { size: 10 })}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-black leading-none">{value}</div>
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

  const tenants = useMemo(() => {
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
        bedId: t.bedId,
        vacated: isVacated,
        newlyJoined: isNewlyJoined,
        rent: t.rentResponse?.[0] || null,
      }
    })
  }, [tenantsRaw])

  const filtered = useMemo(() => {
    return tenants.filter(t => {
      if (filters.active && !t.vacated) return true
      if (filters.vacated && t.vacated) return true
      if (filters.newlyJoined && t.newlyJoined) return true
      if (!filters.active && !filters.vacated && !filters.newlyJoined) return true
      return false
    })
  }, [tenants, filters])

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
            <div className="flex flex-wrap items-center justify-end gap-1.5">
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
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-slate-400 mr-1">
              <Filter size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">Filters</span>
            </div>
            <FilterPill
              label="Active"
              icon={UserCheck}
              active={filters.active}
              onClick={() => setFilters(f => ({ ...f, active: !f.active }))}
              activeClass="bg-indigo-600 border-indigo-500 text-white"
            />
            <FilterPill
              label="Vacated"
              icon={UserMinus}
              active={filters.vacated}
              onClick={() => setFilters(f => ({ ...f, vacated: !f.vacated }))}
              activeClass="bg-slate-900 border-slate-800 text-white"
            />
            <FilterPill
              label="Newly Joined"
              icon={TrendingUp}
              active={filters.newlyJoined}
              onClick={() => setFilters(f => ({ ...f, newlyJoined: !f.newlyJoined }))}
              activeClass="bg-emerald-600 border-emerald-500 text-white"
            />
            {(filters.active || filters.vacated || filters.newlyJoined) && (
              <button
                onClick={() => setFilters({ active: false, vacated: false, newlyJoined: false })}
                className="text-[10px] font-black text-rose-500 bg-rose-50 px-4 py-2.5 rounded-xl uppercase tracking-widest hover:bg-rose-100 transition-colors ml-2 border border-rose-100"
              >
                Clear
              </button>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="col-span-full bg-white rounded-xl border-2 border-dashed border-slate-200 py-32 text-center"
                >
                  <div className="mx-auto w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mb-6">
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden h-full flex flex-col"
                  >
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 shadow-sm ${
                          t.vacated ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-indigo-600 text-white border-indigo-500'
                        }`}>
                          <div className="text-sm font-black">{initials(t.name)}</div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none truncate">{t.name}</h3>
                          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 truncate">ID: {String(t.id).slice(-8)}</p>
                        </div>
                      </div>
                      <div className={`shrink-0 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${t.vacated ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {t.vacated ? 'Vacated' : 'Active'}
                      </div>
                    </div>

                    {/* Contact Bar */}
                    <div className="flex flex-col gap-1.5 mb-5 px-0.5">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone size={11} className="shrink-0" />
                        <span className="text-[10px] font-bold text-slate-600 tracking-tight">{t.phone || 'No Phone'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Mail size={11} className="shrink-0" />
                        <span className="text-[10px] font-bold text-slate-500 truncate">{t.email || 'No Email'}</span>
                      </div>
                    </div>

                    {/* High Density Info Bar */}
                    <div className="flex items-center justify-between bg-slate-50/50 rounded-xl px-4 py-2 border border-slate-100 mb-6">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Joined</span>
                        <span className="text-[11px] font-black text-slate-900 mt-0.5">{t.start ? dayjs(t.start).format('DD MMM YYYY') : '—'}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bed</span>
                        <span className="text-[11px] font-black text-slate-900 mt-0.5">{t.bedId || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto flex items-center justify-between gap-1.5 pt-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                         <Building2 size={12} />
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resident</span>
                      </div>
                      <button
                        onClick={() => navigate(`/tenant/${t.id}`)}
                        className="ml-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-100 min-w-[80px] whitespace-nowrap"
                      >
                        Profile <ArrowRight size={14} />
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
