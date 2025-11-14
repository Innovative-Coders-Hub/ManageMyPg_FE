// src/pages/PgDetail.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { sampleData } from '../sampleData'

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="currentColor">
    <path d="M7 10l5 5 5-5H7z" />
  </svg>
)

/* ---------------- Bed button ---------------- */
function Bed({ bed, context }) {
  const navigate = useNavigate()
  const today = dayjs()

  let tone = 'bg-green-100 border-green-300 text-green-900'
  if (bed.occupied) tone = 'bg-red-100 border-red-300 text-red-900'
  if (bed?.tenant?.end && dayjs(bed.tenant.end).isValid() && dayjs(bed.tenant.end).diff(today, 'day') <= 7) {
    tone = 'bg-amber-100 border-amber-300 text-amber-900'
  }

  const payments = Array.isArray(bed?.tenant?.payments) ? bed.tenant.payments : []

  const go = () => {
    const id = encodeURIComponent(String(bed.id))
    navigate(`/beds/${id}`, {
      state: {
        bed: {
          ...bed,
          _context: context,
          tenant: bed.tenant ? { ...bed.tenant, payments } : bed.tenant,
        }
      }
    })
  }

  return (
    <button
      type="button"
      onClick={go}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${tone} hover:shadow transition`}
      title={bed.occupied ? `Tenant: ${bed.tenant?.name ?? ''}` : 'Available'}
    >
      <span className="text-sm">{String(bed.id)}</span>
      {bed.occupied && <span className="ml-auto text-xs opacity-80">{bed.tenant?.name ?? ''}</span>}
    </button>
  )
}

/* ---------------- Sticky toolbar component ---------------- */
function StickyToolbar({ floorNumber, setFloorNumber, addFloor, filters, setFilters }) {
  // compact pill builder
  const pills = [
    { key: 'ac', label: 'AC', on: 'bg-sky-100 border-sky-300 text-sky-800', off: 'bg-white border-sky-200 text-sky-700 hover:bg-sky-50' },
    { key: 'nonac', label: 'Non-AC', on: 'bg-red-100 border-red-300 text-red-800', off: 'bg-white border-red-200 text-red-700 hover:bg-red-50' },
    { key: 'available', label: 'Available', on: 'bg-green-100 border-green-300 text-green-800', off: 'bg-white border-green-200 text-green-700 hover:bg-green-50' },
    { key: 'vacatingSoon', label: 'Vacating ≤ 7d', on: 'bg-amber-100 border-amber-300 text-amber-800', off: 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50' }
  ]

  return (
    // Keep toolbar at top of viewport; avoid transform on parent so sticky works
    <div className="sticky top-16 z-40">
      <div className="rounded-2xl border bg-white/80 backdrop-blur-md p-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-3">
          {/* Add Floor (left) */}
          <div className="w-full lg:w-1/2 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-sm">Add Floor</h3>
            </div>
            <form onSubmit={addFloor} className="flex items-center gap-2">
              <input
                required
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
                placeholder="Enter floor number"
                className="flex-1 px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                aria-label="Floor number"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Add
              </button>
            </form>
          </div>

          {/* Filters (right) */}
          <div className="w-full lg:w-1/2 rounded-xl border p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-sm">Filters</h3>
              <button
                type="button"
                className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700"
                onClick={() => setFilters({ ac: false, nonac: false, available: false, vacatingSoon: false })}
                aria-label="Clear filters"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {pills.map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilters(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-sm transition ${filters[f.key] ? f.on : f.off}`}
                  aria-pressed={!!filters[f.key]}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================= Page ================= */
export default function PgDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pg, setPg] = useState(null)

  const [filters, setFilters] = useState({ ac: false, nonac: false, available: false, vacatingSoon: false })
  const [openFloors, setOpenFloors] = useState({})
  const [floorNumber, setFloorNumber] = useState('')

  // ROOM CARD width constant — adjust if you want more/less per row
  const ROOM_CARD_WIDTH = 'w-64'

  useEffect(() => {
    const found = (sampleData?.pgs || []).find(p => String(p.id) === String(id)) || null
    setPg(found)
  }, [id])

  const addFloor = (e) => {
    e.preventDefault()
    const num = Number(floorNumber)
    if (!Number.isFinite(num)) return
    setPg(prev => {
      if (!prev) return prev
      if ((prev.floors || []).some(f => Number(f.number) === num)) return prev
      const next = {
        ...prev,
        floors: [...(prev.floors || []), { number: num, rooms: [] }].sort((a,b)=>Number(a.number)-Number(b.number))
      }
      return next
    })
    setFloorNumber('')
  }

  const matchesRoomFilters = (room) => {
    const { ac, nonac } = filters
    if (!ac && !nonac) return true
    if (ac && room.ac) return true
    if (nonac && !room.ac) return true
    return false
  }

  const filteredBedsForRoom = (room) => {
    const { available, vacatingSoon } = filters
    if (!available && !vacatingSoon) return room.beds || []
    const today = dayjs()
    return (room.beds || []).filter(b => {
      const isAvailable = !b.occupied
      const isVacSoon = !!(b.tenant?.end) && dayjs(b.tenant.end).isValid() && dayjs(b.tenant.end).diff(today, 'day') <= 7
      return (available && isAvailable) || (vacatingSoon && isVacSoon)
    })
  }

  const filteredFloors = useMemo(() => {
    if (!pg) return []
    return (pg.floors || []).map(floor => {
      const rooms = (floor.rooms || [])
        .filter(matchesRoomFilters)
        .map(r => ({ ...r, beds: filteredBedsForRoom(r) }))
        .filter(r => (r.beds || []).length > 0)
      return { ...floor, rooms }
    }).filter(f => f.rooms.length > 0)
  }, [pg, filters])

  if (!pg) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight">PG not found</h2>
          <button onClick={() => navigate(-1)} className="text-sm rounded-lg border px-3 py-1.5 hover:bg-gray-50">← Back</button>
        </div>
        <div className="text-gray-600">We couldn’t find a PG with id “{id}”.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight">{pg.name}</h2>
        <button type="button" onClick={() => navigate(-1)} className="text-sm rounded-lg border px-3 py-1.5 hover:bg-gray-50">
          ← Back
        </button>
      </div>

      {/* Sticky toolbar (new component) */}
      <StickyToolbar
        floorNumber={floorNumber}
        setFloorNumber={setFloorNumber}
        addFloor={addFloor}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Floors stacked vertically */}
      {filteredFloors.length === 0 ? (
        <div className="text-gray-600">No rooms/beds match the selected filters.</div>
      ) : (
        <div className="space-y-4">
          {filteredFloors.map((f) => {
            const isOpen = openFloors[f.number] ?? true
            const totalBedsOnFloor = f.rooms.reduce((a, r) => a + (r.beds?.length || 0), 0)
            const roomsCount = f.rooms.length

            return (
              <div key={f.number} className="rounded-2xl border bg-white p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenFloors(prev => ({ ...prev, [f.number]: !isOpen }))}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 border flex items-center justify-center text-indigo-700 font-semibold">
                      {f.number}
                    </div>
                    <div>
                      <div className="font-semibold">Floor {f.number}</div>
                      <div className="text-xs text-gray-600">
                        {roomsCount} room{roomsCount !== 1 ? 's' : ''} • {totalBedsOnFloor} bed{totalBedsOnFloor !== 1 ? 's' : ''} visible
                      </div>
                    </div>
                  </div>
                  <ChevronIcon open={isOpen} />
                </button>

                {isOpen && (
                  <div className="mt-4">
                    <div className="flex flex-row flex-wrap gap-3">
                      {f.rooms.map((r) => (
                        <div
                          key={r.number}
                          className={`rounded-xl border p-3 bg-gradient-to-br from-gray-50 to-white hover:shadow transition ${ROOM_CARD_WIDTH}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-semibold">
                              Room {r.number}
                              <div className="text-xs text-gray-500 mt-0.5">• {r.sharing}-sharing</div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${r.ac ? 'bg-sky-50 border border-sky-200 text-sky-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                              <span className="text-xs font-medium">{r.ac ? 'AC' : 'Non-AC'}</span>
                            </span>
                          </div>

                          {/* Beds: vertical list */}
                          <div className="mt-3 flex flex-col gap-2">
                            {(r.beds || []).map(b => (
                              <div key={`${f.number}-${r.number}-${String(b.id)}`} className="w-full">
                                <Bed
                                  bed={b}
                                  context={{ pgId: pg.id, floor: f.number, room: r.number }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
