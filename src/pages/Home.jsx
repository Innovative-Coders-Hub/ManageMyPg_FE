// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import PageHeader from '../components/PageHeader'
import { Link } from "react-router-dom";

// Inline icons (no package required)
const UpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"
    viewBox="0 0 24 24">
    <path d="M17 7l-5-5-5 5M12 2v20" />
  </svg>
);

const DownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"
    viewBox="0 0 24 24">
    <path d="M7 17l5 5 5-5M12 22V2" />
  </svg>
);

// Simple sparkline component
function Sparkline({ data = [], width = 80, height = 26 }) {
  if (!data.length) return <span className="text-gray-400 text-xs">—</span>;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const rising = data[data.length - 1] >= data[0];

  return (
    <svg width={width} height={height}>
      <polyline
        fill="none"
        stroke={rising ? "#22c55e" : "#ef4444"}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

function Tile({ title, value, to, color, meta, sparkline }) {
  return (
    <Link to={to} className="block">
      <div
        className={`rounded-2xl p-4 text-white shadow-md hover:scale-105 transition ${color}`}
        style={{ minHeight: 120 }}
      >
        <div className="flex justify-between">
          <div>
            <div className="text-sm opacity-90">{title}</div>
            <div className="text-2xl font-bold mt-2">{value ?? "—"}</div>
          </div>

          {meta && (
            <div className="text-xs flex items-center gap-1">
              {meta.trend === "up" && <UpIcon />}
              {meta.trend === "down" && <DownIcon />}
              {meta.label}
            </div>
          )}
        </div>

        <div className="mt-3 flex justify-between">
          <div className="text-xs text-white/90">{meta?.subtitle}</div>
          {sparkline && <Sparkline data={sparkline} />}
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  // 📌 SAMPLE DASHBOARD DATA
  const sampleStats = {
    totalBeds: 20,
    filledBeds: 15,
    upcomingVacatingBeds: 2,
    currentMonthJoined: 3,
    last3MonthsJoined: 8,
    lastMonthVacated: 1,
    last3MonthsVacated: 4,
    upcomingVacationsThisMonth: 2,

    history: {
      filledBeds: [12, 13, 13, 14, 15, 15, 15],
      joined: [0, 1, 0, 2, 1, 0, 3],
      vacated: [0, 0, 1, 0, 0, 1, 1],
    },
  };

  const [stats, setStats] = useState(null);

  useEffect(() => {
    // simulate loading
    setTimeout(() => {
      setStats(sampleStats);
    }, 500);
  }, []);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (!stats) return <div className="p-4">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Friendly Greeting */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">{getGreeting()}! 👋</h1>
        <p className="mt-2 text-white/90">Welcome back to your PG management dashboard</p>
      </div>

      <PageHeader title="Dashboard" />

      {/* GRID TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        <Tile
          title="Total beds"
          value={stats.totalBeds}
          to="/my-pgs"
          color="bg-blue-600"
        />

        <Tile
          title="Filled beds"
          value={stats.filledBeds}
          to="/my-pgs"
          sparkline={stats.history.filledBeds}
          color="bg-green-600"
          meta={{
            label: `${Math.round((stats.filledBeds / stats.totalBeds) * 100)}%`,
            subtitle: "Occupancy rate",
            trend: "up",
          }}
        />

        <Tile
          title="Upcoming vacating beds"
          value={stats.upcomingVacatingBeds}
          to="/my-pgs"
          sparkline={stats.history.vacated}
          color="bg-yellow-400 text-black"
          meta={{ label: stats.upcomingVacatingBeds, trend: "down" }}
        />

        <Tile
          title="Joined (this month)"
          value={stats.currentMonthJoined}
          to="/tenants"
          color="bg-purple-600"
          sparkline={stats.history.joined}
          meta={{ label: stats.currentMonthJoined }}
        />

        <Tile
          title="Joined (last 3 months)"
          value={stats.last3MonthsJoined}
          to="/tenants"
          color="bg-indigo-600"
          sparkline={stats.history.joined}
          meta={{ label: stats.last3MonthsJoined }}
        />

        <Tile
          title="Last month vacated"
          value={stats.lastMonthVacated}
          to="/tenants"
          sparkline={stats.history.vacated}
          color="bg-red-600"
          meta={{ label: stats.lastMonthVacated }}
        />

        <Tile
          title="Last 3 months vacated"
          value={stats.last3MonthsVacated}
          to="/tenants"
          sparkline={stats.history.vacated}
          color="bg-orange-500"
          meta={{ label: stats.last3MonthsVacated }}
        />

        <Tile
          title="Upcoming vacations (this month)"
          value={stats.upcomingVacationsThisMonth}
          to="/my-pgs"
          color="bg-pink-600"
          meta={{ label: stats.upcomingVacationsThisMonth }}
        />
      </div>

      {/* QUICK SUMMARY BAR */}
      <div className="bg-white rounded-lg p-4 shadow flex justify-between items-center">
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-700">Overall Occupancy</div>
          <div className="text-xs text-gray-500">
            {Math.round((stats.filledBeds / stats.totalBeds) * 100)}% occupied
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/complaints" className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md">
            View complaints
          </Link>
          <Link to="/tenants" className="px-3 py-2 bg-indigo-600 text-white rounded-md">
            Manage tenants
          </Link>
        </div>
      </div>
    </div>
  );
}
