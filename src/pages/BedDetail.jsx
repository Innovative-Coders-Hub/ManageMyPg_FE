// src/pages/BedDetail.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { markRentAsPaid,updateVacatingDate } from '../api/ownerAuth'
import PageHeader from '../components/PageHeader'
import {
  getBedDetails,
  getAllTenants,
  assignTenantToBed,
} from '../api/ownerAuth'

import {
  fmt,
  fmtShort,
  minVacateDate,
  hasVacated
  } from "../components/utills/dateUtils";

import {
  calculateExtension,
  buildBillingPeriods,
  dueStatus
} from "../components/utills/billingUtils";

// import usePersistentMap from '../hooks/usePersistentMap'

import TenantCard from '../components/models/TenantCard'
import QuickAssignModal from '../components/models/QuickAssignModal'
import TenantModal from '../components/models/TenantModal'
import PaymentModal from '../components/models/PaymentModal'
import HistoryDetailsModal from '../components/models/HistoryDetailsModal'
import ConfirmModal from '../components/models/ConfirmModal'
import Snackbar from '../components/models/Snackbar'
import VacateTenantModal from '../components/models/VacateTenantModal'

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

function normalizeBed(data) {
  if (!data) return null

  const tenant = data.tenantDetails
  const latestRent = tenant?.rentResponse
    ?.slice()
    ?.sort((a, b) => b.rentMonth.localeCompare(a.rentMonth))[0]

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
      amountPaid: r.paidAmount,
      pending: (r.rentAmount ?? 0) - (r.paidAmount ?? 0),
      rent: r.rentAmount,
      modeOfPayment: r.modeOfPayment, // 👈 change here
      paidAt: r.paidDate,
      status: r.status,
    }
  })

  return map
}

function printAndDownloadSlip({ tenant, period, payment, bed }) {
  const win = window.open('', '_blank')
  if (!win) return

  const monthYear = dayjs(period.from).format('MMM YYYY')
  const fileName = `${tenant.name}_${dayjs(period.from).format('MMM_YYYY')}.pdf`

  win.document.write(`
  <!DOCTYPE html>
  <html>
  <head>
  <title>${fileName}</title>
  <style>
    @page {
      size: A5;
      margin: 12mm;
    }

    body {
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 12px;
      color: #000;
    }

    .header {
      text-align: center;
      margin-bottom: 8px;
    }

    .header h1 {
      margin: 0;
      font-size: 18px;
      letter-spacing: 1px;
    }

    .header .sub {
      font-size: 11px;
      margin-top: 2px;
    }

    .receipt-title {
      text-align: center;
      font-weight: bold;
      margin: 8px 0;
      text-decoration: underline;
    }

    .row {
      display: flex;
      justify-content: space-between;
      margin: 6px 0;
    }

    .label {
      width: 35%;
    }

    .value {
      width: 65%;
      border-bottom: 1px dotted #000;
      padding-left: 4px;
    }

    .amount-box {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .rs-box {
      border: 2px solid #000;
      padding: 6px 12px;
      font-weight: bold;
      font-size: 14px;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      font-size: 11px;
    }

    .signature {
      width: 45%;
      text-align: center;
      border-top: 1px solid #000;
      padding-top: 4px;
    }

    .footer {
      margin-top: 10px;
      font-size: 10px;
    }
  </style>
  </head>

  <body>

  <div class="header">
    <h1>BLISS MEN'S PG HOSTEL</h1>
    <div class="sub">
      Plot No. 220, Prasanth Hills, Raidurg, Khajaguda, Hyderabad - 500032<br/>
      Cell : 99666 08088
    </div>
  </div>

  <div class="receipt-title">RECEIPT</div>

  <div class="row">
    <div><strong>No:</strong> ${payment.id?.slice(-4) || '—'}</div>
    <div><strong>Date:</strong> ${dayjs(payment.paidAt).format('DD-MM-YYYY')}</div>
  </div>

  <div class="row">
    <div class="label">Received From</div>
    <div class="value">${tenant.name}</div>
  </div>

  <div class="row"><span class="label">Room No</span>
  <span class="value">${bed?.roomName || '-'} / Bed ${bed?.bedName || '-'}</span>
 </div>

  <div class="row">
    <div class="label">Valid From</div>
    <div class="value">${dayjs(period.from).format('DD MMM YYYY')}</div>
  </div>

  <div class="row">
    <div class="label">Valid To</div>
    <div class="value">${dayjs(period.to).format('DD MMM YYYY')}</div>
  </div>

  <div class="row">
    <div class="label">Rupees in words</div>
    <div class="value">${numberToWords(payment.amountPaid)} only</div>
  </div>

  <div class="amount-box">
    <div class="rs-box">Rs. ${payment.amountPaid}</div>
  </div>

  <div class="signatures">
    <div class="signature">Candidate's Signature</div>
    <div class="signature">Receiver's Signature</div>
  </div>

  <div class="footer">
    * Fees once paid is not refundable
  </div>

  <script>
    window.onload = () => {
      window.print()
      window.onafterprint = () => window.close()
    }
  </script>

  </body>
  </html>
  `)

  win.document.close()
}

