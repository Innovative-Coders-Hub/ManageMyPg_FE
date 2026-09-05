import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import SEO from '../components/SEO'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Bed as BedIcon,
  CreditCard,
  Briefcase,
  User,
  Users,
  ShieldCheck,
  FileText,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Building,
  Hash,
  Activity,
  ThumbsUp,
  Printer,
  X
} from 'lucide-react'
import { getTenantDetails, approveTenant, markRentAsPaid } from '../api/ownerAuth'
import toast from 'react-hot-toast'
import PaymentModal from '../components/models/PaymentModal'
import { printRentReceipt } from '../components/PrintRentReceipt'
import { numberToWords } from '../components/utills/numberUtils'

const IMAGE_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.managemypg.com/managemypg'

export default function TenantDetails() {
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState(null)
  const [selectedRent, setSelectedRent] = useState(null)
  const [imgError, setImgError] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  const fetchDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const data = await getTenantDetails(tenantId)
      setTenant(data)
    } catch (err) {
      setError('Failed to load tenant details')
      console.error(err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [tenantId])

  const handleApprove = async () => {
    try {
      setApproving(true)
      const updatedTenant = await approveTenant(tenantId)
      setTenant(updatedTenant)
      toast.success('Tenant approved successfully!')
    } catch (err) {
      toast.error('Failed to approve tenant')
      console.error(err)
    } finally {
      setApproving(false)
    }
  }

  const handlePayment = async (payload) => {
    try {
      const requestBody = {
        paymentId: selectedRent?.id || null,
        rentMonth: payload.rentMonth,
        rent: payload.rent,
        paidAmount: payload.paidAmount,
        advance: payload.advance,
        pending: payload.pending,
        modeOfPayment: payload.modeOfPayment,
        paidDate: payload.paidDate,
        remarks: payload.remarks
      }

      await markRentAsPaid(tenantId, requestBody)
      setSelectedRent(null)
      toast.success('Payment recorded successfully!')
      fetchDetails(true)
    } catch (err) {
      toast.error('Failed to record payment')
      console.error(err)
    }
  }

  const handlePrintReceipt = (rent) => {
    const receiptData = {
      receipt: {
        receiptNumber: `REC-${tenant.pgId || '00'}-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000)}`,
        issuedAt: rent.paidDate || new Date(),
      },
      pg: {
        name: tenant.pgName || 'Our PG',
        address: tenant.pgAddress || 'N/A',
        phone: tenant.pgPhone || ''
      },
      owner: {
        name: tenant.ownerName || 'Manager'
      },
      tenant: {
        name: tenant.name,
        mobile: tenant.mobileNumber
      },
      bed: {
        roomName: tenant.roomName || 'N/A',
        bedName: tenant.bedDetail || 'N/A'
      },
      billing: {
        period: {
          from: rent.dueDate,
          to: dayjs(rent.dueDate).endOf('month').toISOString()
        },
        amount: {
          paid: rent.paidAmount,
          inWords: `${numberToWords(rent.paidAmount)} only`
        },
        payment: {
          mode: rent.modeOfPayment || 'CASH',
          paidAt: rent.paidDate
        },
        remarks: rent.remarks || ''
      }
    }
    printRentReceipt(receiptData)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Retrieving Resident Profile...</p>
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xl text-center max-w-md">
          <div className="h-20 w-20 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Profile Unavailable</h2>
          <p className="text-slate-500 font-medium mb-8 text-sm">{error || 'Resident profile could not be located.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={16} /> Return to Directory
          </button>
        </div>
      </div>
    )
  }

  const profileImageUrl = tenant.profileImageUrl
    ? (tenant.profileImageUrl.startsWith('http') ? tenant.profileImageUrl : `${IMAGE_BASE_URL}${tenant.profileImageUrl}`)
    : null

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <SEO
        title={tenant ? `${tenant.name} - Resident Profile` : 'Resident Profile'}
        description={tenant ? `Detailed profile for ${tenant.name} at ${tenant.pgName}. View rent ledger, personal details, and verification documents.` : 'View resident profile and rent ledger.'}
        canonical={`/tenant-details/${tenantId}`}
      />

      {/* STICKY HEADER BAR WITH RESIDENT IDENTIFIER & QUICK STATS */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            
            {/* LEFT PROFILE HIGHLIGHT */}
            <div className="flex items-center gap-4 md:gap-5">
              <button
                onClick={() => navigate(-1)}
                className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                title="Back to Directory"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="relative group shrink-0">
                <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white border-2 border-slate-100 shadow-md overflow-hidden flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                     onClick={() => profileImageUrl && !imgError && setPreviewImage({ url: profileImageUrl, title: tenant.name })}
                >
                  {profileImageUrl && !imgError ? (
                    <img
                      src={profileImageUrl}
                      alt={tenant.name}
                      className="h-full w-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="h-full w-full bg-indigo-600 flex items-center justify-center text-white font-black text-xl">
                      {tenant.name ? tenant.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                {tenant.approved && (
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center text-white shadow-xs">
                    <CheckCircle2 size={12} />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase truncate leading-tight">
                    {tenant.name}
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                      tenant.vacated
                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {tenant.vacated ? 'Vacated' : 'Active Resident'}
                    </span>
                    {tenant.approved && (
                      <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                    {tenant.pgName} • {tenant.roomName || 'Room N/A'} • {tenant.bedDetail || 'Bed N/A'}
                  </p>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock size={11} className="text-indigo-600" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Joined {dayjs(tenant.dateOfJoining).format('DD MMM YYYY')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK EXECUTIVE STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 xl:max-w-2xl">
              <HeaderStat label="Monthly Rent" value={`₹${(tenant.monthlyRent || 0).toLocaleString()}`} icon={<CreditCard />} color="indigo" />
              <HeaderStat label="Security Deposit" value={`₹${(tenant.advance || 0).toLocaleString()}`} icon={<ShieldCheck />} color="emerald" />
              <HeaderStat label="Outstanding Dues" value={`₹${(tenant.pending || 0).toLocaleString()}`} icon={<AlertCircle />} color={tenant.pending > 0 ? 'rose' : 'slate'} />
              <HeaderStat label="Sharing Model" value={`${tenant.sharing || 1} Sharing`} icon={<Users />} color="purple" />
            </div>

            {/* HEADER ACTIONS */}
            {!tenant.approved && (
              <div className="flex items-center gap-3 self-end xl:self-center shrink-0">
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {approving ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} strokeWidth={2.5} />}
                  Approve Resident
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: CORE RESIDENT INFO & LEDGER (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">

            {/* PERSONAL PROFILE CARD */}
            <Section title="Personal Profile" icon={<User />} color="indigo">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <InfoItem label="Full Legal Name" value={tenant.name} icon={<User />} color="indigo" />
                <InfoItem label="Guardian / Parent Name" value={tenant.sonOf} icon={<Users />} color="blue" />
                <InfoItem label="Date of Birth" value={tenant.dateOfBirth ? dayjs(tenant.dateOfBirth).format('DD MMMM YYYY') : 'N/A'} icon={<Calendar />} color="amber" />
                <InfoItem label="Age" value={tenant.age ? `${tenant.age} Years` : 'N/A'} icon={<Activity />} color="rose" />
                <InfoItem label="Aadhaar ID Number" value={tenant.aadhaarNumber ? `XXXX XXXX ${tenant.aadhaarNumber.slice(-4)}` : 'N/A'} icon={<ShieldCheck />} color="emerald" />
                <InfoItem label="Blood Group" value={tenant.bloodGroup || 'N/A'} icon={<Activity />} color="rose" />
                <InfoItem label="Educational Qualification" value={tenant.qualification || 'N/A'} icon={<Briefcase />} color="purple" />
              </div>
            </Section>

            {/* CONTACT & EMPLOYMENT CARD */}
            <Section title="Professional & Emergency Contact" icon={<Briefcase />} color="purple">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <InfoItem label="Email Address" value={tenant.email} icon={<Mail />} color="indigo" />
                <InfoItem label="Primary Mobile" value={tenant.mobileNumber} icon={<Phone />} color="emerald" />
                <InfoItem label="Emergency Contact" value={tenant.parentNumber} icon={<Phone />} color="rose" />
                <InfoItem label="Workplace / Institution" value={tenant.workCompany || 'N/A'} icon={<Building />} color="amber" />
                <InfoItem label="Vehicle Number" value={tenant.vehicleNumber || 'No Vehicle'} icon={<Hash />} color="slate" />
              </div>
            </Section>

            {/* PERMANENT ADDRESS CARD */}
            <Section title="Permanent Address" icon={<MapPin />} color="rose">
              {tenant.address ? (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-600 shadow-xs shrink-0 mt-0.5">
                    <MapPin size={18} strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-relaxed">
                      {tenant.address.address}, {tenant.address.areaLocality}<br />
                      {tenant.address.landmark && `${tenant.address.landmark}, `}
                      {tenant.address.city}, {tenant.address.district && `${tenant.address.district}, `} {tenant.address.state} - {tenant.address.pinCode}<br />
                      {tenant.address.country || 'India'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No address details registered</p>
              )}
            </Section>

            {/* RENT LEDGER TABLE SECTION */}
            <Section title="Rent Payment Ledger" icon={<History />} color="emerald">
              <div className="overflow-x-auto bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest">Billing Month</th>
                      <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest">Due Date</th>
                      <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest">Total Due</th>
                      <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest">Paid Amount</th>
                      <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest">Payment Date</th>
                      <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest">Status</th>
                      <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenant.rentResponse && tenant.rentResponse.length > 0 ? (
                      tenant.rentResponse.map((rent, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block">{rent.rentMonth}</span>
                            {rent.modeOfPayment && (
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{rent.modeOfPayment}</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              {rent.dueDate ? dayjs(rent.dueDate).format('DD MMM YYYY') : 'N/A'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black text-slate-900 tracking-tight">₹{(rent.rentAmount + (rent.charges || 0) + (rent.lateFee || 0)).toLocaleString()}</span>
                              {(rent.charges > 0 || rent.lateFee > 0 || rent.refundAmount > 0) && (
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  {rent.charges > 0 && <span className="text-[7px] px-1 bg-blue-50 text-blue-600 rounded font-black uppercase">Chg: ₹{rent.charges}</span>}
                                  {rent.lateFee > 0 && <span className="text-[7px] px-1 bg-amber-50 text-amber-600 rounded font-black uppercase">Fee: ₹{rent.lateFee}</span>}
                                  {rent.refundAmount > 0 && <span className="text-[7px] px-1 bg-rose-50 text-rose-600 rounded font-black uppercase">Ref: ₹{rent.refundAmount}</span>}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-emerald-600">
                            <span className="text-[11px] font-black tracking-tight">₹{(rent.paidAmount || 0).toLocaleString()}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {rent.paidDate ? dayjs(rent.paidDate).format('DD MMM YYYY') : 'PENDING'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                              rent.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {rent.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {rent.status === 'PAID' && (
                                <button
                                  onClick={() => handlePrintReceipt(rent)}
                                  className="p-1.5 bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-200 cursor-pointer shadow-xs"
                                  title="Print Receipt"
                                >
                                  <Printer size={14} />
                                </button>
                              )}
                              {rent.status !== 'PAID' && (
                                <button
                                  onClick={() => setSelectedRent(rent)}
                                  className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">No rent transaction records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>

          {/* RIGHT COLUMN: ACCOMMODATION & DOCUMENTS (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">

            {/* ACCOMMODATION DETAILS CARD */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group border border-slate-800">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <BedIcon size={110} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-400 mb-5">
                  <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Accommodation Summary</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned Pg</p>
                    <p className="text-base font-black tracking-tight">{tenant.pgName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Room Allocation</p>
                    <p className="text-base font-black tracking-tight">{tenant.bedDetail || 'Not Assigned'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Room Type</p>
                    <p className="text-base font-black tracking-tight uppercase">{tenant.roomType?.replace('_', ' ') || 'Standard'}</p>
                  </div>
                  {(tenant.dateOfVacate || tenant.expectedCheckoutDate) && (
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Vacate Date</p>
                        <p className="text-xs font-bold">{tenant.dateOfVacate ? dayjs(tenant.dateOfVacate).format('DD MMM YYYY') : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Vacateing</p>
                        <p className="text-xs font-bold">{(tenant.dateOfVacate || tenant.expectedCheckoutDate) ? dayjs(tenant.dateOfVacate || tenant.expectedCheckoutDate).format('DD MMM YYYY') : 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {tenant.bedId && (
                  <Link
                    to={`/beds/${tenant.bedId}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-md active:scale-95"
                  >
                     View Assigned Bed Details <ExternalLink size={14} />
                  </Link>
                )}
              </div>
            </div>

            {/* VERIFICATION DOCUMENTS SECTION */}
            <Section title="Verification Documents" icon={<ShieldCheck />} color="blue">
              <div className="space-y-3">
                {tenant.documents && tenant.documents.length > 0 ? (
                  tenant.documents.map((doc, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between group hover:border-indigo-300 transition-all shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                          <FileText size={16} strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">{doc.type}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">
                            ID: {doc.type?.toUpperCase().includes('AADHAAR')
                              ? (doc.documentNumber ? `XXXX XXXX ${doc.documentNumber.slice(-4)}` : 'Verified')
                              : (doc.documentNumber || 'Verified')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPreviewImage({ url: `${IMAGE_BASE_URL}${doc.url}`, title: doc.type })}
                        className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-pointer shadow-xs shrink-0"
                        title="View Document"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Documents Uploaded</p>
                  </div>
                )}
              </div>
            </Section>

            {/* ADMINISTRATIVE STATUS CARD */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-slate-100">
                <UserCheck size={16} className="text-indigo-600" /> Administrative Status
              </h3>
              <div className="space-y-3">
                <StatusToggle
                  label="Approval Status"
                  status={tenant.approved ? 'APPROVED' : 'PENDING'}
                  active={tenant.approved}
                />
                {!tenant.approved && (
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {approving ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                    Approve Resident
                  </button>
                )}
                <StatusToggle label="Onboarding Status" status={tenant.approved ? 'COMPLETE' : 'IN-PROGRESS'} active={tenant.approved} />
                <StatusToggle label="Residency Status" status={tenant.vacated ? 'VACATED' : 'STAYING'} active={!tenant.vacated} />
                <StatusToggle label="Account Access" status={tenant.blocked ? 'BLOCKED' : 'ACTIVE'} active={!tenant.blocked} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {selectedRent && (
          <PaymentModal
            isOpen={!!selectedRent}
            onClose={() => setSelectedRent(null)}
            onSave={handlePayment}
            period={{
              key: selectedRent.rentMonth,
              label: selectedRent.rentMonth,
              from: selectedRent.dueDate,
              to: selectedRent.dueDate
            }}
            defaultRent={selectedRent.rentAmount}
          />
        )}
      </AnimatePresence>

      {/* IMAGE PREVIEW MODAL */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest">{previewImage.title}</span>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 bg-slate-100 flex items-center justify-center">
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="max-h-[75vh] w-auto object-contain rounded-xl shadow-md"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* =====================================================
   HELPER SUB-COMPONENTS
===================================================== */
function HeaderStat({ label, value, icon, color }) {
  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100'
  }

  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:bg-white transition-all shadow-xs">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${colors[color] || colors.indigo}`}>
        {React.cloneElement(icon, { size: 16, strokeWidth: 2.2 })}
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xs font-black text-slate-900 truncate leading-none">{value}</p>
      </div>
    </div>
  )
}

function Section({ title, icon, children, color = "indigo" }) {
  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100'
  }

  const colorClass = colors[color] || colors.indigo

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 px-1">
        <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shadow-xs ${colorClass}`}>
          {React.cloneElement(icon, { size: 16, strokeWidth: 2.2 })}
        </div>
        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        {children}
      </div>
    </div>
  )
}

function InfoItem({ label, value, icon, color = "indigo" }) {
  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100',
    cyan: 'text-cyan-600 bg-cyan-50 border-cyan-100'
  }

  const colorClass = colors[color] || colors.indigo

  return (
    <div className="flex gap-3.5 items-center group">
      <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs ${colorClass}`}>
        {React.cloneElement(icon, { size: 15, strokeWidth: 2.2 })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">{value || 'N/A'}</p>
      </div>
    </div>
  )
}

function StatusToggle({ label, status, active }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={`px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
        active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
      }`}>
        {status}
      </span>
    </div>
  )
}
