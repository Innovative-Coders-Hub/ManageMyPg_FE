import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
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
  DollarSign,
  User,
  Trash2,
  Edit2,
  Camera,
  MoreVertical,
  Clock,
  ShieldAlert,
  MessageSquare,
  Eye,
  Tag
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

function FilterPill({ active, onClick, label, icon: Icon, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
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

function WorkerAvatar({ name, profileImageUrl, status }) {
  const [imageError, setImageError] = useState(false)
  const fullImageUrl = getFullImageUrl(profileImageUrl)

  const initials = name
    ? name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?'

  const avatarColors = [
    'bg-orange-500', 'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-cyan-500'
  ]
  const avatarBg = status === 'INACTIVE' ? 'bg-slate-400' : avatarColors[Math.abs(name?.length || 0) % avatarColors.length]

  return (
    <div className={`shrink-0 relative w-12 h-12 sm:w-16 sm:h-16 overflow-hidden rounded-2xl border-2 border-white shadow-md flex items-center justify-center text-white font-black ${avatarBg}`}>
      {fullImageUrl && !imageError ? (
        <img
          src={fullImageUrl}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-base sm:text-xl tracking-tighter">{initials}</span>
      )}
      {/* Status Dot */}
      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm sm:hidden ${
        status === 'ACTIVE' ? 'bg-emerald-500' :
        status === 'ON_LEAVE' ? 'bg-orange-500' :
        'bg-slate-400'
      }`} />
    </div>
  )
}

export default function Workers() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pgId = searchParams.get('pgId')

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
      if (!pgId) {
        try {
          const pgs = await getAllPgs()
          if (pgs?.length > 0) {
            navigate(`?pgId=${pgs[0].id}`, { replace: true })
          }
        } catch (e) {
          console.error(e)
        }
        return
      }
      fetchWorkers()
    }
    init()
  }, [pgId])

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

  // Refetch when filters change
  useEffect(() => {
    if (pgId) fetchWorkers()
  }, [roleFilter, statusFilter])

  const filteredWorkers = useMemo(() => {
    if (!searchQuery.trim()) return workers
    const q = searchQuery.toLowerCase()
    return workers.filter(w =>
      w.fullName.toLowerCase().includes(q) ||
      w.mobileNumber.includes(q)
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
    setSubmitting(true)
    try {
      const payload = { ...formData, pgId, salary: parseFloat(formData.salary) }
      await createWorker(payload, selectedFile)
      toast.success('Worker added successfully')
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
      toast.success('Worker updated')
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
      toast.success('Worker deactivated')
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing Personnel Files...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Worker Management"
            subtitle="PG staff management"
          >
            <div className="flex flex-nowrap items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
              <TopStat label="Total" value={stats.total} icon={Users} />
              <TopStat label="Active" value={stats.active} icon={UserCheck} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
              <TopStat label="Inactive" value={stats.inactive} icon={UserMinus} colorClass="text-rose-600" bgClass="bg-rose-50" />
              <TopStat label="Onleave" value={stats.onLeave} icon={Clock} colorClass="text-amber-600" bgClass="bg-amber-50" />
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex flex-col gap-6">
          {/* Toolbar */}
          <div className="bg-white border border-slate-200 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1 group w-full">
              <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">Search Directory</label>
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 z-10">
                <Search size={18} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Name, Phone or Role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-rose-500 z-10"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="shrink-0">
              <CustomDropdown
                label="Staff Role"
                value={roleFilter}
                options={ROLES.map(r => ({ id: r, label: r }))}
                onChange={setRoleFilter}
                icon={Tag}
                className="w-full md:w-56"
                labelBg="bg-white"
                showAll={true}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0">
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
                label="Onleave"
                icon={Clock}
                active={statusFilter === 'ON_LEAVE'}
                onClick={() => setStatusFilter(statusFilter === 'ON_LEAVE' ? 'ALL' : 'ON_LEAVE')}
                activeClass="bg-orange-600 border-orange-500 text-white"
              />
            </div>

            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center justify-center gap-2 h-[52px] px-6 bg-slate-900 text-white rounded-2xl text-[8px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-lg active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus size={16} /> Add Worker
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredWorkers.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-black text-slate-900 uppercase">No Workers Found</h3>
                  <p className="text-slate-500 text-sm font-medium">Try adjusting your filters or add a new staff member.</p>
                </div>
              ) : (
                filteredWorkers.map(worker => (
                  <motion.div
                    key={worker.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    onClick={() => openEdit(worker)}
                    className={`group rounded-[2rem] border p-5 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col items-stretch gap-4 cursor-pointer hover:-translate-y-1 active:scale-[0.99] h-full relative overflow-hidden ${
                      worker.status === 'ACTIVE' ? 'bg-gradient-to-br from-white to-emerald-50/30 border-slate-200 hover:border-emerald-200' :
                      worker.status === 'ON_LEAVE' ? 'bg-gradient-to-br from-white to-amber-50/30 border-slate-200 hover:border-amber-200' :
                      'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Status Indicator Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300 ${
                      worker.status === 'ACTIVE' ? 'bg-emerald-500' :
                      worker.status === 'ON_LEAVE' ? 'bg-amber-500' :
                      'bg-slate-300'
                    }`} />
                    {/* Header: Avatar + Identity */}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <WorkerAvatar
                          name={worker.fullName}
                          profileImageUrl={worker.profileImageUrl}
                          status={worker.status}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-tight truncate leading-tight">
                            {worker.fullName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                            <Briefcase size={12} className="text-indigo-600" />
                          </div>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">
                            {worker.role}
                          </span>
                        </div>
                      </div>

                    <div className="flex-1 min-w-0 flex flex-col items-end gap-2">
                        <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          worker.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                          worker.status === 'ON_LEAVE' ? 'bg-orange-500/10 text-orange-700 border-orange-500/20' :
                          'bg-slate-500/10 text-slate-600 border-slate-500/20'
                        }`}>
                          {worker.status === 'ACTIVE' ? 'Active' : worker.status === 'INACTIVE' ? 'Inactive' : 'Onleave'}
                        </span>
                        <div className="flex items-center gap-2 text-slate-900">
                          <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                            <Phone size={14} className="text-emerald-600" />
                          </div>
                          <span className="text-[17px] font-black tracking-tight">
                            {worker.mobileNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Salary & Joining Row */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Salary</span>
                        <span className="text-xs font-black text-slate-900">₹{worker.salary?.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Joined</span>
                        <span className="text-xs font-black text-slate-800">
                          {dayjs(worker.joiningDate).format('DD MMM YY')}
                        </span>
                      </div>
                    </div>

                    {/* Action Row - Unified for all screens */}
                    <div className="mt-auto flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex-1 flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                        {['ACTIVE', 'INACTIVE', 'ON_LEAVE'].map(s => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(worker.id, s)}
                            className={`flex-1 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all ${
                              worker.status === s
                                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {s === 'ACTIVE' ? 'Act' : s === 'INACTIVE' ? 'Inact' : 'Leave'}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setWorkerToDelete(worker)}
                        className="p-2.5 bg-rose-500/10 text-rose-600 rounded-2xl border border-rose-500/20 hover:bg-rose-500/20 transition-all active:scale-95 flex items-center justify-center shrink-0"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => openEdit(worker)}
                        className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/20 hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center shrink-0"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingWorker) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => { setShowAddModal(false); setEditingWorker(null); }}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <form onSubmit={editingWorker ? handleEditSubmit : handleAddSubmit}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                    {editingWorker ? <Edit2 size={20} /> : <Plus size={20} />}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">
                      {editingWorker ? 'Update Worker' : 'Register New Worker'}
                    </h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      Staff Member Details
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingWorker(null); }}
                  className="p-2 bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all border border-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image Upload */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center pb-4 border-b border-dashed border-slate-100">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-white shadow-inner flex items-center justify-center overflow-hidden">
                         {selectedFile ? (
                          <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-cover" alt="Preview" />
                        ) : editingWorker?.profileImageUrl ? (
                          <img src={getFullImageUrl(editingWorker.profileImageUrl)} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                          <User size={28} className="text-slate-300" />
                        )}
                      </div>
                      <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 text-white rounded-lg shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:bg-slate-900 transition-all">
                        <Camera size={14} />
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">Profile Photo (Optional)</p>
                  </div>

                  <FormInput
                    label="Full Name"
                    value={formData.fullName}
                    onChange={v => setFormData({...formData, fullName: v})}
                    placeholder="Enter full name"
                    required
                  />

                  <FormInput
                    label="Mobile Number"
                    value={formData.mobileNumber}
                    onChange={v => setFormData({...formData, mobileNumber: v.replace(/\D/g, '').slice(0, 10)})}
                    placeholder="10-digit number"
                    disabled={!!editingWorker}
                    required
                  />

                  <CustomDropdown
                    label="Work Role"
                    value={formData.role}
                    options={ROLES}
                    onChange={v => setFormData({...formData, role: v})}
                    icon={Briefcase}
                    showAll={false}
                    className="w-full"
                    labelBg="bg-white"
                  />

                  <FormInput
                    label="Monthly Salary (₹)"
                    type="number"
                    value={formData.salary}
                    onChange={v => setFormData({...formData, salary: v})}
                    placeholder="15000"
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

                  <CustomDropdown
                    label="Gender"
                    value={formData.gender}
                    options={GENDERS}
                    onChange={v => setFormData({...formData, gender: v})}
                    icon={User}
                    showAll={false}
                    className="w-full"
                    labelBg="bg-white"
                  />

                  {!editingWorker && (
                    <FormInput
                      label="Aadhaar Number"
                      value={formData.aadhaarNumber}
                      onChange={v => setFormData({...formData, aadhaarNumber: v.replace(/\D/g, '').slice(0, 12)})}
                      placeholder="12 digit number"
                      required
                    />
                  )}

                  <div className="md:col-span-2">
                    <FormInput
                      label="Residential Address"
                      value={formData.address}
                      onChange={v => setFormData({...formData, address: v})}
                      placeholder="Full home address..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingWorker(null); }}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[1.5] px-4 py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="animate-spin" size={12} /> Processing...</>
                  ) : (
                    <>{editingWorker ? 'Save Updates' : 'Register Worker'}</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!workerToDelete}
        title="Deactivate Worker"
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
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300 disabled:opacity-50"
      />
    </div>
  )
}
