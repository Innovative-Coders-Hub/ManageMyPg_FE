import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
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
  Printer
} from 'lucide-react'
import { getTenantDetails, approveTenant, markRentAsPaid } from '../api/ownerAuth'
import PageHeader from '../components/PageHeader'
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving Tenant Profile...</p>
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xl text-center max-w-md">
          <div className="h-20 w-20 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Error Occurred</h2>
          <p className="text-slate-500 font-medium mb-8">{error || 'Tenant not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    )
  }

  const profileImageUrl = tenant.profileImageUrl
    ? (tenant.profileImageUrl.startsWith('http') ? tenant.profileImageUrl : `${IMAGE_BASE_URL}${tenant.profileImageUrl}`)
    : null

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 transition-colors group mb-2"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Back to Registry</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative h-24 w-24 rounded-3xl bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt={tenant.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-300">
                      <User size={40} />
                    </div>
                  )}
                </div>
                {tenant.approved && (
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-emerald-500 rounded-xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                    <CheckCircle2 size={14} />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">{tenant.name}</h1>
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    tenant.vacated
                      ? 'bg-rose-50 text-rose-600 border-rose-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {tenant.vacated ? 'Vacated' : 'Active'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-indigo-600" />
                    <span className="text-[11px] font-black uppercase tracking-widest">{tenant.pgName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-indigo-600" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Joined {dayjs(tenant.dateOfJoining).format('MMM YYYY')}</span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Core Info */}
          <div className="lg:col-span-8 space-y-8">

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Monthly Rent" value={`₹${tenant.monthlyRent}`} icon={<CreditCard />} color="indigo" />
              <StatCard label="Security Advance" value={`₹${tenant.advance}`} icon={<ShieldCheck />} color="emerald" />
              <StatCard label="Outstanding" value={`₹${tenant.pending}`} icon={<AlertCircle />} color={tenant.pending > 0 ? 'rose' : 'slate'} />
              <StatCard label="Sharing Type" value={`${tenant.sharing} Sharing`} icon={<Users />} color="purple" />
            </div>

            {/* Personal Details Section */}
            <Section title="Personal Profile" icon={<User />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <InfoItem label="Full Name" value={tenant.name} icon={<User />} />
                <InfoItem label="Son/Daughter of" value={tenant.sonOf} icon={<Users />} />
                <InfoItem label="Date of Birth" value={tenant.dateOfBirth ? dayjs(tenant.dateOfBirth).format('DD MMMM YYYY') : 'N/A'} icon={<Calendar />} />
                <InfoItem label="Age" value={`${tenant.age} Years`} icon={<Activity />} />
                <InfoItem label="Aadhaar Number" value={tenant.aadhaarNumber ? `XXXX XXXX ${tenant.aadhaarNumber.slice(-4)}` : 'N/A'} icon={<ShieldCheck />} />
                <InfoItem label="Blood Group" value={tenant.bloodGroup} icon={<Activity />} />
                <InfoItem label="Qualification" value={tenant.qualification} icon={<Briefcase />} />
              </div>
            </Section>

            {/* Professional & Contact */}
            <Section title="Professional & Contact" icon={<Briefcase />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <InfoItem label="Email Address" value={tenant.email} icon={<Mail />} />
                <InfoItem label="Mobile Number" value={tenant.mobileNumber} icon={<Phone />} />
                <InfoItem label="Emergency Number" value={tenant.parentNumber} icon={<Phone />} />
                <InfoItem label="Company / College" value={tenant.workCompany} icon={<Building />} />
                <InfoItem label="Vehicle Number" value={tenant.vehicleNumber || 'No Vehicle'} icon={<Hash />} />
              </div>
            </Section>

            {/* Permanent Address */}
            <Section title="Permanent Address" icon={<MapPin />}>
              {tenant.address ? (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-relaxed">
                        {tenant.address.address}, {tenant.address.areaLocality}<br />
                        {tenant.address.landmark && `${tenant.address.landmark}, `}
                        {tenant.address.city}, {tenant.address.district && `${tenant.address.district}, `} {tenant.address.state} - {tenant.address.pinCode}<br />
                        {tenant.address.country}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No address information provided</p>
              )}
            </Section>

            {/* Rent History */}
            <Section title="Rent Ledger" icon={<History />}>
              <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Month</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Due</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Paid</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Paid Date</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenant.rentResponse && tenant.rentResponse.length > 0 ? (
                      tenant.rentResponse.map((rent, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{rent.rentMonth}</span>
                            {rent.modeOfPayment && (
                              <p className="text-[8px] font-bold text-slate-400 uppercase">{rent.modeOfPayment}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                              {rent.dueDate ? dayjs(rent.dueDate).format('DD MMM YYYY') : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900 tracking-tight">₹{rent.rentAmount + (rent.charges || 0) + (rent.lateFee || 0)}</span>
                              {(rent.charges > 0 || rent.lateFee > 0 || rent.refundAmount > 0) && (
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  {rent.charges > 0 && <span className="text-[7px] px-1 bg-blue-50 text-blue-600 rounded">Chg: ₹{rent.charges}</span>}
                                  {rent.lateFee > 0 && <span className="text-[7px] px-1 bg-amber-50 text-amber-600 rounded">Fee: ₹{rent.lateFee}</span>}
                                  {rent.refundAmount > 0 && <span className="text-[7px] px-1 bg-rose-50 text-rose-600 rounded">Ref: ₹{rent.refundAmount}</span>}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-indigo-600">
                            <span className="text-xs font-black tracking-tight">₹{rent.paidAmount}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                              {rent.paidDate ? dayjs(rent.paidDate).format('DD MMM YYYY') : 'PENDING'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                              rent.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {rent.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {rent.status === 'PAID' && (
                                <button
                                  onClick={() => handlePrintReceipt(rent)}
                                  className="p-1.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all border border-slate-200"
                                  title="Print Receipt"
                                >
                                  <Printer size={14} />
                                </button>
                              )}
                              {rent.status !== 'PAID' && (
                                <button
                                  onClick={() => setSelectedRent(rent)}
                                  className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 transition-colors"
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
                        <td colSpan="3" className="px-6 py-8 text-center text-xs font-black text-slate-400 uppercase tracking-widest">No transaction history found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>

          {/* Right Column: Documentation & Bed Info */}
          <div className="lg:col-span-4 space-y-8">

            {/* Bed Allocation Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <BedIcon size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-400 mb-6">
                  <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Accommodation Details</span>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Property</p>
                    <p className="text-lg font-black tracking-tight">{tenant.pgName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Space Allocation</p>
                    <p className="text-lg font-black tracking-tight">{tenant.bedDetail || 'Not Assigned'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Type</p>
                    <p className="text-lg font-black tracking-tight">{tenant.roomType} / {tenant.joiningType || 'Regular'}</p>
                  </div>
                  {(tenant.dateOfVacate || tenant.expectedCheckoutDate) && (
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Vacate Date</p>
                        <p className="text-xs font-bold">{tenant.dateOfVacate ? dayjs(tenant.dateOfVacate).format('DD MMM YYYY') : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Expected Checkout</p>
                        <p className="text-xs font-bold">{tenant.expectedCheckoutDate ? dayjs(tenant.expectedCheckoutDate).format('DD MMM YYYY') : 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {tenant.bedId && (
                  <Link
                    to={`/beds/${tenant.bedId}`}
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all"
                  >
                    View Bed Layout <ExternalLink size={16} />
                  </Link>
                )}
              </div>
            </div>

            {/* Documentation Section */}
            <Section title="Verification Documents" icon={<ShieldCheck />}>
              <div className="space-y-3">
                {tenant.documents && tenant.documents.length > 0 ? (
                  tenant.documents.map((doc, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-indigo-600 transition-all shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{doc.type}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Verified: {doc.type?.toUpperCase().includes('AADHAAR')
                              ? (doc.documentNumber ? `XXXX XXXX ${doc.documentNumber.slice(-4)}` : 'N/A')
                              : doc.documentNumber}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`${IMAGE_BASE_URL}${doc.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Documents Uploaded</p>
                  </div>
                )}
              </div>
            </Section>

            {/* Account Status Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <UserCheck size={16} className="text-indigo-600" /> Administrative Status
              </h3>
              <div className="space-y-4">
                <StatusToggle
                  label="Approval Status"
                  status={tenant.approved ? 'APPROVED' : 'PENDING'}
                  active={tenant.approved}
                />
                {!tenant.approved && (
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
                  >
                    {approving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ThumbsUp size={14} />
                    )}
                    Approve Tenant
                  </button>
                )}
                <StatusToggle label="Onboarding" status={tenant.approved ? 'COMPLETE' : 'IN-PROGRESS'} active={tenant.approved} />
                <StatusToggle label="Residency" status={tenant.vacated ? 'VACATED' : 'STAYING'} active={!tenant.vacated} />
                <StatusToggle label="Account Access" status={tenant.blocked ? 'BLOCKED' : 'ACTIVE'} active={!tenant.blocked} />
                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Custom Rent</span>
                    <span className={`text-[9px] font-bold ${tenant.customRent ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {tenant.customRent ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Prorated</span>
                    <span className={`text-[9px] font-bold ${tenant.prorated ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {tenant.prorated ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
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
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100'
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 border ${colors[color]}`}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-black text-slate-900">{value}</p>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <div className="text-indigo-600">{React.cloneElement(icon, { size: 18 })}</div>
        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        {children}
      </div>
    </div>
  )
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="flex gap-4 group">
      <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-white group-hover:border-indigo-100 transition-all shrink-0">
        {React.cloneElement(icon, { size: 16 })}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-black text-slate-900 truncate">{value || 'N/A'}</p>
      </div>
    </div>
  )
}

function StatusToggle({ label, status, active }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
        active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
      }`}>
        {status}
      </span>
    </div>
  )
}