function numberToWords(num) {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five',
    'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
    'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ]

  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  if (num === 0) return 'Zero'

  if (num < 20) return a[num]

  if (num < 100) {
    return b[Math.floor(num / 10)] + (num % 10 ? ' ' + a[num % 10] : '')
  }

  if (num < 1000) {
    return a[Math.floor(num / 100)] + ' Hundred ' + numberToWords(num % 100)
  }

  return num.toString()
}


/* -------------------------------------------------- */
/* Page                                               */
/* -------------------------------------------------- */

export default function BedDetail() {
  const { bedId } = useParams()
  const navigate = useNavigate()
  const [printedSlips, setPrintedSlips] = useState({})
  const [bed, setBed] = useState(null)
  const [loading, setLoading] = useState(true)
const [vacateModalOpen, setVacateModalOpen] = useState(false)
  // const [payments, setPayments] = usePersistentMap(
  //   `payments:${bedId}`,
  //   {}
  // )
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
  const [snack, setSnack] = useState(null)

  const showSnack = (text, type = 'success') => {
    setSnack({ text, type })
    setTimeout(() => setSnack(null), 2500)
  }

  /* ---------------- Fetch Bed ---------------- */

  useEffect(() => {
    async function fetchBed() {
      setLoading(true)
      try {
        const data = await getBedDetails(bedId)
        const normalized = normalizeBed(data)
        setBed(normalized)
        if (normalized?.tenantDetails?.rentResponse) {
        setPayments(
          buildPaymentsFromRentResponse(normalized.tenantDetails.rentResponse)
        )
      }
      } finally {
        setLoading(false)
      }
    }
    fetchBed()
  }, [bedId])

  /* ---------------- Fetch Tenants ---------------- */

  useEffect(() => {
    if (!bed?.pgId) return
    getAllTenants(bed.pgId).then(setTenants).catch(() => setTenants([]))
  }, [bed?.pgId])

  /* ---------------- Derived Data ---------------- */

  const current = bed?.occupied ? bed.tenantDetails : null
  const isVacated = hasVacated(current?.end)
  const defaultRent = current?.monthlyRent

const firstAdvance =  current?.rentResponse?.[0]?.advance ?? null
  const periods = useMemo(() => {
    if (!current?.start) return []
    return buildBillingPeriods(current.start, current.end ?? undefined)
  }, [current?.start, current?.end])

  const visiblePeriods = useMemo(() => {
    const limit = dayjs().add(1, 'month').endOf('month')
    return periods.filter(p => !dayjs(p.from).isAfter(limit))
  }, [periods])

  const totals = useMemo(() => {
    let due = 0, paid = 0, pending = 0
    periods.forEach(p => {
      const pay = payments[p.key]
      if (pay) {
        paid += Number(pay.amountPaid) || 0
        pending += Number(pay.pending) || 0
      } else {
        due += current.monthlyRent
      }
    })
    return { due, paid, pending }
  }, [periods, payments, defaultRent])

  const sortedHistory = useMemo(() => {
    return [...(bed?.bedHistory || [])].sort(
      (a, b) =>
        dayjs(b.end || b.start).valueOf() -
        dayjs(a.end || a.start).valueOf()
    )
  }, [bed])

  /* -------------------------------------------------- */
  function handleEditPayment(period) {
  setActivePeriod({
    ...period,
    __existing: payments[period.key],
  })
  setPaymentModalOpen(true)
}

function exportPaymentsCSV() {
  const rows = [
    ['Bed', 'Tenant', 'Period', 'From', 'To', 'Status', 'Paid', 'Pending', 'Mode', 'Paid At']
  ]

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
      pay?.mode ?? '-',
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
  showSnack('CSV exported')
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
        <td>${pay?.mode ?? '-'}</td>
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


  if (loading) return <div className="p-6">Loading…</div>

  if (!bed)
    return (
      <div className="p-6">
        <div className="font-semibold">Bed not found</div>
        <button onClick={() => navigate(-1)} className="mt-3 border px-3 py-2 rounded">
          Go Back
        </button>
      </div>
    )

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-8">
      <PageHeader
        title={`Bed ${bed.bedName}`}
        subtitle={`${bed.floorName} • Room ${bed.roomName}`}
      />
   {/* ================= GRID ================= */}
  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

  {/* LEFT COLUMN – ROW 1 */}
  <TenantCard
    bed={bed}
    current={current}
    totals={totals}
    statusLabel={bed.occupied ? 'Occupied' : 'Available'}
    statusClasses={
      bed.occupied
        ? 'bg-red-50 text-red-800 border border-red-200'
        : 'bg-green-50 text-green-700 border border-green-200'
    }
    isVacated={isVacated}
    onCreateTenant={() => setTenantModalOpen(true)}
    onQuickAssign={() => setQuickAssignOpen(true)}
    onOpenVacateEdit={() => setVacateModalOpen(true)}
  />
  <VacateTenantModal
  open={vacateModalOpen}
  tenant={current}
  onClose={() => setVacateModalOpen(false)}
  onSave={async ({ vacatingDate, reason }) => {   // ✅ FIX HERE
    try {
      await updateVacatingDate(current.id, {
        vacatingDate,
        reason,
      })

      const updated = await getBedDetails(bedId)
      setBed(normalizeBed(updated))

      showSnack('Vacating date updated')
    } catch (e) {
      showSnack('Failed to update vacating date', 'error')
    } finally {
      setVacateModalOpen(false)
    }
  }}
/>




  {/* RIGHT COLUMN – ROW 1 */}
    <div className="col-span-1 rounded-2xl border bg-white p-5 shadow-sm w-full min-w-0">
  <div className="flex items-center justify-between">
    <h3 className="font-semibold">Payments</h3>

    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">
        {visiblePeriods.length} period{visiblePeriods.length !== 1 ? 's' : ''}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={exportPaymentsCSV}
          className="px-2 py-1 rounded border text-xs hover:bg-gray-50"
        >
          CSV
        </button>
        <button
          onClick={printPayments}
          className="px-2 py-1 rounded border text-xs hover:bg-gray-50"
        >
          Print
        </button>
      </div>
    </div>
  </div>

      <div className="mt-4 space-y-4">
        {/* Totals */}
        <div className="rounded-lg border bg-gray-50 p-3 text-sm">
          {/* <div className="flex justify-between">
            <div className="text-xs text-gray-600">Total Due</div>
            <div className="font-semibold">₹{totals.due}</div>
          </div> */}
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <div>
              Paid: <span className="font-medium text-gray-900">₹{totals.paid}</span>
            </div>
            <div>
              Pending:{' '}
              <span className="font-medium text-amber-700">₹{totals.pending}</span>
            </div>
          </div>
        </div>

        {(!current || visiblePeriods.length === 0) ? (
          <div className="rounded-2xl border border-dashed p-4 text-sm text-gray-600">
            No periods to display.
          </div>
        ) : (
          <div className="space-y-4">
            {visiblePeriods.map(p => {
             const paid = payments[p.key]
            const status = dueStatus(p, paid)
            const isCurrentMonth = dayjs(p.from).isSame(dayjs(), 'month')
            const isFutureMonth = dayjs(p.from).isAfter(dayjs(), 'month')
              const badgeTone =
                status.tone === 'green' ? 'bg-green-50 border-green-200 text-green-800'
                : status.tone === 'red' ? 'bg-red-50 border-red-200 text-red-800'
                : status.tone === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-gray-50 border-gray-200 text-gray-700'


              return (
                <div key={p.key} className="rounded-xl border p-3 bg-white">
                  <div className="flex justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{p.label}</div>
                      <div className="text-xs text-gray-500">
                        {fmt(p.from, 'DD MMM')} – {fmt(p.to, 'DD MMM')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-flex px-2 py-0.5 rounded border text-xs ${badgeTone}`}
                      >
                        {status.label}
                      </div>

                      <div className="mt-1 font-semibold">
                        Rent : ₹{paid ? paid.amountPaid : current.monthlyRent}
                        <br />
                        Payment Mode : {paid ? paid.modeOfPayment.replace('_', ' ') : '—'}
                        {paid?.pending > 0 && (
                          <span className="text-xs text-amber-700 ml-1">
                            (+₹{paid.pending} pending)
                          </span>
                        )}
                      </div>


                      <div className="mt-2 flex gap-2 justify-end">
                       {isVacated ? (
                          <span className="text-xs text-gray-400 italic">
                            Payments locked
                          </span>
                        ) : isFutureMonth ? (
                          <span className="text-xs text-gray-400 italic">
                            Not payable yet
                          </span>
                        ) : paid ? (
                            <>
                              <button
                                onClick={() => {
                                  printAndDownloadSlip({
                                    tenant: current,
                                    period: p,
                                    payment: paid,
                                    bed: bed          // ✅ ADD THIS
                                  })
                                  setPrintedSlips(prev => ({ ...prev, [p.key]: true }))
                                }}
                                className="px-2 py-1 rounded border text-xs"
                              >
                                Print Slip
                              </button>

                              <button
                                onClick={() => handleEditPayment(p)}
                                className="px-2 py-1 rounded border text-xs"
                              >
                                Edit
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setActivePeriod(p)
                                setPaymentModalOpen(true)
                              }} className="
                                mt-[2px]
                                px-3 py-1.5
                                rounded-lg border
                                text-xs font-medium text-indigo-700
                                hover:bg-indigo-50
                                whitespace-nowrap
                              "
                            >
                              Mark As Paid
                            </button>
                          )}
                        {printedSlips[p.key] && (
                          <div className="text-[11px] text-green-600 mt-1 text-right">
                            Slip Printed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {p.isFirst &&
                    current?.start &&
                    dayjs(current.start).date() !== 1 && (
                      <div className="mt-2 text-[11px] bg-blue-50 border border-blue-200 text-blue-800 px-2 py-1 rounded inline-block">
                        Prorated
                      </div>
                    )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>


          {/* LEFT COLUMN – ROW 2 */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">History</h3>
              <span className="text-xs text-gray-500">
                {sortedHistory.length} records
              </span>
            </div>

            {sortedHistory.length === 0 ? (
              <div className="text-sm text-gray-500 border-dashed border p-4 rounded">
                No history yet
              </div>
            ) : (
              <ol className="space-y-3">
                {sortedHistory.map((h, i) => (
                  <li key={i} className="border rounded-lg p-3">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{h.tenantName}</div>
                        <div className="text-xs text-gray-500">
                          {fmtShort(h.start)} → {h.end ? fmtShort(h.end) : 'Ongoing'}
                        </div>
                      </div>
                      <button
                        className="text-xs border px-2 py-1 rounded"
                        onClick={() => {
                          setHistoryItem(h)
                          setHistoryOpen(true)
                        }}
                      >
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

        </div>


      {/* ================= MODALS ================= */}

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

              showSnack('Tenant assigned successfully')
              setQuickAssignOpen(false)
              setSelectedTenant(null)

            } catch (error) {
                const message =
                  error?.response?.data?.message ||
                  'Tenant already assigned to another bed'

                showSnack(message, 'error')
              }
          }}
      />

      <TenantModal
        open={tenantModalOpen}
        defaultRent={defaultRent}
        onClose={() => setTenantModalOpen(false)}
        onSave={() => {
          showSnack('Tenant assigned')
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
                  rentMonth: payload.rentMonth,
                  rent: payload.rent,
                  paidAmount: payload.paidAmount,
                  advance: payload.advance,
                  pending: payload.pending,
                  modeOfPayment: payload.modeOfPayment, // ✅ STRING
                  paidDate: payload.paidDate,
                  remarks: payload.remarks
                }

              const res = await markRentAsPaid(current.id, requestBody)

              // ✅ Backend-controlled success
              showSnack(res.message, 'success')

              // 🔄 Refresh bed & payments
              const updated = await getBedDetails(bedId)
              setBed(normalizeBed(updated))

              setPaymentModalOpen(false)

            } catch (error) {
              const apiMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Payment failed'

              showSnack(apiMessage, 'error')
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

      <Snackbar snack={snack} />
    </div>
  )
}
