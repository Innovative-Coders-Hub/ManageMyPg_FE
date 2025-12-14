import React, { useMemo, useState } from "react"
import PageHeader from '../components/PageHeader'

/*
  Reports page
  - Centered layout (max-w-6xl)
  - Global filters: PG selector, date range presets
  - KPI cards: Occupancy, MTD Revenue, Outstanding Dues, Tenant Churn
  - Report sections with lightweight visualizations (pure CSS/Tailwind)
  - Export buttons (CSV/PDF placeholders)
  - All UI-only; wire to your APIs later
*/

const DownloadIcon = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 3a1 1 0 0 1 1 1v9.586l2.293-2.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 8.707 11.293L11 13.586V4a1 1 0 0 1 1-1Zm-7 16a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"/>
  </svg>
)

const CalendarIcon = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm12 8H5v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8Z"/>
  </svg>
)

const BuildingIcon = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M4 20h16v2H4v-2Zm2-2h5V2H6v16Zm7 0h5V6h-5v12Z"/>
  </svg>
)

/* Tiny sparkline using pure CSS bars */
function Sparkline({ values = [] }) {
  const max = Math.max(1, ...values)
  return (
    <div className="flex items-end gap-1 h-10">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded bg-indigo-200"
          style={{ height: `${(v / max) * 100}%` }}
          title={`${v}`}
        />
      ))}
    </div>
  )
}

function Progress({ value = 0, label }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div>
      {label && <div className="mb-1 text-xs text-gray-600">{label}</div>}
      <div className="h-2 w-full rounded bg-gray-100 overflow-hidden">
        <div className="h-full bg-green-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-gray-700">{pct}%</div>
    </div>
  )
}

function Stat({ title, value, sub, trend }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
      {Array.isArray(trend) && trend.length > 0 && (
        <div className="mt-3"><Sparkline values={trend} /></div>
      )}
    </div>
  )
}

