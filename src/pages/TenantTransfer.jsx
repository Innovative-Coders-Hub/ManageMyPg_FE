import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  Loader2
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
      toast.error("Please select Floor, Room and Bed")
      return
    }

    if (rentChange && !newRent) {
      toast.error("Please enter new rent")
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
      toast.success("Tenant transferred successfully")
      setTimeout(() => {
        if (transferData?.pgId) {
          navigate(`/pg/${transferData.pgId}`)
        } else {
          navigate(-1)
        }
      }, 1500)
    } catch (err) {
      const msg = err?.response?.data?.message || "Transfer failed"
      toast.error(msg)
      setSubmitting(false)
    }
  }

  if (!transferData) return null

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Tenant Relocation"
            subtitle="Internal room transfer and contract adjustment"
          >
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
              Return
            </button>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Side: Context Cards */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <BedIcon size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-400 mb-6">
                  <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Active Tenancy</span>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Resident</p>
                    <p className="text-xl font-black tracking-tight uppercase leading-none">{transferData.tenantName}</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Assignment</p>
                      <p className="text-xs font-bold uppercase">{transferData.floorName} • {transferData.roomName}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xs border border-indigo-500/20">
                      {transferData.bedName}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center gap-3">
                  <Info size={16} className="text-indigo-400 shrink-0" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed tracking-tight">
                    Relocation will be logged in the tenant's history ledger. Current stay status will be preserved.
                  </p>
                </div>
              </div>
            </div>

            {/* Price Adjustment Card */}
            <AnimatePresence>
              {selectedBedId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                        <CreditCard size={18} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Contract Update</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rentChange}
                        onChange={() => setRentChange(!rentChange)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {rentChange ? (
                    <div className="space-y-4 pt-2">
                      <div className="relative group">
                        <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">New Monthly Rent</label>
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none z-10">
                          <CreditCard size={16} strokeWidth={2.5} />
                        </div>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={newRent}
                          onChange={(e) => setNewRent(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="relative group">
                        <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">Adjusted Security Advance</label>
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none z-10">
                          <ShieldCheck size={16} strokeWidth={2.5} />
                        </div>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={newDeposit}
                          onChange={(e) => setNewDeposit(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                      <AlertCircle size={16} className="text-slate-400 shrink-0" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                        Terms of the original contract will remain unchanged during this relocation.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Selection Flow */}
          <div className="lg:col-span-8 space-y-6">
            {/* Target Selection Bar */}
            <div className="bg-white rounded-[2.5rem] p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <CustomDropdown
                  label="Target Floor"
                  value={selectedFloorId}
                  options={floors.map(f => ({ id: f.id, label: f.name }))}
                  onChange={handleFloorChange}
                  icon={Building2}
                  className="w-full"
                  labelBg="bg-white"
                />
              </div>
              <div className="hidden sm:block">
                <MoveRight size={24} className="text-slate-200" strokeWidth={3} />
              </div>
              <div className="flex-1 w-full">
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

            {/* Bed Grid Section */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                    <BedIcon size={18} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Available Inventory</h3>
                </div>
                {selectedRoomId && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    {beds.length} Options Found
                  </span>
                )}
              </div>

              {!selectedRoomId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                    <Home size={40} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Awaiting Room Selection</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter mt-1">Select a target room to browse available beds</p>
                  </div>
                </div>
              ) : beds.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-20 w-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-300 border border-rose-100 shadow-inner">
                    <AlertCircle size={40} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest">Inventory Exhausted</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter mt-1">All beds in this room are currently occupied</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                  {beds.map(b => (
                    <motion.button
                      key={b.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedBedId(b.id)}
                      className={`relative flex flex-col items-center p-4 rounded-[2rem] border-2 transition-all duration-300 group ${
                        selectedBedId === b.id
                          ? 'bg-indigo-50 border-indigo-500 shadow-xl shadow-indigo-100/50'
                          : 'bg-white border-slate-100 hover:border-indigo-200'
                      }`}
                    >
                      <div className="relative mb-3">
                        <img
                          src={BedAvailableImg}
                          alt={b.name}
                          className={`h-24 w-24 object-contain transition-all duration-500 ${
                            selectedBedId === b.id ? 'brightness-110 drop-shadow-2xl' : 'opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0'
                          }`}
                        />
                        {selectedBedId === b.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-xl p-1.5 shadow-lg border-2 border-white"
                          >
                            <CheckCircle2 size={12} strokeWidth={3} />
                          </motion.div>
                        )}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${
                        selectedBedId === b.id ? 'text-indigo-900' : 'text-slate-400'
                      }`}>
                        {b.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {selectedBedId && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 size={18} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Target Allocation</p>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">
                          Bed {beds.find(b => b.id === selectedBedId)?.name} Confirmed
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    disabled={!selectedBedId || submitting}
                    onClick={handleTransfer}
                    className={`h-[56px] px-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                      selectedBedId && !submitting
                        ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-100'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw size={18} strokeWidth={3} />}
                    Execute Relocation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
