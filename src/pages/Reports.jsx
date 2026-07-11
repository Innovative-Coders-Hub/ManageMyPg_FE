import React, { useMemo, useState, useId, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { jsPDF } from "jspdf"
import dayjs from 'dayjs'
import PageHeader from "../components/PageHeader"
import CustomDropdown from "../components/CustomDropdown"
import SEO from "../components/SEO"
import {
  Download,
  Calendar,
  Building2,
  TrendingUp,
  Users,
  IndianRupee,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  FileText,
  PieChart,
  Clock,
  Activity,
  Layers,
  Sparkles,
  ChevronDown,
  Target,
  Zap,
  ShieldCheck,
  BarChart3,
  Loader2
} from "lucide-react"

/* =====================================================
   COMPONENTS
===================================================== */

function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50' }) {
  return (
    <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md hover:scale-[1.02] transition-all cursor-default flex-1 min-w-0">
      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 h-6" />
      </div>
      <div className="min-w-0">
        <div className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</div>
        <div className="text-base sm:text-xl font-black text-slate-900 leading-tight truncate">{value}</div>
      </div>
    </div>
  )
}

/**
 * Enhanced Sparkline
 */
const Sparkline = React.memo(function Sparkline({ values = [], color = "indigo" }) {
  const gradientId = useId()
  if (!values.length) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const width = 100
  const height = 30
  const step = width / (values.length - 1)

  const points = values.map((v, i) => ({
    x: i * step,
    y: height - ((v - min) / range) * height
  }))

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`

  return (
    <div className="h-10 w-full mt-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
           <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" stopColor={color === "indigo" ? "#6366f1" : "#10b981"} stopOpacity="0.2" />
             <stop offset="100%" stopColor={color === "indigo" ? "#6366f1" : "#10b981"} stopOpacity="1" />
           </linearGradient>
        </defs>
        <path
          d={pathData}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />
      </svg>
    </div>
  )
})

const Progress = React.memo(function Progress({ value = 0, label, color = "indigo" }) {
  const pct = Math.max(0, Math.min(100, value))
  const colorClasses = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    slate: "bg-slate-900"
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black text-slate-900">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClasses[color] || colorClasses.indigo} shadow-sm`}
        />
      </div>
    </div>
  )
})

function ReportSection({ title, icon: Icon, children, onExportCSV, onExportPDF, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group"
    >
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
            <Icon size={16} />
          </div>
          <div>
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">{title}</h3>
            {subtitle && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onExportCSV}
            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
            title="Export CSV"
          >
            <FileText size={14} />
          </button>
          <button
            onClick={onExportPDF}
            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
            title="Export PDF"
          >
            <Download size={14} />
          </button>
        </div>
      </div>
      <div className="p-6 flex-1">
        {children}
      </div>
    </motion.div>
  )
}

