// src/pages/MyPgs.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { sampleData } from '../sampleData' // ensure file is exactly "sampleData.js"

// --- tiny inline icons ---
const PlusIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M11 11V5a1 1 0 1 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6Z" />
  </svg>
)

const MapPinIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
  </svg>
)

const ChevronRightIcon = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
)

const BuildingsIcon = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M3 21h18v-2H3v2Zm2-4h4V7H5v10Zm6 0h4V3h-4v14Zm6 0h4V9h-4v8Z"/>
  </svg>
)

export default function MyPgs() {
  // DATA (local only)
  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // (no search/sort — simplified list view)

  // create modal (local only)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [landmark, setLandmark] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [pincode, setPincode] = useState('')
  const [creating, setCreating] = useState(false)

  // INIT: read from sampleData only
  useEffect(() => {
    try {
      const list = Array.isArray(sampleData?.pgs) ? sampleData.pgs : []
      setPgs(list)
    } catch (e) {
      console.error(e)
      setError('Failed to load local sample data')
    } finally {
      setLoading(false)
    }
  }, [])

  const composeAddress = ({ address1, address2, landmark, city, stateName, pincode }) =>
    [address1, address2, landmark, city, stateName, pincode].filter(Boolean).join(', ')

  const create = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      const body = {
        id: `pg_${Date.now()}`,
        name: name.trim(),
        address: composeAddress({ address1, address2, landmark, city, stateName, pincode }),
        address1, address2, landmark, city, state: stateName, pincode,
        floors: []
      }
      setPgs(prev => [...prev, body])
      // reset form
      setName(''); setAddress1(''); setAddress2(''); setLandmark('')
      setCity(''); setStateName(''); setPincode('')
      setShowCreate(false)
    } finally {
      setCreating(false)
    }
  }

  const filtered = useMemo(() => {
    return Array.isArray(pgs) ? pgs : []
  }, [pgs])

  return (
    <div className="max-w-6xl px-4 py-6 space-y-4">
      <PageHeader title="My PGs" />
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3" />

       <div className="flex items-center justify-end">
              <button
                onClick={()=>setShowCreate(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow"
              >
                <PlusIcon />
                Create new PG
              </button>
            </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i)=>(
            <div key={i} className="rounded-2xl border p-4 animate-pulse bg-white">
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-4" />
              <div className="h-3 w-1/2 bg-gray-200 rounded mb-3" />
              <div className="flex gap-2 mt-3">
                <div className="h-8 w-8 bg-gray-200 rounded" />
                <div className="h-8 w-8 bg-gray-200 rounded" />
                <div className="h-8 w-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <div className="text-lg font-semibold mb-1">No PGs found</div>
          <div className="text-sm text-gray-600 mb-4">Try a different search or create a new PG.</div>
          <button
            onClick={()=>setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            <PlusIcon />
            Create your first PG
          </button>
        </div>
      )}

      {/* List */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((pg, idx) => {
            // compute beds/fill/vacating safely
            let totalBeds = 0, filled = 0, vacating = 0
            for (const f of (pg.floors || [])) {
              for (const r of (f.rooms || [])) {
                for (const b of (r.beds || [])) {
                  totalBeds++
                  if (b.occupied) {
                    filled++
                    if (b.tenant?.end) {
                      try {
                        const end = Date.parse(b.tenant.end)
                        const msLeft = end - Date.now()
                        if (msLeft > 0 && msLeft <= 7*24*3600*1000) vacating++
                      } catch {}
                    }
                  }
                }
              }
            }
            const occupancy = totalBeds ? Math.round((filled/totalBeds)*100) : 0
            return (
              <Link
                key={pg.id}
                to={'/pg/'+pg.id}
                className={`group rounded-2xl border bg-white p-4 hover:shadow-md hover:-translate-y-0.5 transition`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold tracking-tight">{pg.name}</div>
                    <div className="mt-1 text-xs text-gray-600 inline-flex items-center gap-1">
                      <MapPinIcon />
                      <span className="truncate block max-w-xs">{pg.address || '—'}</span>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 border flex items-center justify-center text-indigo-700">
                    <ChevronRightIcon />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg border px-2 py-1 text-gray-700 bg-indigo-50">
                    <div className="font-semibold">Beds</div>
                    <div className="text-sm">{totalBeds}</div>
                  </div>
                  <div className="rounded-lg border px-2 py-1 text-gray-700 bg-green-50">
                    <div className="font-semibold">Filled</div>
                    <div className="text-sm">{filled} ({occupancy}%)</div>
                  </div>
                  <div className={`rounded-lg border px-2 py-1 text-gray-700 ${vacating ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    <div className="font-semibold">Vacating</div>
                    <div className="text-sm">{vacating || '—'}</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Create PG Modal (local only) */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>!creating && setShowCreate(false)} />
          <div className="relative w-full max-w-2xl mx-4 rounded-2xl border bg-white shadow-xl">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
              <div className="text-lg font-semibold">Create New PG</div>
              <div className="text-xs text-gray-600">(Demo) Saved only in memory</div>
            </div>

            <form onSubmit={create} className="p-6 space-y-5">
              <label className="block text-sm">
                <span className="font-medium text-gray-700">PG Name</span>
                <input
                  required
                  value={name}
                  onChange={e=>setName(e.target.value)}
                  placeholder="e.g., Bliss Mens PG"
                  className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block text-sm">
                  <span className="font-medium text-gray-700">Address Line 1</span>
                  <input
                    required
                    value={address1}
                    onChange={e=>setAddress1(e.target.value)}
                    placeholder="House/Flat, Building, Street"
                    className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-gray-700">Address Line 2</span>
                  <input
                    value={address2}
                    onChange={e=>setAddress2(e.target.value)}
                    placeholder="Area/Locality (optional)"
                    className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-gray-700">Landmark</span>
                  <input
                    value={landmark}
                    onChange={e=>setLandmark(e.target.value)}
                    placeholder="Near XYZ Temple (optional)"
                    className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-gray-700">City</span>
                  <input
                    value={city}
                    onChange={e=>setCity(e.target.value)}
                    placeholder="City"
                    className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-gray-700">State</span>
                  <input
                    value={stateName}
                    onChange={e=>setStateName(e.target.value)}
                    placeholder="State"
                    className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-gray-700">Pincode</span>
                  <input
                    value={pincode}
                    onChange={e=>setPincode(e.target.value.replace(/\D/g,''))}
                    placeholder="6-digit"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="^[0-9]{6}$"
                    className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" disabled={creating} onClick={()=>setShowCreate(false)} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !name.trim() || !address1.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
