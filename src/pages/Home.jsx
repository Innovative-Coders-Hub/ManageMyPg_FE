import React, { useEffect, useMemo, useState, memo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import { getOwnerDashboard, getRevenueTrends, getRealTimeAlerts } from "../api/ownerAuth";
import PageHeader from "../components/PageHeader";
import {
  Building2,
  Users,
  IndianRupee,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  ArrowRight,
  PieChart,
  LayoutDashboard,
  Bell,
  Activity,
  Calendar,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  CreditCard,
  UserCheck,
  CheckCircle2,
  Bed,
  Receipt,
  Wrench,
  BarChart3,
  FileText
} from 'lucide-react'

/* =====================================================
   Animation Variants
===================================================== */
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

/* =====================================================
   HELPERS & GREETING
===================================================== */
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

/* =====================================================
   MINI FORECAST BAR
===================================================== */
function ForecastBar({ forecast }) {
  const months = ['Current', 'Next Month', 'In 2 Months']
  const displayForecast = forecast && forecast.length > 0 ? forecast : [75, 80, 85]

  return (
    <div className="space-y-4">
      {displayForecast.slice(0, 3).map((v, i) => {
        const val = Math.min(100, Math.max(0, Math.round(v)))
        return (
          <div key={i} className="group">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              <span>{months[i] || `Month +${i + 1}`}</span>
              <span className="font-extrabold text-slate-800">{val}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${val}%` }}
                transition={{ duration: 1, delay: i * 0.12 }}
                className={`h-full rounded-full transition-all duration-500 ${
                  val >= 80 ? "bg-emerald-500 shadow-sm shadow-emerald-200" : val >= 60 ? "bg-amber-500" : "bg-rose-500"
                }`}
              />
            </div>
          </div>
        )
      })}
    </div>
  );
}

/* =====================================================
   REVENUE COLLECTION CHART
===================================================== */
function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex flex-col items-center justify-center gap-2 text-slate-400">
        <TrendingUp size={28} className="text-slate-300 stroke-[1.5]" />
        <span className="text-[10px] font-black uppercase tracking-widest">No collection history recorded</span>
      </div>
    )
  }

  const values = data.map(v => typeof v === 'number' ? v : 0)
  const max = Math.max(...values, 1000)
  const min = Math.min(...values, 0)
  const range = max - min || 1

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3 sm:gap-4 h-40 px-2 pt-6 pb-2 border-b border-slate-100 relative">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-2">
          <div className="border-b border-dashed border-slate-300 w-full" />
          <div className="border-b border-dashed border-slate-300 w-full" />
          <div className="border-b border-dashed border-slate-300 w-full" />
        </div>

        {values.map((v, i) => {
          const heightPct = Math.max(8, Math.round(((v - min) / range) * 100))
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end group h-full relative z-10">
              <div className="relative w-full flex flex-col items-center justify-end h-full">
                {/* Value tooltip */}
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-lg whitespace-nowrap z-30">
                  ₹{v.toLocaleString()}
                </div>
                
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                  className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-indigo-500 group-hover:from-indigo-700 group-hover:to-indigo-600 transition-all duration-200 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </div>
              <div className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-wider">
                M{i + 1}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
        <span>Historical Collections</span>
        <span className="text-slate-900 flex items-center gap-1 font-extrabold">
          Peak: ₹{max.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/* =====================================================
   KPI METRIC TILE
===================================================== */
const Tile = memo(function Tile({ title, value, to, icon: Icon, gradient, subtitle, badgeText, progressPct }) {
  return (
    <motion.div variants={itemVariants}>
      <Link to={to} className="block group">
        <div className="relative overflow-hidden rounded-2xl p-6 border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1">
          {/* Subtle background gradient glow */}
          <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-[0.06] transition-transform duration-500 group-hover:scale-150 pointer-events-none`} />

          <div className="relative flex justify-between items-start">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                {title}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {value}
              </h3>
              {subtitle && (
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                  {subtitle}
                </p>
              )}
            </div>

            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md shadow-slate-200 shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={20} strokeWidth={2.5} />
            </div>
          </div>

          {/* Optional Progress Bar */}
          {typeof progressPct === 'number' && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                <span>Occupancy Level</span>
                <span className="text-slate-800 font-extrabold">{progressPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }} />
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between pt-2">
            {badgeText ? (
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-widest">
                {badgeText}
              </span>
            ) : <div />}

            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              View Details <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
})

/* =====================================================
   HOME – OWNER DASHBOARD
===================================================== */
export default function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPgId, setSelectedPgId] = useState(null);
  const [openPG, setOpenPG] = useState(false);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getOwnerDashboard();
        if (res.success) {
          setDashboardData(res.data);
          if (res.data?.pgSummaries && res.data.pgSummaries.length > 0) {
            const first = res.data.pgSummaries[0];
            setSelectedPgId(first.pgId);
            localStorage.setItem('selectedPgName', first.pgName);
          } else {
            setSelectedPgId('overall');
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchDashboardAddons = async () => {
      if (!selectedPgId || selectedPgId === 'overall') {
        setRevenueTrends([]);
        setAlerts([]);
        return;
      }
      try {
        const [revRes, alertRes] = await Promise.allSettled([
          getRevenueTrends(selectedPgId),
          getRealTimeAlerts(selectedPgId)
        ]);

        if (revRes.status === 'fulfilled' && revRes.value?.success) {
          setRevenueTrends(revRes.value.data || []);
        } else {
          setRevenueTrends([]);
        }

        if (alertRes.status === 'fulfilled' && alertRes.value?.success) {
          setAlerts(alertRes.value.data || []);
        } else {
          setAlerts([]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard addons:", error);
      }
    };

    fetchDashboardAddons();
  }, [selectedPgId]);

  const displayData = useMemo(() => {
    if (!dashboardData) return null;

    if (selectedPgId === 'overall') {
      const m = dashboardData.metrics || {};
      const history = dashboardData.monthlyAnalytics?.lastThreeMonths?.map(m => m.totalRentCollected).reverse() || [m.totalRentsCollected || 0];

      return {
        name: "Overall Portfolio",
        totalBeds: m.totalBeds || 0,
        occupiedBeds: m.totalOccupiedBeds || 0,
        occupancyRate: m.overallOccupancyRate || 0,
        pendingRents: m.totalPendingRents || 0,
        rentsCollected: m.totalRentsCollected || 0,
        openComplaints: m.totalOpenComplaints || 0,
        vacatings: m.totalTodayVacatings || 0,
        isOverall: true,
        revenueHistory: history,
        occupancyForecast: [m.overallOccupancyRate || 0, m.overallOccupancyRate || 0, m.overallOccupancyRate || 0],
        alerts: (m.totalPendingApprovals > 0) ? [`${m.totalPendingApprovals} pending tenant approvals`] : [],
      };
    }

    const pg = dashboardData.pgSummaries?.find(p => p.pgId === selectedPgId);
    if (!pg) return null;

    const combinedAlerts = [...alerts];
    if (pg.pendingApprovals > 0) {
      const approvalAlert = `${pg.pendingApprovals} pending tenant approvals`;
      if (!combinedAlerts.includes(approvalAlert)) {
        combinedAlerts.push(approvalAlert);
      }
    }

    return {
      name: pg.pgName,
      totalBeds: pg.totalBeds || 0,
      occupiedBeds: pg.occupiedBeds || 0,
      occupancyRate: pg.occupancyRate || 0,
      pendingRents: pg.pendingRents || 0,
      rentsCollected: pg.totalRentsCollected || 0,
      openComplaints: pg.openComplaints || 0,
      vacatings: pg.todayVacatings || 0,
      isOverall: false,
      revenueHistory: revenueTrends.length > 0 ? revenueTrends : [pg.totalRentsCollected || 0],
      occupancyForecast: [pg.occupancyRate || 0],
      alerts: combinedAlerts,
    };
  }, [dashboardData, selectedPgId, revenueTrends, alerts]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-4">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Dashboard Data...</span>
      </div>
    );
  }

  // No PGs fallback state
  if (!dashboardData || (dashboardData.pgSummaries?.length === 0 && selectedPgId !== 'overall')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-6 text-center px-4">
        <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center border border-indigo-100 shadow-sm">
          <Building2 size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">No PG Properties Registered</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 max-w-sm mx-auto">
            Add your first PG property to start tracking occupancy, rent collection, and tenant requests.
          </p>
        </div>
        <Link to="/my-pgs" className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
          <Plus size={16} /> Add Your First PG
        </Link>
      </div>
    );
  }

  const collectionEfficiency = Math.round(
    ((displayData?.rentsCollected || 0) / ((displayData?.rentsCollected || 0) + (displayData?.pendingRents || 0) || 1)) * 100
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SEO
        title={displayData?.name ? `${displayData.name} - Owner Dashboard` : "Owner Dashboard"}
        description="Monitor your PG metrics, occupancy rate, and rent collection at a glance."
      />

      {/* HEADER BAR WITH PROPER GREETING & PROPERTY SELECTOR */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <Sparkles size={14} />
                <span>{dayjs().format('dddd, DD MMMM YYYY')}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {getGreeting()}, Owner
              </h1>
            </div>

            {/* ACTION CONTROLS & PG SELECTOR */}
            <div className="flex items-center gap-3">
              {/* PROPERTY SELECTOR DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setOpenPG(!openPG)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-800 shadow-sm hover:border-indigo-300 hover:bg-white transition-all uppercase tracking-widest"
                >
                  <Building2 size={16} className="text-indigo-600" />
                  <span className="truncate max-w-[160px]">{displayData?.name || "Select PG Unit"}</span>
                  <ChevronDown size={14} className={`ml-1 text-slate-400 transition-transform duration-300 ${openPG ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {openPG && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        <div className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                          Select Property Portfolio
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPgId('overall');
                            localStorage.setItem('selectedPgName', 'Overall Portfolio');
                            setOpenPG(false);
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-3 text-left text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors ${
                            selectedPgId === 'overall'
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className={`h-2 w-2 rounded-full ${selectedPgId === 'overall' ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                            <span className="truncate">Overall Portfolio</span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
                            {dashboardData.pgSummaries?.length || 0} PGs
                          </span>
                        </button>

                        {dashboardData.pgSummaries?.map(pg => (
                          <button
                            key={pg.pgId}
                            onClick={() => {
                              setSelectedPgId(pg.pgId);
                              localStorage.setItem('selectedPgName', pg.pgName);
                              setOpenPG(false);
                              window.dispatchEvent(new Event('storage'));
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-3 text-left text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors ${
                              selectedPgId === pg.pgId
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div className={`h-2 w-2 rounded-full ${selectedPgId === pg.pgId ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                              <span className="truncate">{pg.pgName}</span>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400">
                              {pg.occupiedBeds}/{pg.totalBeds} Beds
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* QUICK ADD ACTION BUTTON */}
              <Link
                to="/my-pgs"
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Plus size={16} />
                <span>Add Property</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT GRID */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mt-6"
      >
        {/* KPI METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Tile
            title="Total Capacity"
            value={`${displayData?.occupiedBeds || 0} / ${displayData?.totalBeds || 0}`}
            to="/tenants"
            icon={Building2}
            gradient="from-indigo-600 to-blue-700"
            subtitle={`${displayData?.occupancyRate || 0}% Total Occupancy`}
            badgeText="Occupancy Status"
            progressPct={displayData?.occupancyRate || 0}
          />
          <Tile
            title={displayData?.isOverall ? "Total Rent Collected" : "Collected Rents"}
            value={`₹${(displayData?.rentsCollected || 0).toLocaleString()}`}
            to="/reports"
            icon={IndianRupee}
            gradient="from-emerald-500 to-teal-600"
            subtitle={`${collectionEfficiency}% Collection Rate`}
            badgeText="Collected"
          />
          <Tile
            title="Pending Rents"
            value={`₹${(displayData?.pendingRents || 0).toLocaleString()}`}
            to="/rents"
            icon={Clock}
            gradient="from-amber-500 to-orange-600"
            subtitle="Outstanding Payments"
            badgeText="Action Required"
          />
          <Tile
            title="Active Complaints & Vacatings"
            value={`${displayData?.openComplaints || 0} Complaints`}
            to="/complaints"
            icon={AlertCircle}
            gradient="from-rose-500 to-red-600"
            subtitle={`${displayData?.vacatings || 0} Vacatings Today`}
            badgeText="Operations"
          />
        </div>

        {/* REVENUE ANALYTICS + ALERTS & OPERATIONS CENTER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* MAIN CHARTS & STATS (LEFT 2 COLS) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            
            {/* REVENUE COLLECTION CHART CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm overflow-hidden relative group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Rent Collection Trends</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                      Live
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Monthly income collection history and metrics
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Collection Rate</span>
                    <span className="text-sm font-black text-emerald-600">{collectionEfficiency}%</span>
                  </div>
                </div>
              </div>

              <RevenueChart data={displayData?.revenueHistory} />
            </div>

            {/* TWO COLUMN SUB-PANEL: OCCUPANCY FORECAST & SYSTEM STATUS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* OCCUPANCY FORECAST CARD */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <PieChart size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Occupancy Outlook</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">3-Month Forecast</p>
                    </div>
                  </div>

                  <ForecastBar forecast={displayData?.occupancyForecast} />
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                  <span>Capacity Projection</span>
                  <span className="text-slate-900 font-extrabold">{displayData?.occupancyRate || 0}% Current</span>
                </div>
              </div>

              {/* SYSTEM OPERATIONAL HEALTH CARD */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="relative z-10 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900">
                        <Activity size={18} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-tight">System Status</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real-time sync</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-[10px] font-black">
                      <span className="text-slate-400 uppercase tracking-widest">Active Properties</span>
                      <span className="text-white font-extrabold">{dashboardData.pgSummaries?.length || 0} Units</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black">
                      <span className="text-slate-400 uppercase tracking-widest">Database Sync</span>
                      <span className="text-indigo-400 uppercase tracking-widest">Up to date</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black">
                      <span className="text-slate-400 uppercase tracking-widest">Today Vacatings</span>
                      <span className="text-amber-400 font-extrabold">{displayData?.vacatings || 0} Tenants</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/my-pgs"
                  className="mt-6 w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 text-center block"
                >
                  Manage Portfolio
                </Link>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: ALERTS & QUICK TIPS HUB */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <Bell size={20} className="text-rose-500" /> Important Alerts
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      Actionable notifications & requests
                    </p>
                  </div>
                  <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100">
                    {displayData?.alerts?.length || 0} New
                  </span>
                </div>

                {/* ALERTS FEED */}
                <div className="space-y-3.5">
                  {displayData?.alerts?.map((alertMsg, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group"
                    >
                      <div className="mt-0.5 h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <AlertCircle size={15} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-900 leading-tight uppercase tracking-tight">
                          {alertMsg}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                          Requires Action
                        </p>
                      </div>

                      <Link
                        to={alertMsg.includes('tenant') ? '/tenants' : '/complaints'}
                        className="p-1.5 text-slate-300 group-hover:text-indigo-600 transition-colors"
                      >
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                  ))}

                  {(!displayData?.alerts || displayData.alerts.length === 0) && (
                    <div className="text-center py-10 px-4">
                      <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-3 border border-emerald-100 shadow-sm">
                        <ShieldCheck size={28} />
                      </div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">All Operations Smooth</h4>
                      <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                        No urgent alerts or pending actions.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* QUICK REPORT BANNER CARD */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100 relative overflow-hidden group">
                  <div className="relative z-10">
                    <h4 className="text-xs font-black uppercase tracking-tight mb-1 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-200" /> Executive Summary
                    </h4>
                    <p className="text-[10px] font-bold text-indigo-100 leading-relaxed mb-4 uppercase tracking-widest">
                      Overall portfolio occupancy is <span className="text-white font-black underline">{displayData?.occupancyRate || 0}%</span>.
                    </p>
                    <Link
                      to="/reports"
                      className="block w-full py-2.5 bg-white text-indigo-600 rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-md"
                    >
                      View Comprehensive Report
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* QUICK ACCESS MODULE SHORTCUTS TOOLBAR */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <LayoutDashboard size={16} className="text-indigo-600" /> Module Navigation Shortcuts
            </h3>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quick Access</span>
          </div>

          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {[
              { label: 'Tenants', to: '/tenants', icon: Users, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
              { label: 'Manage Rents', to: '/rents', icon: Receipt, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
              { label: 'Expenses', to: '/expenses', icon: CreditCard, bg: 'bg-amber-50 text-amber-600 border-amber-100' },
              { label: 'Bookings', to: '/bookings', icon: Calendar, bg: 'bg-blue-50 text-blue-600 border-blue-100' },
              { label: 'Complaints', to: '/complaints', icon: AlertCircle, bg: 'bg-rose-50 text-rose-600 border-rose-100' },
              { label: 'Workers', to: '/workers', icon: Wrench, bg: 'bg-purple-50 text-purple-600 border-purple-100' },
              { label: 'Reports', to: '/reports', icon: BarChart3, bg: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
              { label: 'My PGs', to: '/my-pgs', icon: Building2, bg: 'bg-slate-100 text-slate-700 border-slate-200' },
            ].map((action, idx) => (
              <Link
                key={idx}
                to={action.to}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl ${action.bg} border transition-all duration-200 hover:scale-[1.04] hover:shadow-md text-center group`}
              >
                <action.icon size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-center leading-tight line-clamp-1">{action.label}</span>
              </Link>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