export default function Reports() {
  // "Filters" state — replace with real data as needed
  const [pgId, setPgId] = useState("all")
  const [range, setRange] = useState("last_30")

  // Demo numbers — wire to API later
  const data = useMemo(() => ({
    occupancyPct: 81,
    mtdRevenue: 245000,
    duesOutstanding: 48000,
    churnRatePct: 4.2,
    occupancyTrend: [68, 72, 70, 75, 78, 81],
    revenueTrend: [180, 195, 210, 220, 235, 245],
  }), [])

  const exportCSV = (reportKey) => {
    // placeholder — plug actual data
    const rows = [
      ["Report", reportKey],
      ["GeneratedAt", new Date().toISOString()],
      ["Filters", `pg=${pgId}; range=${range}`],
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${reportKey}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = (reportKey) => {
    // Keep simple for now
    alert(`PDF export placeholder for ${reportKey}. Integrate jsPDF later.`)
  }

  return (
    <div className="w-full max-w-screen-2xl px-4 py-6 space-y-6">
      <PageHeader title="Reports" />
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => exportCSV("all_reports_summary")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
          >
            <DownloadIcon /> Export CSV
          </button>
          <button
            onClick={() => exportPDF("all_reports_summary")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            <DownloadIcon /> Export PDF
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="z-10">
        <div className="rounded-2xl border bg-white/80 backdrop-blur p-4 shadow-sm">
          <div className="grid sm:grid-cols-3 gap-3 items-end">
            {/* PG selector */}
            <label className="block text-sm">
              <span className="font-medium text-gray-700 flex items-center gap-2"><BuildingIcon/> PG</span>
              <select
                value={pgId}
                onChange={(e)=>setPgId(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All PGs</option>
                <option value="pg1">Bliss Mens PG</option>
                <option value="pg2">Bliss Womens PG</option>
              </select>
            </label>

            {/* Date range presets */}
            <label className="block text-sm">
              <span className="font-medium text-gray-700 flex items-center gap-2"><CalendarIcon/> Date Range</span>
              <select
                value={range}
                onChange={(e)=>setRange(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="this_month">This month</option>
                <option value="last_30">Last 30 days</option>
                <option value="last_90">Last 90 days</option>
                <option value="this_year">This year</option>
              </select>
            </label>

            {/* Quick actions */}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={()=>{ setPgId("all"); setRange("last_30") }}
                className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat title="Occupancy" value={`${data.occupancyPct}%`} sub="Across selected range" trend={data.occupancyTrend} />
        <Stat title="MTD Revenue" value={`₹${(data.mtdRevenue/1000).toFixed(0)}k`} sub="Collected" trend={data.revenueTrend} />
        <Stat title="Outstanding Dues" value={`₹${(data.duesOutstanding/1000).toFixed(0)}k`} sub="All tenants" />
        <Stat title="Tenant Churn" value={`${data.churnRatePct}%`} sub="Move-outs vs total" />
      </div>

      {/* Reports grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Occupancy by floor/room */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Occupancy Overview</h3>
            <div className="flex items-center gap-2">
              <button onClick={()=>exportCSV("occupancy_overview")} className="px-2 py-1 rounded border text-xs hover:bg-gray-50">CSV</button>
              <button onClick={()=>exportPDF("occupancy_overview")} className="px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700">PDF</button>
            </div>
          </div>
          <div className="mt-3 space-y-3">
            <Progress label="Overall occupancy" value={data.occupancyPct} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Progress label="AC rooms" value={86} />
              <Progress label="Non‑AC rooms" value={76} />
            </div>
          </div>
        </div>

        {/* Revenue & Collections */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Revenue & Collections</h3>
            <div className="flex items-center gap-2">
              <button onClick={()=>exportCSV("revenue_collections")} className="px-2 py-1 rounded border text-xs hover:bg-gray-50">CSV</button>
              <button onClick={()=>exportPDF("revenue_collections")} className="px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700">PDF</button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border p-3 bg-gray-50">
              <div className="text-gray-600 text-xs">Billed (MTD)</div>
              <div className="font-semibold">₹2.70L</div>
            </div>
            <div className="rounded-xl border p-3 bg-gray-50">
              <div className="text-gray-600 text-xs">Collected (MTD)</div>
              <div className="font-semibold">₹2.45L</div>
            </div>
            <div className="rounded-xl border p-3 bg-gray-50">
              <div className="text-gray-600 text-xs">Pending</div>
              <div className="font-semibold">₹0.25L</div>
            </div>
          </div>
          <div className="mt-3"><Sparkline values={data.revenueTrend} /></div>
        </div>

        {/* Dues aging */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Dues Aging</h3>
            <div className="flex items-center gap-2">
              <button onClick={()=>exportCSV("dues_aging")} className="px-2 py-1 rounded border text-xs hover:bg-gray-50">CSV</button>
              <button onClick={()=>exportPDF("dues_aging")} className="px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700">PDF</button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
            {[
              { label: "0–7d", val: 14 },
              { label: "8–15d", val: 9 },
              { label: "16–30d", val: 5 },
              { label: ">30d", val: 3 },
            ].map(b => (
              <div key={b.label} className="rounded-xl border p-3 text-center">
                <div className="text-gray-600">{b.label}</div>
                <div className="mt-1 text-lg font-semibold">{b.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming vacates & joins */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Movement (Next 30 days)</h3>
            <div className="flex items-center gap-2">
              <button onClick={()=>exportCSV("movements")} className="px-2 py-1 rounded border text-xs hover:bg-gray-50">CSV</button>
              <button onClick={()=>exportPDF("movements")} className="px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700">PDF</button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border p-3 bg-green-50">
              <div className="text-gray-700 text-xs">Expected Joins</div>
              <div className="font-semibold text-green-700">12</div>
            </div>
            <div className="rounded-xl border p-3 bg-amber-50">
              <div className="text-gray-700 text-xs">Expected Vacates</div>
              <div className="font-semibold text-amber-700">8</div>
            </div>
          </div>
        </div>

        {/* Bed utilization by sharing */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Utilization by Sharing</h3>
            <div className="flex items-center gap-2">
              <button onClick={()=>exportCSV("utilization_sharing")} className="px-2 py-1 rounded border text-xs hover:bg-gray-50">CSV</button>
              <button onClick={()=>exportPDF("utilization_sharing")} className="px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700">PDF</button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-600">2‑sharing</div>
              <Progress value={88} />
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-600">3‑sharing</div>
              <Progress value={79} />
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-gray-600">4‑sharing</div>
              <Progress value={73} />
            </div>
          </div>
        </div>

        {/* Payment modes breakdown */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Payment Modes</h3>
            <div className="flex items-center gap-2">
              <button onClick={()=>exportCSV("payment_modes")} className="px-2 py-1 rounded border text-xs hover:bg-gray-50">CSV</button>
              <button onClick={()=>exportPDF("payment_modes")} className="px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700">PDF</button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
            {[
              { label: "UPI", val: 52 },
              { label: "Cash", val: 28 },
              { label: "Card", val: 12 },
              { label: "Bank", val: 8 },
            ].map(b => (
              <div key={b.label} className="rounded-xl border p-3 text-center">
                <div className="text-gray-600">{b.label}</div>
                <div className="mt-1 text-lg font-semibold">{b.val}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Deposits ledger & refunds */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Deposits Ledger</h3>
            <div className="flex items-center gap-2">
              <button onClick={()=>exportCSV("deposits_ledger")} className="px-2 py-1 rounded border text-xs hover:bg-gray-50">CSV</button>
              <button onClick={()=>exportPDF("deposits_ledger")} className="px-2 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700">PDF</button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border p-3 bg-gray-50">
              <div className="text-gray-600 text-xs">Held Deposits</div>
              <div className="font-semibold">₹3.80L</div>
            </div>
            <div className="rounded-xl border p-3 bg-gray-50">
              <div className="text-gray-600 text-xs">Refunds (MTD)</div>
              <div className="font-semibold">₹0.35L</div>
            </div>
            <div className="rounded-xl border p-3 bg-gray-50">
              <div className="text-gray-600 text-xs">Net Change</div>
              <div className="font-semibold">₹+0.10L</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-xs text-gray-500">
        Tip: Click Export on any tile to download a CSV/PDF snapshot with current filters. Replace the placeholder export code with your API-backed data when ready.
      </div>
    </div>
  )
}
