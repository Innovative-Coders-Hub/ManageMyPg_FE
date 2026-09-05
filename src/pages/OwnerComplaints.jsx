import React, { useEffect, useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO'
import PageHeader from '../components/PageHeader'
import CustomDropdown from '../components/CustomDropdown'
import {
  getOwnerComplaints,
  updateComplaintStatus,
  getAllPgs
} from '../api/ownerAuth'
import {
  Filter,
  RefreshCcw,
  Wrench,
  Calendar,
  Tag,
  Activity,
  ChevronDown,
  CheckCircle2,
  Clock,
  User,
  Building2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Search,
  X,
  ChevronRight,
  Loader2,
  ShieldCheck,
  FileText
} from 'lucide-react'

/* =====================================================
   CONSTANTS & HELPERS
===================================================== */
const CATEGORIES = [
  'ELECTRICAL', 'WATER', 'CLEANING', 'WIFI',
  'MAINTENANCE', 'FOOD', 'PLUMBING', 'PARKING', 'OTHER'
]

const STATUSES = ['OPEN', 'ASSIGNED', 'COMPLETED']

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.managemypg.com/managemypg'

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('') || '?'

const TenantAvatar = ({ name, profileImageUrl, size = "w-10 h-10", fontSize = "text-xs" }) => {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [profileImageUrl])

  const fullImageUrl = profileImageUrl
    ? (profileImageUrl.startsWith('http') ? profileImageUrl : `${API_BASE_URL.replace(/\/$/, '')}/${profileImageUrl.replace(/^\//, '')}`)
    : null

  return (
    <div className={`${size} rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black ${fontSize} shadow-inner shrink-0 overflow-hidden relative border border-indigo-500`}>
      {fullImageUrl && !imageError ? (
        <img
          src={fullImageUrl}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
}

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

const StatusBadge = ({ status }) => {
  const styles = {
    OPEN: 'bg-amber-50 text-amber-600 border-amber-100',
    ASSIGNED: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  }

  return (
    <span
      className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border shadow-2xs inline-block ${
        styles[status] || 'bg-slate-50 text-slate-500 border-slate-100'
      }`}
    >
      {status}
    </span>
  )
}

/* =====================================================
   MAIN OWNER COMPLAINTS COMPONENT
===================================================== */
export default function OwnerComplaints() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const pgId = searchParams.get('pgId')

  const [pgs, setPgs] = useState([])
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [allComplaints, setAllComplaints] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const [filters, setFilters] = useState({
    category: '',
    status: '',
    fromDate: '',
    toDate: ''
  })

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [saving, setSaving] = useState(false)

  const [resolutionNotes, setResolutionNotes] = useState('')
  const [status, setStatus] = useState('')
  const [debouncedFilters, setDebouncedFilters] = useState(filters)

  /* ===================== INIT & FETCH ===================== */
  useEffect(() => {
    async function init() {
      try {
        const pgsData = await getAllPgs()
        setPgs(pgsData || [])

        if (!pgId && pgsData && pgsData.length > 0) {
          setSearchParams({ pgId: pgsData[0].id }, { replace: true })
        }
      } catch (e) {
        console.error('Failed to load PGs', e)
      }
    }
    init()
  }, [pgId, setSearchParams])

  useEffect(() => {
    if (!pgId) return
    setPage(0)
    fetchComplaints(0)
  }, [pgId])

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 300)
    return () => clearTimeout(t)
  }, [filters])

  const fetchComplaints = async (pageNo = page) => {
    try {
      setLoading(true)
      const res = await getOwnerComplaints(pgId, pageNo, 10)
      const data = res.content || []
      setAllComplaints(data)
      setPage(pageNo)
      setTotalPages(res.totalPages || 0)
      setComplaints(data)
    } catch (e) {
      console.error('Failed to load complaints', e)
    } finally {
      setLoading(false)
    }
  }

  const filteredComplaints = useMemo(() => {
    let filtered = [...allComplaints]

    if (debouncedFilters.category) {
      filtered = filtered.filter(c => c.category === debouncedFilters.category)
    }
    if (debouncedFilters.status) {
      filtered = filtered.filter(c => c.status === debouncedFilters.status)
    }
    if (debouncedFilters.fromDate) {
      const from = dayjs(debouncedFilters.fromDate).startOf('day')
      filtered = filtered.filter(c =>
        dayjs(c.createdDate).isSame(from) || dayjs(c.createdDate).isAfter(from)
      )
    }
    if (debouncedFilters.toDate) {
      const to = dayjs(debouncedFilters.toDate).endOf('day')
      filtered = filtered.filter(c =>
        dayjs(c.createdDate).isSame(to) || dayjs(c.createdDate).isBefore(to)
      )
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        (c.title || '').toLowerCase().includes(q) ||
        (c.tenantName || '').toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q)
      )
    }
    return filtered
  }, [allComplaints, debouncedFilters, searchQuery])

  const onFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({ category: '', status: '', fromDate: '', toDate: '' })
    setSearchQuery('')
  }

  /* ===================== MODAL HANDLERS ===================== */
  const openDetails = (c) => {
    setSelectedComplaint(c)
    setResolutionNotes(c.resolutionNotes || '')
    setStatus(c.status || 'OPEN')
  }

  const closeDetails = () => {
    setSelectedComplaint(null)
    setResolutionNotes('')
    setStatus('')
  }

  const saveUpdate = async () => {
    try {
      setSaving(true)
      const updated = await updateComplaintStatus(
        selectedComplaint.id,
        { status, resolutionNotes: resolutionNotes || null }
      )
      setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c))
      setAllComplaints(prev => prev.map(c => c.id === updated.id ? updated : c))
      closeDetails()
    } catch (e) {
      console.error('Failed to update complaint', e)
    } finally {
      setSaving(false)
    }
  }

  const openCount = allComplaints.filter(c => c.status === 'OPEN').length
  const assignedCount = allComplaints.filter(c => c.status === 'ASSIGNED').length
  const completedCount = allComplaints.filter(c => c.status === 'COMPLETED').length

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SEO
        title="Complaints & Service Tickets"
        description="Track and resolve tenant complaints, manage maintenance tickets, and monitor SLA resolution times."
      />

      {/* STICKY HEADER & TICKET STATS */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="shrink-0">
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <Wrench size={14} />
                <span>Service Resolution Desk</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 whitespace-nowrap">
                Complaints Desk
              </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
              <TopStat
                label="Open Tickets"
                value={openCount}
                icon={AlertCircle}
                colorClass="text-amber-600"
                bgClass="bg-amber-50"
              />
              <TopStat
                label="In Progress"
                value={assignedCount}
                icon={Activity}
                colorClass="text-indigo-600"
                bgClass="bg-indigo-50"
              />
              <TopStat
                label="Completed"
                value={completedCount}
                icon={CheckCircle2}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
              />
              <TopStat
                label="Total Issues"
                value={allComplaints.length}
                icon={MessageSquare}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* TOOLBAR: PROPERTY SCOPE, SEARCH & FILTERS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <CustomDropdown
              label="Property Scope"
              value={pgId || ''}
              options={pgs.map(pg => ({ id: pg.id, label: pg.pgName }))}
              onChange={(val) => setSearchParams({ pgId: val })}
              icon={Building2}
              className="w-full"
            />

            <CustomDropdown
              label="Category Filter"
              value={filters.category}
              options={[
                { id: '', label: 'All Categories' },
                ...CATEGORIES.map(c => ({ id: c, label: c }))
              ]}
              onChange={(val) => setFilters(prev => ({ ...prev, category: val }))}
              icon={Tag}
              className="w-full"
            />

            <CustomDropdown
              label="Status Filter"
              value={filters.status}
              options={[
                { id: '', label: 'All Statuses' },
                ...STATUSES.map(s => ({ id: s, label: s }))
              ]}
              onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
              icon={Activity}
              className="w-full"
            />

            <div className="relative w-full">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search title, tenant or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">From Date</span>
                <input
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={onFilterChange}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="relative">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">To Date</span>
                <input
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={onFilterChange}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              <RefreshCcw size={13} /> Reset Filters
            </button>
          </div>
        </div>

        {/* COMPLAINTS LIST TABLE / CARDS */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-20 flex flex-col items-center justify-center shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Service Tickets...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-20 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Tickets Found</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 max-w-sm mx-auto">
              There are no service tickets matching the active filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    <th className="py-4 px-6">Issue Title</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Tenant Resident</th>
                    <th className="py-4 px-6">Property</th>
                    <th className="py-4 px-6">Submitted Date</th>
                    <th className="py-4 px-6">Lifecycle Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-900">
                  {filteredComplaints.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => openDetails(c)}
                      className="hover:bg-slate-50/70 transition-all cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <div className="font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                          {c.title}
                        </div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                          Ref #{c.id?.slice(-6)}
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-widest border border-slate-200/80">
                          {c.category}
                        </span>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <TenantAvatar name={c.tenantName} profileImageUrl={c.profileImageUrl} size="w-8 h-8" fontSize="text-[10px]" />
                          <span className="text-xs font-bold text-slate-800">{c.tenantName}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">{c.pgName}</span>
                      </td>

                      <td className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {dayjs(c.createdDate).format('DD MMM YYYY')}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => { e.stopPropagation(); openDetails(c); }}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-2xs"
                        >
                          Ticket Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION BAR */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  disabled={page === 0}
                  onClick={() => fetchComplaints(page - 1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all"
                >
                  Previous
                </button>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => fetchComplaints(page + 1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Slide-Over Drawer - Ticket Details */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetails}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-Over Drawer Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 relative z-10"
                onClick={e => e.stopPropagation()}
              >
                {/* Drawer Header */}
                <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Wrench size={20} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">
                        Ticket Details
                      </h3>
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-0.5 truncate">
                        Ref #{selectedComplaint.id?.slice(-8)} • {selectedComplaint.pgName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeDetails}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
                    title="Close Drawer"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Drawer Form / Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/30">
                  
                  {/* TICKET DETAILS CARD */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Issue Subject</span>
                      <StatusBadge status={selectedComplaint.status} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedComplaint.title}</h4>
                    
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-900">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Category</span>
                        <span className="text-indigo-600 font-black">{selectedComplaint.category}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Submission Date</span>
                        <span className="text-slate-700">{dayjs(selectedComplaint.createdDate).format('DD MMM YYYY HH:mm')}</span>
                      </div>
                    </div>
                  </div>

                  {/* RESIDENT SUBMITTER CARD */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                    <TenantAvatar name={selectedComplaint.tenantName} profileImageUrl={selectedComplaint.profileImageUrl} size="w-11 h-11" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Submitted By Resident</span>
                      <h4 className="text-xs font-black text-slate-900 uppercase truncate">{selectedComplaint.tenantName}</h4>
                    </div>
                  </div>

                  {/* RESOLUTION PROTOCOL NOTES */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-3">
                      Resolution & Action Log
                    </h4>

                    <div className="relative group">
                      <label className="absolute -top-2.5 left-4 bg-white px-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-10">
                        Resolution Notes
                      </label>
                      <textarea
                        value={resolutionNotes}
                        onChange={e => setResolutionNotes(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 pt-3.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
                        placeholder="Document resolution actions or work notes..."
                      />
                    </div>

                    <div>
                      <CustomDropdown
                        label="Lifecycle Status"
                        value={status}
                        options={STATUSES.map(s => ({ id: s, label: s }))}
                        onChange={setStatus}
                        className="w-full"
                        labelBg="bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Drawer Fixed Footer Bar */}
                <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-3 shadow-lg">
                  <button
                    type="button"
                    onClick={closeDetails}
                    className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveUpdate}
                    disabled={saving}
                    className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-40 shadow-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 size={15} />
                    )}
                    {saving ? 'Saving...' : 'Update Ticket'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
