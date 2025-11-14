import React, { useState } from 'react';

// Complaints.jsx
// Single-file React component (Tailwind CSS) that shows an admin complaints overview
// - Uses local sample data (no API calls)
// - Filter by category / status, search, view details in modal
// - Update status (Open -> Assigned -> Completed)

export default function Complaints() {
  const CATEGORIES = ['ALL', 'POWER', 'PLUMBING', 'CLEANING', 'PARKING', 'FOOD'];
  const STATUSES = ['ALL', 'OPEN', 'ASSIGNED', 'COMPLETED'];

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
    {
      id: 4,
      category: 'PARKING',
      description: 'Car blocking driveway repeatedly at night.',
      image: null,
      status: 'OPEN',
      createdBy: 'Nikhil',
      createdAt: '2025-11-14T06:22:00',
    },
    {
      id: 5,
      category: 'FOOD',
      description: 'Mess food quality poor today, many returned plates.',
      image: null,
      status: 'OPEN',
      createdBy: 'Anita',
      createdAt: '2025-11-14T11:05:00',
    },
  ];

  const [complaints, setComplaints] = useState(sampleData);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  function filtered() {
    return complaints
      .filter((c) => (categoryFilter === 'ALL' ? true : c.category === categoryFilter))
      .filter((c) => (statusFilter === 'ALL' ? true : c.status === statusFilter))
      .filter(
        (c) =>
          c.description.toLowerCase().includes(query.toLowerCase()) ||
          c.createdBy.toLowerCase().includes(query.toLowerCase()) ||
          String(c.id) === query
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function openDetails(item) {
    setSelected(item);
  }

  function closeDetails() {
    setSelected(null);
  }

  function updateStatus(id, newStatus) {
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    if (selected && selected.id === id) {
      setSelected((s) => ({ ...s, status: newStatus }));
    }
  }

  function nextStatus(current) {
    if (current === 'OPEN') return 'ASSIGNED';
    if (current === 'ASSIGNED') return 'COMPLETED';
    return 'COMPLETED';
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Complaints — Admin Overview</h1>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Category</label>
              <select
                className="ml-2 px-3 py-2 border rounded"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 mt-3 md:mt-0">
              <label className="text-sm font-medium">Status</label>
              <select
                className="ml-2 px-3 py-2 border rounded"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="ml-auto mt-3 md:mt-0">
              <input
                type="text"
                placeholder="Search by text, id or reporter"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="px-3 py-2 border rounded w-full md:w-64"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Reported By</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filtered().map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{c.id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{c.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">{c.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.createdBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        c.status === 'OPEN'
                          ? 'bg-yellow-100 text-yellow-800'
                          : c.status === 'ASSIGNED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50"
                        onClick={() => openDetails(c)}
                      >
                        View
                      </button>
                      {c.status !== 'COMPLETED' && (
                        <button
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                          onClick={() => updateStatus(c.id, nextStatus(c.status))}
                        >
                          Mark {c.status === 'OPEN' ? 'Assigned' : 'Completed'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered().length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold">Complaint #{selected.id} — {selected.category}</h2>
                <button className="text-gray-500" onClick={closeDetails}>✕</button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selected.description}</p>

                  <div className="mt-4 text-sm text-gray-600">
                    <div><strong>Reported by:</strong> {selected.createdBy}</div>
                    <div><strong>Created:</strong> {new Date(selected.createdAt).toLocaleString()}</div>
                    <div className="mt-2"><strong>Status:</strong>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        selected.status === 'OPEN'
                          ? 'bg-yellow-100 text-yellow-800'
                          : selected.status === 'ASSIGNED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {selected.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    {selected.status !== 'COMPLETED' && (
                      <button
                        className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        onClick={() => updateStatus(selected.id, nextStatus(selected.status))}
                      >
                        Mark as {nextStatus(selected.status)}
                      </button>
                    )}

                    <button className="px-3 py-2 bg-gray-100 rounded" onClick={closeDetails}>Close</button>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-full h-48 bg-gray-50 rounded overflow-hidden flex items-center justify-center border">
                    {selected.image ? (
                      <img src={selected.image} alt={`complaint-${selected.id}`} className="object-contain h-full w-full" />
                    ) : (
                      <div className="text-sm text-gray-400">No image provided</div>
                    )}
                  </div>

                  <div className="mt-3 text-sm text-gray-500">ID: {selected.id}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
