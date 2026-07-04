import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import {
  getOwnerComplaints,
  updateComplaintStatus
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
  X
} from 'lucide-react'

const CATEGORIES = [
  'ELECTRICAL', 'WATER', 'CLEANING', 'WIFI',
  'MAINTENANCE', 'FOOD', 'PLUMBING', 'PARKING', 'OTHER'
]

const STATUSES = ['OPEN', 'ASSIGNED', 'COMPLETED']

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.managemypg.com/managemypg'

const TenantAvatar = ({ name, profileImageUrl, size = "w-10 h-10", fontSize = "text-xs" }) => {
  const [imageError, setImageError] = useState(false)

  const fullImageUrl = profileImageUrl
    ? (profileImageUrl.startsWith('http') ? profileImageUrl : `${API_BASE_URL.replace(/\/$/, '')}/${profileImageUrl.replace(/^\//, '')}`)
    : null

  const initials = name
    ? name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?'

  const avatarColors = [
    'bg-orange-500', 'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-cyan-500'
  ]
  const avatarBg = avatarColors[Math.abs(name?.length || 0) % avatarColors.length]

  return (
    <div className={`${size} rounded-2xl flex items-center justify-center text-white font-black ${fontSize} shadow-inner shrink-0 overflow-hidden relative ${avatarBg}`}>
      {fullImageUrl && !imageError ? (
        <img
          src={fullImageUrl}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

function CustomDropdown({ label, value, options, onChange, icon: Icon, showAll = true, className = "min-w-[240px]", labelBg = "bg-[#F8FAFC]" }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = React.useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayValue = value === '' || value === 'ALL' ? `ALL ${label}S` : value

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className={`absolute -top-2.5 left-5 px-2 ${labelBg} z-20 transition-all duration-300`}>
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none">{label}</span>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-5 py-2.5 bg-slate-50 border-2 rounded-2xl transition-all duration-300 ${
          isOpen ? 'border-indigo-500 shadow-xl shadow-indigo-100/50' : 'border-slate-100 hover:border-indigo-300 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className="text-indigo-500" strokeWidth={2.5} />}
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest truncate max-w-[150px]">
            {displayValue}
          </span>
        </div>
        <ChevronDown
          size={16}
          strokeWidth={3}
          className={`text-indigo-400 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute z-[110] left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-2"
          >
            {showAll && (
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className={`w-full px-7 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all ${
                  value === '' || value === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                ALL {label}S
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full px-7 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all ${
                  value === opt ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50' }) {
  return (
    <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md hover:scale-[1.02] transition-all cursor-default flex-1 min-w-0">
      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</div>
        <div className="text-base sm:text-xl font-black text-slate-900 leading-tight truncate">{value}</div>
      </div>
    </div>
  )
}

export default function OwnerComplaints() {
  const [searchParams] = useSearchParams()
  const pgId = searchParams.get('pgId')
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [allComplaints, setAllComplaints] = useState([])

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
  const [pgFiltersMap, setPgFiltersMap] = useState({})
  const [debouncedFilters, setDebouncedFilters] = useState(filters)

  /* ===================== FETCH ===================== */
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

  useEffect(() => {
    if (!pgId) return
    if (allComplaints.length === 0) return
    setFilters(
      pgFiltersMap[pgId] || {
        category: '',
        status: '',
        fromDate: '',
        toDate: ''
      }
    )
  }, [allComplaints, pgId])

  useEffect(() => {
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
    setComplaints(filtered)
  }, [debouncedFilters, allComplaints])

  useEffect(() => {
    if (!pgId) return
    setPgFiltersMap(prev => ({
      ...prev,
      [pgId]: filters
    }))
  }, [filters, pgId])

  const onFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    const empty = { category: '', status: '', fromDate: '', toDate: '' }
    setFilters(empty)
    if (pgId) {
      setPgFiltersMap(prev => ({ ...prev, [pgId]: empty }))
    }
  }

  /* ===================== MODAL ===================== */
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
    } finally {
      setSaving(false)
    }
  }

  const openCount = allComplaints.filter(c => c.status === 'OPEN').length
  const assignedCount = allComplaints.filter(c => c.status === 'ASSIGNED').length

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Resolution Desk"
            subtitle="High-priority ticket lifecycle & SLA tracking"
          >
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
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
              />
              <TopStat
                label="Total Issues"
                value={allComplaints.length}
                icon={MessageSquare}
              />
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Filters Bar */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-3 shadow-sm">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-2">
            <CustomDropdown
              label="Category"
              value={filters.category}
              options={CATEGORIES}
              onChange={(val) => setFilters(prev => ({ ...prev, category: val }))}
              icon={Tag}
              className="flex-1"
              labelBg="bg-white"
            />

            <CustomDropdown
              label="Status"
              value={filters.status}
              options={STATUSES}
              onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
              icon={Activity}
              className="flex-1"
              labelBg="bg-white"
            />

            {/* From Date */}
            <div className="relative flex-1 group">
              <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20 transition-all duration-300">From Date</label>
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none z-10">
                <Calendar size={18} strokeWidth={2.5} />
              </div>
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={onFilterChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-100/50"
              />
            </div>

            {/* To Date */}
            <div className="relative flex-1 group">
              <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20 transition-all duration-300">To Date</label>
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none z-10">
                <Calendar size={18} strokeWidth={2.5} />
              </div>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={onFilterChange}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all cursor-pointer hover:bg-slate-100/50"
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-100 shrink-0"
            >
              <RefreshCcw size={14} /> Reset
            </button>
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="bg-white rounded-[2.5rem] p-24 text-center border border-slate-200 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-6 text-indigo-600" />
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Synchronizing issues...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-24 text-center border border-slate-200 shadow-sm">
            <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">No complaints found in this view</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-xl duration-500">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800">
                    <Th>Issue Title</Th>
                    <Th>Category</Th>
                    <Th>Tenant</Th>
                    <Th>PG Entity</Th>
                    <Th>Submitted</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode="popLayout">
                    {complaints.map((c, idx) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group hover:bg-indigo-50/30 transition-colors"
                      >
                        <Td className="font-black text-slate-900 text-[11px] uppercase tracking-tight">{c.title}</Td>
                        <Td>
                          <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200">
                            {c.category}
                          </span>
                        </Td>
                        <Td>
                          <div className="flex items-center gap-3">
                            <TenantAvatar name={c.tenantName} profileImageUrl={c.profileImageUrl} size="w-8 h-8" fontSize="text-[10px]" />
                            <span className="text-[10px] font-bold text-slate-600">{c.tenantName}</span>
                          </div>
                        </Td>
                        <Td className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.pgName}</Td>
                        <Td className="text-[10px] font-bold text-slate-400">{dayjs(c.createdDate).format('DD MMM YYYY')}</Td>
                        <Td><StatusBadge status={c.status} /></Td>
                        <Td>
                          <button
                            onClick={() => openDetails(c)}
                            className="px-5 py-2 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95"
                          >
                            Details
                          </button>
                        </Td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {complaints.map(c => (
                <div key={c.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <TenantAvatar name={c.tenantName} profileImageUrl={c.profileImageUrl} size="w-10 h-10" fontSize="text-xs" />
                      <div>
                        <div className="font-black text-slate-900 text-[13px] uppercase tracking-tight leading-tight">{c.title}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{c.tenantName}</div>
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1">
                      <Tag size={12} className="text-indigo-500" /> {c.category}
                    </div>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <div className="flex items-center gap-1">
                      <Calendar size={12} className="text-indigo-500" /> {dayjs(c.createdDate).format('DD MMM YY')}
                    </div>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => openDetails(c)}
                      className="w-full px-4 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95 transition-all"
                    >
                      View Ticket Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center py-6">
          <button
            disabled={page === 0}
            onClick={() => fetchComplaints(page - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm active:scale-95"
          >
            Previous
          </button>
          <div className="px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Page {page + 1} <span className="mx-1 text-slate-300">/</span> {totalPages}
          </div>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => fetchComplaints(page + 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm active:scale-95"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedComplaint && (
          <Modal onClose={closeDetails}>
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-50 -mx-6 -mt-6 px-6 py-4 border-b border-slate-200 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                    <Wrench size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Ticket Analysis</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ref: #{selectedComplaint.id.slice(-6)}</p>
                  </div>
                </div>
                <StatusBadge status={selectedComplaint.status} />
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <Detail label="Subject" value={selectedComplaint.title} icon={<MessageSquare size={10} />} />
                <Detail label="Classification" value={selectedComplaint.category} icon={<Tag size={10} />} />
                <Detail label="Tenant Identity" value={selectedComplaint.tenantName} icon={<User size={10} />} />
                <Detail label="Property" value={selectedComplaint.pgName} icon={<Building2 size={10} />} />
                <Detail
                  label="Submission Date"
                  value={dayjs(selectedComplaint.createdDate).format('DD MMM YYYY HH:mm')}
                  icon={<Calendar size={10} />}
                />
                <Detail label="SLA Clock" value="Active" icon={<Clock size={10} />} />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                    <Activity size={12} className="text-indigo-500" />
                    Resolution Protocol & Notes
                  </label>
                  <textarea
                    value={resolutionNotes}
                    onChange={e => setResolutionNotes(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-4 text-xs font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all bg-slate-50/50 min-h-[100px]"
                    placeholder="Document the actions taken for resolution..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <CustomDropdown
                      label="Lifecycle Status"
                      value={status}
                      options={STATUSES}
                      onChange={setStatus}
                      showAll={false}
                      className="w-full"
                      labelBg="bg-white"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={saveUpdate}
                      disabled={saving}
                      className="flex-1 h-[44px] bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-40 shadow-lg shadow-slate-100 active:scale-95 flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 size={14} />}
                      {saving ? 'Processing...' : 'Commit Changes'}
                    </button>
                    <button
                      onClick={closeDetails}
                      className="flex-1 h-[44px] bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ===================== HELPERS ===================== */

const Th = ({ children }) => (
  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.15em] text-slate-300 text-left">{children}</th>
)

const Td = ({ children, className = "" }) => (
  <td className={`px-6 py-4 text-slate-600 ${className}`}>{children}</td>
)

const Detail = ({ label, value, icon }) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
      {icon} {label}
    </div>
    <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
      {value || 'Not Specified'}
    </div>
  </div>
)

const StatusBadge = ({ status }) => {
  const styles = {
    OPEN: 'bg-amber-500 text-white border-amber-600 shadow-amber-100',
    ASSIGNED: 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-100',
    COMPLETED: 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-100'
  }

  return (
    <span
      className={`px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm inline-block ${
        styles[status] || 'bg-slate-500 text-white border-slate-600 shadow-slate-100'
      }`}
    >
      {status}
    </span>
  )
}

const Modal = React.forwardRef(({ children, onClose }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative border border-white/20 overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
      >
        <X size={20} />
      </button>
      {children}
    </motion.div>
  </motion.div>
))

const Loader2 = ({ className, size = 16 }) => (
  <RefreshCcw className={`animate-spin ${className}`} size={size} />
)
