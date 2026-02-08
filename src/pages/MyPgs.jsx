// src/pages/MyPgs.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { createPg, getAllPgs } from '../api/ownerAuth'
// import { sampleData } from '../sampleData' 
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

const BuildingsIcon = ({ className="mx-auto mb-3 text-indigo-600 h-10 w-10" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M3 21h18v-2H3v2Zm2-4h4V7H5v10Zm6 0h4V3h-4v14Zm6 0h4V9h-4v8Z"/>
  </svg>
)

export default function MyPgs() {
  // DATA (local only)
  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showQrFor, setShowQrFor] = useState(null)
  const selectedPg = pgs.find(p => p.id === showQrFor)
  // (no search/sort — simplified list view)

  // create modal (local only)
  const [showCreate, setShowCreate] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [pgName, setPgName] = useState('')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [area, setArea] = useState('')
  const [district, setDistrict] = useState('')
  const [areas, setAreas] = useState([])
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [country, setCountry] = useState('')
  const [pincode, setPincode] = useState('')
  const [creating, setCreating] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const [totalFloors, setTotalFloors] = useState('')
  const [totalBeds, setTotalBeds] = useState('')

       useEffect(() => {
        const load = async () => {
          try {
            setLoading(true)
            const data = await getAllPgs()
            setError('')
            setPgs(Array.isArray(data) ? data : [])
          } catch (e) {
           //setError('Failed to load PGs')
          } finally {
            setLoading(false)
          }
        }
        load()
      }, [])

        const formatDate = (iso) => {
          if (!iso) return ''
          return new Date(iso).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })
        }

