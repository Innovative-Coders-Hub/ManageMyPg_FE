import React, { useEffect, useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  User,
  Home,
  MapPin,
  CreditCard,
  Clock,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Calendar,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Fingerprint,
  History,
  Activity,
  Users,
  Droplets,
  Briefcase,
  FileText,
  X,
  Camera
} from 'lucide-react'
import { getTenantDetails, ownerLogout, uploadTenantProfileImage } from '../api/ownerAuth'
import TenantComplaints from '../components/TenantComplaints'
import TenantHeader from '../components/TenantHeader'
import ProfileImageCropper from '../components/models/ProfileImageCropper'

const BASE_URL = 'https://api.managemypg.com/managemypg'

/* =======================
   Animation Variants
======================= */
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

/* =======================
   Components
======================= */

const StatCard = ({ title, value, icon: Icon, gradient, subtitle }) => (
  <motion.div
    variants={itemVariants}
    className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03] pointer-events-none`} />
    <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.08] transition-transform duration-500 group-hover:scale-150`} />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-[10px] font-bold text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-current/20`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
    </div>
  </motion.div>
)

const InfoRow = ({ icon: Icon, label, value, color = "text-slate-600" }) => (
  <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
    <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm group-hover:text-indigo-600 transition-all">
      <Icon size={18} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className={`text-sm font-bold truncate ${color}`}>{value || '—'}</p>
    </div>
  </div>
)

export default function TenantDashboard() {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [rawImage, setRawImage] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchTenant() {
      try {
        const tenantId = localStorage.getItem('tenantId')
        if (!tenantId) {
          throw new Error('Tenant ID not found')
        }
        const data = await getTenantDetails(tenantId)
        setTenant(data.tenantDetails || data)
      } catch (e) {
        console.error(e)
        setError('Failed to load dashboard. Please sign in again.')
      } finally {
        setLoading(false)
      }
    }
    fetchTenant()
  }, [])

  const handleLogout = async () => {
    try {
      await ownerLogout()
    } finally {
      localStorage.clear()
      navigate('/manage/mypg/signin', { replace: true })
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    // Allow up to 10MB for selection
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB')
      return
    }
    setRawImage(URL.createObjectURL(file))
    e.target.value = ''
  }

  async function handleCropSave(imgDataUrl) {
    try {
      setSaving(true)
      const res = await fetch(imgDataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
      const result = await uploadTenantProfileImage(file)
      if (result.success) {
        setTenant(prev => ({ ...prev, profileImageUrl: result.data.profileImageUrl }))
      }
    } catch (err) {
      console.error(err)
      alert('Failed to upload image. Please try a smaller file.')
    } finally {
      setSaving(false)
      setRawImage(null)
    }
  }

  const rents = useMemo(() => tenant?.rentResponse || [], [tenant])
  const address = useMemo(() => tenant?.address || {}, [tenant])

  const stats = useMemo(() => {
    if (!tenant) return {}
    const totalPaid = rents.reduce((sum, r) => sum + (r.paidAmount || 0), 0)
    const totalPending = rents.reduce((sum, r) => sum + (r.pending || 0), 0)
    const firstRent = rents[0] || {}
    return {
      totalPaid,
      totalPending,
      advance: firstRent.advance || 0,
      refund: firstRent.refundAmount || 0,
      months: rents.length
    }
  }, [tenant, rents])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Activity className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Synchronizing Data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 text-center shadow-xl border border-slate-100">
          <div className="h-20 w-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 font-medium mb-8">{error}</p>
          <button
            onClick={() => navigate('/manage/mypg/signin')}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  const mask = (val) => val ? val.replace(/\d(?=\d{4})/g, '*') : 'N/A'

  return (
    <div className="min-h-screen bg-slate-50/50">
      <TenantHeader tenant={tenant} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="pb-20"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8" id="overview">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 mb-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Overview</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                <Activity size={12} className="text-indigo-500" />
                Welcome back, {tenant.name.split(' ')[0]}
              </p>
            </div>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Paid"
            value={`₹${stats.totalPaid.toLocaleString('en-IN')}`}
            icon={IndianRupee}
            gradient="from-indigo-600 to-blue-700"
            subtitle="Lifetime Contribution"
          />
          <StatCard
            title="Security Deposit"
            value={`₹${stats.advance.toLocaleString('en-IN')}`}
            icon={ShieldCheck}
            gradient="from-emerald-500 to-teal-600"
            subtitle="Refundable Amount"
          />
          <StatCard
            title="Pending Balance"
            value={`₹${stats.totalPending.toLocaleString('en-IN')}`}
            icon={AlertCircle}
            gradient="from-rose-500 to-red-600"
            subtitle="Total Outstanding"
          />
          <StatCard
            title="Stay Duration"
            value={`${stats.months} Months`}
            icon={Calendar}
            gradient="from-violet-600 to-fuchsia-700"
            subtitle="Active Tenure"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Profile & Stay */}
          <div className="lg:col-span-1 space-y-8" id="profile">

            {/* Identity Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group">
              <div className="bg-slate-900 p-6 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <Fingerprint size={80} />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative group/avatar">
                    <div
                      className="h-16 w-16 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 cursor-pointer"
                      onClick={() => setShowViewModal(true)}
                    >
                      {tenant.profileImageUrl ? (
                        <img
                          src={`${BASE_URL}${tenant.profileImageUrl}`}
                          alt={tenant.name}
                          className="h-full w-full object-cover transition-transform group-hover/avatar:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-2xl">
                          {tenant.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-lg cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors">
                      <span className="text-[10px]">✏️</span>
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{tenant.name}</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{tenant.workCompany}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <InfoRow icon={Mail} label="Email Address" value={tenant.email} />
                <InfoRow icon={Phone} label="Contact Number" value={tenant.mobileNumber} />
                <InfoRow icon={Phone} label="Emergency Contact" value={tenant.parentNumber} />
                <InfoRow icon={Fingerprint} label="Aadhaar ID" value={mask(tenant.aadhaarNumber)} />
                <InfoRow icon={Droplets} label="Blood Group" value={tenant.bloodGroup} />
                <InfoRow icon={Briefcase} label="Qualification" value={tenant.qualification} />
                <InfoRow icon={User} label="Parental Guard" value={tenant.sonOf} />
              </div>
            </motion.div>

            {/* Living Details */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                  <Home size={16} className="text-indigo-600" />
                  Accommodation
                </h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${tenant.vacated ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {tenant.vacated ? 'Vacated' : 'Active Resident'}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                <InfoRow icon={Building2} label="Allocated Bed" value={tenant.bedDetail} color="text-indigo-600" />
                <InfoRow icon={Users} label="Room Sharing" value={`${tenant.sharing} Sharing`} />
                <InfoRow icon={Activity} label="Room Type" value={tenant.roomType} />
                <InfoRow icon={Clock} label="Joining Date" value={dayjs(tenant.dateOfJoining).format('DD MMM YYYY')} />
                <InfoRow icon={Calendar} label="Expected Checkout" value={tenant.expectedCheckoutDate || 'Not Scheduled'} />
                <InfoRow icon={Calendar} label="Vacate Date" value={tenant.dateOfVacate || 'Ongoing Stay'} />
                <InfoRow icon={IndianRupee} label="Monthly Rent" value={`₹ ${tenant.monthlyRent}`} color="text-slate-900" />
              </div>
            </motion.div>

            {/* Address */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                <MapPin size={16} className="text-indigo-600" />
                Permanent Address
              </h3>
              <div className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                {address.address}, {address.areaLocality}, {address.city}, {address.state} - {address.pinCode}
              </div>
            </motion.div>

            {/* Documents */}
            {tenant.documents && tenant.documents.length > 0 && (
              <motion.div variants={itemVariants} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-600" />
                  Verified Documents
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {tenant.documents.map(doc => (
                    <a
                      key={doc.id}
                      href={`${BASE_URL}${doc.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-100 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                          <FileText size={16} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{doc.type}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}

          </div>

          {/* Right Column: Payments & Complaints */}
          <div className="lg:col-span-2 space-y-8">

            {/* Payment History */}
            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden" id="payments">
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <History size={20} className="text-indigo-600" />
                    Ledger Summary
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Detailed history of all transactions</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                      <th className="px-8 py-4">Month</th>
                      <th className="px-4 py-4">Rent</th>
                      <th className="px-4 py-4">Paid</th>
                      <th className="px-4 py-4">Balance</th>
                      <th className="px-4 py-4">Method</th>
                      <th className="px-4 py-4 text-center">Status</th>
                      <th className="px-8 py-4 text-right">Settled On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rents.map((r, idx) => (
                      <tr key={r.id || idx} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="font-bold text-slate-900">{r.rentMonth}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Due: {r.dueDate}</div>
                        </td>
                        <td className="px-4 py-4 font-bold text-slate-600">₹{r.rentAmount}</td>
                        <td className="px-4 py-4 font-bold text-emerald-600">₹{r.paidAmount}</td>
                        <td className="px-4 py-4 font-bold text-rose-600">₹{r.pending}</td>
                        <td className="px-4 py-4">
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            {r.modeOfPayment || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${
                            r.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            <span className={`h-1 w-1 rounded-full mr-1.5 ${r.status === 'PAID' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {r.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="text-xs font-bold text-slate-600">{r.paidDate || 'Pending'}</div>
                          {r.lateFee > 0 && <div className="text-[10px] text-rose-500 font-bold tracking-tighter">Late Fee: ₹{r.lateFee}</div>}
                        </td>
                      </tr>
                    ))}
                    {rents.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-8 py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Clock size={32} strokeWidth={1.5} />
                            <p className="font-bold text-sm tracking-tight italic">No payment records found on file</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Complaints Section */}
            <motion.div variants={itemVariants} id="complaints">
              <TenantComplaints tenantId={tenant.id} pgId={tenant.pgId} />
            </motion.div>

          </div>
        </div>
      </div>
    </motion.div>

      {rawImage && (
        <ProfileImageCropper
          image={rawImage}
          onCancel={() => setRawImage(null)}
          onSave={handleCropSave}
        />
      )}

      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <X size={20} />
              </button>

              <div className="p-8 flex flex-col items-center">
                <div className="w-full mb-6">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Profile Photo</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Personal Identity</p>
                </div>

                <div className="h-64 w-64 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner mb-8 bg-indigo-50 flex items-center justify-center">
                  {tenant.profileImageUrl ? (
                    <img
                      src={`${BASE_URL}${tenant.profileImageUrl}`}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={80} className="text-indigo-200" />
                  )}
                </div>

                <div className="grid grid-cols-1 w-full gap-3">
                  <label className="flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-200">
                    <Camera size={18} />
                    Upload New Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        setShowViewModal(false)
                        handleImageChange(e)
                      }}
                    />
                  </label>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {saving && (
        <div className="fixed inset-0 z-[100] bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
          <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
            <Activity className="h-5 w-5 text-indigo-600 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">Uploading...</span>
          </div>
        </div>
      )}
    </div>
  )
}
