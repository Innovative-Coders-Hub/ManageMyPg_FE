import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppScope } from '../context/AppScopeContext'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import dayjs from 'dayjs'
import api from '../api/api'
import { getOwnerCompleteDetails } from '../api/ownerAuth'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  PauseCircle,
  XCircle,
  Building2,
  ChevronLeft,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  Activity,
  ArrowRight,
  Shield,
  Home,
  FileText,
  UserCheck
} from 'lucide-react'
import SEO from '../components/SEO'

/* ======================
   Animation Variants
====================== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

const BASE_URL = 'https://api.managemypg.com'

export default function AdminOwnerDetails() {
  const { id: routeAdminOwnerId } = useParams()
  const { activeAdminOwnerId } = useAppScope()
  const id = activeAdminOwnerId || routeAdminOwnerId
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [owner, setOwner] = useState(null)
  const [pgs, setPgs] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusResponse, setStatusResponse] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    const handleScrollLock = () => {
      if (showReasonModal || showStatusModal) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
    handleScrollLock()
    return () => { document.body.style.overflow = '' }
  }, [showReasonModal, showStatusModal])

  useEffect(() => {
    if (!id) {
      navigate('/admin/owners', { replace: true })
      return
    }
    async function fetchOwner() {
      try {
        setLoading(true)
        const res = await getOwnerCompleteDetails(id)
        const apiData = res.data?.data || res.data

        if (apiData) {
          setOwner(apiData.ownerInfo)
          setPgs(apiData.pgDetails || [])
        } else {
          setError('Owner data not found')
        }
      } catch (e) {
        console.error('Fetch error:', e)
        setError('Unable to load owner details')
      } finally {
        setLoading(false)
      }
    }
    fetchOwner()
  }, [id, refreshKey, navigate])

  async function updateOwnerStatus(action, reason) {
    try {
      setActionLoading(true)
      setActionError('')
      const payload = { ownerId: owner.id, action, reason }
      const res = await api.put('/api/admin/owner/status', payload)
      setStatusResponse(res.data)
      setShowStatusModal(true)
    } catch (e) {
      setActionError(e.response?.data?.message || 'Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  async function updatePgStatus(pgId, action, reason) {
    try {
      setActionLoading(true)
      setActionError('')
      const payload = { pgId, action, reason }
      const res = await api.put('/api/admin/pg/status', payload)
      setStatusResponse(res.data)
      setShowStatusModal(true)
    } catch (e) {
      setActionError(e.response?.data?.message || 'Failed to update PG status')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-9 w-9 text-indigo-600 animate-spin" />
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Retrieving Owner Profile...</p>
        </div>
      </div>
    )
  }

  if (error || !owner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-200/80">
          <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-100">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{error || 'Owner Not Found'}</h2>
          <p className="text-slate-500 text-xs font-medium mb-6">The requested partner profile could not be located in the system.</p>
          <button
            onClick={() => navigate('/admin/owners')}
            className="w-full py-3 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md cursor-pointer"
          >
            Return to Directory
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SEO
        title={owner ? `${owner.fullName} | Owner Details` : 'Owner Verification'}
        description={`Verification and complete profile details for PG owner ${owner?.fullName || ''} on ManageMyPg.`}
        canonical={`/admin/owner/${id}`}
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
            <ShieldCheck size={160} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <button
                onClick={() => navigate('/admin/owners')}
                className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-white text-[9.5px] font-black uppercase tracking-widest mb-3 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} /> Back to Directory
              </button>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white flex items-center gap-3">
                {owner.fullName}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <StatusBadge status={owner.status} />
                <span className="text-slate-400 text-xs font-medium">Registered Platform Partner</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-xl font-black text-[9.5px] uppercase tracking-widest">
                <Building2 size={14} />
                {pgs.length} Managed PG Units
              </div>
            </div>
          </div>
        </div>

        {actionError && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold shadow-2xs"
          >
            <AlertCircle size={18} className="shrink-0" />
            {actionError}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Owner Profile & PGs List */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6 md:space-y-8">
            
            {/* OWNER PROFILE CARD */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-6 md:p-8 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Profile Photo */}
                <div className="h-20 w-20 rounded-2xl bg-indigo-50 border border-indigo-100 p-0.5 shadow-2xs overflow-hidden shrink-0">
                  {owner.profileImageUrl ? (
                    <img
                      src={`${BASE_URL}${owner.profileImageUrl}`}
                      alt={owner.fullName}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-2xl bg-white flex items-center justify-center font-black text-2xl text-indigo-600">
                      {owner.fullName?.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Info Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="h-9 w-9 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 shrink-0">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-xs font-black text-slate-900 truncate">{owner.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="h-9 w-9 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 shrink-0">
                      <Phone size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                      <p className="text-xs font-black text-slate-900 truncate">{owner.phone || 'Not available'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="h-9 w-9 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">Onboarding Date</p>
                      <p className="text-xs font-black text-slate-900 truncate">{dayjs(owner.registeredAt).format('DD MMM YYYY')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div className="h-9 w-9 rounded-lg bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 shrink-0">
                      <UserCheck size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">Account Status</p>
                      <p className="text-xs font-black text-indigo-600 truncate uppercase">{owner.status}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address & Verification Details */}
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={15} className="text-indigo-600" />
                    <h4 className="text-[9.5px] font-black text-slate-900 uppercase tracking-widest">Registered HQ Address</h4>
                  </div>
                  <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 text-xs font-bold text-slate-700 leading-relaxed">
                    {owner.address ? (
                      <>
                        <p className="text-slate-900 font-black">{owner.address.street}</p>
                        <p>{owner.address.city}, {owner.address.district}</p>
                        <p>{owner.address.state} - {owner.address.pinCode}</p>
                        <p className="text-[9px] uppercase mt-2 text-slate-400 font-black">{owner.address.country}</p>
                      </>
                    ) : (
                      <p className="text-slate-400 italic font-bold">Address details not provided</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={15} className="text-emerald-600" />
                    <h4 className="text-[9.5px] font-black text-slate-900 uppercase tracking-widest">Security & Verification</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-700 text-[9.5px] font-black uppercase tracking-widest border border-emerald-100">
                      <span>Identity Status</span>
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-700 text-[9.5px] font-black uppercase tracking-widest border border-blue-100">
                      <span>Business Compliance</span>
                      <Activity size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PG UNITS LIST */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Home size={18} className="text-indigo-600" /> Managed PG Properties ({pgs.length})
                </h3>
              </div>

              {pgs.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
                  <Building2 size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No PG Units Onboarded Yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pgs.map(pg => (
                    <PGCard key={pg.id} pg={pg} ownerStatus={owner.status} onAction={(action) => {
                      setSelectedAction({ type: 'PG', action, pgId: pg.id })
                      setShowReasonModal(true)
                    }} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Command Center Actions */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800 lg:sticky lg:top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-white">Command Center</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verification Control Desk</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <ActionButton
                  label="Approve Profile"
                  icon={CheckCircle2}
                  variant="emerald"
                  active={owner.status !== 'APPROVED'}
                  loading={actionLoading}
                  onClick={() => {
                    setSelectedAction({ type: 'OWNER', action: 'APPROVE' })
                    setShowReasonModal(true)
                  }}
                />

                <ActionButton
                  label="Place On Hold"
                  icon={PauseCircle}
                  variant="amber"
                  active={owner.status !== 'ON_HOLD'}
                  loading={actionLoading}
                  onClick={() => {
                    setSelectedAction({ type: 'OWNER', action: 'ON_HOLD' })
                    setShowReasonModal(true)
                  }}
                />

                <ActionButton
                  label="Reject Partner"
                  icon={XCircle}
                  variant="rose"
                  active={owner.status !== 'REJECTED'}
                  loading={actionLoading}
                  onClick={() => {
                    setSelectedAction({ type: 'OWNER', action: 'REJECT' })
                    setShowReasonModal(true)
                  }}
                />
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[9.5px] font-bold text-slate-300 leading-relaxed italic">
                  "Approving this owner will grant full access to the PG management dashboard and tenant onboarding features."
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reason Modal */}
        <AnimatePresence>
          {showReasonModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowReasonModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden border border-slate-200"
                onClick={e => e.stopPropagation()}
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />

                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-1">
                  Action Required
                </h3>
                <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest mb-5">
                  Specify justification for <span className="text-indigo-600">"{selectedAction?.action?.replace('_', ' ')}"</span>
                </p>

                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Professional rationale (Required)..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all resize-none placeholder:text-slate-400"
                />

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => { setShowReasonModal(false); setReason(''); }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[9.5px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!reason.trim() || actionLoading}
                    onClick={() => {
                      if (selectedAction?.type === 'OWNER') updateOwnerStatus(selectedAction.action, reason.trim())
                      if (selectedAction?.type === 'PG') updatePgStatus(selectedAction.pgId, selectedAction.action, reason.trim())
                      setShowReasonModal(false); setReason('');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                  >
                    Confirm Action
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Status Result Modal */}
        <AnimatePresence>
          {showStatusModal && statusResponse && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm bg-white rounded-3xl p-6 md:p-8 text-center shadow-2xl border border-slate-200"
                onClick={e => e.stopPropagation()}
              >
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <CheckCircle2 size={36} />
                </div>

                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mb-1">Status Updated</h3>
                <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest mb-6">{statusResponse.message}</p>

                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entity</span>
                    <span className="font-black text-slate-900 truncate ml-2 uppercase">{statusResponse.data.ownerName || statusResponse.data.pgName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">New Status</span>
                    <span className="font-black text-indigo-600 uppercase">{statusResponse.data.newStatus}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setStatusResponse(null)
                    setRefreshKey(prev => prev + 1)
                  }}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xs cursor-pointer"
                >
                  Continue Review
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function StatusBadge({ status }) {
  const configs = {
    APPROVED: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2, label: 'Verified Active' },
    PENDING: { color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Clock, label: 'In Review' },
    ON_HOLD: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: ShieldCheck, label: 'Suspended' },
    REJECTED: { color: 'bg-rose-50 text-rose-600 border-rose-100', icon: XCircle, label: 'Rejected' },
    DEACTIVATED: { color: 'bg-slate-50 text-slate-500 border-slate-200', icon: PauseCircle, label: 'Inactive' },
  }

  const config = configs[status?.toUpperCase()] || configs.PENDING
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[8.5px] font-black uppercase tracking-widest ${config.color}`}>
      <Icon size={11} />
      {config.label}
    </div>
  )
}

const PGCard = React.memo(function PGCard({ pg, ownerStatus, onAction }) {
  return (
    <div className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{pg.pgName}</h4>
            <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mt-0.5">UID: {pg.id?.slice(-6)?.toUpperCase()}</p>
          </div>
          <StatusBadge status={pg.status} />
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 mb-4 space-y-2">
          <div className="flex items-start gap-1.5">
            <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
            <p className="text-[10px] font-bold text-slate-700 leading-snug">
              {pg.address?.street}, {pg.address?.city}, {pg.address?.state} - {pg.address?.pinCode}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
            <div className="flex items-center gap-1.5">
              <Building2 size={12} className="text-indigo-500" />
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Levels</p>
                <p className="text-[10px] font-black text-slate-900">{pg.totalFloors} Floors</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-500" />
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Occupancy</p>
                <p className="text-[10px] font-black text-slate-900">{pg.occupiedBeds} / {pg.totalBeds} Beds</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        {pg.status !== 'APPROVED' && (
          <button
            onClick={() => onAction('APPROVE')}
            disabled={ownerStatus !== 'APPROVED'}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[8.5px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
          >
            Verify
          </button>
        )}
        {pg.status !== 'ON_HOLD' && (
          <button
            onClick={() => onAction('ON_HOLD')}
            disabled={ownerStatus !== 'APPROVED'}
            className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[8.5px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
          >
            Suspend
          </button>
        )}
        {pg.status === 'DEACTIVATED' ? (
          <button
            onClick={() => onAction('REACTIVATE')}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[8.5px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all col-span-2 cursor-pointer"
          >
            Reactivate
          </button>
        ) : (
          <button
            onClick={() => onAction('DEACTIVATE')}
            className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[8.5px] font-black uppercase tracking-widest hover:bg-slate-600 hover:text-white transition-all cursor-pointer"
          >
            Disable
          </button>
        )}
      </div>
    </div>
  )
})

const ActionButton = React.memo(function ActionButton({ label, icon: Icon, variant, active, loading, onClick }) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-100/80',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white border-amber-100/80',
    rose: 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-100/80',
  }

  return (
    <button
      onClick={onClick}
      disabled={!active || loading}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-[9.5px] font-black uppercase tracking-widest transition-all duration-300 shadow-2xs disabled:opacity-30 disabled:hover:scale-100 group cursor-pointer ${variants[variant] || ''}`}
    >
      <span className="flex items-center gap-2.5">
        <Icon size={15} className="transition-transform group-hover:scale-110" />
        {label}
      </span>
      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
    </button>
  )
})
