import React, { useState } from 'react'
import PageHeader from '../components/PageHeader'

export default function Complaints() {
  const CATEGORIES = ['ALL', 'POWER', 'PLUMBING', 'CLEANING', 'PARKING', 'FOOD']
  const STATUSES = ['ALL', 'OPEN', 'ASSIGNED', 'COMPLETED']

  const sampleData = [
    {
      id: 1,
      category: 'POWER',
      description: 'No electricity in block B since 10 AM. Fuse might have blown.',
      image: null,
      status: 'OPEN',
      createdBy: 'Ravi Kumar',
      createdAt: '2025-11-13T09:12:00',
    },
    {
      id: 2,
      category: 'PLUMBING',
      description: 'Leaking pipe outside flat 204, water pooling near stairs.',
      image: null,
      status: 'ASSIGNED',
      createdBy: 'Asha Devi',
      createdAt: '2025-11-12T17:45:00',
    },
    {
      id: 3,
      category: 'CLEANING',
      description: 'Garbage not collected for 2 days at the west gate.',
      image: null,
      status: 'COMPLETED',
      createdBy: 'Suresh',
      createdAt: '2025-11-10T07:30:00',
    },
  ]

  const [complaints, setComplaints] = useState(sampleData)
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = () =>
    complaints
      .filter(c => categoryFilter === 'ALL' || c.category === categoryFilter)
      .filter(c => statusFilter === 'ALL' || c.status === statusFilter)
      .filter(
        c =>
          c.description.toLowerCase().includes(query.toLowerCase()) ||
          c.createdBy.toLowerCase().includes(query.toLowerCase()) ||
          String(c.id) === query
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const nextStatus = s => (s === 'OPEN' ? 'ASSIGNED' : 'COMPLETED')

  return (
    <div className="space-y-6">
      {/* ===== HEADER (same as Tenants) ===== */}
      <PageHeader
        title="Complaints"
        subtitle={
          <span className="hidden sm:inline">
            Search by id, text or reporter.
          </span>
        }
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:max-w-sm sm:justify-end">
          {/* Desktop search */}
          <label className="relative hidden sm:block w-full">
            <input
              className="border rounded px-3 py-2 w-full text-sm"
              placeholder="Search by id, text or reporter"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </label>
        </div>
      </PageHeader>

      {/* Mobile search (same behavior as Tenants) */}
      <div className="sm:hidden">
        <input
          className="border rounded px-3 py-2 w-full text-sm"
          placeholder="Search by id, text or reporter"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* ===== FILTERS (unchanged) ===== */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            className="border rounded px-3 py-2"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {STATUSES.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <div className="hidden lg:block" />
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* ===== MOBILE / TABLET CARD VIEW ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {filtered().map(c => (
          <div key={c.id} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-semibold">
                  #{c.id} · {c.category}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
              <StatusBadge status={c.status} />
            </div>

            <p className="text-sm text-gray-700 line-clamp-3">
              {c.description}
            </p>

            <div className="text-xs text-gray-500">
              Reported by: {c.createdBy}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelected(c)}
                className="flex-1 border rounded py-1 text-sm"
              >
                View
              </button>
              {c.status !== 'COMPLETED' && (
                <button
                  onClick={() =>
                    setComplaints(prev =>
                      prev.map(x =>
                        x.id === c.id
                          ? { ...x, status: nextStatus(x.status) }
                          : x
                      )
                    )
                  }
                  className="flex-1 bg-indigo-600 text-white rounded py-1 text-sm"
                >
                  Mark {nextStatus(c.status)}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ===== DESKTOP TABLE VIEW ===== */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              {['ID', 'Category', 'Description', 'By', 'Created', 'Status', 'Actions'].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered().map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{c.id}</td>
                <td className="px-4 py-3 text-sm font-medium">{c.category}</td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">
                  {c.description}
                </td>
                <td className="px-4 py-3 text-sm">{c.createdBy}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(c.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3">
                  <button
                    className="border px-3 py-1 rounded text-sm"
                    onClick={() => setSelected(c)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== MODAL ===== */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <h2 className="text-xl font-semibold mb-3">
              Complaint #{selected.id}
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              {selected.description}
            </p>
            <button
              className="bg-gray-100 px-4 py-2 rounded"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    OPEN: 'bg-yellow-100 text-yellow-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
  }
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  )
}
