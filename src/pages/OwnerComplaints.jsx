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
  '', 'ELECTRICAL', 'WATER', 'CLEANING', 'WIFI',
  'MAINTENANCE', 'FOOD', 'PLUMBING', 'PARKING', 'OTHER'
]

const STATUSES = ['', 'OPEN', 'ASSIGNED', 'COMPLETED']

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
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-1">
              <TopStat
                label="Open Tickets"
                value={openCount}
                icon={<AlertCircle />}
                isAccent={openCount > 0}
              />
              <TopStat
                label="In Progress"
                value={assignedCount}
                icon={<Activity />}
              />
              <TopStat
                label="Total"
                value={allComplaints.length}
                icon={<MessageSquare />}
              />
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-4">
        {/* Filters Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative group">
              <select
                name="category"
                value={filters.category}
                onChange={onFilterChange}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c || 'All Categories'}</option>
                ))}
              </select>
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            <div className="relative group">
              <select
                name="status"
                value={filters.status}
                onChange={onFilterChange}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s || 'All Statuses'}</option>
                ))}
              </select>
              <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            <div className="relative group">
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={onFilterChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
              />
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>

            <div className="relative group">
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={onFilterChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
              />
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
            >
              <RefreshCcw size={12} /> Reset Filters
            </button>
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="bg-white rounded-2xl p-20 text-center border border-slate-200 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing issues...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-20 text-center border border-slate-200 shadow-sm">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No complaints found in this view</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <Th>Issue Title</Th>
                    <Th>Category</Th>
                    <Th>Tenant</Th>
                    <Th>PG Entity</Th>
                    <Th>Submitted</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {complaints.map((c, idx) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group hover:bg-slate-50/80 transition-colors"
                      >
                        <Td className="font-black text-slate-900 text-[11px] uppercase tracking-tight">{c.title}</Td>
                        <Td>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200">
                            {c.category}
                          </span>
                        </Td>
                        <Td className="text-[10px] font-bold text-slate-600">{c.tenantName}</Td>
                        <Td className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.pgName}</Td>
                        <Td className="text-[10px] font-bold text-slate-400">{dayjs(c.createdDate).format('DD MMM YYYY')}</Td>
                        <Td><StatusBadge status={c.status} /></Td>
                        <Td>
                          <button
                            onClick={() => openDetails(c)}
                            className="px-4 py-2 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95"
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
                <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="font-black text-slate-900 text-xs uppercase">{c.title}</div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Tag size={10} /> {c.category}
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <Calendar size={10} /> {dayjs(c.createdDate).format('DD MMM')}
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => openDetails(c)}
                      className="w-full px-4 py-2.5 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Lifecycle Status</label>
                    <div className="relative group">
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-xs font-black uppercase tracking-widest bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        {STATUSES.filter(Boolean).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
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
  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 text-left bg-slate-50/50">{children}</th>
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
