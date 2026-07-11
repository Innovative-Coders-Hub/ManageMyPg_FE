import React, { useMemo, useState, useEffect, lazy, Suspense, memo } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
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
  Activity
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
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
      className={`relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 group' : ''
      }`}
    >
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{value}</h3>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-current/20`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
        <div className="flex items-center gap-2">
          {growth !== undefined && (
            <div className={`flex items-center text-[9px] font-black px-1.5 py-0.5 rounded-lg ${
              growth >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}>
              {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
            </div>
          )}
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{subtitle}</span>
        </div>

        {onClick && (
          <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
        )}
      </div>
    </motion.div>
  )
})

/* =======================
   Page
======================= */

export default function AdminDashboard() {
  const navigate = useNavigate()

  // State for API data
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getAdminDashboard(10) // Pass limit=10 for recent owners
        
        // Handle backend response structure: { success: true, data: {...} }
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
    onHold: kpis.onHoldOwners || 0,  // ✅ New field
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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    )
  }

  /* =======================
     Render
  ======================= */

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="System Overview"
        description="Comprehensive dashboard for ManageMyPg administrators to monitor system performance, user registrations, and regional distribution."
        canonical="/admin/dashboard"
      />
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="System Overview"
            subtitle="Enterprise Administration & Control Center"
          >
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button className="flex items-center justify-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition shadow-sm">
                <Download size={14} />
                Export
              </button>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                <Activity size={14} />
                Healthy
              </div>
            </div>
          </PageHeader>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 pb-10 space-y-6 md:space-y-8"
      >
        {/* KPIs */}
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
          title="Pending"
          value={totals.pending}
          subtitle="Awaiting Review"
          icon={Clock}
          gradient="from-amber-400 to-orange-500"
          onClick={() => navigate('/admin/owners?filter=pending')}
        />
        <StatCard
          title="Restricted"
          value={totals.onHold}
          subtitle="Deleted/Blocked"
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
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Recent Onboarding</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Monitor latest registrations</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    placeholder="Search owners…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest w-full sm:w-64 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="appearance-none w-full pl-4 pr-10 py-2 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                  <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Partner Details</th>
                    <th className="hidden sm:table-cell px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOwners.map(o => (
                    <tr
                      key={o.id}
                      className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/owner/${o.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-black shrink-0 text-sm">
                            {(o.fullName || o.username || 'O')?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate text-[11px] uppercase tracking-tight">{o.fullName || o.username}</div>
                            <div className="text-[9px] font-medium text-slate-500 truncate lowercase">{o.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        <div className="text-slate-900 font-bold text-[11px] uppercase tracking-tight">{o.city}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{o.state || 'Region'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${
                          o.status?.toLowerCase() === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-100'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${o.status?.toLowerCase() === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all ml-auto border border-indigo-100 group-hover:shadow-sm">
                          View
                          <ArrowRight size={14} className="hidden sm:inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedOwners.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        No partners matching criteria
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
                  className="p-2 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="px-3 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  Page {page}
                </div>
                <button
                  disabled={page * ownersPerPage >= filteredOwners.length}
                  onClick={(e) => { e.stopPropagation(); setPage(p => p + 1); }}
                  className="p-2 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Analytics */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                Regional Distribution
              </h3>
              <MoreVertical size={16} className="text-slate-400" />
            </div>
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Top Cities</span>
                  <span className="text-[9px] text-indigo-600 font-black px-2 py-0.5 bg-indigo-50 rounded-lg border border-indigo-100">LIVE DATA</span>
                </div>
                <div className="h-64">
                  <Suspense fallback={<div className="h-full flex items-center justify-center text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse bg-slate-50 rounded-[2.5rem] border border-slate-100">Analyzing...</div>}>
                    <OwnersByCityChart data={chartCityData} />
                  </Suspense>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">State Analysis</span>
                </div>
                <div className="h-64">
                  <Suspense fallback={<div className="h-full flex items-center justify-center text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse bg-slate-50 rounded-xl border border-slate-100">Analyzing...</div>}>
                    <OwnersByStateChart data={chartStateData} />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
    </div>
  )
}
