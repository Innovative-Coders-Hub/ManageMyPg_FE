import React, { useEffect, useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO'
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
  Camera,
  Tag,
  Sparkles,
  Percent,
  Copy,
  Check
} from 'lucide-react'
import { getTenantDetails, ownerLogout, uploadTenantProfileImage } from '../api/ownerAuth'
import { getActivePromotionsForPg } from '../api/promotions'
import { getFullImageUrl } from '../api/api'
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
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

/* =======================
   Sub-Components
======================= */

const StatCard = ({ title, value, icon: Icon, gradient, subtitle, borderClass = "border-slate-200/80" }) => (
  <motion.div
    variants={itemVariants}
    className={`relative overflow-hidden rounded-2xl border ${borderClass} bg-white p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03] pointer-events-none`} />
    <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.06] transition-transform duration-500 group-hover:scale-125`} />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{value}</h3>
        {subtitle && <p className="text-[9.5px] font-bold text-slate-400 mt-1.5">{subtitle}</p>}
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm shrink-0`}>
        <Icon size={20} strokeWidth={2.3} />
      </div>
    </div>
  </motion.div>
)

const InfoRow = ({ icon: Icon, label, value, color = "text-slate-900" }) => (
  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
    <div className="h-8 w-8 rounded-lg bg-slate-100/80 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shrink-0">
      <Icon size={16} strokeWidth={2.2} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">{label}</p>
      <p className={`text-xs font-black truncate ${color}`}>{value || '—'}</p>
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
  const [activePromotions, setActivePromotions] = useState([])
  const [copiedCodeId, setCopiedCodeId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadPromos = async () => {
      try {
        const tenantPgId = tenant?.pgDetailsId || tenant?.pgId
        const promos = await getActivePromotionsForPg(tenantPgId || 'ALL').catch(() => [])
        const now = dayjs()
        const validActive = (promos || []).filter(p => {
          const isNotExpired = !p.expireAt || dayjs(p.expireAt).isAfter(now)
          return (p.status === 'ACTIVE' || p.computedStatus === 'ACTIVE') && isNotExpired
        })
        setActivePromotions(validActive)
      } catch (e) {
        console.error('Failed to load promotions in tenant view:', e)
      }
    }
    loadPromos()
    window.addEventListener('promotionsUpdated', loadPromos)
    return () => window.removeEventListener('promotionsUpdated', loadPromos)
  }, [tenant?.pgDetailsId, tenant?.pgId])

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
        toast.success('Profile photo updated')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload image. Please try a smaller file.')
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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-9 w-9 text-indigo-600 animate-spin" />
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-200/80">
          <div className="h-16 w-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-5 border border-rose-100">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Access Denied</h2>
          <p className="text-slate-500 text-xs font-medium mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/manage/mypg/signin')}
            className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  const mask = (val) => val ? val.replace(/\d(?=\d{4})/g, '*') : 'N/A'

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="Tenant Dashboard"
        description="View your stay details, payment history, and manage complaints."
        canonical="/tenant-dashboard"
      />
      <TenantHeader tenant={tenant} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="pb-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="overview">
          
          {/* HEADER HERO BANNER */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Building2 size={160} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group/avatar">
                  <div
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 cursor-pointer bg-slate-800 shrink-0"
                    onClick={() => setShowViewModal(true)}
                  >
                    {tenant.profileImageUrl ? (
                      <img
                        src={getFullImageUrl(tenant.profileImageUrl)}
                        alt={tenant.name}
                        className="h-full w-full object-cover transition-transform group-hover/avatar:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-2xl text-white"
                      style={{ display: tenant.profileImageUrl ? 'none' : 'flex' }}
                    >
                      {tenant.name?.charAt(0) || 'T'}
                    </div>
                  </div>
                  <label className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-lg cursor-pointer shadow-md hover:bg-indigo-500 transition-colors" title="Change Photo">
                    <Camera size={12} />
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase truncate">
                      {tenant.name}
                    </h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border ${
                      tenant.vacated
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {tenant.vacated ? 'Vacated' : 'Active Resident'}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-1 truncate">
                    {tenant.workCompany || 'Resident'} • Room: {tenant.bedDetail || 'N/A'}
                  </p>
                  <p className="text-slate-400 text-xs font-medium mt-1.5 flex items-center gap-1.5">
                    <Building2 size={13} className="text-indigo-400" />
                    <span>Your PG Stay</span>
                  </p>
                </div>
              </div>

              {/* QUICK RENT ACTION BADGE */}
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 shrink-0 flex items-center gap-4">
                <div>
                  <p className="text-[8.5px] font-black text-indigo-200 uppercase tracking-widest">Monthly Rent</p>
                  <p className="text-xl font-black text-white leading-none mt-1">₹{tenant.monthlyRent || 0}</p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                  <IndianRupee size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE PROMOTIONS & ANNOUNCEMENTS BANNER FOR TENANTS */}
          {activePromotions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
                    <Sparkles size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                      Special Offers & Announcements
                    </h3>
                    <p className="text-[10.5px] font-bold text-slate-500">
                      Exclusive deals and updates for your PG stay
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                  {activePromotions.length} {activePromotions.length === 1 ? 'Active Offer' : 'Active Offers'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activePromotions.map((promo) => {
                  const isCopied = copiedCodeId === promo.id
                  const isPercentage = promo.discountType === 'PERCENT'
                  
                  return (
                    <div
                      key={promo.id}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group"
                    >
                      {/* Top Visual Section */}
                      {promo.bannerUrl ? (
                        <div className="relative h-48 sm:h-52 w-full bg-slate-950 overflow-hidden shrink-0">
                          <img
                            src={getFullImageUrl(promo.bannerUrl)}
                            alt={promo.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                          
                          {/* Badges Overlay */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                            <span className="px-3 py-1 rounded-xl bg-slate-900/85 backdrop-blur-md text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-400/30 shadow-md">
                              {promo.type || 'SPECIAL OFFER'}
                            </span>
                            
                            {promo.discountValue && (
                              <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                                {isPercentage ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Fallback Visual Header without Image */
                        <div className="relative h-28 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-4 flex items-center justify-between shrink-0 overflow-hidden">
                          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center justify-center">
                            <Sparkles size={140} />
                          </div>
                          <span className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider border border-white/20">
                            {promo.type || 'SPECIAL OFFER'}
                          </span>
                          {promo.discountValue && (
                            <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                              {isPercentage ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Content Body */}
                      <div className="p-5 sm:p-6 space-y-3.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <h4 className="text-lg font-black text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors">
                            {promo.title}
                          </h4>
                          {promo.subtitle && (
                            <p className="text-xs font-bold text-indigo-600">
                              {promo.subtitle}
                            </p>
                          )}
                          {promo.description && (
                            <p className="text-xs font-medium text-slate-600 leading-relaxed pt-1">
                              {promo.description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3 pt-2 border-t border-slate-100">
                          {/* Coupon Code Pill */}
                          {promo.promoCode && (
                            <div className="bg-amber-500/10 border border-dashed border-amber-400/60 p-3 rounded-2xl flex items-center justify-between">
                              <div>
                                <span className="text-[9px] font-black text-amber-800 uppercase tracking-wider block">Use Coupon Code:</span>
                                <span className="font-mono font-black text-amber-900 text-sm tracking-widest">
                                  {promo.promoCode}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(promo.promoCode)
                                  setCopiedCodeId(promo.id)
                                  toast.success(`Copied code: ${promo.promoCode}`)
                                  setTimeout(() => setCopiedCodeId(null), 2000)
                                }}
                                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isCopied
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                                }`}
                              >
                                {isCopied ? (
                                  <>
                                    <Check size={13} /> COPIED!
                                  </>
                                ) : (
                                  <>
                                    <Copy size={13} /> COPY CODE
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {/* Expiration & Terms Footer */}
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-0.5">
                            {promo.expirationDate ? (
                              <span className="flex items-center gap-1 text-slate-500 font-bold">
                                <Clock size={12} className="text-amber-500" />
                                Expires: {dayjs(promo.expirationDate).format('MMM DD, YYYY')}
                              </span>
                            ) : promo.validDays ? (
                              <span className="flex items-center gap-1 text-slate-500 font-bold">
                                <Clock size={12} className="text-amber-500" />
                                Valid for {promo.validDays} days
                              </span>
                            ) : (
                              <span>* Limited time offer</span>
                            )}

                            {promo.terms && (
                              <span className="text-slate-400 truncate max-w-[180px]" title={promo.terms}>
                                * {promo.terms}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Rent Paid"
              value={`₹${stats.totalPaid.toLocaleString('en-IN')}`}
              icon={IndianRupee}
              gradient="from-indigo-600 to-blue-700"
              subtitle="Total Paid So Far"
            />
            <StatCard
              title="Security Deposit"
              value={`₹${stats.advance.toLocaleString('en-IN')}`}
              icon={ShieldCheck}
              gradient="from-emerald-500 to-teal-600"
              subtitle="Refundable Advance"
            />
            <StatCard
              title="Pending Balance"
              value={`₹${stats.totalPending.toLocaleString('en-IN')}`}
              icon={AlertCircle}
              gradient="from-rose-500 to-red-600"
              subtitle="Pending Amount Due"
            />
            <StatCard
              title="Stay Duration"
              value={`${stats.months} Months`}
              icon={Calendar}
              gradient="from-violet-600 to-fuchsia-700"
              subtitle="Months Stayed"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Profile & Stay */}
            <div className="lg:col-span-1 space-y-6" id="profile">

              {/* Personal Details Card */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-xs flex items-center gap-2">
                    <User size={16} className="text-indigo-600" />
                    Personal Information
                  </h3>
                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    Verified
                  </span>
                </div>
                <div className="space-y-1">
                  <InfoRow icon={Mail} label="Email" value={tenant.email} />
                  <InfoRow icon={Phone} label="Phone Number" value={tenant.mobileNumber} />
                  <InfoRow icon={Phone} label="Emergency Contact" value={tenant.parentNumber} />
                  <InfoRow icon={Fingerprint} label="Aadhaar Card" value={mask(tenant.aadhaarNumber)} />
                  <InfoRow icon={Droplets} label="Blood Group" value={tenant.bloodGroup} />
                  <InfoRow icon={Briefcase} label="Education / Qualification" value={tenant.qualification} />
                  <InfoRow icon={User} label="Father / Guardian" value={tenant.sonOf} />
                </div>
              </motion.div>

              {/* Living Details Card */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-xs flex items-center gap-2">
                    <Home size={16} className="text-indigo-600" />
                    Room & Stay Details
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border ${
                    tenant.vacated ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {tenant.vacated ? 'Vacated' : 'Active Resident'}
                  </span>
                </div>
                <div className="space-y-1">
                  <InfoRow icon={Building2} label="Bed Number" value={tenant.bedDetail} color="text-indigo-600" />
                  <InfoRow icon={Users} label="Sharing Type" value={`${tenant.sharing} Sharing`} />
                  <InfoRow icon={Activity} label="Room Type" value={tenant.roomType} />
                  <InfoRow icon={Clock} label="Move-in Date" value={dayjs(tenant.dateOfJoining).format('DD MMM YYYY')} />
                  <InfoRow icon={Calendar} label="Expected Vacate Date" value={tenant.expectedCheckoutDate || 'Not Scheduled'} />
                  <InfoRow icon={Calendar} label="Vacate Date" value={tenant.dateOfVacate || 'Ongoing Stay'} />
                  <InfoRow icon={IndianRupee} label="Monthly Rent" value={`₹ ${tenant.monthlyRent}`} color="text-slate-900 font-extrabold" />
                </div>
              </motion.div>

              {/* Permanent Address Card */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                <h3 className="font-black text-slate-900 uppercase tracking-tight text-xs flex items-center gap-2">
                  <MapPin size={16} className="text-indigo-600" />
                  Permanent Address
                </h3>
                <div className="text-xs font-bold text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {address.address}, {address.areaLocality}, {address.city}, {address.state} - {address.pinCode}
                </div>
              </motion.div>

              {/* Verified Documents Card */}
              {tenant.documents && tenant.documents.length > 0 && (
                <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-xs flex items-center gap-2">
                    <ShieldCheck size={16} className="text-indigo-600" />
                    Uploaded ID & Documents
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {tenant.documents.map(doc => (
                      <a
                        key={doc.id}
                        href={`${BASE_URL}${doc.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all border border-slate-100 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-2xs transition-colors">
                            <FileText size={16} />
                          </div>
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{doc.type}</span>
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

              {/* Payment Ledger History */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden" id="payments">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <History size={18} className="text-indigo-600" />
                      Rent & Payment History
                    </h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Summary of all rent payments and dues</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-3.5">Month</th>
                        <th className="px-4 py-3.5">Rent Amount</th>
                        <th className="px-4 py-3.5">Amount Paid</th>
                        <th className="px-4 py-3.5">Balance Due</th>
                        <th className="px-4 py-3.5">Payment Mode</th>
                        <th className="px-4 py-3.5 text-center">Status</th>
                        <th className="px-6 py-3.5 text-right">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold">
                      {rents.map((r, idx) => (
                        <tr key={r.id || idx} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-3.5">
                            <div className="font-black text-slate-900 uppercase">{r.rentMonth}</div>
                            <div className="text-[8.5px] text-slate-400 font-black uppercase tracking-widest">Due: {r.dueDate}</div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">₹{r.rentAmount}</td>
                          <td className="px-4 py-3.5 text-emerald-600">₹{r.paidAmount}</td>
                          <td className="px-4 py-3.5 text-rose-600">₹{r.pending}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-[8.5px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider border border-slate-200/60">
                              {r.modeOfPayment || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border ${
                              r.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${r.status === 'PAID' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <div className="text-xs font-black text-slate-700">{r.paidDate || 'Pending'}</div>
                            {r.lateFee > 0 && <div className="text-[8.5px] text-rose-500 font-black tracking-widest uppercase">Late Fee: ₹{r.lateFee}</div>}
                          </td>
                        </tr>
                      ))}
                      {rents.length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                              <Clock size={28} strokeWidth={1.5} />
                              <p className="font-black text-xs uppercase tracking-widest">No rent payment records found</p>
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

      {/* CROPPER OVERLAY */}
      {rawImage && (
        <ProfileImageCropper
          image={rawImage}
          onCancel={() => setRawImage(null)}
          onSave={handleCropSave}
        />
      )}

      {/* PHOTO PREVIEW MODAL */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-500 cursor-pointer z-10"
              >
                <X size={18} />
              </button>

              <div className="p-6 flex flex-col items-center">
                <div className="w-full mb-5">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Profile Photo</h3>
                  <p className="text-[9px] text-indigo-600 font-black uppercase tracking-widest mt-0.5">Your profile picture</p>
                </div>

                <div className="h-60 w-60 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm mb-6 bg-slate-50 flex items-center justify-center">
                  {tenant.profileImageUrl ? (
                    <img
                      src={getFullImageUrl(tenant.profileImageUrl)}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-300"
                    style={{ display: tenant.profileImageUrl ? 'none' : 'flex' }}
                  >
                    <User size={72} className="text-slate-300" />
                  </div>
                </div>

                <div className="grid grid-cols-1 w-full gap-2.5">
                  <label className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-black text-[9.5px] uppercase tracking-widest hover:bg-indigo-700 transition-all cursor-pointer shadow-md active:scale-95">
                    <Camera size={15} />
                    Change Photo
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
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-[9.5px] uppercase tracking-widest hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAVING OVERLAY */}
      {saving && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white p-4 px-6 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-100">
            <Activity className="h-5 w-5 text-indigo-600 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-900">Uploading photo...</span>
          </div>
        </div>
      )}
    </div>
  )
}
