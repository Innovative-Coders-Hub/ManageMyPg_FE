import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  assignTenantToBed
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
  Loader2
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
    <div className="flex items-center gap-3 px-3 py-2 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-sm transition-all min-w-[120px]">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${bgClass} ${colorClass} ${borderClass} group-hover:scale-110 transition-transform`}>
        <Icon size={14} strokeWidth={2.5} />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-[10px] font-black text-slate-900 truncate leading-none">{value}</p>
      </div>
    </div>
  )
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2 text-slate-400">
        {Icon && <Icon size={12} />}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-[11px] font-black text-slate-900 truncate ml-4">
        {value || '—'}
      </div>
    </div>
  )
}

export default function BedDetail() {
  const { bedId } = useParams()
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
      setBed(normalized)
      if (normalized?.tenantDetails?.rentResponse) {
        setPayments(
          buildPaymentsFromRentResponse(normalized.tenantDetails.rentResponse)
        )
      }
    } catch (e) {
      toast.error('Failed to load bed details')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchBed()
  }, [bedId])

  useEffect(() => {
    if (!bed?.pgId) return
    getAllTenants(bed.pgId).then(setTenants).catch(() => setTenants([]))
  }, [bed?.pgId])

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
      state: data,
      pgId: bed?.pgId
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
        current?.name || '-',
        p.label,
        fmt(p.from),
        fmt(p.to),
        pay ? 'Paid' : 'Unpaid',
        pay?.amountPaid ?? 0,
        pay?.pending ?? defaultRent,
        pay?.modeOfPayment ?? '-',
        pay?.paidAt ? fmt(pay.paidAt, 'DD MMM YYYY, HH:mm') : '-',
      ])
    })
    const csv = rows.map(r =>
      r.map(v =>
        typeof v === 'string' && v.includes(',')
          ? `"${v.replace(/"/g, '""')}"`
          : v
      ).join(',')
    ).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments_${bed.bedName}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  function printPayments() {
    const win = window.open('', '_blank')
    if (!win) return
    const rows = visiblePeriods.map(p => {
      const pay = payments[p.key]
      return `
      <tr>
        <td>${p.label}</td>
        <td>${fmt(p.from)}</td>
        <td>${fmt(p.to)}</td>
        <td>${pay ? 'Paid' : 'Unpaid'}</td>
        <td>${pay?.amountPaid ?? defaultRent}</td>
        <td>${pay?.pending ?? 0}</td>
        <td>${pay?.modeOfPayment ?? '-'}</td>
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
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    )
  }

  if (!bed) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-xl shadow-slate-200/50">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-6" />
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Bed not found</h2>
          <button onClick={() => navigate(-1)} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const occupancy = bed.occupied ? 100 : 0

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <SEO
        title={`Bed ${bed.bedName} | ${bed.roomName}`}
        description={`Details for Bed ${bed.bedName} in Room ${bed.roomName} at ${bed.pgName || 'ManageMyPg'}. View resident info, payment history, and bed status.`}
        canonical={`/bed/${bedId}`}
      />
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all group shrink-0"
              >
                <ArrowLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase truncate leading-tight">
                  Bed {bed.bedName}
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  {bed.floorName} • Room {bed.roomName}
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 xl:max-w-3xl">
              <TopStat label="Status" value={bed.occupied ? 'Occupied' : 'Open'} icon={ShieldCheck} isAccent={bed.occupied} />
              <TopStat label="Rent" value={`₹${current?.monthlyRent || 0}`} icon={IndianRupee} />
              <TopStat label="Paid" value={`₹${totals.paid}`} icon={TrendingUp} colorClass="text-emerald-600" bgClass="bg-emerald-50" borderClass="border-emerald-100" />
              <TopStat label="Pending" value={`₹${totals.pending}`} icon={AlertCircle} isAccent={totals.pending > 0} colorClass="text-rose-600" bgClass="bg-rose-50" borderClass="border-rose-100" />
            </div>

            <div className="flex items-center gap-3 self-end xl:self-center">
              {!bed.occupied && (
                <button
                  onClick={() => setQuickAssignOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-100 disabled:opacity-50"
                >
                  <Plus size={14} /> Quick Assign
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Resident Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Resident</h3>
                {current && (
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isVacated ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {isVacated ? 'Vacated' : 'Active'}
                  </span>
                )}
              </div>

              {current ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-100">
                      {current.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <Link to={`/tenant/${current.id}`} className="hover:text-indigo-600 transition-colors">
                        <div className="text-sm font-black text-slate-900 truncate uppercase">{current.name}</div>
                      </Link>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{current.mobileNumber}</div>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <InfoRow label="Joining Date" value={fmt(current.start)} icon={Calendar} />
                    <InfoRow label="Vacating Date" value={fmt(current.end)} icon={Clock} />
                    <InfoRow label="Organization" value={current.company} icon={Briefcase} />
                    <InfoRow label="Email" value={current.email} icon={Mail} />
                    <InfoRow label="Emergency" value={current.parentNumber} icon={Phone} />
                  </div>

                  {!isVacated && (
                    <div className="pt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setVacateModalOpen(true)}
                        className="py-2.5 bg-slate-50 text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 shadow-sm"
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
                        className="py-2.5 bg-rose-50 text-rose-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100 shadow-sm"
                      >
                        Transfer
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4 border border-slate-100">
                    <User size={32} />
                  </div>
                  <p className="text-slate-500 text-xs font-medium mb-6 px-4">No resident currently assigned to this bed.</p>
                  <button
                    onClick={() => setQuickAssignOpen(true)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    Quick Assign
                  </button>
                </div>
              )}
            </div>

            {/* History Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">History</h3>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{sortedHistory.length} Records</span>
              </div>

              <div className="space-y-2">
                {sortedHistory.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    No history found
                  </div>
                ) : (
                  sortedHistory.map((h, i) => (
                    <div key={i} className="group p-3 rounded-2xl border border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer" onClick={() => { setHistoryItem(h); setHistoryOpen(true); }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{h.tenantName}</div>
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            {fmtShort(h.start)} — {h.end ? fmtShort(h.end) : 'Present'}
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Ledger */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Financial Ledger</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit Trail & Revenue Collection</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={exportPaymentsCSV} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 shadow-sm">
                    <Download size={12} /> CSV
                  </button>
                  <button onClick={printPayments} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 shadow-sm">
                    <Printer size={12} /> Print
                  </button>
                </div>
              </div>

              <div className="p-6">
                {!current || visiblePeriods.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl">
                    <CreditCard size={40} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No billing periods active</p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                        <div key={p.key} className="group p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center ${toneStyles[status.tone]}`}>
                                <div className="text-base font-black leading-none">{dayjs(p.from).format('DD')}</div>
                                <div className="text-[8px] font-black uppercase tracking-widest mt-0.5">{dayjs(p.from).format('MMM')}</div>
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{p.label}</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                  {fmt(p.from, 'DD MMM')} — {fmt(p.to, 'DD MMM')}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 md:justify-end flex-1">
                              <div className="text-right">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                                <div className={`inline-flex px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${toneStyles[status.tone]}`}>
                                  {status.label}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Collection</div>
                                <div className="text-sm font-black text-slate-900">
                                  ₹{paid ? paid.amountPaid : current.monthlyRent}
                                  {paid?.pending > 0 && <span className="text-[9px] text-amber-500 ml-1">(-₹{paid.pending})</span>}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {!isVacated && !isFuture && (
                                  <>
                                    {paid ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            const receiptData = {
                                              receipt: {
                                                receiptNumber: generateTempReceiptNumber({ pgId: bed.pgId, periodKey: p.key }),
                                                issuedAt: paid.paidAt,
                                              },
                                              pg: { name: bed.pgName || '—', address: bed.pgAddress || '—', phone: bed.pgPhone || '' },
                                              owner: { name: bed.ownerName || '—' },
                                              tenant: { name: current.name, mobile: current.mobileNumber },
                                              bed: { roomName: bed.roomName, bedName: bed.bedName },
                                              billing: {
                                                period: { from: p.from, to: p.to },
                                                amount: { paid: paid.amountPaid, inWords: `${numberToWords(paid.amountPaid)} only` },
                                                payment: { mode: paid.modeOfPayment?.replace('_', ' ') || '-', paidAt: paid.paidAt },
                                                remarks: paid.remarks,
                                              },
                                            }
                                            printRentReceipt(receiptData)
                                            setPrintedSlips(prev => ({ ...prev, [p.key]: true }))
                                          }}
                                          className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border border-slate-200 shadow-sm"
                                          title="Print Receipt"
                                        >
                                          <Printer size={16} />
                                        </button>
                                        <button
                                          onClick={() => handleEditPayment(p)}
                                          className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border border-slate-200 shadow-sm"
                                          title="Edit Payment"
                                        >
                                          <TrendingUp size={16} />
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => { setActivePeriod(p); setPaymentModalOpen(true); }}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                      >
                                        Mark as Paid
                                      </button>
                                    )}
                                  </>
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

      <VacateTenantModal
        open={vacateModalOpen}
        tenant={current}
        onClose={() => setVacateModalOpen(false)}
        onSave={async ({ vacatingDate, reason }) => {
          try {
            await updateVacatingDate(current.id, { vacatingDate, reason })
            const updated = await getBedDetails(bedId)
            setBed(normalizeBed(updated))
            toast.success('Vacating date updated')
          } catch (e) {
            toast.error('Failed to update vacating date')
          } finally {
            setVacateModalOpen(false)
          }
        }}
      />

      <QuickAssignModal
        open={quickAssignOpen}
        tenants={tenants}
        selectedTenant={selectedTenant}
        onSelectTenant={setSelectedTenant}
        onClose={() => {
          setQuickAssignOpen(false)
          setSelectedTenant(null)
        }}
        onAssign={async () => {
          try {
            await assignTenantToBed(bed.id, selectedTenant.id)
            const updated = await getBedDetails(bedId)
            setBed(normalizeBed(updated))
            toast.success('Tenant assigned successfully')
            setQuickAssignOpen(false)
            setSelectedTenant(null)
          } catch (error) {
            toast.error(error?.response?.data?.message || 'Assignment failed')
          }
        }}
      />

      <TenantModal
        open={tenantModalOpen}
        defaultRent={defaultRent}
        onClose={() => setTenantModalOpen(false)}
        onSave={() => {
          toast.success('Tenant assigned')
          setTenantModalOpen(false)
        }}
      />

      <PaymentModal
        open={paymentModalOpen}
        period={activePeriod}
        defaultRent={defaultRent}
        existingAdvance={firstAdvance}
        onClose={() => setPaymentModalOpen(false)}
        onSave={async payload => {
          try {
            const requestBody = {
              paymentId: activePeriod?.__existing?.paymentId || null,
              rentMonth: payload.rentMonth,
              rent: payload.rent,
              paidAmount: payload.paidAmount,
              advance: payload.advance,
              pending: payload.pending,
              modeOfPayment: payload.modeOfPayment,
              paidDate: payload.paidDate,
              remarks: payload.remarks
            }
            const res = await markRentAsPaid(current.id, requestBody)
            setPaymentModalOpen(false)
            toast.success(res.message || 'Payment recorded')
            fetchBed(true)
          } catch (error) {
            toast.error(error?.response?.data?.message || 'Payment failed')
          }
        }}
      />

      <HistoryDetailsModal
        open={historyOpen}
        historyItem={historyItem}
        paymentsForRange={payments}
        defaultRent={defaultRent}
        onClose={() => setHistoryOpen(false)}
      />

      <ConfirmModal
        open={!!confirm}
        {...confirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

