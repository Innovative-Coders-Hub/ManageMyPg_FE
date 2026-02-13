import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";

/* =====================================================
   BRAND THEME (single source of truth)
===================================================== */
const BRAND = {
  primary: "indigo",
  accent: "blue",
};

/* =====================================================
   ICONS (inline, no external libs)
===================================================== */
const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M19 9l-7 7-7-7" />
  </svg>
);

const BedIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M3 7v10M21 7v10M3 12h18M7 7h10a4 4 0 014 4v1" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M12 1v22M5 6h10a4 4 0 010 8H9a4 4 0 000 8h10" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 9v4M12 17h.01M10.29 3.86l-8.58 14.85A2 2 0 003.42 22h17.16a2 2 0 001.71-3.29L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

/* =====================================================
   MINI LINE CHART (Monthly Revenue)
===================================================== */
function ForecastBar({ forecast }) {
  const max = Math.max(...forecast);
  return (
    <div className="space-y-3">
      {forecast.map((v, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span>Month +{i + 1}</span>
            <span className="font-medium">{v}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded">
            <div
              className={`h-2 rounded ${v >= 80 ? "bg-emerald-500" : v >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
              style={{ width: `${v}%` }}
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
    <div className="flex items-end gap-2 h-32">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end">
          <div
            className="w-full rounded-t-md bg-indigo-500"
            style={{ height: `${((v - min) / (max - min || 1)) * 100}%` }}
          />
          <div className="text-[10px] text-gray-500 mt-1">M{i + 1}</div>
        </div>
      ))}
    </div>
  );
}

/* =====================================================
   KPI TILE
===================================================== */
function Tile({ title, value, to, icon, color, subtitle }) {
  return (
    <Link to={to} className="block">
      <div className={`rounded-2xl p-4 shadow hover:scale-[1.02] transition ${color}`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs opacity-90">{title}</div>
            <div className="text-xl font-bold mt-1">{value}</div>
            {subtitle && <div className="text-[11px] opacity-80 mt-1">{subtitle}</div>}
          </div>
          {icon}
        </div>
      </div>
    </Link>
  );
}

/* =====================================================
   MOCK DATA (per PG)
===================================================== */
const PG_DATA = {
  "Green Homes": {
    beds: { total: 20, filled: 15 },
    rent: { expected: 120000, pending: 12000 },
    revenueHistory: [80, 90, 95, 100, 110, 108],
    occupancyForecast: [78, 82, 85],
    alerts: ["2 beds vacating this month", "3 tenants pending rent"],
  },
  "Blue Residency": {
    beds: { total: 12, filled: 10 },
    rent: { expected: 72000, pending: 8000 },
    revenueHistory: [60, 65, 68, 70, 72, 70],
    occupancyForecast: [70, 74, 76],
    alerts: ["1 bed vacating this month"],
  },
};

/* =====================================================
   HOME – OWNER DASHBOARD
===================================================== */
export default function Home() {
  const pgNames = Object.keys(PG_DATA);
  const [selectedPG, setSelectedPG] = useState(pgNames[0]);
  const [openPG, setOpenPG] = useState(false);

  const data = PG_DATA[selectedPG];

  const occupancy = useMemo(() => {
    return Math.round((data.beds.filled / data.beds.total) * 100);
  }, [data]);

  return (
    <div className="space-y-6 px-3 sm:px-4">
      {/* HEADER + PG SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader title="Owner Dashboard" />

        <div className="relative">
          <button
            onClick={() => setOpenPG(!openPG)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm shadow"
          >
            {selectedPG}
            <ChevronDown />
          </button>

          {openPG && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow z-20">
              {pgNames.map(pg => (
                <div
                  key={pg}
                  onClick={() => {
                    setSelectedPG(pg);
                    setOpenPG(false);
                  }}
                  className="px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
                >
                  {pg}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile
          title="Total Beds"
          value={data.beds.total}
          to="/my-pgs"
          icon={<BedIcon />}
          color="bg-indigo-600 text-white"
        />
        <Tile
          title="Occupied"
          value={`${data.beds.filled} (${occupancy}%)`}
          to="/my-pgs"
          icon={<BedIcon />}
          color="bg-emerald-600 text-white"
          subtitle="Occupancy rate"
        />
        <Tile
          title="Expected Rent"
          value={`₹${data.rent.expected.toLocaleString()}`}
          to="/payments"
          icon={<MoneyIcon />}
          color="bg-blue-600 text-white"
        />
        <Tile
          title="Pending Rent"
          value={`₹${data.rent.pending.toLocaleString()}`}
          to="/payments"
          icon={<MoneyIcon />}
          color="bg-rose-600 text-white"
          subtitle="Needs attention"
        />
      </div>

      {/* REVENUE + ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-4 shadow lg:col-span-2">
          <div className="font-semibold mb-3">Monthly Revenue Trend</div>
          <RevenueChart data={data.revenueHistory} />
        </div>

        {/* OCCUPANCY FORECAST */}
        <div className="bg-white rounded-2xl p-4 shadow">
          <div className="font-semibold mb-3">Occupancy Forecast (Next 3 Months)</div>
          <ForecastBar forecast={data.occupancyForecast} />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-gray-800">Alerts & Reminders</div>
            <div className="text-xs text-gray-500">
              Things that need your attention
            </div>
          </div>

          <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
            {data.alerts.length} active
          </span>
        </div>

        {/* Alerts List */}
        <ul className="space-y-3">
          {data.alerts.map((a, i) => (
            <li
              key={i}
              className="flex gap-3 items-start p-3 rounded-xl bg-amber-50 border-l-4 border-amber-400"
            >
              <div className="mt-0.5 text-amber-600">
                <AlertIcon />
              </div>

              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">
                  {a}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Review and take action
                </div>
              </div>

              {/* Optional action hook */}
              <Link
                to="/my-pgs"
                className="text-xs text-indigo-600 font-medium whitespace-nowrap"
              >
                View →
              </Link>
            </li>
          ))}
        </ul>

        {/* Empty state (future-proof) */}
        {data.alerts.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-6">
            🎉 No alerts right now. Everything looks good!
          </div>
        )}
      </div>

      </div>

      {/* QUICK ACTIONS – MOBILE FIRST */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/tenants" className="rounded-xl bg-indigo-50 p-3 text-center text-sm font-medium">Tenants</Link>
        <Link to="/payments" className="rounded-xl bg-blue-50 p-3 text-center text-sm font-medium">Payments</Link>
        <Link to="/complaints" className="rounded-xl bg-amber-50 p-3 text-center text-sm font-medium">Complaints</Link>
        <Link to="/my-pgs" className="rounded-xl bg-emerald-50 p-3 text-center text-sm font-medium">My PGs</Link>
      </div>
    </div>
  );
}
