import React, { useMemo, useState, useEffect, lazy, Suspense, memo } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import CustomDropdown from '../components/CustomDropdown'
import {
  Users,
  CheckCircle2,
  Clock,
  PauseCircle,
  TrendingUp,
  Search,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
  Activity,
  ShieldCheck,
  Building2,
  MapPin
} from 'lucide-react'
import { getAdminDashboard } from '../api/adminAuth'
import useDebounce from '../hooks/useDebounce'
import SEO from '../components/SEO'

dayjs.extend(isBetween)

/* =======================
   Animation Variants
======================= */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

/* =======================
   Charts (Lazy + Memo)
======================= */

const OwnersByCityChart = memo(lazy(() =>
  import('../components/OwnersByCityChart')
))

const OwnersByStateChart = memo(lazy(() =>
  import('../components/OwnersByStateChart')
))

/* =======================
   Utilities
======================= */

const getGrowth = (current, previous) => {
  if (!previous) return 100
  return Math.round(((current - previous) / previous) * 100)
}

/* =======================
   Enterprise Stat Card
======================= */

const StatCard = memo(function StatCard({ title, value, subtitle, growth, icon: Icon, gradient, onClick }) {
  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200 group' : ''
      }`}
    >
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{value}</h3>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-xs shrink-0`}>
          <Icon size={18} strokeWidth={2.3} />
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          {growth !== undefined && (
            <div className={`flex items-center text-[9px] font-black px-1.5 py-0.5 rounded-md ${
              growth >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}>
              {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
            </div>
          )}
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{subtitle}</span>
        </div>

        {onClick && (
          <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        )}
      </div>
    </motion.div>
  )
})

/* =======================
   Page Component
======================= */

export default function AdminDashboard() {
  const navigate = useNavigate()

  // State for API data
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Regional View Tab: 'cities' or 'states'
  const [regionTab, setRegionTab] = useState('cities')

  // Fetch dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getAdminDashboard(10)
        
        if (response.data && response.data.data) {
          setDashboardData(response.data.data)
        } else if (response.data) {
          setDashboardData(response.data)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data')
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const ownersPerPage = 10
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState('all')

  // Extract data from API response
  const kpis = dashboardData?.kpis || {}
  const ownersByCity = dashboardData?.ownersByCity || []
  const ownersByState = dashboardData?.ownersByState || []
  const recentOwners = dashboardData?.recentOwners || []

  /* =======================
     Stats
  ======================= */

  const totals = useMemo(() => ({
    total: kpis.totalOwners || 0,
    approved: kpis.approvedOwners || 0,
    pending: kpis.pendingOwners || 0,
    onHold: kpis.onHoldOwners || 0,
    currentMonth: kpis.currentMonthRegistrations || 0,
    growth: getGrowth(kpis.currentMonthRegistrations || 0, kpis.previousMonthRegistrations || 0),
  }), [kpis])

  /* =======================
     Charts
  ======================= */

  const chartCityData = useMemo(() => ownersByCity.map(item => ({
    city: item.city,
    count: item.count
  })), [ownersByCity])

  const chartStateData = useMemo(() => ownersByState.map(item => ({
    state: item.state,
    count: item.count
  })), [ownersByState])

  /* =======================
     Filters (Table only)
  ======================= */

  const filteredOwners = useMemo(() => {
    return recentOwners.filter(o => {
      const q = debouncedSearch.toLowerCase()
      const matchSearch =
        (o.fullName || '').toLowerCase().includes(q) ||
        (o.username || '').toLowerCase().includes(q) ||
        (o.email || '').toLowerCase().includes(q) ||
        (o.phone || '').includes(q) ||
        (o.city || '').toLowerCase().includes(q)

      const matchStatus =
        statusFilter === 'all' || o.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [recentOwners, debouncedSearch, statusFilter])

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredOwners.length / ownersPerPage)
    )
    if (page > totalPages) setPage(1)
  }, [filteredOwners.length])

  const paginatedOwners = filteredOwners.slice(
    (page - 1) * ownersPerPage,
    page * ownersPerPage
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-9 w-9 text-indigo-600 animate-spin" />
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Loading System Metrics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-200/80">
          <div className="h-16 w-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-5 border border-rose-100">
            <Activity size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">System Error</h2>
          <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  /* =======================
     Render
  ======================= */

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SEO
        title="System Overview"
        description="Comprehensive dashboard for ManageMyPg administrators to monitor system performance, user registrations, and regional distribution."
        canonical="/admin/dashboard"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 md:space-y-8"
      >
        {/* HERO HEADER CARD */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Building2 size={160} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[9.5px] font-black uppercase tracking-widest mb-3">
                <ShieldCheck size={13} />
                <span>Enterprise Control Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
                System Overview
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-1">
                Real-time monitoring for partner onboarding, verification requests, and regional activity.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-black text-[9.5px] uppercase tracking-widest transition-all cursor-pointer shadow-2xs"
              >
                <Download size={14} />
                Export Brief
              </button>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-xl font-black text-[9.5px] uppercase tracking-widest">
                <Activity size={14} className="animate-pulse" />
                System Active
              </div>
            </div>
          </div>
        </div>

        {/* KPIs GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            title="Total Owners"
            value={totals.total}
            subtitle="System Wide"
            icon={Users}
            gradient="from-indigo-600 to-blue-700"
            onClick={() => navigate('/admin/owners')}
          />
          <StatCard
            title="Approved"
            value={totals.approved}
            subtitle="Verified Active"
            icon={CheckCircle2}
            gradient="from-emerald-500 to-teal-600"
            onClick={() => navigate('/admin/owners?filter=approved')}
          />
          <StatCard
            title="Pending Review"
            value={totals.pending}
            subtitle="Awaiting Review"
            icon={Clock}
            gradient="from-amber-400 to-orange-500"
            onClick={() => navigate('/admin/owners?filter=pending')}
          />
          <StatCard
            title="Restricted"
            value={totals.onHold}
            subtitle="Deleted / Blocked"
            icon={PauseCircle}
            gradient="from-slate-600 to-slate-800"
            onClick={() => navigate('/admin/owners?filter=deleted')}
          />
          <StatCard
            title="Monthly Growth"
            value={totals.currentMonth}
            subtitle="New Registrations"
            icon={TrendingUp}
            gradient="from-violet-600 to-fuchsia-700"
            growth={totals.growth}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content: Recent Owners Table */}
          <motion.div variants={itemVariants} className="xl:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Recent Onboarding</h3>
                  <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Monitor latest partner registrations</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      placeholder="Search partner name or city..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 w-full sm:w-56 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                    />
                  </div>

                  <div className="w-full sm:w-44">
                    <CustomDropdown
                      value={statusFilter}
                      options={[
                        { id: 'all', label: 'All Status' },
                        { id: 'approved', label: 'Approved' },
                        { id: 'pending', label: 'Pending' }
                      ]}
                      onChange={(val) => setStatusFilter(val)}
                      icon={Filter}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-3.5">Partner Details</th>
                      <th className="hidden sm:table-cell px-6 py-3.5">Location</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                    {paginatedOwners.map(o => (
                      <tr
                        key={o.id}
                        className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/owner/${o.id}`)}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-black shrink-0 text-sm shadow-2xs">
                              {(o.fullName || o.username || 'O')?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-slate-900 truncate text-xs uppercase tracking-tight">{o.fullName || o.username}</div>
                              <div className="text-[9.5px] font-medium text-slate-500 truncate lowercase">{o.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-3.5">
                          <div className="text-slate-900 font-black text-xs uppercase tracking-tight">{o.city}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{o.state || 'Region'}</div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border ${
                            o.status?.toLowerCase() === 'approved'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${o.status?.toLowerCase() === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all ml-auto border border-indigo-100 group-hover:shadow-2xs cursor-pointer">
                            View
                            <ArrowRight size={13} className="hidden sm:inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {paginatedOwners.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                          No partners matching search criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Displaying <span className="text-slate-900">{paginatedOwners.length}</span> of <span className="text-slate-900">{filteredOwners.length}</span> records
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={(e) => { e.stopPropagation(); setPage(p => p - 1); }}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="px-3 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                    Page {page}
                  </div>
                  <button
                    disabled={page * ownersPerPage >= filteredOwners.length}
                    onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer shadow-2xs"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar Analytics - Regional Distribution */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 space-y-5">
              
              {/* CARD HEADER */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0 border border-indigo-100">
                    <MapPin size={18} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 tracking-tight">Regional Distribution</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Geographic expansion analytics</p>
                  </div>
                </div>
                <span className="text-[8.5px] text-indigo-600 font-black px-2.5 py-1 bg-indigo-50 rounded-lg border border-indigo-100 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  Live Hubs
                </span>
              </div>

              {/* QUICK REGIONAL SUMMARY METRICS */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Top Hub</span>
                  <span className="text-xs font-black text-slate-900 truncate block uppercase">{chartCityData[0]?.city || 'N/A'}</span>
                  <span className="text-[8.5px] font-black text-indigo-600 mt-0.5 block">{chartCityData[0]?.count || 0} Partners</span>
                </div>
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Active States</span>
                  <span className="text-xs font-black text-slate-900 block uppercase">{chartStateData.length} Regions</span>
                  <span className="text-[8.5px] font-black text-emerald-600 mt-0.5 block">State Coverage</span>
                </div>
              </div>

              {/* TAB SELECTOR: CITIES vs STATES */}
              <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setRegionTab('cities')}
                  className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                    regionTab === 'cities' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Cities ({chartCityData.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRegionTab('states')}
                  className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                    regionTab === 'states' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  States ({chartStateData.length})
                </button>
              </div>

              {/* CHART CONTAINER & RANK LEADERBOARD */}
              {regionTab === 'cities' ? (
                <div className="space-y-4">
                  <div className="h-52 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    <Suspense fallback={<div className="h-full flex items-center justify-center text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Analyzing Cities...</div>}>
                      <OwnersByCityChart data={chartCityData} />
                    </Suspense>
                  </div>

                  {/* CITY RANK LEADERBOARD */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">City Expansion Rank</span>
                    <div className="space-y-1.5">
                      {chartCityData.slice(0, 4).map((c, i) => {
                        const maxCount = chartCityData[0]?.count || 1
                        const pct = Math.round((c.count / maxCount) * 100)
                        return (
                          <div key={c.city} className="flex items-center gap-2.5 p-2 bg-slate-50/80 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 h-5 w-5 rounded-md flex items-center justify-center shrink-0">#{i + 1}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-900 mb-1">
                                <span className="uppercase truncate text-[11px] font-black">{c.city}</span>
                                <span className="text-[9.5px] font-black text-indigo-600">{c.count} partners</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-52 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                    <Suspense fallback={<div className="h-full flex items-center justify-center text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Analyzing States...</div>}>
                      <OwnersByStateChart data={chartStateData} />
                    </Suspense>
                  </div>

                  {/* STATE RANK LEADERBOARD */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">State Coverage Rank</span>
                    <div className="space-y-1.5">
                      {chartStateData.slice(0, 4).map((s, i) => {
                        const maxCount = chartStateData[0]?.count || 1
                        const pct = Math.round((s.count / maxCount) * 100)
                        return (
                          <div key={s.state} className="flex items-center gap-2.5 p-2 bg-slate-50/80 rounded-xl border border-slate-100">
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 h-5 w-5 rounded-md flex items-center justify-center shrink-0">#{i + 1}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-900 mb-1">
                                <span className="uppercase truncate text-[11px] font-black">{s.state}</span>
                                <span className="text-[9.5px] font-black text-emerald-600">{s.count} partners</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
