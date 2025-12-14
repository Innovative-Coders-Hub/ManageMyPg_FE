import React, { useMemo, useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { sampleData } from '../sampleData'
import dayjs from 'dayjs'
import { useSearchParams, useNavigate } from 'react-router-dom'

function Select({ label, value, onChange, children }){
  return (
    <label className="block">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-2 border rounded-md">
        {children}
      </select>
    </label>
  )
}

export default function AdminOwnersList(){
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const owners = sampleData.owners || []
  const [localOwners, setLocalOwners] = useState(owners)

  const statusFilter = params.get('filter') || 'all' // all|approved|pending
  const [stateFilter, setStateFilter] = useState(params.get('state') || 'all')
  const [cityFilter, setCityFilter] = useState(params.get('city') || 'all')

  // unique states & cities
  const states = useMemo(() => {
    const s = new Set(owners.map(o => o.state).filter(Boolean))
    return ['all', ...Array.from(s).sort()]
  }, [owners])

  const citiesForState = useMemo(() => {
    const filtered = stateFilter === 'all' ? owners : owners.filter(o => o.state === stateFilter)
    const c = new Set(filtered.map(o => o.city).filter(Boolean))
    return ['all', ...Array.from(c).sort()]
  }, [owners, stateFilter])

  useEffect(() => {
    // update city options if state changes
    if (cityFilter !== 'all' && !citiesForState.includes(cityFilter)) setCityFilter('all')
  }, [stateFilter, cityFilter, citiesForState])

  useEffect(() => {
    // sync to query params while preserving other params
    const np = new URLSearchParams(params)
    if (statusFilter && statusFilter !== 'all') {
      np.set('filter', statusFilter)
    } else {
      np.delete('filter')
    }
    if (stateFilter && stateFilter !== 'all') {
      np.set('state', stateFilter)
    } else {
      np.delete('state')
    }
    if (cityFilter && cityFilter !== 'all') {
      np.set('city', cityFilter)
    } else {
      np.delete('city')
    }
    setParams(np)
  }, [statusFilter, stateFilter, cityFilter])

  function setStatus(s){
    const np = new URLSearchParams(params)
    if (s === 'all') np.delete('filter')
    else np.set('filter', s)
    setParams(np)
  }

  const filteredOwners = useMemo(() => {
    return localOwners.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (stateFilter !== 'all' && o.state !== stateFilter) return false
      if (cityFilter !== 'all' && o.city !== cityFilter) return false
      return true
    })
  }, [localOwners, statusFilter, stateFilter, cityFilter])

  const counts = useMemo(() => ({
    total: localOwners.length,
    approved: localOwners.filter(o => o.status === 'approved').length,
    pending: localOwners.filter(o => o.status === 'pending').length,
  }), [localOwners])

  function changeStatus(id, newStatus) {
    setLocalOwners(prev => prev.map(o => {
      if (o.id !== id) return o
      const now = dayjs().format('YYYY-MM-DD')
      return { ...o, status: newStatus, approvedAt: newStatus === 'approved' ? (o.approvedAt || now) : undefined }
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <PageHeader title="Owners" subtitle="Manage registered owners and filter by state/city/status" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow-sm border">
          <div className="text-sm text-gray-500">Total registered</div>
          <div className="text-2xl font-bold">{counts.total}</div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border">
          <div className="text-sm text-gray-500">Approved</div>
          <div className="text-2xl font-bold">{counts.approved}</div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border">
          <div className="text-sm text-gray-500">Pending</div>
          <div className="text-2xl font-bold">{counts.pending}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
              <div className="flex gap-2">
              <button onClick={() => setStatus('all')} className={`px-3 py-1 rounded ${statusFilter==='all' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>All</button>
              <button onClick={() => setStatus('approved')} className={`px-3 py-1 rounded ${statusFilter==='approved' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Approved</button>
              <button onClick={() => setStatus('pending')} className={`px-3 py-1 rounded ${statusFilter==='pending' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>Pending</button>
            </div>
            <div className="ml-auto w-40">
              <Select label="State" value={stateFilter} onChange={setStateFilter}>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div className="w-40">
              <Select label="City" value={cityFilter} onChange={setCityFilter}>
                {citiesForState.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-gray-500">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">State</th>
                  <th className="py-2">City</th>
                  <th className="py-2">Registered</th>
                  <th className="py-2">Approved</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOwners.map(o => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2">{o.name}</td>
                    <td className="py-2 text-gray-600">{o.email}</td>
                    <td className="py-2">{o.state}</td>
                    <td className="py-2">{o.city}</td>
                    <td className="py-2 text-gray-500">{dayjs(o.registeredAt).format('YYYY-MM-DD')}</td>
                    <td className="py-2">{o.approvedAt ? dayjs(o.approvedAt).format('YYYY-MM-DD') : '—'}</td>
                    <td className="py-2">
                      {o.status === 'approved' && <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Approved</span>}
                      {o.status === 'pending' && <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>}
                      {o.status === 'rejected' && <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rejected</span>}
                      {(!o.status) && <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">—</span>}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                          <select key={o.status} defaultValue="" onChange={(e) => {
                            const val = e.target.value
                            if (val) {
                              changeStatus(o.id, val)
                              // reset select to default
                              e.target.selectedIndex = 0
                            }
                          }} className="px-2 py-1 rounded bg-gray-50 text-xs border">
                            <option value="" disabled>Actions</option>
                            <option value="approved">Approve</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Reject</option>
                          </select>
                          <button onClick={() => navigate(`/admin/owner/${o.id}`)} className="ml-2 px-2 py-1 rounded bg-gray-50 text-xs hover:bg-indigo-50 hover:text-indigo-700">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
