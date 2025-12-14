// src/pages/PgDetail.jsx
import React, { useState, useMemo, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
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

  let status = 'available'
  if (bed.occupied) status = 'occupied'
  if (
    bed?.tenant?.end &&
    dayjs(bed.tenant.end).isValid() &&
    dayjs(bed.tenant.end).diff(today, 'day') <= 7
  ) {
    status = 'vacating'
  }

  const tones = {
    available: 'border-green-300 bg-green-50 hover:bg-green-100',
    occupied: 'border-red-300 bg-red-50 hover:bg-red-100',
    vacating: 'border-amber-300 bg-amber-50 hover:bg-amber-100',
  }

  const go = () => {
    navigate(`/beds/${encodeURIComponent(String(bed.id))}`, {
      state: {
        bed: {
          ...bed,
          _context: context,
        },
      },
    })
  }

  return (
    <button
      onClick={go}
      className={`relative w-20 h-20 rounded-xl border transition shadow-sm ${tones[status]}`}
      title={bed.occupied ? bed.tenant?.name : 'Available'}
    >
      {/* Status strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
          status === 'available'
            ? 'bg-green-500'
            : status === 'vacating'
            ? 'bg-amber-500'
            : 'bg-red-500'
        }`}
      />

      {/* Bed ID */}
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-lg font-bold text-gray-800">
          {bed.id}
        </div>

        <div className="text-[10px] text-gray-600 mt-1 text-center px-1 truncate">
          {bed.occupied ? bed.tenant?.name : 'Vacant'}
        </div>
      </div>
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
    // Toolbar scrolls with page now (no sticky)
    <div className="z-40">
      <div className="rounded-2xl border bg-white/80 backdrop-blur-md p-3 shadow-sm">
        <div className="max-w-7xl flex flex-col lg:flex-row items-start lg:items-center gap-3">
          {/* Add Floor (left) */}
          

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
  const [showAddRoom, setShowAddRoom] = useState(null) // { floor }
  const [showAddBed, setShowAddBed] = useState(null) // { floor, roomNumber, onSave }
  const [roomForm, setRoomForm] = useState({ number: '', sharing: 2, ac: false, beds: [] })
  const [bedForm, setBedForm] = useState({ id: '', occupied: false, tenantName: '' })
  const [formError, setFormError] = useState('')

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

  // helpers for tenants
  const getPgTenants = () => {
    if (!pg) return []
    const list = []
    ;(pg.floors || []).forEach(f => {
      (f.rooms || []).forEach(r => {
        (r.beds || []).forEach(b => {
          if (b.tenant && b.tenant.name) list.push({ name: b.tenant.name, floor: f.number, room: r.number, bedId: b.id })
        })
      })
    })
    return list
  }

  const findTenantAssignment = (tenantName) => {
    if (!tenantName || !pg) return null
    const name = String(tenantName).trim().toLowerCase()
    for (const f of (pg.floors || [])) {
      for (const r of (f.rooms || [])) {
        for (const b of (r.beds || [])) {
          if (b.tenant && b.tenant.name && String(b.tenant.name).trim().toLowerCase() === name) {
            return { floor: f.number, room: r.number, bedId: b.id }
          }
        }
      }
    }
    return null
  }

  const addRoomToFloor = (floorNumber, roomData) => {
    setPg(prev => {
      if (!prev) return prev
      const floors = (prev.floors || []).map(f => ({ ...f }))
      const idx = floors.findIndex(x => Number(x.number) === Number(floorNumber))
      if (idx === -1) return prev
      const rooms = [...(floors[idx].rooms || []), roomData]
      floors[idx] = { ...floors[idx], rooms }
      return { ...prev, floors }
    })
  }

  const addBedToRoom = (floorNumber, roomNumber, bedData) => {
    setPg(prev => {
      if (!prev) return prev
      const floors = (prev.floors || []).map(f => ({ ...f, rooms: (f.rooms || []).map(r => ({ ...r })) }))
      const fIndex = floors.findIndex(f => Number(f.number) === Number(floorNumber))
      if (fIndex === -1) return prev
      const rooms = floors[fIndex].rooms
      const rIndex = rooms.findIndex(r => String(r.number) === String(roomNumber))
      if (rIndex === -1) return prev
      const beds = [...(rooms[rIndex].beds || []), bedData]
      rooms[rIndex] = { ...rooms[rIndex], beds }
      floors[fIndex] = { ...floors[fIndex], rooms }
      return { ...prev, floors }
    })
  }

  if (!pg) {
    return (
      <div className="max-w-6xl px-4 py-6">
        <div className="mb-4">
          <PageHeader title="PG not found" showBack={true} />
        </div>
        <div className="text-gray-600">We couldn’t find a PG with id “{id}”.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader title={pg.name} subtitle={pg.address} />

      {/* Summary card */}
      <div className="max-w-7xl">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-semibold text-lg">{pg.name.charAt(0) || 'P'}</div>
              <div>
                <div className="font-semibold text-gray-800">{pg.name}</div>
                <div className="text-xs text-gray-600 mt-0.5">{pg.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:flex-nowrap">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-50 border text-center">
                  <div className="text-xs text-gray-500">Floors</div>
                  <div className="font-semibold text-gray-800">{(pg.floors || []).length}</div>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 border text-center">
                  <div className="text-xs text-gray-500">Rooms</div>
                  <div className="font-semibold text-gray-800">{(pg.floors || []).reduce((acc, f) => acc + ((f.rooms || []).length), 0)}</div>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 border text-center">
                  <div className="text-xs text-gray-500">Beds</div>
                  <div className="font-semibold text-gray-800">{(pg.floors || []).reduce((acc, f) => acc + ((f.rooms || []).reduce((rAcc, r) => rAcc + ((r.beds || []).length), 0)), 0)}</div>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 border text-center">
                  <div className="text-xs text-gray-500">Occupied</div>
                  <div className="font-semibold text-gray-800">{(pg.floors || []).reduce((acc, f) => acc + ((f.rooms || []).reduce((rAcc, r) => rAcc + ((r.beds || []).filter(b=>b.occupied).length), 0)), 0)}</div>
                </div>
              </div>

              <div className="flex-shrink-0 w-full sm:w-auto sm:ml-4">
                <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
                  <div className="flex items-center justify-between mb-0">
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
              </div>
            </div>
          </div>
        </div>
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
                <div className="w-full flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOpenFloors(prev => ({ ...prev, [f.number]: !isOpen }))}
                      className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 border flex items-center justify-center text-indigo-700 font-semibold"
                      aria-expanded={isOpen}
                    >
                      {f.number}
                    </button>

                    <div>
                      <div className="font-semibold">Floor {f.number}</div>
                      <div className="text-xs text-gray-600">
                        {roomsCount} room{roomsCount !== 1 ? 's' : ''} • {totalBedsOnFloor} bed{totalBedsOnFloor !== 1 ? 's' : ''} visible
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="px-3 py-2 rounded-lg border text-sm font-medium" onClick={() => setShowAddRoom({ floor: f.number })}>Add Room</button>
                    <button type="button" onClick={() => setOpenFloors(prev => ({ ...prev, [f.number]: !isOpen }))} className="p-2 rounded hover:bg-gray-100"><ChevronIcon open={isOpen} /></button>
                  </div>
                </div>

                {isOpen && (
                    <div className="mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {f.rooms.map((r) => {
                          const totalBeds = (r.beds || []).length;
                          const occupiedBeds = (r.beds || []).filter(b => b.occupied).length;

                          return (
                            <div key={r.number} className="rounded-xl border p-2 bg-gradient-to-br from-gray-50 to-white hover:shadow transition w-full">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <div className="text-sm font-medium">Room {r.number}</div>
                                  <div className="text-[12px] text-gray-500 mt-0.5">
                                    • {r.sharing}-sharing
                                  </div>
                                  <div className="text-[11px] text-gray-400">
                                    {occupiedBeds}/{totalBeds} occupied
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${r.ac ? 'bg-sky-50 border border-sky-200 text-sky-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                                    <span className="text-xs font-medium">{r.ac ? 'AC' : 'Non-AC'}</span>
                                  </span>
                                  <button className="text-xs px-2 py-1 rounded border bg-white font-medium" onClick={() => setShowAddBed({ floor: f.number, roomNumber: r.number })}>Add Bed</button>
                                </div>
                              </div>

                              {/* Beds: wrap with equal gap */}
                              <div className="mt-3 flex flex-wrap gap-3">
                                {(r.beds || []).map(b => (
                                  <div key={`${f.number}-${r.number}-${String(b.id)}`} className="flex-none">
                                    <Bed
                                      bed={b}
                                      context={{ pgId: pg.id, floor: f.number, room: r.number }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
            <h3 className="font-semibold mb-3">Add Room to Floor {showAddRoom.floor}</h3>
            <div className="space-y-2">
              <input value={roomForm.number} onChange={(e)=>setRoomForm(prev=>({...prev,number:e.target.value}))} placeholder="Room number" className="w-full px-3 py-2 rounded border" />
              <div className="flex gap-2">
                <input type="number" value={roomForm.sharing} onChange={(e)=>setRoomForm(prev=>({...prev,sharing:Number(e.target.value)}))} className="w-24 px-3 py-2 rounded border" />
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={roomForm.ac} onChange={(e)=>setRoomForm(prev=>({...prev,ac:e.target.checked}))} /> AC</label>
              </div>

              <div>
                <div className="text-xs text-gray-600 mb-1">Beds in this room</div>
                <div className="flex flex-col gap-2">
                  {(roomForm.beds || []).map((b, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 border rounded px-2 py-1">
                      <div className="text-sm">{b.id} {b.occupied ? ` • ${b.tenant?.name}` : ''}</div>
                      <div className="text-xs text-red-600 cursor-pointer" onClick={() => setRoomForm(prev=>({...prev, beds: prev.beds.filter((_,idx)=>idx!==i)}))}>Remove</div>
                    </div>
                  ))}
                  <div>
                    <button className="px-3 py-2 rounded border text-sm" onClick={() => setShowAddBed({ floor: showAddRoom.floor, roomNumber: roomForm.number || 'new', onSave: (bed) => setRoomForm(prev => ({ ...prev, beds: [...(prev.beds || []), bed] })) })}>Add Bed</button>
                  </div>
                </div>
              </div>

              {formError && <div className="text-sm text-red-600">{formError}</div>}
              <div className="mt-3 flex justify-end gap-2">
                <button className="px-3 py-2 rounded border" onClick={() => { setShowAddRoom(null); setRoomForm({ number: '', sharing: 2, ac: false, beds: [] }); setFormError('') }}>Cancel</button>
                <button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={() => {
                  // validate
                  if (!roomForm.number) { setFormError('Enter room number'); return }
                  // check duplicate
                  const floor = (pg.floors || []).find(x => Number(x.number) === Number(showAddRoom.floor))
                  if (!floor) { setFormError('Floor not found'); return }
                  if ((floor.rooms || []).some(r=>String(r.number) === String(roomForm.number))) { setFormError('Room number already exists on this floor'); return }
                  // create beds with ids if missing
                  const beds = (roomForm.beds || []).map(b => ({ ...b, id: b.id || `b${Date.now() + Math.random()*1000}` }))
                  addRoomToFloor(showAddRoom.floor, { number: roomForm.number, sharing: roomForm.sharing, ac: roomForm.ac, beds })
                  setShowAddRoom(null)
                  setRoomForm({ number: '', sharing: 2, ac: false, beds: [] })
                }}>Save Room</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bed Modal */}
      {showAddBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
            <h3 className="font-semibold mb-3">Add Bed (Floor {showAddBed.floor})</h3>
            <div className="space-y-2">
              <div className="text-xs text-gray-600">Bed id (optional)</div>
              <input value={bedForm.id} onChange={(e)=>setBedForm(prev=>({...prev,id:e.target.value}))} placeholder="e.g. B1" className="w-full px-3 py-2 rounded border" />

              <div className="text-xs text-gray-600">Assign tenant (search by name)</div>
              <input value={bedForm.tenantName} onChange={(e)=>{ setBedForm(prev=>({...prev, tenantName: e.target.value})); setFormError('') }} placeholder="Type to search or enter new name" className="w-full px-3 py-2 rounded border" />
              <div className="max-h-32 overflow-auto">
                {getPgTenants().filter(t => bedForm.tenantName ? t.name.toLowerCase().includes(bedForm.tenantName.toLowerCase()) : true).slice(0,6).map(t => (
                  <div key={`${t.name}-${t.floor}-${t.room}`} className="text-sm p-1 cursor-pointer hover:bg-gray-100" onClick={() => setBedForm(prev=>({...prev, tenantName: t.name}))}>{t.name} • Floor {t.floor} Room {t.room}</div>
                ))}
              </div>

              {formError && <div className="text-sm text-red-600">{formError}</div>}

              <div className="mt-3 flex justify-end gap-2">
                <button className="px-3 py-2 rounded border" onClick={()=>{ setShowAddBed(null); setBedForm({ id: '', occupied: false, tenantName: '' }); setFormError('') }}>Cancel</button>
                <button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={() => {
                  // validation
                  const name = (bedForm.tenantName || '').trim()
                  if (name) {
                    const existing = findTenantAssignment(name)
                    if (existing) {
                      setFormError(`Already assigned to floor ${existing.floor} room ${existing.room} bed ${existing.bedId}`)
                      return
                    }
                  }
                  const idVal = bedForm.id && String(bedForm.id).trim() ? String(bedForm.id).trim() : `b${Date.now()}`
                  const bedData = { id: idVal, occupied: !!name, tenant: name ? { name, start: dayjs().format('YYYY-MM-DD'), end: null } : undefined, history: [] }
                  if (showAddBed.onSave) {
                    showAddBed.onSave(bedData)
                    setShowAddBed(null)
                    setBedForm({ id: '', occupied: false, tenantName: '' })
                    setFormError('')
                    return
                  }
                  // direct add to existing room
                  addBedToRoom(showAddBed.floor, showAddBed.roomNumber, bedData)
                  setShowAddBed(null)
                  setBedForm({ id: '', occupied: false, tenantName: '' })
                }}>Save Bed</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
