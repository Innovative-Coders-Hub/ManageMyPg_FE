import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppScope } from '../context/AppScopeContext'
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import SEO from '../components/SEO'
import {
  Users,
  UserCheck,
  UserMinus,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  CheckCircle2,
  X,
  Plus,
  Loader2,
  Building2,
  Briefcase,
  IndianRupee,
  User,
  Trash2,
  Edit2,
  Camera,
  MoreVertical,
  Clock,
  ShieldAlert,
  MessageSquare,
  Eye,
  Tag,
  ShieldCheck
} from 'lucide-react'
import {
  getWorkers,
  getAllPgs,
  createWorker,
  updateWorker,
  updateWorkerStatus,
  deleteWorker,
  updateWorkerImage
} from '../api/ownerAuth'
import CustomDropdown from '../components/CustomDropdown'
import ConfirmModal from '../components/ConfirmModal'

/* =====================================================
   CONSTANTS & HELPERS
===================================================== */
const ROLES = ['MANAGER', 'SUPERVISOR', 'MAINTENANCE', 'COOK']
const STATUSES = ['ACTIVE', 'INACTIVE', 'ON_LEAVE']
const GENDERS = ['MALE', 'FEMALE', 'OTHER']

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.managemypg.com/managemypg'

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('') || '?'

