import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useSearchParams } from 'react-router-dom'
import {
  getOwnerComplaints,
  updateComplaintStatus
} from '../api/ownerAuth'

const CATEGORIES = [
  '', 'ELECTRICITY', 'WATER', 'CLEANING', 'WIFI',
  'MAINTENANCE', 'FOOD', 'PLUMBING', 'PARKING', 'OTHER'
]

const STATUSES = ['', 'OPEN', 'ASSIGNED', 'COMPLETED']

export default function OwnerComplaints() {
  const [searchParams] = useSearchParams()
  const pgId = searchParams.get('pgId')
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [allComplaints, setAllComplaints] = useState([])

  const [filters, setFilters] = useState({
    category: '',
    status: '',
    fromDate: '',
    toDate: ''
  })

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [saving, setSaving] = useState(false)

  const [resolutionNotes, setResolutionNotes] = useState('')
  const [status, setStatus] = useState('')
const [pgFiltersMap, setPgFiltersMap] = useState({})
const [debouncedFilters, setDebouncedFilters] = useState(filters)
  /* ===================== AUTO APPLY FILTERS ===================== */

   


  /* ===================== FETCH ===================== */
useEffect(() => {
  if (!pgId) return

  setPage(0)
  fetchComplaints(0)
}, [pgId])
    
useEffect(() => {
  const t = setTimeout(() => {
    setDebouncedFilters(filters)
  }, 300)

  return () => clearTimeout(t)
}, [filters])

const fetchComplaints = async (pageNo = page) => {
  try {
    setLoading(true)

    const res = await getOwnerComplaints(pgId, pageNo, 10)
    const data = res.content || []

    setAllComplaints(data)
    setPage(pageNo)
    setTotalPages(res.totalPages || 0)

    // 👇 apply filters on new page data
    setComplaints(data)
    // setComplaints(() => {
    //   let filtered = [...data]

    //   if (filters.category) {
    //     filtered = filtered.filter(c => c.category === filters.category)
    //   }
    //   if (filters.status) {
    //     filtered = filtered.filter(c => c.status === filters.status)
    //   }
    //   if (filters.fromDate) {
    //     const from = dayjs(filters.fromDate).startOf('day')
    //     filtered = filtered.filter(c =>
    //       dayjs(c.createdDate).isSame(from) ||
    //       dayjs(c.createdDate).isAfter(from)
    //     )
    //   }
    //   if (filters.toDate) {
    //     const to = dayjs(filters.toDate).endOf('day')
    //     filtered = filtered.filter(c =>
    //       dayjs(c.createdDate).isSame(to) ||
    //       dayjs(c.createdDate).isBefore(to)
    //     )
    //   }

    //   return filtered
    // })
  } catch (e) {
    console.error('Failed to load complaints', e)
  }finally {
    setLoading(false)
  }
}

useEffect(() => {
  if (!pgId) return
  if (allComplaints.length === 0) return

  setFilters(
    pgFiltersMap[pgId] || {
      category: '',
      status: '',
      fromDate: '',
      toDate: ''
    }
  )
}, [allComplaints, pgId])

 useEffect(() => {
  let filtered = [...allComplaints]

  if (debouncedFilters.category) {
    filtered = filtered.filter(
      c => c.category === debouncedFilters.category
    )
  }

  if (debouncedFilters.status) {
    filtered = filtered.filter(
      c => c.status === debouncedFilters.status
    )
  }

  if (debouncedFilters.fromDate) {
    const from = dayjs(debouncedFilters.fromDate).startOf('day')
    filtered = filtered.filter(c =>
      dayjs(c.createdDate).isSame(from) ||
      dayjs(c.createdDate).isAfter(from)
    )
  }

  if (debouncedFilters.toDate) {
    const to = dayjs(debouncedFilters.toDate).endOf('day')
    filtered = filtered.filter(c =>
      dayjs(c.createdDate).isSame(to) ||
      dayjs(c.createdDate).isBefore(to)
    )
  }

  setComplaints(filtered)
}, [debouncedFilters, allComplaints])

    useEffect(() => {
      if (!pgId) return

      setPgFiltersMap(prev => ({
        ...prev,
        [pgId]: filters
      }))
    }, [filters, pgId])
  /* ===================== FILTERS ===================== */

  const onFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

// const applyClientFilters = () => {
//   let filtered = [...allComplaints]

//   if (filters.category) {
//     filtered = filtered.filter(
//       c => c.category === filters.category
//     )
//   }

//   if (filters.status) {
//     filtered = filtered.filter(
//       c => c.status === filters.status
//     )
//   }

//   if (filters.fromDate) {
//     const from = dayjs(filters.fromDate).startOf('day')
//     filtered = filtered.filter(c =>
//       dayjs(c.createdDate).isAfter(from) ||
//       dayjs(c.createdDate).isSame(from)
//     )
//   }

//   if (filters.toDate) {
//     const to = dayjs(filters.toDate).endOf('day')
//     filtered = filtered.filter(c =>
//       dayjs(c.createdDate).isBefore(to) ||
//       dayjs(c.createdDate).isSame(to)
//     )
//   }

//   setComplaints(filtered)
// }

const resetFilters = () => {
  const empty = {
    category: '',
    status: '',
    fromDate: '',
    toDate: ''
  }

  setFilters(empty)

  if (pgId) {
    setPgFiltersMap(prev => ({
      ...prev,
      [pgId]: empty
    }))
  }
}


  /* ===================== MODAL ===================== */

const openDetails = (c) => {
  setSelectedComplaint(c)
  setResolutionNotes(c.resolutionNotes || '')
  setStatus(c.status || 'OPEN')
}

  const closeDetails = () => {
    setSelectedComplaint(null)
    setResolutionNotes('')
    setStatus('')
  }

  const saveUpdate = async () => {
    try {
      setSaving(true)

      const updated = await updateComplaintStatus(
        selectedComplaint.id,
        {
          status,
          resolutionNotes: resolutionNotes || null
        }
      )

      setComplaints(prev =>
        prev.map(c => c.id === updated.id ? updated : c)
      )
      setAllComplaints(prev =>
        prev.map(c => c.id === updated.id ? updated : c)
      )

      closeDetails()
    } finally {
      setSaving(false)
    }
  }

  /* ===================== RENDER ===================== */

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">

      {/* Header */}
      <h1 className="text-2xl font-bold">🛠 Complaint Management</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <select
        name="category"
        value={filters.category}
        onChange={onFilterChange}
        className="w-full appearance-none cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition
                  hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
      >
        {CATEGORIES.map(c => (
          <option key={c} value={c}>
            {c || 'All Categories'}
          </option>
        ))}
      </select>

      <select
        name="status"
        value={filters.status}
        onChange={onFilterChange}
        className="w-full appearance-none cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm transition
                  hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>
            {s || 'All Statuses'}
          </option>
        ))}
      </select>


          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={onFilterChange}
            className="border rounded-lg px-3 py-2"
          />

          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={onFilterChange}
            className="border rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            Reset
          </button>
        </div>
        {/* <div className="flex gap-3">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
          >
            Apply
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
          >
            Reset
          </button>
        </div> */}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-gray-500">Loading complaints…</div>
      ) : complaints.length === 0 ? (
        <div className="text-gray-500">No complaints found.</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <Th>Title</Th>
                  <Th>Category</Th>
                  <Th>Tenant</Th>
                  <Th>PG</Th>
                  <Th>Created</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id} className="border-t text-center">
                    <Td>{c.title}</Td>
                    <Td>{c.category}</Td>
                    <Td>{c.tenantName}</Td>
                    <Td>{c.pgName}</Td>
                    <Td>{dayjs(c.createdDate).format('DD MMM YYYY')}</Td>
                    <Td><StatusBadge status={c.status} /></Td>
                    <Td>
                      <button
                        onClick={() => openDetails(c)}
                        className="text-indigo-600 font-semibold text-sm"
                      >
                        View Details
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {complaints.map(c => (
              <div key={c.id} className="bg-white rounded-xl shadow p-3 space-y-1">
                <div className="font-semibold">{c.title}</div>
                <div className="text-xs text-gray-500">
                  {c.category} • {dayjs(c.createdDate).format('DD MMM YYYY')}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <StatusBadge status={c.status} />
                  <button
                    onClick={() => openDetails(c)}
                    className="text-indigo-600 text-sm font-semibold"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <button
          disabled={page === 0}
          onClick={() => fetchComplaints(page - 1)}
          className="px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page + 1} of {totalPages}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => fetchComplaints(page + 1)}
          className="px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {selectedComplaint && (
        <Modal onClose={closeDetails}>
          <h3 className="text-xl font-semibold text-center bg-gray-100 py-3 rounded-lg mb-4">
            Complaint Details
          </h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Detail label="Title" value={selectedComplaint.title} />
            <Detail label="Category" value={selectedComplaint.category} />
            <Detail label="Tenant" value={selectedComplaint.tenantName} />
            <Detail label="PG" value={selectedComplaint.pgName} />
            <Detail
              label="Created"
              value={dayjs(selectedComplaint.createdDate).format('DD MMM YYYY HH:mm')}
            />
            <Detail label="Status" value={selectedComplaint.status} />
          </div>

          <div className="mt-4">
            <label className="text-sm text-gray-500">Resolution Notes</label>
            <textarea
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              rows={3}
            />
          </div>

          <div className="mt-3">
            <label className="text-sm text-gray-500">Update Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            >
              {STATUSES.filter(Boolean).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={saveUpdate}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={closeDetails}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ===================== HELPERS ===================== */

const Th = ({ children }) => (
  <th className="px-3 py-2 border">{children}</th>
)

const Td = ({ children }) => (
  <td className="px-3 py-2 border">{children}</td>
)

const Detail = ({ label, value }) => (
  <div>
    <div className="text-gray-500">{label}</div>
    <div className="font-medium">{value || '—'}</div>
  </div>
)

const StatusBadge = ({ status }) => {
  const styles = {
    OPEN: 'bg-yellow-100 text-yellow-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700'
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


const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500"
      >
        ✕
      </button>
      {children}
    </div>
  </div>
)
