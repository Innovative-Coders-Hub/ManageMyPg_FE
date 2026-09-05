import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppScope } from '../context/AppScopeContext'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import SEO from '../components/SEO'
import {
  markRentAsPaid,
  updateVacatingDate,
  getBedDetails,
  getAllTenants,
  getUnassignedTenants,
  assignTenantToBed,
  getPgDetailsById,
  getOwnerProfile
} from '../api/ownerAuth'
import {
  fmt,
  fmtShort,
  hasVacated
} from "../components/utills/dateUtils"
import {
  buildBillingPeriods,
  dueStatus
} from "../components/utills/billingUtils"
import { numberToWords } from '../components/utills/numberUtils'
import { printRentReceipt } from '../components/PrintRentReceipt'
import QuickAssignModal from '../components/models/QuickAssignModal'
import TenantModal from '../components/models/TenantModal'
import PaymentModal from '../components/models/PaymentModal'
import HistoryDetailsModal from '../components/models/HistoryDetailsModal'
import ConfirmModal from '../components/models/ConfirmModal'
import VacateTenantModal from '../components/models/VacateTenantModal'
import {
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  History,
  ArrowLeft,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  Percent,
  Bed as BedIcon,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle,
  IndianRupee,
  Plus,
  Loader2,
  CheckCircle2,
  ArrowUpRight,
  RefreshCcw
} from 'lucide-react'

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

function normalizeBed(data) {
  if (!data) return null
  const tenant = data.tenantDetails
  return {
    ...data,
    occupied: Boolean(data.occupied),
    tenantDetails: tenant
      ? {
          ...tenant,
          start: tenant.dateOfJoining,
          end: tenant.dateOfVacate,
          mobileNumber: tenant.mobileNumber,
          company: tenant.workCompany,
        }
      : null,
    bedHistory: Array.isArray(data.bedHistory)
      ? data.bedHistory.map(h => ({
          ...h,
          tenantName: h.tenantName || h.tenant?.name || h.name,
          start: h.startDate,
          end: h.endDate,
        }))
      : [],
  }
}

function buildPaymentsFromRentResponse(rentResponse = []) {
  const map = {}
  rentResponse.forEach(r => {
    const key = dayjs(r.rentMonth + '-01').format('YYYY-MM')
    map[key] = {
      key,
      paymentId: r.id,
      amountPaid: r.paidAmount,
      pending: (r.rentAmount ?? 0) - (r.paidAmount ?? 0),
      rent: r.rentAmount,
      modeOfPayment: r.modeOfPayment,
      paidAt: r.paidDate,
      status: r.status,
    }
  })
  return map
}

function generateTempReceiptNumber({ pgId, periodKey }) {
  const ym = dayjs().format('YYYYMM')
  const hash = Math.abs(
    `${pgId}-${periodKey}`.split('').reduce((sum, ch) => {
      return sum + ch.charCodeAt(0)
    }, 0)
  )
  return `PG-${pgId}-${ym}-${String(hash).slice(-4)}`
}

function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50', borderClass = 'border-indigo-100', isAccent = false }) {
  if (isAccent) {
    colorClass = 'text-white'
    bgClass = 'bg-indigo-600'
    borderClass = 'border-indigo-600'
  }
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:bg-white transition-all shadow-xs min-w-0">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border ${bgClass} ${colorClass} ${borderClass}`}>
        <Icon size={16} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xs font-black text-slate-900 truncate leading-none">{value}</p>
      </div>
    </div>
  )
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100/80 last:border-0">
      <div className="flex items-center gap-2 text-slate-400">
        {Icon && <Icon size={14} />}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-xs font-black text-slate-900 truncate ml-3">
        {value || '—'}
      </div>
    </div>
  )
}