const getFullImageUrl = (path) => {
  if (!path) return null
  return path.startsWith('http') ? path : `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
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

function WorkerAvatar({ name, profileImageUrl, status, size = "w-12 h-12" }) {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [profileImageUrl])

  const fullImageUrl = getFullImageUrl(profileImageUrl)

  return (
    <div className={`shrink-0 relative ${size} rounded-2xl border shadow-sm overflow-hidden bg-indigo-600 text-white border-indigo-500 flex items-center justify-center`}>
      {fullImageUrl && !imageError ? (
        <img
          src={fullImageUrl}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-xs sm:text-sm font-black uppercase tracking-tight">{getInitials(name)}</span>
      )}
    </div>
  )
}

/* =====================================================
   MAIN WORKERS PAGE COMPONENT
===================================================== */
export default function Workers() {
  const navigate = useNavigate()
  const { activePgId: pgId, setActivePgId } = useAppScope()

  const [pgs, setPgs] = useState([])
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingWorker, setEditingWorker] = useState(null)
  const [workerToDelete, setWorkerToDelete] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    role: 'MAINTENANCE',
    salary: '',
    joiningDate: dayjs().format('YYYY-MM-DD'),
    gender: 'MALE',
    address: '',
    aadhaarNumber: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    async function init() {
      try {
        const pgsData = await getAllPgs()
        setPgs(pgsData || [])

        if (!pgId && pgsData && pgsData.length > 0) {
          setActivePgId(pgsData[0].id)
          return
        }
      } catch (e) {
        console.error(e)
      }
    }
    init()
  }, [pgId, setActivePgId])

  useEffect(() => {
    if (pgId) fetchWorkers()
  }, [pgId, roleFilter, statusFilter])

  async function fetchWorkers() {
    try {
      setLoading(true)
      const params = {}
      if (roleFilter !== 'ALL') params.role = roleFilter
      if (statusFilter !== 'ALL') params.status = statusFilter

      const res = await getWorkers(pgId, params)
      setWorkers(res.data || [])
    } catch (e) {
      toast.error('Failed to fetch workers')
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkers = useMemo(() => {
    if (!searchQuery.trim()) return workers
    const q = searchQuery.toLowerCase()
    return workers.filter(w =>
      (w.fullName || '').toLowerCase().includes(q) ||
      (w.mobileNumber || '').includes(q) ||
      (w.role || '').toLowerCase().includes(q)
    )
  }, [workers, searchQuery])

  const stats = useMemo(() => {
    return {
      total: workers.length,
      active: workers.filter(w => w.status === 'ACTIVE').length,
      onLeave: workers.filter(w => w.status === 'ON_LEAVE').length,
      inactive: workers.filter(w => w.status === 'INACTIVE').length,
    }
  }, [workers])

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!formData.fullName || !formData.mobileNumber || !formData.salary) {
      toast.error('Please fill all required fields')
      return
    }

    setSubmitting(true)
    try {
      const payload = { ...formData, pgId, salary: parseFloat(formData.salary) }
      await createWorker(payload, selectedFile)
      toast.success('Worker registered successfully')
      setShowAddModal(false)
      resetForm()
      fetchWorkers()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add worker')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        fullName: formData.fullName,
        role: formData.role,
        salary: parseFloat(formData.salary),
        address: formData.address
      }
      await updateWorker(editingWorker.id, payload)
      if (selectedFile) {
        await updateWorkerImage(editingWorker.id, selectedFile)
      }
      toast.success('Worker details updated')
      setEditingWorker(null)
      resetForm()
      fetchWorkers()
    } catch (e) {
      toast.error('Failed to update worker')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (workerId, newStatus) => {
    try {
      await updateWorkerStatus(workerId, newStatus)
      toast.success(`Status updated to ${newStatus}`)
      fetchWorkers()
    } catch (e) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteWorker(workerToDelete.id)
      toast.success('Worker deactivated successfully')
      setWorkerToDelete(null)
      fetchWorkers()
    } catch (e) {
      toast.error('Failed to deactivate worker')
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      mobileNumber: '',
      role: 'MAINTENANCE',
      salary: '',
      joiningDate: dayjs().format('YYYY-MM-DD'),
      gender: 'MALE',
      address: '',
      aadhaarNumber: ''
    })
    setSelectedFile(null)
  }

  const openEdit = (worker) => {
    setEditingWorker(worker)
    setFormData({
      fullName: worker.fullName || '',
      mobileNumber: worker.mobileNumber || '',
      role: worker.role || 'MAINTENANCE',
      salary: worker.salary || '',
      joiningDate: worker.joiningDate || dayjs().format('YYYY-MM-DD'),
      gender: worker.gender || 'MALE',
      address: worker.address || '',
      aadhaarNumber: worker.aadhaarNumber || ''
    })
  }

  if (loading && workers.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Accessing Personnel Directory...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SEO
        title="Worker Management - Staff Roster"
        description="Manage your PG staff, track roles, salaries, and work statuses across all PG properties."
      />

      {/* STICKY HEADER & PORTFOLIO METRICS */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="shrink-0">
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <Briefcase size={14} />
                <span>Personnel Roster</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 whitespace-nowrap">
                Staff & Workers
              </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
              <TopStat label="Total Staff" value={stats.total} icon={Users} />
              <TopStat label="Active" value={stats.active} icon={UserCheck} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
              <TopStat label="Inactive" value={stats.inactive} icon={UserMinus} colorClass="text-rose-600" bgClass="bg-rose-50" />
              <TopStat label="On Leave" value={stats.onLeave} icon={Clock} colorClass="text-amber-600" bgClass="bg-amber-50" />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* TOOLBAR: PROPERTY SCOPE, SEARCH, ROLE & STATUS FILTERS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 w-full">
            <CustomDropdown
              label="Property Scope"
              value={pgId || ''}
              options={pgs.map(pg => ({ id: pg.id, label: pg.pgName }))}
              onChange={(val) => setActivePgId(val)}
              icon={Building2}
              className="w-full sm:w-56"
            />

            <div className="relative flex-1 w-full">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <CustomDropdown
              label="Staff Role"
              value={roleFilter}
              options={[
                { id: 'ALL', label: 'All Roles' },
                ...ROLES.map(r => ({ id: r, label: r }))
              ]}
              onChange={setRoleFilter}
              icon={Tag}
              className="w-full sm:w-48"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <FilterPill
                label="Active"
                icon={UserCheck}
                active={statusFilter === 'ACTIVE'}
                onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
                activeClass="bg-emerald-600 border-emerald-500 text-white"
              />
              <FilterPill
                label="Inactive"
                icon={UserMinus}
                active={statusFilter === 'INACTIVE'}
                onClick={() => setStatusFilter(statusFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
                activeClass="bg-slate-900 border-slate-800 text-white"
              />
              <FilterPill
                label="On Leave"
                icon={Clock}
                active={statusFilter === 'ON_LEAVE'}
                onClick={() => setStatusFilter(statusFilter === 'ON_LEAVE' ? 'ALL' : 'ON_LEAVE')}
                activeClass="bg-amber-600 border-amber-500 text-white"
              />
            </div>

            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Plus size={15} /> Add Staff
            </button>
          </div>
        </div>

        {/* WORKERS GRID */}
        <div>
          <AnimatePresence mode="popLayout">
            {filteredWorkers.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-24 text-center px-6 shadow-sm"
              >
                <div className="mx-auto w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                  <Briefcase size={36} />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Staff Members Found</h3>
                <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-sm mx-auto">
                  Try adjusting search or role filters, or add a new staff member.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWorkers.map(worker => (
                  <motion.div
                    key={worker.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    onClick={() => openEdit(worker)}
                    className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden h-full"
                  >
                    <div>
                      {/* STATUS ACCENT TOP BAR */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                        worker.status === 'ACTIVE' ? 'bg-emerald-500' :
                        worker.status === 'ON_LEAVE' ? 'bg-amber-500' :
                        'bg-slate-300'
                      }`} />

                      {/* CARD HEADER: AVATAR, NAME & ROLE */}
                      <div className="flex items-start justify-between gap-3 mb-4 pt-1">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <WorkerAvatar
                            name={worker.fullName}
                            profileImageUrl={worker.profileImageUrl}
                            status={worker.status}
                          />
                          <div className="min-w-0">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate leading-tight group-hover:text-indigo-600 transition-colors">
                              {worker.fullName}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                                {worker.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border shrink-0 ${
                          worker.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          worker.status === 'ON_LEAVE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {worker.status === 'ACTIVE' ? 'Active' : worker.status === 'INACTIVE' ? 'Inactive' : 'On Leave'}
                        </span>
                      </div>

                      {/* CONTACT & SALARY PANE */}
                      <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100 mb-4">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mobile</span>
                          <span className="font-black text-slate-900">{worker.mobileNumber}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Monthly Salary</span>
                          <span className="font-black text-emerald-600">₹{worker.salary?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Joining Date</span>
                          <span className="font-bold text-slate-700">{dayjs(worker.joiningDate).format('DD MMM YYYY')}</span>
                        </div>
                      </div>
                    </div>

                    {/* ACTION CONTROLS */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex-1 flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                        {['ACTIVE', 'INACTIVE', 'ON_LEAVE'].map(s => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(worker.id, s)}
                            className={`flex-1 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${
                              worker.status === s
                                ? 'bg-white text-indigo-600 shadow-2xs'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {s === 'ACTIVE' ? 'Act' : s === 'INACTIVE' ? 'Inact' : 'Leave'}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => openEdit(worker)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Edit Details"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        onClick={() => setWorkerToDelete(worker)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Deactivate"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Slide-Over Drawer - Add / Edit Staff */}
      <AnimatePresence>
        {(showAddModal || editingWorker) && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddModal(false); setEditingWorker(null); }}
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
                      <Briefcase size={20} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">
                        {editingWorker ? 'Update Staff Member' : 'Add Staff Member'}
                      </h3>
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-0.5 truncate">
                        {editingWorker ? 'Update staff details' : 'Add new staff member'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowAddModal(false); setEditingWorker(null); }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
                    title="Close Drawer"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Drawer Form Body */}
                <form onSubmit={editingWorker ? handleEditSubmit : handleAddSubmit} className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/30">
                    
                    {/* PROFILE PHOTO CARD */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-xs flex items-center justify-center overflow-hidden">
                          {selectedFile ? (
                            <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-cover" alt="Preview" />
                          ) : editingWorker?.profileImageUrl ? (
                            <img src={getFullImageUrl(editingWorker.profileImageUrl)} className="w-full h-full object-cover" alt="Profile" />
                          ) : (
                            <User size={32} className="text-indigo-400" />
                          )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-900 text-white rounded-xl shadow-md border-2 border-white flex items-center justify-center cursor-pointer hover:bg-indigo-600 transition-all">
                          <Camera size={14} />
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                          />
                        </label>
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2.5">
                        Profile Photo (Optional)
                      </p>
                    </div>

                    {/* PERSONAL & WORK DETAILS */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-3">
                        Staff Details
                      </h4>

                      <FormInput
                        label="Full Name"
                        value={formData.fullName}
                        onChange={v => setFormData({...formData, fullName: v})}
                        placeholder="e.g. Ramesh Kumar"
                        required
                      />

                      <FormInput
                        label="Mobile Number"
                        value={formData.mobileNumber}
                        onChange={v => setFormData({...formData, mobileNumber: v.replace(/\D/g, '').slice(0, 10)})}
                        placeholder="10-digit phone number"
                        disabled={!!editingWorker}
                        required
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <CustomDropdown
                          label="Staff Role"
                          value={formData.role}
                          options={ROLES.map(r => ({ id: r, label: r }))}
                          onChange={v => setFormData({...formData, role: v})}
                          icon={Briefcase}
                          className="w-full"
                          labelBg="bg-white"
                        />

                        <CustomDropdown
                          label="Gender"
                          value={formData.gender}
                          options={GENDERS.map(g => ({ id: g, label: g }))}
                          onChange={v => setFormData({...formData, gender: v})}
                          icon={User}
                          className="w-full"
                          labelBg="bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormInput
                          label="Monthly Salary (₹)"
                          type="number"
                          value={formData.salary}
                          onChange={v => setFormData({...formData, salary: v})}
                          placeholder="e.g. 15000"
                          required
                        />

                        <FormInput
                          label="Joining Date"
                          type="date"
                          value={formData.joiningDate}
                          onChange={v => setFormData({...formData, joiningDate: v})}
                          disabled={!!editingWorker}
                          required
                        />
                      </div>

                      {!editingWorker && (
                        <FormInput
                          label="Aadhaar Number"
                          value={formData.aadhaarNumber}
                          onChange={v => setFormData({...formData, aadhaarNumber: v.replace(/\D/g, '').slice(0, 12)})}
                          placeholder="12-digit Aadhaar number"
                          required
                        />
                      )}

                      <FormInput
                        label="Residential Address"
                        value={formData.address}
                        onChange={v => setFormData({...formData, address: v})}
                        placeholder="Full home / permanent address"
                        required
                      />
                    </div>
                  </div>

                  {/* Drawer Fixed Footer Bar */}
                  <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-3 shadow-lg">
                    <button
                      type="button"
                      onClick={() => { setShowAddModal(false); setEditingWorker(null); }}
                      className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-40 shadow-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      {submitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      {submitting ? 'Saving...' : (editingWorker ? 'Save Updates' : 'Register Staff')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        open={!!workerToDelete}
        title="Deactivate Staff Member"
        message={`Are you sure you want to deactivate ${workerToDelete?.fullName}? This staff member will be moved to INACTIVE status.`}
        confirmText="Deactivate"
        onConfirm={handleDelete}
        onCancel={() => setWorkerToDelete(null)}
      />
    </div>
  )
}

function FormInput({ label, value, onChange, type = 'text', placeholder, required, disabled }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300 disabled:opacity-50"
      />
    </div>
  )
}
