import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { sampleData } from '../sampleData'
import PageHeader from '../components/PageHeader'

// Simple utility to get initials
const initials = (name = '') => name.split(' ').filter(Boolean).slice(0,2).map(s => s[0]?.toUpperCase()).join('') || '?'

export default function Tenants() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  // default unchecked as requested
  const [showActive, setShowActive] = useState(false)
  const [showPast, setShowPast] = useState(false)

  // Build a flat list of tenants across sampleData with links to bed/context
  const tenants = useMemo(() => {
    const out = []
    for (const pg of (sampleData?.pgs || [])) {
      for (const floor of (pg.floors || [])) {
        for (const room of (floor.rooms || [])) {
          for (const b of (room.beds || [])) {
            if (b.occupied && b.tenant) {
              out.push({ id: `${pg.id}-${floor.number}-${room.number}-${b.id}`, bedId: b.id, pgId: pg.id, floor: floor.number, room: room.number, tenant: b.tenant, bed: b })
            }
            if (Array.isArray(b.history)) {
              for (const h of b.history) {
                out.push({ id: `${pg.id}-${floor.number}-${room.number}-${b.id}-hist-${h.start}`, bedId: b.id, pgId: pg.id, floor: floor.number, room: room.number, tenant: { name: h.tenantName, start: h.start, end: h.end }, bed: b, history: true })
              }
            }
          }
        }
      }
    }
    return out
  }, [])

  const filtered = useMemo(() => {
    // apply active/past filters first
    // If neither filter is checked, show all tenants
    const afterFilter = tenants.filter(it => {
      const isPast = !!it.history
      if (!showActive && !showPast) return true
      if (isPast && showPast) return true
      if (!isPast && showActive) return true
      return false
    })

    if (!q) return afterFilter
    return afterFilter.filter(t => {
      const name = (t.tenant?.name || '').toLowerCase()
      const phone = (t.tenant?.phone || '').toLowerCase()
      return name.includes(q) || phone.includes(q)
    })
  }, [q, tenants, showActive, showPast])

  // Pagination
  const ITEMS_PER_PAGE = 20
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  // reset page when filters/search change
  React.useEffect(() => setPage(1), [q, showActive, showPast, filtered.length])
  const current = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="w-full max-w-screen-2xl px-4 py-8">
      <PageHeader title="Tenants" subtitle="Search by name or mobile number.">
        <div className="flex items-center gap-3 w-full max-w-md justify-end">
          <label className="relative flex-1">
            <span className="sr-only">Search</span>
            <input
              className="placeholder:italic placeholder:text-gray-400 block bg-white w-full border border-gray-200 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Search name or mobile…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M21 21l-4.35-4.35" />
              <circle cx="11" cy="11" r="6" />
            </svg>
          </label>

          {/* Filters next to search box */}
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showActive}
                onChange={(e)=>setShowActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400"
              />
              <span className="text-gray-700">Active</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPast}
                onChange={(e)=>setShowPast(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400"
              />
              <span className="text-gray-700">Past</span>
            </label>
          </div>
        </div>
      </PageHeader>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed p-6 text-center text-gray-600">No tenants found. Adjust filters or search term.</div>
        ) : (
          current.map((item, idx) => {
            const t = item.tenant || {}
            const isCurrent = !item.history && item.bed && item.bed.occupied && item.bed.tenant && item.bed.tenant.name === t.name
            const altBg = (Math.floor(idx / 3) % 2 === 0) ? 'bg-gray-50' : 'bg-white'

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 shadow-sm transition ${altBg} hover:bg-gradient-to-br hover:from-emerald-50 hover:to-sky-50 hover:border-emerald-200 hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-12 w-12 flex items-center justify-center rounded-lg text-white font-bold ${isCurrent ? 'bg-emerald-600' : 'bg-gray-400'}`}>
                    {initials(t.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-900">{t.name || '—'}</div>
                        <div className="text-xs text-gray-500">{t.phone || (t.email ? t.email : '—')}</div>
                      </div>

                      <div className="text-right text-xs flex flex-col items-end">
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 border text-gray-700 text-sm">Room {item.room} / Bed {String(item.bedId)}</div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 items-center">
                      <div className="text-right col-span-2">
                        <div className="text-gray-500">Join</div>
                        <div className="font-medium">{t.start ? dayjs(t.start).format('DD MMM YYYY') : '—'}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500">{item.history ? 'Past stay' : 'Active'}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigate(`/beds/${item.bedId}`, { state: { bed: item.bed } })
                          }}
                          className="px-3 py-1 rounded-lg bg-gradient-to-br from-emerald-600 to-sky-600 text-white text-xs font-medium hover:from-emerald-700 hover:to-sky-700"
                        >View</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination controls */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} tenants</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50">Previous</button>
            <div className="text-sm">Page {page} / {totalPages}</div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
