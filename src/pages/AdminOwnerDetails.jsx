import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sampleData } from '../sampleData'
import PageHeader from '../components/PageHeader'
import dayjs from 'dayjs'

export default function AdminOwnerDetails(){
  const { id } = useParams()
  const navigate = useNavigate()
  const owner = sampleData.owners.find(o => o.id === id)
  const initialPgs = sampleData.pgs.filter(p => p.ownerId === id)
  const [pgs, setPgs] = useState(initialPgs)

  const counts = useMemo(() => ({
    total: pgs.length,
    approved: pgs.filter(p => p.status === 'approved').length,
    pending: pgs.filter(p => p.status === 'pending').length,
    blocked: pgs.filter(p => p.status === 'blocked').length,
  }), [pgs])

  function updateStatus(pgId, newStatus){
    setPgs(prev => prev.map(p => p.id === pgId ? { ...p, status: newStatus, approvedAt: newStatus === 'approved' ? dayjs().format('YYYY-MM-DD HH:mm') : p.approvedAt } : p))
  }

  if (!owner) return <div className="p-6">Owner not found</div>

  return (
    <div>
      <PageHeader title={`Owner: ${owner.name}`} subtitle={owner.email} />
      {/* Top cards removed - counts will be shown inside the PGs section */}

      <div className="bg-white p-4 rounded shadow-sm border">
        <div className="text-lg font-semibold mb-3">PGs by {owner.name}</div>
        <div className="md:flex md:items-start gap-6">
          <div className="flex-1 overflow-x-auto">
          {pgs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No pgs are created yet.</div>
          ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500">
              <tr>
                <th className="py-2">PG Name</th>
                <th className="py-2">Address</th>
                <th className="py-2">Status</th>
                <th className="py-2">Created At</th>
                <th className="py-2">Approved At</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pgs.map(pg => (
                <tr key={pg.id} className="border-t">
                  <td className="py-2">{pg.name}</td>
                  <td className="py-2">{pg.address}</td>
                  <td className="py-2">
                    {pg.status === 'approved' && <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Approved</span>}
                    {pg.status === 'pending' && <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>}
                    {pg.status === 'blocked' && <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Blocked</span>}
                    {(!pg.status) && <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">—</span>}
                  </td>
                   <td className="py-2">{pg.registeredAt ?? '—'}</td>
                  <td className="py-2">{pg.approvedAt ?? '—'}</td>
                  <td className="py-2">
                    <div>
                      <select key={pg.status} defaultValue="" onChange={(e) => { const val = e.target.value; if (val) { updateStatus(pg.id, val); e.target.selectedIndex = 0 } }} className="border rounded px-2 py-1 text-sm">
                        <option value="" disabled>Actions</option>
                        <option value="approved">Approve</option>
                        <option value="pending">Pending</option>
                        <option value="blocked">Block</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          </div>
          <aside className="w-44 shrink-0">
            <div className="space-y-2">
              <div className="bg-gray-50 p-2 rounded-md text-center">
                <div className="text-xs text-gray-500">Total PGs</div>
                <div className="text-lg font-bold">{counts.total}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded-md text-center">
                <div className="text-xs text-gray-500">Approved</div>
                <div className="text-lg font-bold text-green-700">{counts.approved}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded-md text-center">
                <div className="text-xs text-gray-500">Pending</div>
                <div className="text-lg font-bold text-yellow-800">{counts.pending}</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