export default function BedDetail() {
  const { bedId: routeBedId } = useParams()
  const { activeBedId } = useAppScope()
  const bedId = activeBedId || routeBedId
  const navigate = useNavigate()
  const [printedSlips, setPrintedSlips] = useState({})
  const [bed, setBed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [vacateModalOpen, setVacateModalOpen] = useState(false)
  const [payments, setPayments] = useState({})
  const [tenants, setTenants] = useState([])
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [quickAssignOpen, setQuickAssignOpen] = useState(false)
  const [tenantModalOpen, setTenantModalOpen] = useState(false)
  const [activePeriod, setActivePeriod] = useState(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [historyItem, setHistoryItem] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const fetchBed = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await getBedDetails(bedId)
      const normalized = normalizeBed(data)

      let pgInfo = null
      let ownerInfo = null
      if (normalized?.pgId) {
        try {
          const [pgRes, ownerRes] = await Promise.all([
            getPgDetailsById(normalized.pgId).catch(() => null),
            getOwnerProfile().catch(() => null)
          ])
          pgInfo = pgRes
          ownerInfo = ownerRes
        } catch (e) {
          console.error(e)
        }
      }

      const mergedBed = {
        ...normalized,
        pgName: pgInfo?.pgName || pgInfo?.name || normalized?.pgName || localStorage.getItem('selectedPgName') || localStorage.getItem('businessName') || 'Manage My PG',
        pgAddress: pgInfo?.address || pgInfo?.fullAddress || normalized?.pgAddress || localStorage.getItem('pgAddress') || '',
        pgPhone: pgInfo?.phone || pgInfo?.mobile || normalized?.pgPhone || '',
        ownerName: ownerInfo?.fullName || ownerInfo?.businessName || pgInfo?.ownerName || normalized?.ownerName || localStorage.getItem('fullName') || 'Property Owner'
      }

      setBed(mergedBed)
      if (mergedBed?.tenantDetails?.rentResponse) {
        setPayments(
          buildPaymentsFromRentResponse(mergedBed.tenantDetails.rentResponse)
        )
      }
    } catch (e) {
      toast.error('Failed to load bed details')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    if (!bedId) {
      navigate('/mypgs', { replace: true })
      return
    }
    fetchBed()
  }, [bedId, navigate])

  useEffect(() => {
    if (!bed?.pgId || !quickAssignOpen) return
    getUnassignedTenants(bed.pgId).then(setTenants).catch(() => setTenants([]))
  }, [bed?.pgId, quickAssignOpen])

  const current = bed?.occupied ? bed.tenantDetails : null
  const isVacated = hasVacated(current?.end)
  const defaultRent = current?.monthlyRent
  const firstAdvance = current?.rentResponse?.[0]?.advance ?? null

  const periods = useMemo(() => {
    if (!current?.start) return []
    return buildBillingPeriods(current.start, current.end ?? undefined)
  }, [current?.start, current?.end])

  const visiblePeriods = useMemo(() => {
    const limit = dayjs().add(1, 'month').endOf('month')
    return periods.filter(p => !dayjs(p.from).isAfter(limit))
  }, [periods])

  function handleTransferTenant(data) {
    navigate('/tenant-transfer', {
      state: {
        ...data,
        pgId: bed?.pgId
      }
    });
  }

  const totals = useMemo(() => {
    let due = 0, paid = 0, pending = 0
    periods.forEach(p => {
      const pay = payments[p.key]
      if (pay) {
        paid += Number(pay.amountPaid) || 0
        pending += Number(pay.pending) || 0
      } else if (current) {
        due += current.monthlyRent
      }
    })
    return { due, paid, pending }
  }, [periods, payments, current])

  const sortedHistory = useMemo(() => {
    return [...(bed?.bedHistory || [])].sort(
      (a, b) =>
        dayjs(b.end || b.start).valueOf() -
        dayjs(a.end || a.start).valueOf()
    )
  }, [bed])

  function handleEditPayment(period) {
    setActivePeriod({
      ...period,
      __existing: payments[period.key],
    })
    setPaymentModalOpen(true)
  }

  function exportPaymentsCSV() {
    const rows = [['Bed', 'Tenant', 'Period', 'From', 'To', 'Status', 'Paid', 'Pending', 'Mode', 'Paid At']]
    visiblePeriods.forEach(p => {
      const pay = payments[p.key]
      rows.push([
        bed.bedName,
        current?.name || '',
        p.label,
        fmtShort(p.from),
        fmtShort(p.to),
        pay ? pay.status : 'DUE',
        pay ? pay.amountPaid : 0,
        pay ? pay.pending : current?.monthlyRent || 0,
        pay?.modeOfPayment || '',
        pay?.paidAt ? fmtShort(pay.paidAt) : ''
      ])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${bed.bedName}-${dayjs().format('YYYYMMDD')}.csv`
    a.click()
  }

  function printPayments() {
    const win = window.open('', '_blank')
    const rows = visiblePeriods.map(p => {
      const pay = payments[p.key]
      return `
        <tr>
          <td>${p.label}</td>
          <td>${fmtShort(p.from)}</td>
          <td>${fmtShort(p.to)}</td>
          <td>${pay ? pay.status : 'DUE'}</td>
          <td>₹${pay ? pay.amountPaid : 0}</td>
          <td>₹${pay ? pay.pending : current?.monthlyRent || 0}</td>
          <td>${pay?.modeOfPayment || '—'}</td>
        </tr>
      `
    }).join('')

    win.document.write(`
      <html>
        <head>
          <title>Payments - ${bed.bedName}</title>
          <style>
            body { font: 14px system-ui; padding: 16px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 6px; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h3>Payments — ${bed.bedName}</h3>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <script>window.print()</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Bed Allocation Details...</p>
        </div>
      </div>
    )
  }

  if (!bed) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center shadow-xl max-w-md">
          <AlertCircle size={48} className="mx-auto text-rose-500 mb-6" />
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Bed Allocation Not Found</h2>
          <p className="text-slate-500 font-medium text-sm mt-2 mb-8">The requested bed space could not be found or has been unassigned.</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={16} /> Return Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <SEO
        title={`Bed ${bed.bedName} | ${bed.roomName}`}
        description={`Details for Bed ${bed.bedName} in Room ${bed.roomName} at ${bed.pgName || 'ManageMyPg'}. View resident info, payment history, and bed status.`}
        canonical={`/bed/${bedId}`}
      />

      {/* STICKY HEADER BAR */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                title="Back to PG Layout"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black shrink-0 shadow-xs">
                <BedIcon size={24} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100/80 shrink-0">
                    {bed.pgName || 'ManageMyPg'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                    bed.occupied
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    {bed.occupied ? 'Occupied' : 'Available'}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase truncate leading-tight">
                  Bed {bed.bedName} <span className="text-slate-400 font-bold text-base md:text-lg">({bed.roomName})</span>
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">
                  {bed.floorName} • Room {bed.roomName} • Space {bed.bedName}
                </p>
              </div>
            </div>

            {/* Quick Executive Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 xl:max-w-3xl">
              <TopStat label="Space Status" value={bed.occupied ? 'Occupied' : 'Open'} icon={ShieldCheck} isAccent={bed.occupied} />
              <TopStat label="Monthly Rent" value={`₹${(current?.monthlyRent || bed?.monthlyRent || bed?.rent || 0).toLocaleString()}`} icon={IndianRupee} />
              <TopStat label="Total Paid" value={`₹${totals.paid.toLocaleString()}`} icon={TrendingUp} colorClass="text-emerald-600" bgClass="bg-emerald-50" borderClass="border-emerald-100" />
              <TopStat label="Pending Dues" value={`₹${totals.pending.toLocaleString()}`} icon={AlertCircle} isAccent={totals.pending > 0} colorClass="text-rose-600" bgClass="bg-rose-50" borderClass="border-rose-100" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 self-end xl:self-center shrink-0">
              {!bed.occupied && (
                <button
                  onClick={() => setQuickAssignOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Plus size={14} /> Quick Assign Resident
                </button>
              )}
              {bed.occupied && (
                <button
                  onClick={() => handleTransferTenant({
                    floorId: bed.floorId,
                    floorName: bed.floorName,
                    roomId: bed.roomId,
                    roomName: bed.roomName,
                    bedId: bed.id,
                    bedName: bed.bedName,
                    tenantId: current?.id,
                    tenantName: current?.name
                  })}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <RefreshCcw size={14} /> Transfer Tenant
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: RESIDENT PROFILE & HISTORY (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">

            {/* RESIDENT PROFILE CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <User size={16} className="text-indigo-600" /> Assigned Resident
                </h3>
                {current && (
                  <span className={`px-2.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                    isVacated ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {isVacated ? 'Vacated' : 'Active'}
                  </span>
                )}
              </div>

              {current ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                    <div className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-lg font-black shrink-0 shadow-xs">
                      {current.name ? current.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to={`/tenant/${current.id}`} className="group flex items-center gap-1 hover:text-indigo-600 transition-colors">
                        <span className="text-xs font-black text-slate-900 uppercase truncate group-hover:text-indigo-600">{current.name}</span>
                        <ArrowUpRight size={12} className="text-slate-400 group-hover:text-indigo-600 shrink-0" />
                      </Link>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{current.mobileNumber}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <InfoRow label="Joining Date" value={fmt(current.start)} icon={Calendar} />
                    <InfoRow label="Vacating Date" value={fmt(current.end)} icon={Clock} />
                    <InfoRow label="Workplace / College" value={current.company} icon={Briefcase} />
                    <InfoRow label="Email Address" value={current.email} icon={Mail} />
                    <InfoRow label="Emergency Contact" value={current.parentNumber} icon={Phone} />
                  </div>

                  {current && (
                    <div className="pt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setVacateModalOpen(true)}
                        className="py-2.5 px-3 bg-slate-50 text-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 shadow-xs cursor-pointer text-center"
                      >
                        {current?.end ? 'Update Vacate' : 'Set Vacate'}
                      </button>
                      <button
                        onClick={() => handleTransferTenant({
                          floorId: bed.floorId,
                          floorName: bed.floorName,
                          roomId: bed.roomId,
                          roomName: bed.roomName,
                          bedId: bed.id,
                          bedName: bed.bedName,
                          tenantId: current?.id,
                          tenantName: current?.name
                        })}
                        className="py-2.5 px-3 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 shadow-xs cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        <RefreshCcw size={12} /> Transfer Tenant
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 px-3 space-y-4">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100 shadow-xs">
                    <BedIcon size={28} />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[8px] font-black uppercase tracking-widest inline-block mb-1.5">
                      Vacant & Available
                    </span>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">No Resident Assigned</h4>
                    <p className="text-[10px] font-medium text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                      Assign an existing resident from your directory or onboard a new tenant to activate this bed space.
                    </p>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => setQuickAssignOpen(true)}
                      className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xs hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} /> Quick Assign Resident
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* OCCUPANCY HISTORY CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <History size={16} className="text-indigo-600" /> Occupancy History
                </h3>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{sortedHistory.length} Records</span>
              </div>

              <div className="space-y-2">
                {sortedHistory.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-[9px] font-black uppercase tracking-widest">
                    No historical logs found
                  </div>
                ) : (
                  sortedHistory.map((h, i) => (
                    <div
                      key={i}
                      className="group p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer"
                      onClick={() => { setHistoryItem(h); setHistoryOpen(true); }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{h.tenantName}</div>
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            {fmtShort(h.start)} — {h.end ? fmtShort(h.end) : 'Present'}
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FINANCIAL LEDGER & REVENUE COLLECTION (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <CreditCard size={18} className="text-indigo-600" /> Tenant Rent Ledger
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Audit Trail & Billing Collections</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportPaymentsCSV}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 shadow-xs cursor-pointer"
                  >
                    <Download size={13} /> CSV
                  </button>
                  <button
                    onClick={printPayments}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-700 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 shadow-xs cursor-pointer"
                  >
                    <Printer size={13} /> Print
                  </button>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {!current || visiblePeriods.length === 0 ? (
                  <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200/80 rounded-2xl bg-slate-50/50 space-y-3">
                    <div className="w-14 h-14 bg-white text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-200 shadow-xs">
                      <CreditCard size={28} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Financial Ledger Inactive</h4>
                      <p className="text-[10px] font-medium text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                        Monthly rent tracking, payment ledger, and billing statements will activate automatically as soon as a resident is assigned to Bed {bed.bedName}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visiblePeriods.map(p => {
                      const paid = payments[p.key]
                      const status = dueStatus(p, paid)
                      const isFuture = dayjs(p.from).isAfter(dayjs(), 'month')

                      const toneStyles = {
                        green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                        red: 'bg-rose-50 text-rose-600 border-rose-100',
                        amber: 'bg-amber-50 text-amber-600 border-amber-100',
                        gray: 'bg-slate-50 text-slate-400 border-slate-100'
                      }

                      return (
                        <div key={p.key} className="group p-4 rounded-xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-xs transition-all bg-white">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center shrink-0 ${toneStyles[status.tone]}`}>
                                <div className="text-sm font-black leading-none">{dayjs(p.from).format('DD')}</div>
                                <div className="text-[7px] font-black uppercase tracking-widest mt-0.5">{dayjs(p.from).format('MMM')}</div>
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{p.label}</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                  {fmt(p.from, 'DD MMM')} — {fmt(p.to, 'DD MMM')}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 sm:justify-end flex-1">
                              <div className="sm:text-right">
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status</div>
                                <div className={`inline-flex px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${toneStyles[status.tone]}`}>
                                  {status.label}
                                </div>
                              </div>

                              <div className="sm:text-right">
                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Collection</div>
                                <div className="text-xs font-black text-slate-900">
                                  ₹{(paid ? paid.amountPaid : current.monthlyRent).toLocaleString()}
                                  {paid?.pending > 0 && <span className="text-[9px] text-amber-600 font-bold ml-1">(-₹{paid.pending})</span>}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {paid ? (
                                  <>
                                    {(!paid.pending || paid.pending <= 0) && paid.status !== 'PARTIAL' ? (
                                      <button
                                        onClick={async () => {
                                          let pgInfo = { name: bed.pgName, address: bed.pgAddress, phone: bed.pgPhone }
                                          let ownerInfo = { name: bed.ownerName }

                                          try {
                                            const [pgRes, ownerRes] = await Promise.all([
                                              bed?.pgId ? getPgDetailsById(bed.pgId).catch(() => null) : null,
                                              getOwnerProfile().catch(() => null)
                                            ])
                                            if (pgRes) {
                                              pgInfo = {
                                                name: pgRes.pgName || pgRes.name || pgInfo.name,
                                                address: pgRes.address || pgRes.fullAddress || pgInfo.address,
                                                phone: pgRes.phone || pgRes.mobile || pgInfo.phone
                                              }
                                            }
                                            if (ownerRes) {
                                              ownerInfo.name = ownerRes.fullName || ownerRes.businessName || ownerInfo.name
                                            }
                                          } catch (e) {
                                            console.error('Receipt API fetch error', e)
                                          }

                                          const receiptData = {
                                            receipt: {
                                              receiptNumber: generateTempReceiptNumber({ pgId: bed.pgId, periodKey: p.key }),
                                              issuedAt: paid.paidAt,
                                            },
                                            pg: pgInfo,
                                            owner: ownerInfo,
                                            tenant: { name: current.name, mobile: current.mobileNumber },
                                            bed: { roomName: bed.roomName, bedName: bed.bedName },
                                            billing: {
                                              period: { from: p.from, to: p.to },
                                              amount: { paid: paid.amountPaid, inWords: `${numberToWords(paid.amountPaid)} only` },
                                              payment: { mode: paid.modeOfPayment || 'CASH', paidAt: paid.paidAt },
                                              remarks: ''
                                            }
                                          }
                                          printRentReceipt(receiptData)
                                        }}
                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-200 cursor-pointer shadow-xs font-black text-[9px] uppercase tracking-wider"
                                        title="Download Receipt"
                                      >
                                        <Download size={13} /> Download
                                      </button>
                                    ) : (
                                      <button
                                        disabled
                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-400 rounded-lg border border-slate-200 cursor-not-allowed opacity-50 font-black text-[9px] uppercase tracking-wider"
                                        title="Receipt download is only available for fully paid rent"
                                      >
                                        <Download size={13} /> Download
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleEditPayment(p)}
                                      className="px-3 py-1.5 bg-slate-100 text-slate-800 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-200 transition-colors shadow-xs cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setActivePeriod(p)
                                      setPaymentModalOpen(true)
                                    }}
                                    className="px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                                  >
                                    <CreditCard size={13} /> Mark Paid
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <QuickAssignModal
        open={quickAssignOpen}
        onClose={() => setQuickAssignOpen(false)}
        bed={bed}
        tenants={tenants}
        onAssignSuccess={async (selectedTenantId) => {
          try {
            await assignTenantToBed(bed.id, selectedTenantId)
            toast.success('Resident assigned successfully!')
            setQuickAssignOpen(false)
            fetchBed(true)
          } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to assign resident')
          }
        }}
        onAddNewTenant={() => {
          setQuickAssignOpen(false)
          setTenantModalOpen(true)
        }}
      />

      <TenantModal
        open={tenantModalOpen}
        onClose={() => setTenantModalOpen(false)}
        pgId={bed.pgId}
        defaultBedId={bed.id}
        onSuccess={() => {
          setTenantModalOpen(false)
          fetchBed(true)
        }}
      />

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        period={activePeriod}
        defaultRent={defaultRent}
        firstAdvance={firstAdvance}
        onSave={async (payload) => {
          try {
            const requestBody = {
              paymentId: activePeriod?.__existing?.paymentId || null,
              rentMonth: activePeriod?.key,
              rent: payload.rent,
              paidAmount: payload.paidAmount,
              advance: payload.advance,
              pending: payload.pending,
              modeOfPayment: payload.modeOfPayment,
              paidDate: payload.paidDate,
              remarks: payload.remarks
            }
            await markRentAsPaid(current.id, requestBody)
            setPaymentModalOpen(false)
            toast.success('Payment recorded successfully!')
            fetchBed(true)
          } catch (err) {
            toast.error('Failed to record payment')
          }
        }}
      />

      <HistoryDetailsModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={historyItem}
      />

      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.title || ''}
        message={confirm?.message || ''}
        confirmText="Confirm"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.action()
          setConfirm(null)
        }}
      />

      <VacateTenantModal
        open={vacateModalOpen}
        onClose={() => setVacateModalOpen(false)}
        tenant={current}
        currentDate={current?.end}
        onSave={async (vacatingDate) => {
          try {
            await updateVacatingDate(current.id, vacatingDate)
            toast.success('Vacating date updated successfully!')
            setVacateModalOpen(false)
            fetchBed(true)
          } catch (err) {
            toast.error('Failed to update vacating date')
          }
        }}
      />
    </div>
  )
}
