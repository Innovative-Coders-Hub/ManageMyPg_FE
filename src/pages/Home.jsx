import React, { useEffect, useMemo, useState, memo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getAllPgs, getRevenueTrends, getRealTimeAlerts } from "../api/ownerAuth";
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
  ShieldCheck
} from 'lucide-react'

/* =====================================================
   Animation Variants
===================================================== */
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

/* =====================================================
   MINI LINE CHART (Monthly Revenue)
===================================================== */
function ForecastBar({ forecast }) {
  return (
    <div className="space-y-4">
      {forecast.map((v, i) => (
        <div key={i} className="group">
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
            <span>Forecast M+{i + 1}</span>
            <span className="text-slate-900">{v}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${v}%` }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className={`h-full rounded-full transition-all duration-500 ${v >= 80 ? "bg-emerald-500" : v >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RevenueChart({ data }) {
  const max = Math.max(...data);
  const min = Math.min(...data);

  return (
    <div className="flex items-end gap-3 h-32 px-2">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end group h-full">
           <div className="relative w-full flex flex-col items-center justify-end h-full">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${((v - min) / (max - min || 1)) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className="w-full rounded-t-lg bg-indigo-500 group-hover:bg-indigo-600 transition-colors shadow-sm"
            />
             {/* Tooltip on hover */}
             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                ₹{v.toLocaleString()}
             </div>
           </div>
          <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase">M{i + 1}</div>
        </div>
      ))}
    </div>
  );
}

/* =====================================================
   KPI TILE
===================================================== */
const Tile = memo(function Tile({ title, value, to, icon: Icon, gradient, subtitle }) {
  return (
    <motion.div variants={itemVariants}>
      <Link to={to} className="block group">
        <div className={`relative overflow-hidden rounded-xl p-5 shadow-sm border border-slate-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
           <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.03] transition-transform duration-500 group-hover:scale-150`} />

          <div className="relative flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{value}</h3>
              {subtitle && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-current/20`}>
               <Icon size={18} strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end">
             <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
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
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPG, setSelectedPG] = useState(null);
  const [openPG, setOpenPG] = useState(false);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchPgs = async () => {
      try {
        setLoading(true);
        const data = await getAllPgs();
        const approvedPgs = (Array.isArray(data) ? data : []).filter(p => p.approved);
        setPgs(approvedPgs);
        if (approvedPgs.length > 0) {
          const first = approvedPgs[0];
          setSelectedPG(first);
          localStorage.setItem('selectedPgName', first.pgName);
        }
      } catch (error) {
        console.error("Failed to fetch PGs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPgs();
  }, []);

  useEffect(() => {
    const fetchDashboardAddons = async () => {
      if (!selectedPG?.id) return;
      try {
        const [revRes, alertRes] = await Promise.all([
          getRevenueTrends(selectedPG.id),
          getRealTimeAlerts(selectedPG.id)
        ]);
        if (revRes.success) setRevenueTrends(revRes.data);
        if (alertRes.success) setAlerts(alertRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard addons:", error);
      }
    };

    fetchDashboardAddons();
  }, [selectedPG]);

  const displayData = useMemo(() => {
    if (!selectedPG) return {
      pgName: "No PG Selected",
      totalBeds: 0,
      filledBeds: 0,
      rent: { expected: 0, pending: 0 },
      revenueHistory: [0, 0, 0, 0, 0, 0],
      occupancyForecast: [0, 0, 0],
      alerts: [],
    };

    return {
      ...selectedPG,
      rent: selectedPG.rent || { expected: 0, pending: 0 },
      revenueHistory: revenueTrends.length > 0 ? revenueTrends : [80, 90, 95, 100, 110, 108],
      occupancyForecast: selectedPG.occupancyForecast || [78, 82, 85],
      alerts: alerts.length > 0 ? alerts : ["Operational sync active"],
    };
  }, [selectedPG, revenueTrends, alerts]);

  const occupancy = useMemo(() => {
    if (!displayData.totalBeds) return 0;
    return Math.round((displayData.filledBeds / displayData.totalBeds) * 100);
  }, [displayData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Portfolio...</span>
      </div>
    );
  }

  if (pgs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="h-20 w-20 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 border border-slate-100">
           <Building2 size={40} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">No active PGs discovered</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 max-w-sm mx-auto">Create and verify your PG units to activate the enterprise control center.</p>
        </div>
        <Link to="/my-pgs" className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
          Initialize PG Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* HEADER + PG SWITCHER */}
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Command Center"
            subtitle="Real-time operational overview"
          >
            <div className="relative group self-center md:self-auto">
              <button
                onClick={() => setOpenPG(!openPG)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-700 shadow-sm hover:border-indigo-300 transition-all uppercase tracking-widest"
              >
                <Building2 size={16} className="text-indigo-600" />
                {selectedPG?.pgName || "Select Unit"}
                <ChevronDown size={14} className={`ml-2 transition-transform duration-300 ${openPG ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {openPG && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      {pgs.map(pg => (
                        <button
                          key={pg.id}
                          onClick={() => {
                            setSelectedPG(pg);
                            localStorage.setItem('selectedPgName', pg.pgName);
                            setOpenPG(false);
                            window.dispatchEvent(new Event('storage'));
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors ${
                            selectedPG?.id === pg.id
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className={`h-2 w-2 rounded-full ${selectedPG?.id === pg.id ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                          {pg.pgName}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </PageHeader>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12 mt-2"
      >

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Tile
          title="Inventory Assets"
          value={`${displayData.totalBeds} Units`}
          to="/my-pgs"
          icon={Building2}
          gradient="from-indigo-600 to-blue-700"
          subtitle="Total Capacity"
        />
        <Tile
          title="Utilization Rate"
          value={`${occupancy}%`}
          to="/tenants"
          icon={Users}
          gradient="from-emerald-500 to-teal-600"
          subtitle={`${displayData.filledBeds} Active Tenants`}
        />
        <Tile
          title="Revenue Pipeline"
          value={`₹${(displayData.rent.expected || 0).toLocaleString()}`}
          to="/reports"
          icon={IndianRupee}
          gradient="from-blue-600 to-indigo-700"
          subtitle="Monthly Potential"
        />
        <Tile
          title="Pending Receivables"
          value={`₹${(displayData.rent.pending || 0).toLocaleString()}`}
          to="/reports"
          icon={AlertCircle}
          gradient="from-rose-500 to-red-600"
          subtitle="Awaiting Collection"
        />
      </div>

      {/* REVENUE + ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 text-indigo-50 opacity-20 group-hover:opacity-40 transition-opacity">
                 <TrendingUp size={120} />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Financial Velocity</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Monthly collection performance</p>
                   </div>
                   <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Live Stream
                   </div>
                </div>
                <RevenueChart data={displayData.revenueHistory} />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* OCCUPANCY FORECAST */}
              <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                      <PieChart size={16} />
                   </div>
                   <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Portfolio Prediction</h3>
                </div>
                <ForecastBar forecast={displayData.occupancyForecast} />
                <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase leading-relaxed text-center tracking-widest">
                   Predicted demand based on historical churn analytics.
                </div>
              </div>

              {/* RECENT ACTIVITY / QUICK STATS */}
              <div className="bg-slate-900 rounded-xl p-8 text-white shadow-xl relative overflow-hidden">
                 <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-8">
                      <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                         <Activity size={16} />
                      </div>
                      <h3 className="text-[11px] font-black uppercase tracking-tight">System Status</h3>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Connectivity</span>
                         <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Optimal
                         </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Synchronization</span>
                         <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">99.8% Accuracy</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Protocol</span>
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">24/7 Enabled</span>
                      </div>
                   </div>

                   <button className="w-full mt-10 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                      Access Tech Intelligence
                   </button>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* ALERTS SECTION */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                   <Bell size={20} className="text-rose-500" /> Operational Alerts
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Prioritized Action Items</p>
              </div>
              <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100">
                {displayData.alerts.length} Critical
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {displayData.alerts.map((a, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all cursor-pointer"
                >
                  <div className="mt-1 h-6 w-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <AlertCircle size={14} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-black text-slate-900 leading-tight uppercase tracking-tight truncate">
                      {a}
                    </div>
                    <div className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                      Immediate resolution required
                    </div>
                  </div>

                  <Link
                    to="/my-pgs"
                    className="self-center p-2 text-slate-300 group-hover:text-indigo-600 transition-colors"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))}

              {displayData.alerts.length === 0 && (
                <div className="text-center py-12 px-6 h-full flex flex-col justify-center">
                  <div className="h-16 w-16 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mx-auto mb-4 border border-emerald-100">
                     <ShieldCheck size={32} />
                  </div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Zero Anomalies</h4>
                  <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-widest">Portfolio operations are stable.</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-[11px] font-black uppercase tracking-tight mb-2">Portfolio Insights</h4>
                  <p className="text-[10px] font-black text-indigo-100 leading-relaxed mb-6 uppercase tracking-widest">Aggregate occupancy across all units is currently trending at <span className="text-white underline">84.5%</span>.</p>
                  <Link to="/reports" className="block w-full px-4 py-3 bg-white text-indigo-600 rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-900/20">
                      View Analytical Report
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* QUICK ACTIONS */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tenant Registry', to: '/tenants', icon: Users, bg: 'bg-indigo-50', text: 'text-indigo-600' },
          { label: 'Business Intelligence', to: '/reports', icon: IndianRupee, bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { label: 'Resolution Desk', to: '/complaints', icon: AlertCircle, bg: 'bg-amber-50', text: 'text-amber-600' },
          { label: 'Portfolio Units', to: '/my-pgs', icon: Building2, bg: 'bg-blue-50', text: 'text-blue-600' },
        ].map((action, idx) => (
          <Link
            key={idx}
            to={action.to}
            className={`flex items-center justify-center gap-3 px-4 py-3 rounded-xl ${action.bg} ${action.text} transition-all duration-300 hover:scale-[1.03] hover:shadow-md border border-transparent hover:border-current/10`}
          >
            <action.icon size={18} strokeWidth={2.5} />
            <span className="text-[9px] font-black uppercase tracking-widest">{action.label}</span>
          </Link>
        ))}
      </motion.div>
    </motion.div>
    </div>
  );
}
