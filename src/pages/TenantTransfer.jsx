import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { ArrowLeft, Building2, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'
import { getFloorsRoomsWithBeds, transferTenantFromBed } from '../api/ownerAuth'

export default function TenantTransfer() {

  const location = useLocation()
  const navigate = useNavigate()
  const transferData = location.state

  const [floors, setFloors] = useState([])
  const [rooms, setRooms] = useState([])
  const [beds, setBeds] = useState([])

  const [selectedFloorId, setSelectedFloorId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [selectedBedId, setSelectedBedId] = useState('')

  const [rentChange, setRentChange] = useState(false)
  const [newRent, setNewRent] = useState('')
  const [newDeposit, setNewDeposit] = useState('')

  const [popupMsg, setPopupMsg] = useState('')
  const [popupType, setPopupType] = useState('success')
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    if (!transferData) {
      navigate(-1)
      return
    }
    async function loadData() {
      const res = await getFloorsRoomsWithBeds()
      setFloors(res.data || [])
    }
    loadData()
  }, [])

  function handleFloorChange(e) {
    const floorId = e.target.value
    setSelectedFloorId(floorId)
    setSelectedRoomId('')
    setSelectedBedId('')
    setBeds([])

    const floor = floors.find(f => f.id === floorId)
    setRooms(floor?.rooms || [])
  }

  function handleRoomChange(e) {
    const roomId = e.target.value
    setSelectedRoomId(roomId)
    setSelectedBedId('')

    const room = rooms.find(r => String(r.id) === roomId)
    const availableBeds =
      room?.beds?.filter(b => !b.isOccupied && !b.isDeleted) || []

    setBeds(availableBeds)
  }

  async function handleTransfer() {

    if (!selectedFloorId || !selectedRoomId || !selectedBedId) {
      setPopupType('error')
      setPopupMsg("Please select Floor, Room and Bed")
      setShowPopup(true)
      return
    }

    if (rentChange && !newRent) {
      setPopupType('error')
      setPopupMsg("Please enter new rent")
      setShowPopup(true)
      return
    }

    const payload = {
      tenantId: transferData.tenantId,
      targetBedId: selectedBedId,
      rentChanged: rentChange,
      newMonthlyRent: rentChange ? Number(newRent) : null,
      newAdvance: rentChange ? Number(newDeposit) : null,
      reason: "Room Transfer"
    }

    try {

      const res = await transferTenantFromBed(
        transferData.bedId,   // 👈 FROM BED ID IN PATH
        payload
      )

      setPopupType('success')
      setPopupMsg("Tenant transferred successfully")

    } catch (err) {

      const msg =
        err?.response?.data?.message ||
        Object.values(err?.response?.data?.data || {})[0] ||
        "Transfer failed"

      setPopupType('error')
      setPopupMsg(msg)

    } finally {

      setShowPopup(true)

      setTimeout(() => {
       if (transferData?.pgId) {
            navigate(`/pg/${transferData.pgId}`)
            } else {
            console.error("PG ID missing during redirect")
            navigate(-1)
            }
      }, 2000)
    }
  }

  if (!transferData) return null

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Tenant Transfer"
            subtitle="Transfer Tenant to another Room"
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 space-y-4 pb-20">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm col-span-1">
            <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2">
              Current Allocation
            </div>
            <div className="text-sm font-black text-slate-900 uppercase tracking-tight">
              {transferData.tenantName}
            </div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {transferData.floorName} / {transferData.roomName} / {transferData.bedName}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm col-span-2">
            <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">
              Transfer To
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Floor</label>
                <select
                  value={selectedFloorId}
                  onChange={handleFloorChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                >
                  <option value="">Choose Floor...</option>
                  {floors.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {selectedFloorId && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Room</label>
                  <select
                    value={selectedRoomId}
                    onChange={handleRoomChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  >
                    <option value="">Choose Room...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedRoomId && (
          <div className="rounded-xl border border-slate-200 p-5 bg-white shadow-sm w-full">
            <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Select Available Bed</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
              {beds.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBedId(b.id)}
                  className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                    ${selectedBedId === b.id
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200'
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-white'}
                  `}
                >
                  {b.name}
                </button>
              ))}
              {beds.length === 0 && <div className="col-span-full text-center py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">No beds available in this room</div>}
            </div>
          </div>
        )}

        {selectedBedId && (
          <div className="rounded-xl border border-slate-200 p-5 bg-white shadow-sm w-full">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={rentChange}
                onChange={() => setRentChange(!rentChange)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Price changes</span>
            </label>

            {rentChange && (
              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Monthly Rent</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">₹</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newRent}
                      onChange={(e) => setNewRent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-8 pr-4 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Security Deposit</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">₹</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newDeposit}
                      onChange={(e) => setNewDeposit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-8 pr-4 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            disabled={!selectedBedId}
            onClick={handleTransfer}
            className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95
            ${selectedBedId
              ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-100'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
            `}
          >
            Confirm Transfer
          </button>
        </div>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black/40 absolute inset-0" />
          <div className={`relative p-6 rounded-xl shadow-xl text-center bg-white w-[90%] max-w-sm`}>
            <div className={`text-lg font-semibold ${popupType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {popupType === 'success' ? 'Success' : 'Failed'}
            </div>
            <p className="mt-2 text-sm">{popupMsg}</p>
          </div>
        </div>
      )}

    </div>
  )
}