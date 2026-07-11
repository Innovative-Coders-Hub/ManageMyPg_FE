import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  Home
} from 'lucide-react'
import SEO from '../components/SEO'

/* ======================
   Animation Variants
====================== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const BASE_URL = 'https://api.managemypg.com'

export default function AdminOwnerDetails() {
  const { id } = useParams()
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
    async function fetchOwner() {
      try {
        setLoading(true)
        const res = await getOwnerCompleteDetails(id)
        // Correctly handle the nested data structure from your API response
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
  }, [id, refreshKey])

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Retrieving Profile...</span>
      </div>
    )
  }

  if (error || !owner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{error || 'Owner not found'}</h2>
        <button onClick={() => navigate('/admin/owners')} className="px-4 py-1.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
          Return to Directory
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      <SEO
        title={owner ? `${owner.fullName} | Owner Details` : 'Owner Verification'}
        description={`Verification and complete profile details for PG owner ${owner?.fullName || ''} on ManageMyPg.`}
        canonical={`/admin/owner/${id}`}
      />
      {/* Top Header Section */}
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Verification Desk"
            subtitle={`Reviewing profile for ${owner.fullName}`}
          >
            <div className="flex items-center gap-1.5">
              <TopStat
                label="Status"
                value={owner.status}
                icon={<ShieldCheck />}
                color={owner.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}
              />
              <TopStat
                label="Units"
                value={pgs.length}
                icon={<Building2 />}
              />
              <button
                onClick={() => navigate('/admin/owners')}
                className="hidden md:inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
              >
                <ChevronLeft size={14} /> Back to Directory
              </button>
            </div>
          </PageHeader>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 pb-12 space-y-6"
      >
        {actionError && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-bold shadow-sm"
        >
          <AlertCircle size={20} />
          {actionError}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Owner Profile Card */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden p-5 md:p-8 relative">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-50/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />

            <div className="relative flex flex-row items-center gap-6 md:gap-8">
              {/* Profile Photo Placeholder */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-slate-100 p-0.5 shadow-lg shadow-slate-200/50 overflow-hidden">
                  {owner.profileImageUrl ? (
                    <img
                      src={`${BASE_URL}${owner.profileImageUrl}`}
                      alt={owner.fullName}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="h-full w-full rounded-2xl bg-white flex items-center justify-center font-black text-2xl md:text-3xl text-indigo-600">
                      {owner.fullName?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Core Details */}
              <div className="flex-1 space-y-2 md:space-y-4 text-left">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{owner.fullName}</h3>
                  <div className="mt-1 flex flex-col md:flex-row md:items-center gap-2">
                    <StatusBadge status={owner.status} />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Platform Partner Identity</p>
                  </div>
                </div>

                <div className="hidden md:grid md:grid-cols-2 gap-y-3 gap-x-8 text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-black text-slate-700">{owner.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                      <p className="text-sm font-black text-slate-700">{owner.phone || 'Not available'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Onboarding Date</p>
                      <p className="text-sm font-black text-slate-700">{dayjs(owner.registeredAt).format('DD MMM YYYY')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Activity size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Activity</p>
                      <p className="text-sm font-black text-slate-700">Recent Login</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Contact Info Grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:hidden">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-black text-slate-700">{owner.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                  <p className="text-sm font-black text-slate-700">{owner.phone || 'Not available'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Registered Address */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-indigo-600" />
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Registered HQ Address</h4>
                </div>
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-sm font-black text-slate-600 leading-relaxed">
                  {owner.address ? (
                    <>
                      <p className="text-slate-900">{owner.address.street}</p>
                      <p>{owner.address.city}, {owner.address.district}</p>
                      <p>{owner.address.state} - {owner.address.pinCode}</p>
                      <p className="text-[9px] uppercase mt-2 text-slate-400 font-black">{owner.address.country}</p>
                    </>
                  ) : (
                    <p className="text-slate-400 italic font-bold">Address details not provided</p>
                  )}
                </div>
              </div>

              {/* Account Security Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Security & Verification</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                    <span>Identity Verified</span>
                    <CheckCircle2 size={12} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                    <span>Business Documents</span>
                    <Activity size={12} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PG Units List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Home size={18} className="text-indigo-600" /> Managed PG Units ({pgs.length})
              </h3>
            </div>

            {pgs.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-[2.5rem] p-8 md:p-12 text-center">
                 <Building2 size={32} className="text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">No PG Units Onboarded Yet</p>
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

        {/* Right: Command Center (Actions) */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl shadow-slate-200 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight">Command Center</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Administrative Control</p>
              </div>
            </div>

            <div className="space-y-3">
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

            <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
                  <Activity size={14} />
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Review Progress</span>
                      <span className="text-[10px] font-black text-indigo-400">75%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: '75%' }} />
                   </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800 text-[10px] font-black text-slate-400 leading-relaxed italic uppercase tracking-wider">
                "Approving this owner will grant them full access to the PG management dashboard and tenant onboarding features."
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reason Modal */}
      <AnimatePresence>
        {showReasonModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReasonModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 100 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />

              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">
                Action Required
              </h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">
                Specify the rationale for <span className="text-indigo-600">"{selectedAction?.action?.replace('_', ' ')}"</span>
              </p>

              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Professional justification (Required)..."
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none"
              />

              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { setShowReasonModal(false); setReason(''); }}
                  className="order-2 sm:order-1 flex-1 px-4 py-2 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition"
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
                  className="order-1 sm:order-2 flex-1 px-4 py-2 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
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
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 100 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 md:p-10 text-center shadow-2xl"
            >
              <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 size={40} />
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Success</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 md:mb-8">{statusResponse.message}</p>

              <div className="bg-slate-50 rounded-2xl p-4 mb-6 md:mb-8 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entity</span>
                   <span className="text-xs font-black text-slate-900 truncate ml-2">{statusResponse.data.ownerName || statusResponse.data.pgName}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">New Status</span>
                   <span className="text-xs font-black text-indigo-600">{statusResponse.data.newStatus}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setStatusResponse(null)
                  setRefreshKey(prev => prev + 1)
                }}
                className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-xl shadow-indigo-100"
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

/* ======================
   Helper Components
====================== */

const TopStat = React.memo(function TopStat({ label, value, icon, color }) {
  return (
    <div className={`px-4 py-1.5 rounded-2xl border flex flex-col items-center justify-center transition-all min-w-[84px] bg-white shadow-sm ${color || 'border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-0.5 text-slate-400">
        {icon && React.isValidElement(icon) ? React.cloneElement(icon, { size: 10 }) : null}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-black text-slate-900 leading-none">{value}</div>
    </div>
  )
})

const StatusBadge = React.memo(function StatusBadge({ status }) {
  const configs = {
    APPROVED: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: CheckCircle2, label: 'Verified' },
    PENDING: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock, label: 'Reviewing' },
    ON_HOLD: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: ShieldCheck, label: 'Suspended' },
    REJECTED: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle, label: 'Rejected' },
    DEACTIVATED: { color: 'bg-slate-50 text-slate-500 border-slate-200', icon: PauseCircle, label: 'Inactive' },
  }

  const config = configs[status?.toUpperCase()] || configs.PENDING
  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-black text-[9px] uppercase tracking-widest ${config.color}`}>
      <Icon size={10} strokeWidth={3} />
      {config.label}
    </div>
  )
})

const PGCard = React.memo(function PGCard({ pg, ownerStatus, onAction }) {
  return (
    <div className="group bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{pg.pgName}</h4>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">UID: {pg.id?.slice(-6)?.toUpperCase()}</p>
        </div>
        <div className="self-start">
          <StatusBadge status={pg.status} />
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 space-y-2">
        <div className="flex items-start gap-2">
          <MapPin size={12} className="text-slate-400 mt-0.5" />
          <p className="text-[11px] font-black text-slate-600 leading-snug">
            {pg.address?.street}, {pg.address?.city}, {pg.address?.state} - {pg.address?.pinCode}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
          <div className="flex items-center gap-2">
            <Building2 size={12} className="text-slate-400" />
            <div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Levels</p>
               <p className="text-[10px] font-black text-slate-800">{pg.totalFloors} Floors</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-slate-400" />
            <div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Occupancy</p>
               <p className="text-[10px] font-black text-slate-800">{pg.occupiedBeds} / {pg.totalBeds} Beds</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
         {pg.status !== 'APPROVED' && (
           <button
             onClick={() => onAction('APPROVE')}
             disabled={ownerStatus !== 'APPROVED'}
             className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition disabled:opacity-30"
           >
             Verify
           </button>
         )}
         {pg.status !== 'ON_HOLD' && (
           <button
             onClick={() => onAction('ON_HOLD')}
             disabled={ownerStatus !== 'APPROVED'}
             className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition disabled:opacity-30"
           >
             Suspend
           </button>
         )}
         {pg.status === 'DEACTIVATED' ? (
           <button
             onClick={() => onAction('REACTIVATE')}
             className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition col-span-2"
           >
             Reactivate
           </button>
         ) : (
           <button
             onClick={() => onAction('DEACTIVATE')}
             className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-600 hover:text-white transition"
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
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-emerald-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white shadow-amber-100',
    rose: 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-rose-100',
  }

  return (
    <button
      onClick={onClick}
      disabled={!active || loading}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-none font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm disabled:opacity-30 disabled:hover:scale-100 group ${variants[variant] || ''}`}
    >
      <span className="flex items-center gap-3">
        <Icon size={16} className="transition-transform group-hover:scale-110" />
        {label}
      </span>
      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
    </button>
  )
})
