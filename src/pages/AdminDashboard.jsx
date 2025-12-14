import React, { useMemo, useState, useEffect } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)
import { sampleData } from '../sampleData'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { lazy, Suspense } from 'react'

const OwnersByCityChart = lazy(() =>
  import('../components/OwnersByCityChart')
)

const OwnersByStateChart = lazy(() =>
  import('../components/OwnersByStateChart')
)
/* =======================
   Utilities
======================= */

const getGrowth = (current, previous) => {
  if (!previous) return 100
  return Math.round(((current - previous) / previous) * 100)
}

/* Dark mode removed — UI stays in normal mode */

/* =======================
   UI Components
======================= */

function StatCard({ title, value, subtitle, growth, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 bg-white border-gray-200 transition ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-gray-400">{subtitle}</span>
        {growth !== undefined && (
          <span
            className={`text-xs font-semibold ${
              growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {growth >= 0 ? '+' : ''}
            {growth}%
          </span>
        )}
      </div>
    </div>
  )
}

/* =======================
   Page
======================= */

export default function AdminDashboard() {
  const navigate = useNavigate()

  const owners = sampleData.owners || []
  const ownersPerPage = 10
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  /* =======================
     Stats
  ======================= */

  const totals = useMemo(() => {
    const now = dayjs()
    const startOfMonth = now.startOf('month')
    const prevMonth = startOfMonth.subtract(1, 'month')

    const currentMonth = owners.filter(o =>
      dayjs(o.registeredAt).isAfter(startOfMonth)
    ).length

    const lastMonth = owners.filter(o =>
      dayjs(o.registeredAt).isBetween(prevMonth, startOfMonth)
    ).length

    return {
      total: owners.length,
      approved: owners.filter(o => o.status === 'approved').length,
      pending: owners.filter(o => o.status === 'pending').length,
      currentMonth,
      growth: getGrowth(currentMonth, lastMonth),
    }
  }, [owners])

  /* =======================
     Charts
  ======================= */

  const ownersByCity = useMemo(() => {
    const map = {}
    owners.forEach(o => (map[o.city] = (map[o.city] || 0) + 1))
    return Object.entries(map).map(([city, count]) => ({ city, count }))
  }, [owners])

  const ownersByState = useMemo(() => {
    const map = {}
    owners.forEach(o => (map[o.state] = (map[o.state] || 0) + 1))
    return Object.entries(map).map(([state, count]) => ({ state, count }))
  }, [owners])

  /* =======================
     Filters
  ======================= */

  const filteredOwners = useMemo(() => {
    return owners.filter(o => {
      const q = search.toLowerCase()
      const matchSearch =
        (o.name || '').toLowerCase().includes(q) ||
        (o.email || '').toLowerCase().includes(q) ||
        (o.city || '').toLowerCase().includes(q)

      const matchStatus =
        statusFilter === 'all' || o.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [owners, search, statusFilter])

  // Ensure current page is valid when filters change
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredOwners.length / ownersPerPage))
    if (page > totalPages) setPage(1)
  }, [filteredOwners.length])

  const paginatedOwners = filteredOwners.slice(
    (page - 1) * ownersPerPage,
    page * ownersPerPage
  )

  /* =======================
     Render
  ======================= */

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Admin Dashboard"
          subtitle="ManageMyPg analytics & control"
        />
        {/* Normal mode only — dark toggle removed */}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Owners" value={totals.total} />
        <StatCard
          title="Approved"
          value={totals.approved}
          onClick={() => navigate('/admin/owners?filter=approved')}
        />
        <StatCard
          title="Pending"
          value={totals.pending}
          onClick={() => navigate('/admin/owners?filter=pending')}
        />
        <StatCard
          title="This Month"
          value={totals.currentMonth}
          subtitle="MoM growth"
          growth={totals.growth}
        />
      </div>
<div className="bg-white border border-gray-200 rounded-xl p-5">
  <h3 className="font-semibold mb-4">
    Owners by City
  </h3>

  <Suspense
    fallback={
      <div className="h-[250px] flex items-center justify-center text-sm text-gray-400">
        Loading chart…
      </div>
    }
  >
    <OwnersByCityChart data={ownersByCity} />
  </Suspense>
</div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          placeholder="Search owners…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border rounded w-64 bg-white border-gray-200"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded bg-white border-gray-200"
        >
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm table-auto">
            <thead className="bg-indigo-50">
              <tr className="text-indigo-700">
                <th className="text-left py-2 px-3 w-2/5 text-xs font-semibold uppercase tracking-wide">Name</th>
                <th className="text-left py-2 px-3 w-2/5 text-xs font-semibold uppercase tracking-wide">Email</th>
                <th className="text-left py-2 px-3 w-1/5 text-xs font-semibold uppercase tracking-wide">City</th>
                <th className="text-right py-2 px-3 w-1/5 text-xs font-semibold uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOwners.map(o => (
                <tr
                  key={o.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/admin/owner/${o.id}`)}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex-shrink-0 flex items-center justify-center font-semibold">
                        {((o.name||'').split(' ').map(n => n?.[0] || '').join('').slice(0,2)).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{o.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-gray-500 text-xs truncate max-w-[200px]">{o.email}</div>
                  </td>
                  <td className="py-3 px-3 text-sm">{o.city}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${o.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredOwners.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">No owners found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page * ownersPerPage >= filteredOwners.length}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
