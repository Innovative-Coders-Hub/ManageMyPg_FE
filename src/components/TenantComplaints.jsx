import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import {
  getTenantComplaints,
  createComplaint
} from '../api/ownerAuth'

const COMPLAINT_CATEGORIES = [
  'ELECTRICITY',
  'WATER',
  'CLEANING',
  'WIFI',
  'MAINTENANCE',
  'FOOD',
  'PLUMBING',
  'PARKING',
  'OTHER'
]

export default function TenantComplaints({ pgId }) {
  const [complaints, setComplaints] = useState([])
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: ''
  })

  useEffect(() => {
    fetchComplaints(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const fetchComplaints = async (pageNo) => {
    try {
      setLoading(true)
      const res = await getTenantComplaints(pageNo, 5)
      setComplaints(res.content || [])
      setTotalPages(res.totalPages || 0)
    } finally {
      setLoading(false)
    }
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

const submit = async () => {
  if (!form.title || !form.category) {
    alert('Title and category are required')
    return
  }

  try {
    setSubmitting(true)

    const created = await createComplaint({
      pgId,
      title: form.title,
      description: form.description || null,
      category: form.category,
      complaintImageUrl: null
    })

    // 🔥 ADD THIS
    setComplaints(prev => [created, ...prev])

    setForm({
      title: '',
      description: '',
      category: ''
    })
    setShowForm(false)
  } finally {
    setSubmitting(false)
  }
}


  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">🛠 Complaints</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
        >
          + New Complaint
        </button>
      </div>

      {/* Complaint Form */}
      {showForm && (
        <div className="border rounded-xl p-4 mb-6 bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="title"
              placeholder="Complaint title *"
              value={form.title}
              onChange={onChange}
              className="border rounded-lg px-3 py-2"
            />

            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Select category *</option>
              {COMPLAINT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <textarea
            name="description"
            rows={3}
            placeholder="Describe the issue (optional)"
            value={form.description}
            onChange={onChange}
            className="border rounded-lg px-3 py-2 w-full"
          />

          <div className="flex gap-3">
            <button
              onClick={submit}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>

            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Complaint List */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading complaints…</div>
      ) : complaints.length === 0 ? (
        <div className="text-sm text-gray-500">No complaints raised yet.</div>
      ) : (
        <>
          <div className="space-y-3">
            {/* Complaint List */}
            <div className="hidden md:block overflow-x-auto">
             <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                <tr>
                    <th className="px-3 py-2 border">Title</th>
                    <th className="px-3 py-2 border">Category</th>
                    <th className="px-3 py-2 border">Description</th>
                    <th className="px-3 py-2 border">Created</th>
                    <th className="px-3 py-2 border">Updated</th>
                    <th className="px-3 py-2 border">Status</th>
                    <th className="px-3 py-2 border">Action</th>
                </tr>
                </thead>
                <tbody>
                    {complaints.map(c => (
                        <tr key={c.id} className="border-t text-center">
                        <td className="px-3 py-2">{c.title}</td>
                        <td className="px-3 py-2">{c.category}</td>
                        <td className="px-3 py-2 text-left max-w-xs truncate">
                            {c.description || '—'}
                        </td>
                        <td className="px-3 py-2">
                            {dayjs(c.createdDate).format('DD MMM YYYY')}
                        </td>
                        <td className="px-3 py-2">
                            {dayjs(c.updatedDate).format('DD MMM YYYY')}
                        </td>
                        <td className="px-3 py-2">
                            <StatusBadge status={c.status} />
                        </td>
                        <td className="px-3 py-2">
                            <button
                            onClick={() => setSelectedComplaint(c)}
                            className="text-indigo-600 text-sm font-semibold hover:underline"
                            >
                            View Details
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>

             </table>
             </div>
                    {selectedComplaint && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
                            <button
                                onClick={() => setSelectedComplaint(null)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-black"
                            >
                                ✕
                            </button>

                           <h3 className="
                            text-xl font-semibold
                            mb-4
                            text-center
                            bg-indigo-50
                            text-indigo-700
                            py-3
                            rounded-lg
                            ">
                            Complaint Details
                            </h3>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                <Detail label="Title" value={selectedComplaint.title} />
                                <Detail label="Category" value={selectedComplaint.category} />
                                <Detail label="Status" value={selectedComplaint.status} />
                                <Detail label="Tenant" value={selectedComplaint.tenantName} />
                                <Detail label="PG" value={selectedComplaint.pgName} />
                                <Detail
                                label="Created Date"
                                value={dayjs(selectedComplaint.createdDate).format('DD MMM YYYY HH:mm')}
                                />
                                <Detail
                                label="Updated Date"
                                value={dayjs(selectedComplaint.updatedDate).format('DD MMM YYYY HH:mm')}
                                />
                                <Detail
                                label="Resolved Date"
                                value={
                                    selectedComplaint.resolvedDate
                                    ? dayjs(selectedComplaint.resolvedDate).format('DD MMM YYYY HH:mm')
                                    : '—'
                                }
                                />
                            </div>

                            <div className="mt-4">
                                <div className="text-gray-500 text-sm mb-1">Description</div>
                                <div className="border rounded-lg p-3 text-sm">
                                {selectedComplaint.description || '—'}
                                </div>
                            </div>

                            {selectedComplaint.resolutionNotes && (
                                <div className="mt-4">
                                <div className="text-gray-500 text-sm mb-1">Resolution Notes</div>
                                <div className="border rounded-lg p-3 text-sm bg-green-50">
                                    {selectedComplaint.resolutionNotes}
                                </div>
                                </div>
                            )}
                            </div>
                        </div>
                        )}

            </div>
        {/* Mobile View */}
                <div className="md:hidden space-y-3">
                {complaints.map(c => (
                    <div key={c.id} className="border rounded-xl p-3 space-y-1">
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-xs text-gray-500">
                        {c.category} • {dayjs(c.createdDate).format('DD MMM YYYY')}
                    </div>
                    <div className="text-sm truncate">
                        {c.description || '—'}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <StatusBadge status={c.status} />
                        <button
                        onClick={() => setSelectedComplaint(c)}
                        className="text-indigo-600 text-sm font-semibold"
                        >
                        View Details
                        </button>
                    </div>
                    </div>
                ))}
                </div>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {page + 1} of {totalPages}
            </span>

            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const styles = {
    OPEN: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-200 text-gray-700'
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  )
}

const Detail = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-2">
    <div className="text-gray-500 text-xs">{label}</div>
    <div className="font-medium text-sm truncate">
      {value || '—'}
    </div>
  </div>
)