export default function Reports() {
  const [pgId, setPgId] = useState("all")
  const [range, setRange] = useState("last_30")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading for consistency
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const data = useMemo(() => ({
    occupancyPct: 81,
    mtdRevenue: 245000,
    duesOutstanding: 48000,
    churnRatePct: 4.2,
    occupancyTrend: [68, 72, 70, 75, 78, 81],
    revenueTrend: [180, 195, 210, 220, 235, 245],
    revenueGrowth: 12.5,
    occupancyGrowth: 4.2
  }), [])

  const exportCSV = (reportKey) => {
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
    a.download = `MMP_REPORT_${reportKey.toUpperCase()}_${dayjs().format('YYYYMMDD')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = (reportKey) => {
    if (!jsPDF) {
      alert("PDF library not loaded")
      return
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    })

    // Colors & Branding
    const primaryColor = [15, 23, 42] // slate-900
    const accentColor = [79, 70, 229] // indigo-600

    // Header
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 40, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text("MANAGE MY PG", 20, 20)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("ENTERPRISE DOSSIER • BUSINESS INTELLIGENCE", 20, 28)

    doc.setFontSize(8)
    doc.text(`GENERATED: ${dayjs().format('DD MMM YYYY HH:mm')}`, 150, 28)

    // Report Summary
    doc.setTextColor(...primaryColor)
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(reportKey.replace("_", " ").toUpperCase(), 20, 55)

    doc.setDrawColor(226, 232, 240)
    doc.line(20, 60, 190, 60)

    // Data Points
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("PORTFOLIO PERFORMANCE METRICS", 20, 75)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    const metrics = [
      ["Portfolio Occupancy", `${data.occupancyPct}%`],
      ["MTD Collection", `INR ${(data.mtdRevenue / 1000).toFixed(1)}K`],
      ["Total Outstanding", `INR ${(data.duesOutstanding / 1000).toFixed(1)}K`],
      ["Churn Rate", `${data.churnRatePct}%`]
    ]

    let y = 85
    metrics.forEach(([label, val]) => {
      doc.text(label, 20, y)
      doc.setFont("helvetica", "bold")
      doc.text(val, 80, y)
      doc.setFont("helvetica", "normal")
      y += 8
    })

    // Disclaimer / Footer
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.text("CONFIDENTIAL • FOR AUTHORIZED OWNER USE ONLY • ALL RIGHTS RESERVED", 20, 280)
    doc.text("Powered by ManageMyPg Neural Infrastructure", 145, 280)

    doc.save(`MMP_Dossier_${reportKey}_${dayjs().format('YYYYMMDD')}.pdf`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <SEO
        title="Business Intelligence & Reports"
        description="Detailed analytics and financial reports for your PG portfolio. Track occupancy, revenue, and receivables in real-time."
        canonical="/reports"
      />
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Business Intelligence"
            subtitle="Strategic portfolio analytics & financial tracking"
          >
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
              <TopStat
                label="Portfolio Occupancy"
                value={`${data.occupancyPct}%`}
                icon={Users}
              />
              <TopStat
                label="MTD Collection"
                value={`₹${(data.mtdRevenue / 1000).toFixed(1)}K`}
                icon={IndianRupee}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
              />
              <TopStat
                label="Total Dues"
                value={`₹${(data.duesOutstanding / 1000).toFixed(1)}K`}
                icon={AlertCircle}
                colorClass="text-rose-600"
                bgClass="bg-rose-50"
              />
              <TopStat
                label="Churn Rate"
                value={`${data.churnRatePct}%`}
                icon={TrendingUp}
              />
              <button
                onClick={() => exportPDF("executive_summary")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-100 h-[64px]"
              >
                <ShieldCheck size={16} /> Export Dossier
              </button>
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex flex-col gap-8">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CustomDropdown
                label="Property"
                value={pgId}
                options={[
                  { id: 'all', label: 'CONSOLIDATED PORTFOLIO' },
                  { id: 'pg1', label: 'BLISS MENS PG - SECTOR 45' },
                  { id: 'pg2', label: 'BLISS WOMENS PG - SECTOR 21' }
                ]}
                onChange={setPgId}
                icon={Building2}
                className="w-full"
              />

              <CustomDropdown
                label="Analysis Window"
                value={range}
                options={[
                  { id: 'this_month', label: 'CURRENT BILLING CYCLE' },
                  { id: 'last_30', label: 'TRAILING 30 DAYS' },
                  { id: 'last_90', label: 'QUARTERLY REVIEW' },
                  { id: 'this_year', label: 'FISCAL YEAR TO DATE' }
                ]}
                onChange={setRange}
                icon={Calendar}
                className="w-full"
              />

              <div className="flex items-center gap-4 px-6 py-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                 <div className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
                 <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Real-time Sync Active</span>
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            <ReportSection
              title="Occupancy Yield"
              subtitle="Strategic Capacity Utilization"
              icon={Target}
              onExportCSV={() => exportCSV("occupancy")}
              onExportPDF={() => exportPDF("occupancy")}
            >
              <div className="space-y-6">
                <Progress label="Target Portfolio Coverage" value={data.occupancyPct} color="indigo" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <Progress label="Premium AC" value={86} color="emerald" />
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <Progress label="Standard" value={76} color="amber" />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center gap-4 border border-white/10 shadow-lg">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 border border-white/10 shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Growth Recommendation</p>
                    <p className="text-[11px] font-bold leading-tight">High demand for AC segments. Expand capacity by ~12% for optimal yield.</p>
                  </div>
                </div>
              </div>
            </ReportSection>

            <ReportSection
              title="Revenue Liquidity"
              subtitle="Cashflow & Collection Velocity"
              icon={IndianRupee}
              onExportCSV={() => exportCSV("revenue")}
              onExportPDF={() => exportPDF("revenue")}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Billed", val: "₹2.70L", color: "slate" },
                    { label: "Realized", val: "₹2.45L", color: "emerald" },
                    { label: "Variance", val: "₹25K", color: "rose" },
                  ].map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-100 p-4 bg-slate-50/50 transition-all hover:border-slate-200">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{item.label}</div>
                      <div className={`text-sm font-black ${item.color === 'emerald' ? 'text-emerald-600' : item.color === 'rose' ? 'text-rose-600' : 'text-slate-900'}`}>{item.val}</div>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Collection Trend (30D)</div>
                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">+12.5% YoY</div>
                  </div>
                  <Sparkline values={data.revenueTrend} color="emerald" />
                </div>
              </div>
            </ReportSection>

            <ReportSection
              title="Receivables Aging"
              subtitle="Risk exposure by maturity"
              icon={Clock}
              onExportCSV={() => exportCSV("aging")}
              onExportPDF={() => exportPDF("aging")}
            >
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "0–7 Days", val: 14, color: "emerald", bg: "bg-emerald-50/50", border: "border-emerald-100", text: "text-emerald-600" },
                  { label: "8–15 Days", val: 9, color: "amber", bg: "bg-amber-50/50", border: "border-amber-100", text: "text-amber-600" },
                  { label: "16–30 Days", val: 5, color: "orange", bg: "bg-orange-50/50", border: "border-orange-100", text: "text-orange-600" },
                  { label: "Over 30D", val: 3, color: "rose", bg: "bg-rose-50/50", border: "border-rose-100", text: "text-rose-600" },
                ].map(b => (
                  <div key={b.label} className={`rounded-xl border ${b.border} p-4 text-center ${b.bg} group hover:scale-[1.02] transition-all duration-300 shadow-sm hover:shadow-md`}>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{b.label}</div>
                    <div className={`text-2xl font-black ${b.text}`}>{b.val}</div>
                    <div className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Accounts</div>
                  </div>
                ))}
              </div>
            </ReportSection>

            <ReportSection
              title="Lifecycle Movement"
              subtitle="Tenant Acquisition & Retention"
              icon={Activity}
              onExportCSV={() => exportCSV("movement")}
              onExportPDF={() => exportPDF("movement")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-emerald-100 p-5 bg-emerald-50/30 relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 p-3 text-emerald-100 group-hover:scale-110 transition-transform">
                    <ArrowUpRight size={48} />
                  </div>
                  <div className="relative">
                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Projected Inflow</div>
                    <div className="text-3xl font-black text-emerald-900 tracking-tighter">12</div>
                    <div className="text-[8px] font-bold text-emerald-600/60 mt-2 uppercase tracking-[0.1em]">Verified Next 30D</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-100 p-5 bg-amber-50/30 relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 p-3 text-amber-100 group-hover:scale-110 transition-transform">
                    <ArrowDownRight size={48} />
                  </div>
                  <div className="relative">
                    <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Exit Trajectory</div>
                    <div className="text-3xl font-black text-amber-900 tracking-tighter">08</div>
                    <div className="text-[8px] font-bold text-amber-600/60 mt-2 uppercase tracking-[0.1em]">Notices Received</div>
                  </div>
                </div>
              </div>
            </ReportSection>

            <ReportSection
              title="Segment Performance"
              subtitle="Efficiency by Sharing Model"
              icon={Layers}
              onExportCSV={() => exportCSV("inventory")}
              onExportPDF={() => exportPDF("inventory")}
            >
              <div className="space-y-4">
                {[
                  { label: "Double Sharing (2-S)", val: 88, color: "indigo" },
                  { label: "Triple Sharing (3-S)", val: 79, color: "emerald" },
                  { label: "Quad Sharing (4-S)", val: 73, color: "amber" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-colors group">
                    <Progress label={item.label} value={item.val} color={item.color} />
                  </div>
                ))}
              </div>
            </ReportSection>

            <ReportSection
              title="Payment Ecosystem"
              subtitle="Channel adoption analysis"
              icon={BarChart3}
              onExportCSV={() => exportCSV("payments")}
              onExportPDF={() => exportPDF("payments")}
            >
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Digital (UPI)", val: "52%", icon: Zap, color: "emerald" },
                  { label: "Cash (Offline)", val: "28%", icon: Activity, color: "slate" },
                  { label: "Card (POS)", val: "12%", icon: Target, color: "indigo" },
                  { label: "Direct (Bank)", val: "08%", icon: Building2, color: "amber" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all group">
                    <div className={`h-8 w-8 rounded-lg bg-white text-slate-400 flex items-center justify-center shrink-0 border border-slate-200 group-hover:text-indigo-600 transition-colors`}>
                      <item.icon size={14} />
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{item.label}</div>
                      <div className="text-sm font-black text-slate-900 leading-none">{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ReportSection>
          </div>
        </div>
      </div>

      {/* Footer Insight */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="flex items-center gap-4 p-5 rounded-2xl bg-slate-900 text-white/70 text-[9px] font-black uppercase tracking-[0.25em] border border-white/5 shadow-2xl shadow-slate-200"
        >
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
          Neural Synchronization Active • Full Audit Trail Enabled • Last Refreshed: {new Date().toLocaleTimeString()}
        </motion.div>
      </div>
    </div>
  )
}