// const composeAddress = () =>
//   [
//     address,
//     landmark,
//     area,
//     city,
//     district,
//     stateName,
//     country,
//     pincode
//   ].filter(Boolean).join(', ')


   const create = async (e) => {
          e.preventDefault()
          if (!pgName.trim()) return
          setCreating(true)

          try {
            const body = {
              businessName: businessName.trim(),
              pgName: pgName.trim(),
              totalFloors: totalFloors.trim(),
              totalBeds: totalBeds.trim(),
              address: {
                address: address.trim(),
                areaLocality: area,
                city,
                state: stateName,
                district,
                pinCode: pincode,
                country,
                landmark
              }
            }

           const createdPg = await createPg(body)
            setPgs(prev => [...prev, createdPg])

            // reset form
            setBusinessName('')
            setPgName('')
            setTotalFloors('')
            setTotalBeds('')
            setAddress('')
            setLandmark('')
            setCity('')
            setStateName('')
            setPincode('')
            setArea('')
            setDistrict('')
            setCountry('')
            setAreas([])

            setShowCreate(false)
          } catch (err) {
            console.error(err)
            alert('Failed to create PG')
          } finally {
            setCreating(false)
          }
        }


  const fetchAddressFromPincode = async (pin) => {
        if (pin.length !== 6) return

        setPinLoading(true)
        setPinError('')
        setAreas([])
        setArea('')
        setCity('')
        setDistrict('')
        setStateName('')
        setCountry('')

        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
          const data = await res.json()

          if (data[0]?.Status === 'Success' && data[0].PostOffice?.length) {
            const list = data[0].PostOffice

            setAreas(list)
            setDistrict(list[0].District || '')
            setStateName(list[0].State || '')
            setCountry('India')

            // ✅ AUTO-SELECT when only ONE area exists
            if (list.length === 1) {
              const po = list[0]
              setArea(po.Name || '')
              setCity(po.Block || po.District || '')
            }
          } else {
            setPinError('Invalid pincode')
          }
        } catch {
          setPinError('Failed to fetch pincode details')
        } finally {
          setPinLoading(false)
        }
      }

    const onAreaSelect = (areaName) => {
      const selected = areas.find(a => a.Name === areaName)
      if (!selected) return

      setArea(selected.Name)
      setCity(selected.Block || selected.District || '')
    }


  const filtered = useMemo(() => {
    return Array.isArray(pgs) ? pgs : []
  }, [pgs])

  return (
    <div className="space-y-6">
      <PageHeader title="My PGs">
        <div className="flex items-center justify-end w-full sm:w-auto">
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow"
            >
           <PlusIcon />
           Create new PG
          </button>
        </div>
      </PageHeader>

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
        <div className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 p-10 text-center">
          <div className="text-2xl font-bold text-indigo-700 mb-2">
            Welcome to PG Management 🎉
          </div>
          <div className="text-base text-indigo-600 mb-6">
            Create your first PG to get started
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow"
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
                    <div className="text-base font-semibold tracking-tight">
                      {pg.pgName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Created on {formatDate(pg.createdAt)}
                    </div>
                    <div className="mt-1 text-xs text-gray-600 inline-flex items-center gap-1">
                      <MapPinIcon />
                      <span className="truncate block max-w-xs">
                        {pg.address?.address}, {pg.address?.areaLocality}, {pg.address?.city}
                      </span>
                    </div>
                  </div>

                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 border flex items-center justify-center text-indigo-700">
                    <ChevronRightIcon />
                  </div>
                </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowQrFor(pg.id)
                    }}
                    className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                              border border-indigo-200 text-indigo-700 text-xs font-medium
                              hover:bg-indigo-50 hover:border-indigo-300 transition"
                  >
                    <span>📲</span>
                    <span>QR</span>
                  </button>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg border px-2 py-1 text-gray-700 bg-indigo-50">
                    <div className="font-semibold">Floors</div>
                    <div className="text-sm">{pg.pgFloors}</div>
                  </div>
                  <div className="rounded-lg border px-2 py-1 text-gray-700 bg-indigo-50">
                    <div className="font-semibold">Beds</div>
                    <div className="text-sm">{pg.totalBeds}</div>
                  </div>
                  <div className="rounded-lg border px-2 py-1 text-gray-700 bg-green-50">
                    <div className="font-semibold">Filled</div>
                    <div className="text-sm">{pg.filledBeds}</div>
                    {/* <div className="text-sm">{pg.filledBeds} ({occupancy}%)</div> */}
                  </div>
                  {/* <div className={`rounded-lg border px-2 py-1 text-gray-700 ${vacating ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    <div className="font-semibold">Vacating</div>
                    <div className="text-sm">{vacating || '—'}</div>
                  </div> */}
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
              <div className="text-xs text-gray-600">FIll all below details</div>
            </div>

            <form onSubmit={create} className="p-6 space-y-5">
              <label className="block text-sm">
                <span className="font-medium text-gray-700">Business Name</span>
                <input
                  required
                  value={businessName}
                  onChange={e=>setBusinessName(e.target.value)}
                  placeholder="e.g., Bliss Mens PG"
                  className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-gray-700">PG Name</span>
                <input
                  required
                  value={pgName}
                  onChange={e=>setPgName(e.target.value)}
                  placeholder="e.g., Bliss Mens PG"
                  className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm">
                <span className="font-medium text-gray-700">Total Floors</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={totalFloors}
                  onChange={e => setTotalFloors(e.target.value)}
                  placeholder="e.g., 5"
                  className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <label className="block text-sm">
                <span className="font-medium text-gray-700">Total Beds</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={totalBeds}
                  onChange={e => setTotalBeds(e.target.value)}
                  placeholder="e.g., 120"
                  className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block text-sm">
                  <span className="font-medium text-gray-700">Address</span>
                  <input
                    required
                    value={address}
                    onChange={e=>setAddress(e.target.value)}
                    placeholder="House/Flat, Building, Street"
                    className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              {/* 
                <label className="block text-sm">
                  <span className="font-medium text-gray-700">Address Line 2</span>
                  <input
                    value={address2}
                    onChange={e=>setAddress2(e.target.value)}
                    placeholder="Area/Locality (optional)"
                    className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label> */}
                   <label className="block text-sm">
                  <span className="font-medium text-gray-700">Landmark</span>
                  <input
                    value={landmark}
                    onChange={e=>setLandmark(e.target.value)}
                    placeholder="Near XYZ Temple"
                    className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium text-gray-700">Pincode</span>
                  <input
                    value={pincode}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '')
                      setPincode(value)
                      if (value.length === 6) {
                        fetchAddressFromPincode(value)
                      }
                    }}
                    placeholder="6-digit"
                    inputMode="numeric"
                    maxLength={6}
                    className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {pinLoading && (
                    <div className="text-xs text-gray-500 mt-1">Fetching address…</div>
                  )}
                  {pinError && (
                    <div className="text-xs text-red-600 mt-1">{pinError}</div>
                  )}

                </label>
                  {areas.length > 1 && (
                    <label className="block text-sm">
                      <span className="font-medium text-gray-700">Area / Locality</span>
                      <select
                        value={area}
                        onChange={e => onAreaSelect(e.target.value)}
                        required
                        className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select area</option>
                        {areas.map(a => (
                          <option key={a.Name} value={a.Name}>
                            {a.Name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                <label className="block text-sm">
                  <span className="font-medium text-gray-700">City</span>
                  <input
                    value={city}
                    readOnly
                    placeholder="City"
                    className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                    <label className="block text-sm">
                  <span className="font-medium text-gray-700">District</span>
                  <input
                    value={district}
                    readOnly
                    placeholder="District"
                    className="mt-1 w-full px-3 py-2 rounded-lg border bg-gray-50"
                  />
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-gray-700">State</span>
                  <input
                    value={stateName}
                    readOnly
                    placeholder="State"
                    className="mt-1 w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>

                 <label className="block text-sm">
                  <span className="font-medium text-gray-700">Country</span>
                  <input
                    value={country}
                    readOnly
                    placeholder="Country"
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
                 disabled={
                      creating ||
                      !pgName.trim() ||
                      !address.trim() ||
                      pincode.length !== 6 ||
                      !!pinError ||
                      (areas.length > 1 && !area)
                    }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showQrFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowQrFor(null)}
          />

          <div className="relative bg-white rounded-2xl p-6 text-center shadow-xl w-80">
            <h3 className="text-lg font-bold mb-2">
              Scan to Register for <br />
              <b>{selectedPg?.pgName}</b>
            </h3>

            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/mmp/pg/${showQrFor}/qr`}
              alt="PG QR Code"
              className="mx-auto w-56 h-56"
            />
                  
            <div className="mt-2 text-xs text-gray-600 break-all">
              {window.location.origin}/mmp/register/{showQrFor}
            </div>

            <button
              onClick={() => setShowQrFor(null)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}  


    </div>
  )
}
