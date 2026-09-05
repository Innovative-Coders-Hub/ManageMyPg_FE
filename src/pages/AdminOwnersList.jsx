import React, { useMemo, useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import { useSearchParams, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import CustomDropdown from '../components/CustomDropdown'
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
  Users,
  Activity,
  UserCheck
} from 'lucide-react'
import { getAllOwners, updateOwnerStatus } from '../api/adminAuth'
import useDebounce from '../hooks/useDebounce'
import SEO from '../components/SEO'

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
const StatCard = memo(function StatCard({ label, value, icon: Icon, gradient, onClick }) {
  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200 group' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <h3 className="text-2xl font-black text-slate-900 leading-none">{value}</h3>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-xs shrink-0`}>
          <Icon size={18} strokeWidth={2.3} />
        </div>
      </div>
    </motion.div>
  )
})

const BASE_URL = 'https://api.managemypg.com'

const STATE_OPTIONS = [
  { id: 'all', label: 'All States' },
  { id: 'Karnataka', label: 'Karnataka' },
  { id: 'Maharashtra', label: 'Maharashtra' },
  { id: 'Telangana', label: 'Telangana' },
  { id: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { id: 'Tamil Nadu', label: 'Tamil Nadu' }
]

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
      if (owners.length === 0) setLoading(true)
      setError('')
      const res = await getAllOwners({
        page: page - 1,
        size: limit,
        status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined,
        state: stateFilter !== 'all' ? stateFilter : undefined,
        search: debouncedSearch || undefined
      })

      const rawBody = res.data
      let apiData = []
      let total = 0

      if (rawBody.success && rawBody.data) {
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

  useEffect(() => {
    if (page !== 1) setPage(1)
  }, [statusFilter, stateFilter, debouncedSearch])

  const filteredOwners = useMemo(() => {
    if (!owners || !Array.isArray(owners)) return []
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
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SEO
        title="Owner Directory"
        description="Comprehensive directory of PG owners registered on ManageMyPg. Manage verification status and view partner details."
        canonical="/admin/owners"
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
            <Users size={160} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[9.5px] font-black uppercase tracking-widest mb-3">
                <ShieldCheck size={13} />
                <span>Partner Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
                Owner Management
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-1">
                Directory of all registered PG property owners, onboarding statuses, and verification controls.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-xl font-black text-[9.5px] uppercase tracking-widest">
                <UserCheck size={14} />
                {totalRecords} Total Registered
              </div>
            </div>
          </div>
        </div>

        {/* TOP STAT CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Owners"
            value={stats.total || totalRecords}
            icon={Users}
            gradient="from-indigo-600 to-blue-700"
            onClick={() => updateParams({ filter: 'all' })}
          />
          <StatCard
            label="Verified Active"
            value={stats.approved || 0}
            icon={CheckCircle2}
            gradient="from-emerald-500 to-teal-600"
            onClick={() => updateParams({ filter: 'approved' })}
          />
          <StatCard
            label="Pending Review"
            value={stats.pending || 0}
            icon={Clock}
            gradient="from-amber-400 to-orange-500"
            onClick={() => updateParams({ filter: 'pending' })}
          />
          <StatCard
            label="Restricted / Deleted"
            value={stats.onhold || 0}
            icon={XCircle}
            gradient="from-slate-600 to-slate-800"
            onClick={() => updateParams({ filter: 'deleted' })}
          />
        </div>

        {/* CONTROL FILTER BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
            <input
              placeholder="Search owners by name, email or phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all shadow-2xs"
            />
          </div>

          <div className="flex bg-slate-100/80 border border-slate-200/60 p-1 rounded-xl shadow-2xs">
            {['all', 'approved', 'pending', 'deleted'].map((s) => (
              <button
                key={s}
                onClick={() => updateParams({ filter: s })}
                className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="w-full">
            <CustomDropdown
              value={stateFilter}
              options={STATE_OPTIONS}
              onChange={(val) => updateParams({ state: val })}
              icon={Filter}
              className="w-full"
            />
          </div>
        </div>

        {/* MAIN TABLE DIRECTORY */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-3.5">Partner Identity</th>
                  <th className="hidden md:table-cell px-6 py-3.5">Contact & PGs</th>
                  <th className="hidden lg:table-cell px-6 py-3.5">Registered On</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                <AnimatePresence mode="popLayout">
                  {loading && owners.length === 0 ? (
                    <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Activity className="h-7 w-7 text-indigo-600 animate-spin" />
                          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">Syncing Directory...</span>
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
                        className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/owner/${o.id || o.ownerId}`)}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            {o.profileImageUrl ? (
                              <img
                                src={`${BASE_URL}${o.profileImageUrl}`}
                                alt=""
                                className="h-9 w-9 rounded-xl object-cover border border-slate-100 shadow-2xs shrink-0"
                                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + (o.fullName || 'User') }}
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-black text-sm shadow-2xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {(o.fullName || o.username)?.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 truncate text-xs uppercase tracking-tight">
                                {o.fullName || o.name || o.username || 'N/A'}
                              </p>
                              <p className="text-[9.5px] font-medium text-slate-500 truncate lowercase">
                                {o.email || o.contactEmail || 'No Email'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Phone size={12} className="text-slate-400" />
                              <span className="font-bold text-xs">{o.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Building2 size={12} className="text-indigo-500" />
                              <span className="text-[8.5px] font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                {o.totalPgs || 0} PGs Owned
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-3.5">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Calendar size={12} className="text-slate-400" />
                            <span className="font-bold text-xs">{dayjs(o.createdAt).format('DD MMM YYYY')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                            <select
                              onChange={(e) => handleStatusChange(e, o.id || o.ownerId, e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[8.5px] font-black uppercase tracking-widest text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none cursor-pointer"
                              defaultValue={o.status?.toLowerCase()}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approve</option>
                              <option value="deleted">Deleted</option>
                            </select>
                            <button
                              onClick={() => navigate(`/admin/owner/${o.id || o.ownerId}`)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                              title="View Details"
                            >
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr key="empty">
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <Briefcase size={36} strokeWidth={1.5} />
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No partners matching filter criteria</p>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-900">{filteredOwners.length}</span> of <span className="text-slate-900">{totalRecords}</span> entries
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer shadow-2xs"
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
                      <span key={`sep-${i}`} className="px-2 text-slate-400 font-bold text-xs">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-7 w-7 rounded-lg text-[9.5px] font-black transition-all cursor-pointer ${
                          page === p
                            ? 'bg-slate-900 text-white shadow-2xs font-black'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
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
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer shadow-2xs"
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
    approved: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2, label: 'Verified Active' },
    pending: { color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock, label: 'In Review' },
    onhold: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: ShieldCheck, label: 'On Hold' },
    rejected: { color: 'bg-rose-50 text-rose-600 border-rose-100', icon: XCircle, label: 'Rejected' },
    deleted: { color: 'bg-rose-50 text-rose-600 border-rose-100', icon: XCircle, label: 'Deleted' },
    blocked: { color: 'bg-rose-50 text-rose-600 border-rose-100', icon: XCircle, label: 'Blocked' },
  }

  const config = configs[status?.toLowerCase()] || configs.pending
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[8.5px] font-black uppercase tracking-widest ${config.color}`}>
      <Icon size={11} />
      {config.label}
    </div>
  )
}
