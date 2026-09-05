import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wrench,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Tag,
  MessageSquare,
  Building2,
  User,
  Calendar,
  MoreVertical,
  Activity
} from 'lucide-react'
import CustomDropdown from './CustomDropdown'
import {
  getTenantComplaints,
  createComplaint
} from '../api/ownerAuth'

const COMPLAINT_CATEGORIES = [
  'ELECTRICAL',
  'WATER',
  'CLEANING',
  'WIFI',
  'MAINTENANCE',
  'FOOD',
  'PLUMBING',
  'PARKING',
  'OTHER'
]

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

export default function TenantComplaints({ pgId }) {
  const [complaints, setComplaints] = useState([])
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: ''
  })

  useEffect(() => {
    fetchComplaints(page)
  }, [page])

  const fetchComplaints = async (pageNo) => {
    try {
      setLoading(true)
      const res = await getTenantComplaints(pageNo, 5)
      setComplaints(res.content || [])
      setTotalPages(res.totalPages || 0)
    } finally {
      setLoading(false)
    }
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const submit = async () => {
    if (!form.title || !form.category) {
      return
    }

    try {
      setSubmitting(true)
      const created = await createComplaint({
        pgId,
        title: form.title,
        description: form.description || null,
        category: form.category,
        complaintImageUrl: null
      })

      setComplaints(prev => [created, ...prev])
      setForm({ title: '', description: '', category: '' })
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-visible">
      {/* Header Area */}
      <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-t-2xl">
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench size={18} className="text-indigo-600" />
            Support Requests
          </h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Raise and track maintenance issues</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xs active:scale-95 cursor-pointer"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Close' : '+ New Request'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50/50 border-b border-slate-100 overflow-visible"
          >
            <div className="p-5 md:p-6 pb-20">
              <div className="max-w-3xl space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Title *</label>
                    <input
                      name="title"
                      placeholder="e.g. Fan not working, Water leak"
                      value={form.title}
                      onChange={onChange}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 h-[46px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Category *</label>
                    <CustomDropdown
                      value={form.category}
                      options={[
                        { id: '', label: 'Select Category...' },
                        ...COMPLAINT_CATEGORIES.map(c => ({
                          id: c,
                          label: c.charAt(0) + c.slice(1).toLowerCase()
                        }))
                      ]}
                      onChange={(val) => setForm(prev => ({ ...prev, category: val }))}
                      icon={Tag}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Details</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Describe the issue in detail..."
                    value={form.description}
                    onChange={onChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={submit}
                    disabled={submitting || !form.title || !form.category}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-40 flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    {submitting ? <Activity size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Area */}
      <div className="bg-white rounded-b-2xl">
        {loading ? (
          <div className="px-6 py-12 text-center space-y-3">
            <Activity className="h-7 w-7 text-indigo-600 animate-spin mx-auto" />
            <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">Loading requests...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="px-6 py-16 text-center space-y-3">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">No Support Requests</h4>
            <p className="text-xs text-slate-400 font-bold max-w-xs mx-auto">You haven't raised any maintenance requests yet.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-3.5">Issue Title</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Created Date</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  {complaints.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-6 py-3.5">
                        <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{c.title}</div>
                        <div className="text-[8.5px] text-slate-400 font-bold truncate max-w-[220px]">
                          {c.description || 'No additional details'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[8.5px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60 uppercase">
                          {c.category?.charAt(0) + c.category?.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-black text-slate-700">{dayjs(c.createdDate).format('DD MMM YYYY')}</div>
                        <div className="text-[8.5px] text-slate-400 font-black uppercase">{dayjs(c.createdDate).format('hh:mm A')}</div>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                          title="View Details"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {complaints.map(c => (
                <div key={c.id} className="p-5 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-0.5">
                      <div className="font-black text-slate-900 text-sm uppercase">{c.title}</div>
                      <div className="text-[8.5px] text-slate-400 font-black uppercase tracking-widest">{c.category}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                      Created: {dayjs(c.createdDate).format('DD MMM YYYY')}
                    </div>
                    <button
                      onClick={() => setSelectedComplaint(c)}
                      className="text-[9.5px] font-black text-indigo-600 uppercase tracking-widest hover:underline cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Control */}
            <div className="p-4 px-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Page <span className="text-slate-900">{page + 1}</span> of <span className="text-slate-900">{totalPages || 1}</span>
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer shadow-2xs"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer shadow-2xs"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Detail View */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black tracking-tight text-white uppercase truncate">{selectedComplaint.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">{selectedComplaint.category}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-600" />
                      <StatusBadge status={selectedComplaint.status} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/30">
                <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <DetailItem icon={User} label="Tenant" value={selectedComplaint.tenantName} />
                  <DetailItem icon={Building2} label="PG Name" value={selectedComplaint.pgName} />
                  <DetailItem icon={Calendar} label="Date Created" value={dayjs(selectedComplaint.createdDate).format('DD MMM YYYY')} />
                  <DetailItem icon={History} label="Updated On" value={dayjs(selectedComplaint.updatedDate).format('DD MMM YYYY')} />
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag size={13} />
                    Description
                  </h4>
                  <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-xs font-bold text-slate-700 leading-relaxed">
                    "{selectedComplaint.description || 'No additional details provided for this request.'}"
                  </div>
                </div>

                {selectedComplaint.resolutionNotes && (
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                      <CheckCircle2 size={13} />
                      Resolution Notes
                    </h4>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs font-bold text-emerald-800 leading-relaxed">
                      {selectedComplaint.resolutionNotes}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200/80 bg-white flex justify-end">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[9.5px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const configs = {
    OPEN: { label: 'Open', style: 'bg-amber-50 text-amber-600 border-amber-100', icon: AlertCircle },
    ASSIGNED: { label: 'In Progress', style: 'bg-blue-50 text-blue-600 border-blue-100', icon: Activity },
    COMPLETED: { label: 'Resolved', style: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2 }
  }

  const config = configs[status] || configs.OPEN
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border ${config.style}`}>
      <Icon size={11} />
      {config.label}
    </span>
  )
}

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1 text-slate-400">
      <Icon size={12} />
      <span className="text-[8.5px] font-black uppercase tracking-widest leading-none">{label}</span>
    </div>
    <div className="text-xs font-black text-slate-900 truncate">{value || '—'}</div>
  </div>
)
