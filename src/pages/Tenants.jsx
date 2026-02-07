import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { getAllTenants } from '../api/ownerAuth'
import PageHeader from '../components/PageHeader'
import { useSearchParams } from 'react-router-dom'
// Utility to get initials
const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('') || '?'

export default function Tenants() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const [tenantsRaw, setTenantsRaw] = useState([])
  const [showActive, setShowActive] = useState(false)
  const [showVacated, setShowVacated] = useState(false)
  const [searchParams] = useSearchParams()
const pgId = searchParams.get('pgId')
useEffect(() => {
  if (!pgId) return

  async function fetchTenants() {
    try {
      const data = await getAllTenants(pgId)
      setTenantsRaw(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setTenantsRaw([])
    }
  }

  fetchTenants()
}, [pgId])

const tenants = useMemo(() => {
  return tenantsRaw.map(t => {
    const isVacated = t.vacated === true

    return {
      id: t.id,
      tenant: {
        name: t.name,
        phone: t.mobileNumber,
        email: t.email,
        start: t.dateOfJoining,
        end: t.dateOfVacate,
      },
      bedId: t.bedId,
      vacated: isVacated,          // ✅ source of truth
      rent: t.rentResponse?.[0] || null,
    }
  })
}, [tenantsRaw])



  // Filters + search
const filtered = useMemo(() => {
  const afterFilter = tenants.filter(it => {
    const isVacated = it.vacated

    if (!showActive && !showVacated) return true
    if (!isVacated && showActive) return true   // Active
    if (isVacated && showVacated) return true      // Vacated

    return false
  })

  if (!q) return afterFilter

  return afterFilter.filter(t => {
    const name = (t.tenant?.name || '').toLowerCase()
    const phone = (t.tenant?.phone || '').toLowerCase()
    return name.includes(q) || phone.includes(q)
  })
}, [q, tenants, showActive, showVacated])


  // Pagination
  const ITEMS_PER_PAGE = 20
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))

  useEffect(() => {
    setPage(1)
  }, [q, showActive, showVacated, filtered.length])

  const current = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Tenants"
        subtitle={
          <span className="hidden sm:inline">
            Search by name or mobile number.
          </span>
        }
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:max-w-md sm:justify-end">
          {/* Desktop search */}
          <label className="relative flex-1 hidden sm:block">
            <span className="sr-only">Search</span>
            <input
              className="placeholder:italic placeholder:text-gray-400 block bg-white w-full border border-gray-200 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Search name or mobile…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <svg
              className="w-4 h-4 absolute left-3 top-2.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M21 21l-4.35-4.35" />
              <circle cx="11" cy="11" r="6" />
            </svg>
          </label>

          {/* Filters – unchanged */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showActive}
                onChange={e => setShowActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400"
              />
              <span className="text-gray-700">Active</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showVacated}
                onChange={e => setShowVacated(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400"
              />
              <span className="text-gray-700">Vacated</span>
            </label>
          </div>
        </div>
      </PageHeader>

      {/* Mobile Search (above tenants) */}
      <div className="sm:hidden">
        <label className="relative block">
          <span className="sr-only">Search</span>
          <input
            className="placeholder:italic placeholder:text-gray-400 block bg-white w-full border border-gray-200 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Search name or mobile…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <svg
            className="w-4 h-4 absolute left-3 top-2.5 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M21 21l-4.35-4.35" />
            <circle cx="11" cy="11" r="6" />
          </svg>
        </label>
      </div>

      {/* Tenant Cards */}
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed p-6 text-center text-gray-600">
            No tenants found. Adjust filters or search term.
          </div>
        ) : (
          current.map(item => {
            const t = item.tenant || {}
            const isCurrent = !item.history

            return (
              <div
                key={item.id}
                className="rounded-2xl border p-4 bg-white shadow-sm transition hover:bg-gradient-to-br hover:from-emerald-50 hover:to-sky-50 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className={`h-12 w-12 flex items-center justify-center rounded-lg text-white font-bold ${
                      item.vacated ? 'bg-gray-400' : 'bg-emerald-600'
                    }`}
                  >
                    {initials(t.name)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {t.name || '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t.mobileNumber || t.email || '—'}
                        </div>
                      </div>

                      <div className="text-xs">
                       <span className="px-3 py-1 rounded-full bg-gray-100 border text-gray-700">
                          {item.vacated ? 'Vacated' : 'Active'}
                        </span>
                      </div>
                    </div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {/* Join Date */}
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600">📅</span>
                          <div>
                            <div className="text-gray-500">Joined</div>
                            <div className="font-medium text-emerald-700">
                              {t.start ? dayjs(t.start).format('DD MMM YYYY') : '—'}
                            </div>
                          </div>
                        </div>

                        {/* Vacated Date – show only if vacated */}
                        {item.vacated && (
                          <div className="flex items-center gap-2">
                            <span className="text-rose-600">🚪</span>
                            <div>
                              <div className="text-gray-500">Vacated</div>
                              <div className="font-medium text-rose-700">
                                {t.end ? dayjs(t.end).format('DD MMM YYYY') : '—'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>



                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {item.vacated ? 'Vacated' : 'Active'}
                      </div>

                      <button
                        onClick={() =>
                          item.bedId && navigate(`/beds/${item.bedId}`)
                        }
                        className="px-3 py-1 rounded-lg bg-gradient-to-br from-emerald-600 to-sky-600 text-white text-xs font-medium hover:from-emerald-700 hover:to-sky-700"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of{' '}
            {filtered.length} tenants
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50"
            >
              Previous
            </button>

            <div className="text-sm">
              Page {page} / {totalPages}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
