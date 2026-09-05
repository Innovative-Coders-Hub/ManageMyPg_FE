import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO'
import PageHeader from '../components/PageHeader'
import {
  ArrowLeft,
  Building2,
  Home,
  CheckCircle2,
  AlertCircle,
  Bed as BedIcon,
  MoveRight,
  Info,
  CreditCard,
  ShieldCheck,
  RefreshCcw,
  Loader2,
  User,
  ArrowRight,
  Sparkles,
  Check
} from 'lucide-react'
import { getFloorsRoomsWithBeds, transferTenantFromBed } from '../api/ownerAuth'
import CustomDropdown from '../components/CustomDropdown'
import BedAvailableImg from '../assets/bed_availabe.png'
import toast from 'react-hot-toast'

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
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!transferData) {
      navigate(-1)
      return
    }
    async function loadData() {
      setLoading(true)
      try {
        const res = await getFloorsRoomsWithBeds()
        setFloors(res.data || [])
      } catch (err) {
        toast.error("Failed to load property structure")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [transferData, navigate])

  function handleFloorChange(floorId) {
    setSelectedFloorId(floorId)
    setSelectedRoomId('')
    setSelectedBedId('')
    setBeds([])
    const floor = floors.find(f => f.id === floorId)
    setRooms(floor?.rooms || [])
  }

  function handleRoomChange(roomId) {
    setSelectedRoomId(roomId)
    setSelectedBedId('')
    const room = rooms.find(r => String(r.id) === roomId)
    const availableBeds = room?.beds?.filter(b => !b.isOccupied && !b.isDeleted) || []
    setBeds(availableBeds)
  }

  async function handleTransfer() {
    if (!selectedFloorId || !selectedRoomId || !selectedBedId) {
      toast.error("Please select Target Floor, Room and Bed")
      return
    }

    if (rentChange && !newRent) {
      toast.error("Please enter new monthly rent")
      return
    }

    setSubmitting(true)
    const payload = {
      tenantId: transferData.tenantId,
      targetBedId: selectedBedId,
      rentChanged: rentChange,
      newMonthlyRent: rentChange ? Number(newRent) : null,
      newAdvance: rentChange ? Number(newDeposit) : null,
      reason: "Room Transfer"
    }

    try {
      await transferTenantFromBed(transferData.bedId, payload)
      toast.success("Tenant transferred successfully!")
      setTimeout(() => {
        if (transferData?.pgId) {
          navigate(`/pg/${transferData.pgId}`)
        } else {
          navigate(-1)
        }
      }, 1200)
    } catch (err) {
      const msg = err?.response?.data?.message || "Transfer failed"
      toast.error(msg)
      setSubmitting(false)
    }
  }

  if (!transferData) return null

  const selectedFloorObj = floors.find(f => f.id === selectedFloorId)
  const selectedRoomObj = rooms.find(r => String(r.id) === selectedRoomId)
  const selectedBedObj = beds.find(b => b.id === selectedBedId)

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <SEO
        title="Tenant Relocation"
        description="Transfer tenants between rooms and beds within your property."
        canonical="/tenant-transfer"
      />

      {/* HEADER BAR */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
              title="Return"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black shrink-0 shadow-xs">
              <RefreshCcw size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100/80">
                  Tenant Relocation Wizard
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-tight mt-0.5">
                Transfer {transferData.tenantName}
              </h1>
            </div>
          </div>

          {/* Stepper Progress Pill */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">1</span>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Current Context</span>
            </div>
            <ArrowRight size={14} className="text-slate-300" />
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-lg text-[10px] font-black flex items-center justify-center ${selectedBedId ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Target Allocation</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT SIDE: STEP 1 - CURRENT TENANCY & CONTRACT ADJUSTMENT (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">

            {/* CURRENT RESIDENT ASSIGNMENT CARD */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <BedIcon size={140} />
              </div>
              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <User size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Active Tenant</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md text-[8px] font-black uppercase tracking-widest">
                    Step 1
                  </span>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tenant Name</p>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">{transferData.tenantName}</h3>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Current Space</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-white uppercase">{transferData.floorName} • Room {transferData.roomName}</p>
                      <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider mt-0.5">Space {transferData.bedName}</p>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center border border-indigo-500/30">
                      {transferData.bedName}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center gap-2.5">
                  <Info size={14} className="text-indigo-400 shrink-0" />
                  <p className="text-[9px] font-bold text-slate-300 uppercase leading-relaxed tracking-tight">
                    Relocation history log will be generated automatically upon confirmation.
                  </p>
                </div>
              </div>
            </div>

            {/* CONTRACT ADJUSTMENT CARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Rent Adjustments</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Optional Rent Update</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rentChange}
                    onChange={() => setRentChange(!rentChange)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {rentChange ? (
                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest block">New Monthly Rent (₹)</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <CreditCard size={15} />
                      </div>
                      <input
                        type="number"
                        placeholder="e.g. 25000"
                        value={newRent}
                        onChange={(e) => setNewRent(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest block">Adjusted Security Advance (₹)</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ShieldCheck size={15} />
                      </div>
                      <input
                        type="number"
                        placeholder="e.g. 10000"
                        value={newDeposit}
                        onChange={(e) => setNewDeposit(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
                    Existing monthly rent and deposit structure will carry forward seamlessly.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: STEP 2 - TARGET SELECTION & INVENTORY GRID (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">

            {/* TARGET LOCATION SELECTOR BAR */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-indigo-600" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Select Target Floor & Room</h3>
                </div>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[8px] font-black uppercase tracking-widest">
                  Step 2
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomDropdown
                  label="Target Floor"
                  value={selectedFloorId}
                  options={floors.map(f => ({ id: f.id, label: f.name }))}
                  onChange={handleFloorChange}
                  icon={Building2}
                  className="w-full"
                  labelBg="bg-white"
                />

                <CustomDropdown
                  label="Target Room"
                  value={selectedRoomId}
                  options={rooms.map(r => ({ id: r.id, label: r.name }))}
                  onChange={handleRoomChange}
                  icon={Home}
                  className="w-full"
                  labelBg="bg-white"
                />
              </div>
            </div>

            {/* BED INVENTORY GRID */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs min-h-[380px] flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                      <BedIcon size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Available Bed Inventory</h3>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Select an unallocated space</p>
                    </div>
                  </div>

                  {selectedRoomId && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-widest">
                      {beds.length} Available Option{beds.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {!selectedRoomId ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto border border-slate-200/60 shadow-xs">
                      <Home size={28} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-tight">Select Target Room Above</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        Choose a floor and room to display available beds for relocation
                      </p>
                    </div>
                  </div>
                ) : beds.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-14 h-14 bg-rose-50 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
                      <AlertCircle size={28} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-rose-600 uppercase tracking-tight">No Vacant Beds Available</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        All beds in this room are currently occupied. Please select another room.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {beds.map(b => {
                      const isSelected = selectedBedId === b.id
                      return (
                        <button
                          key={b.id}
                          onClick={() => setSelectedBedId(b.id)}
                          className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all cursor-pointer text-center group ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-600 shadow-md scale-[1.02]'
                              : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50/50'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute top-2 right-2 h-5 w-5 bg-indigo-600 text-white rounded-md flex items-center justify-center shadow-xs">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                          <img
                            src={BedAvailableImg}
                            alt={b.name}
                            className={`h-16 w-16 object-contain mb-2 transition-transform duration-300 ${
                              isSelected ? 'scale-110' : 'group-hover:scale-105'
                            }`}
                          />
                          <span className={`text-[10px] font-black uppercase tracking-wider ${
                            isSelected ? 'text-indigo-900' : 'text-slate-700'
                          }`}>
                            Space {b.name}
                          </span>
                          <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                            Vacant
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM RELOCATION TRAJECTORY & CONFIRMATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Relocation Summary trajectory */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
              <span className="text-[8px] font-black uppercase text-slate-400">From</span>
              <span className="text-xs font-black text-slate-900 uppercase">
                {transferData.floorName} • Room {transferData.roomName} • Space {transferData.bedName}
              </span>
            </div>

            <ArrowRight size={18} className="text-indigo-600 shrink-0" />

            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
              selectedBedObj
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <span className="text-[8px] font-black uppercase text-slate-400">To</span>
              <span className="text-xs font-black uppercase">
                {selectedBedObj
                  ? `${selectedFloorObj?.name || 'Floor'} • Room ${selectedRoomObj?.name || 'Room'} • Space ${selectedBedObj.name}`
                  : 'Select Target Bed'}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={!selectedBedId || submitting}
              onClick={handleTransfer}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                selectedBedId && !submitting
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={15} />}
              Submit Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
