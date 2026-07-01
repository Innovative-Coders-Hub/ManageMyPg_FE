import React, { useMemo, useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import { useSearchParams, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Users
} from 'lucide-react'
import { getAllOwners, updateOwnerStatus } from '../api/adminAuth'
import useDebounce from '../hooks/useDebounce'

/* ======================
   Animation Variants
====================== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

/* ======================
   Stat Card - Compact & Modern
======================= */
const StatCard = memo(function StatCard({ label, value, icon: Icon, color }) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 ${color}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
          <p className="text-lg font-black text-slate-900 leading-none">{value}</p>
        </div>
      </div>
    </motion.div>
  )
})

const BASE_URL = 'https://api.managemypg.com'

export default function AdminOwnersList() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()

  // State
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalRecords, setTotalRecords] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, onhold: 0 })
  const [query, setQuery] = useState('')
  const debouncedSearch = useDebounce(query, 500)

  // Filters from URL
  const statusFilter = params.get('filter') || 'all'
  const stateFilter = params.get('state') || 'all'

  const fetchOwners = async () => {
    try {
      // Only show full loading on initial fetch or page change
      if (owners.length === 0) setLoading(true)
      setError('')
      const res = await getAllOwners({
        page: page - 1,
        size: limit,
        status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined,
        state: stateFilter !== 'all' ? stateFilter : undefined,
        search: debouncedSearch || undefined
      })

      console.log('AdminOwners API Response:', res.data)

      const rawBody = res.data
      let apiData = []
      let total = 0

      // Support various response structures
      if (rawBody.success && rawBody.data) {
        // Nested under data (like the user provided)
        apiData = rawBody.data.content || rawBody.data.owners || (Array.isArray(rawBody.data) ? rawBody.data : [])
        total = rawBody.data.totalElements || rawBody.data.totalRecords || apiData.length
      } else if (Array.isArray(rawBody)) {
        apiData = rawBody
        total = rawBody.length
      } else {
        apiData = rawBody?.content || rawBody?.owners || []
        total = rawBody?.totalElements || rawBody?.totalRecords || apiData.length
      }

      setOwners(Array.isArray(apiData) ? apiData : [])
      setTotalRecords(total)

      // Stats extraction
      const s = rawBody?.stats || rawBody?.data?.stats
      if (s) {
        setStats({
          total: s.totalOwners || 0,
          approved: s.approvedOwners || 0,
          pending: s.pendingOwners || 0,
          onhold: s.onHoldOwners || 0
        })
      }
    } catch (err) {
      setError('Failed to fetch owners directory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOwners()
  }, [page, statusFilter, stateFilter, debouncedSearch])

  // Reset to page 1 when filters or search change
  useEffect(() => {
    if (page !== 1) setPage(1)
  }, [statusFilter, stateFilter, debouncedSearch])

  const filteredOwners = useMemo(() => {
    if (!owners || !Array.isArray(owners)) return []
    // If we're already doing server-side search, we should only do client-side filtering
    // if the query is non-empty AND we want to further refine the server's results.
    // However, to prevent the list from disappearing while typing (before debounce hits),
    // we use debouncedSearch for client-side filtering if it matches the server state.
    const activeQuery = (debouncedSearch || '').toLowerCase().trim()

    if (!activeQuery) return owners

    return owners.filter(owner => {
      const nameMatch = (owner.fullName || owner.name || '').toLowerCase().includes(activeQuery)
      const userMatch = (owner.username || '').toLowerCase().includes(activeQuery)
      const emailMatch = (owner.email || '').toLowerCase().includes(activeQuery)
      const phoneMatch = (owner.phone || '').toLowerCase().includes(activeQuery)
      return nameMatch || userMatch || emailMatch || phoneMatch
    })
  }, [owners, debouncedSearch])

  const updateParams = (newFilters) => {
    const np = new URLSearchParams(params)
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === 'all' || value === '') np.delete(key)
      else np.set(key, value)
    })
    setPage(1)
    setParams(np)
  }

  const handleStatusChange = async (e, ownerId, newStatus) => {
    e.stopPropagation()
    try {
      await updateOwnerStatus({ ownerId, action: newStatus.toUpperCase(), reason: 'Updated via directory' })
      fetchOwners()
    } catch (err) {
      alert('Failed to update status')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Owner Management"
            subtitle="Directory of all registered PG owners"
          >
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <TopStat label="Total" value={stats.total || totalRecords} icon={<Users />} />
              <TopStat label="Verified" value={stats.approved || '0'} icon={<CheckCircle2 />} color="bg-emerald-50 text-emerald-600 border-emerald-100" />
              <TopStat label="Pending" value={stats.pending || '0'} icon={<Clock />} color="bg-amber-50 text-amber-600 border-amber-100" />
              <TopStat label="Restricted" value={stats.onhold || '0'} icon={<AlertCircle />} color="bg-rose-50 text-rose-600 border-rose-100" />
            </div>
          </PageHeader>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 pb-10 space-y-6"
      >
        {/* Modern Control Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input
            placeholder="Search owners by name, email or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all shadow-sm hover:border-slate-300"
          />
        </div>

        <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          {['all', 'approved', 'pending', 'deleted'].map((s) => (
            <button
              key={s}
              onClick={() => updateParams({ filter: s })}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={stateFilter}
            onChange={(e) => updateParams({ state: e.target.value })}
            className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/10 outline-none cursor-pointer h-full"
          >
            <option value="all">All States</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Telangana">Telangana</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Main Table Directory */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner Identity</th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact & PGs</th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenure</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 relative">
              <AnimatePresence mode="popLayout">
                {loading && owners.length === 0 ? (
                  <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-bold text-slate-400">Syncing Directory...</span>
                      </div>
                    </td>
                  </motion.tr>
                ) : filteredOwners.length > 0 ? (
                  filteredOwners.map((o, index) => (
                    <motion.tr
                      key={o.id || o.ownerId || `owner-${index}`}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/owner/${o.id || o.ownerId}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {o.profileImageUrl ? (
                            <img
                              src={`${BASE_URL}${o.profileImageUrl}`}
                              alt=""
                              className="h-10 w-10 rounded-xl object-cover border border-slate-100 shadow-sm"
                              onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + (o.fullName || 'User') }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-base shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {(o.fullName || o.username)?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {o.fullName || o.name || o.username || 'N/A'}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {o.email || o.contactEmail || 'No Email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone size={12} className="text-slate-300" />
                            <span className="font-bold text-xs">{o.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Building2 size={12} className="text-slate-300" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-1.5 rounded">{o.totalPgs || 0} PGs Owned</span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar size={12} className="text-slate-300" />
                          <span className="font-bold text-xs">{dayjs(o.createdAt).format('MMM D, YYYY')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            onClick={e => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(e, o.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
                            defaultValue={o.status?.toLowerCase()}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approve</option>
                            <option value="deleted">Deleted</option>
                          </select>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))

                ) : (
                  <motion.tr key="empty">
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                        <Briefcase size={40} strokeWidth={1} />
                        <p className="text-sm font-bold text-slate-400">No records found</p>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Professional Footer Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{filteredOwners.length}</span> of <span className="text-slate-900">{totalRecords}</span> entries
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {(() => {
                const totalPages = Math.ceil(totalRecords / limit)
                if (totalPages <= 1) return null

                const pages = []
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
                    pages.push(i)
                  } else if (pages[pages.length - 1] !== '...') {
                    pages.push('...')
                  }
                }

                return pages.map((p, i) => (
                  p === '...' ? (
                    <span key={`sep-${i}`} className="px-2 text-slate-400 font-bold">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 rounded-xl text-[10px] font-black transition-all ${
                        page === p
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  )
                ))
              })()}
            </div>
            <button
              disabled={page * limit >= totalRecords}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
    </div>
  )
}

function StatusBadge({ status }) {
  const configs = {
    approved: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2, label: 'Verified' },
    pending: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock, label: 'In Review' },
    onhold: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: ShieldCheck, label: 'On Hold' },
    rejected: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle, label: 'Rejected' },
    deleted: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle, label: 'Deleted' },
    blocked: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle, label: 'Blocked' },
  }

  const config = configs[status?.toLowerCase()] || configs.pending
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold ${config.color}`}>
      <Icon size={12} strokeWidth={3} />
      {config.label}
    </div>
  )
}

function TopStat({ label, value, icon, color }) {
  return (
    <div className={`px-4 py-1.5 rounded-xl border flex flex-col items-center justify-center transition-all min-w-[84px] bg-white shadow-sm ${color || 'border-slate-200'}`}>
      <div className="flex items-center gap-2 mb-0.5 text-slate-400">
        {React.cloneElement(icon, { size: 10 })}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-black text-slate-900 leading-none">{value}</div>
    </div>
  )
}
