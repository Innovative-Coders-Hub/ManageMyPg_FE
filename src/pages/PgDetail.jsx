// src/pages/PgDetail.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import SEO from '../components/SEO'
import {
  createFloor,
  getFloorsByPg,
  getPgDetailsById,
  createBed,
  deleteBed,
  activateBed,
  transferBed
} from '../api/ownerAuth'
import {
  Building2,
  MapPin,
  Users,
  LayoutGrid,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  Trash2,
  RefreshCw,
  Info,
  Sparkles,
  ArrowRight,
  Home,
  Bed as BedIcon,
  CheckCircle2,
  X,
  Loader2,
  TrendingUp,
  Percent,
  Layers,
  DoorOpen,
  ArrowLeft,
  Calendar,
  ArrowRightLeft
} from 'lucide-react'

import bedAvailableImg from '../assets/bed_availabe.png'
import bedOccupiedImg from '../assets/bed_occupied.png'
import bedReservedImg from '../assets/bed_reserved.png'
import bedDeletedImg from '../assets/bed_deleted.png'
import CustomDropdown from '../components/CustomDropdown'

// Preload assets for faster rendering
const statusImages = {
  available: bedAvailableImg,
  occupied: bedOccupiedImg,
  vacating: bedOccupiedImg,
  booked: bedReservedImg,
  deleted: bedDeletedImg
};

Object.values(statusImages).forEach(src => {
  const img = new Image();
  img.src = src;
});

const isVacatingSoon = (endDate, today = dayjs()) => {
  if (!endDate) return false
  const end = dayjs(endDate)
  if (!end.isValid()) return false
  const diff = end.diff(today, 'day')
  return diff >= 0 && diff <= 7
}

const getBedStatus = (bed, today = dayjs()) => {
  if (!bed) return 'available'
  if (bed.deleted === true) return 'deleted'
  if (bed.occupied === true) {
    if (isVacatingSoon(bed.vacatingDate, today)) {
      return 'vacating'
    }
    return 'occupied'
  }
  if (bed.booked === true) return 'booked'
  return 'available'
}

function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50', isAccent = false }) {
  if (isAccent) {
    colorClass = 'text-white'
    bgClass = 'bg-indigo-600'
  }
  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4 hover:shadow-sm transition-all cursor-default min-w-0">
      <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0 border border-slate-100`}>
        <Icon className="w-4 h-4 sm:w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</div>
        <div className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">{value}</div>
      </div>
    </div>
  )
}

const RoomCard = React.memo(React.forwardRef(({ room, onAddBed, onDeleteBed, onTransferBed }, ref) => {
  const occupiedCount = (room.beds || []).filter(b => b.occupied && !b.deleted).length
  const totalBedsCount = (room.beds || []).filter(b => !b.deleted).length

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
            <DoorOpen size={16} className="text-indigo-600 shrink-0" />
            Room {room.number}
          </h4>
          <div className="flex gap-1.5 mt-2">
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${room.ac ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              {room.ac ? 'AC' : 'Non-AC'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[8px] font-black uppercase tracking-widest border border-slate-200">
              {room.sharing} Sharing
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Occupancy</span>
          <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 block">
            {occupiedCount}/{totalBedsCount} Beds
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-auto pt-2">
        <AnimatePresence mode="popLayout">
          {(room.beds || []).map(bed => (
            <Bed
              key={bed.id}
              id={bed.id}
              name={bed.name}
              status={bed.status}
              deleted={bed.deleted}
              tenantName={bed.tenantName}
              onDelete={() => onDeleteBed(bed)}
              onTransfer={() => onTransferBed(bed)}
            />
          ))}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddBed}
          className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all group cursor-pointer"
          title="Add Bed to Room"
        >
          <Plus size={18} className="group-hover:scale-110 transition-transform mb-0.5" />
          <span className="text-[7.5px] font-black uppercase tracking-wider">Add Bed</span>
        </motion.button>
      </div>
    </motion.div>
  )
}))

const Bed = React.memo(React.forwardRef(function Bed({ id, name, status, deleted, tenantName, onDelete, onTransfer }, ref) {
  const navigate = useNavigate()

  const go = () => {
    navigate(`/beds/${encodeURIComponent(id)}`, {
      state: { bedName: name }
    })
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={go}
      className={`group relative aspect-square rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-sm bg-white hover:shadow-md transform-gpu will-change-transform ${
        status === 'available' ? 'border-emerald-100' :
        status === 'occupied' ? 'border-indigo-100' :
        status === 'vacating' ? 'border-amber-100' :
        status === 'booked' ? 'border-purple-100' : 'border-slate-100'
      }`}
    >
      {/* Background Image - Maximum Clarity */}
      <div className="absolute inset-0 flex items-center justify-center p-1 transition-transform duration-300 group-hover:scale-105 bg-slate-50/50 rounded-2xl overflow-hidden transform-gpu">
        <img
          src={statusImages[status]}
          alt={status}
          loading="eager"
          decoding="async"
          fetchpriority="high"
          className="w-full h-full object-contain opacity-100 drop-shadow-sm transform-gpu transition-opacity duration-200"
          onLoad={(e) => e.target.style.opacity = 1}
          style={{ opacity: 0, imageRendering: 'auto' }}
        />
      </div>

      {/* Bed Name Top Left - Professional Badge */}
      <div className="absolute top-0.5 left-0.5 z-10">
        <div className="bg-slate-900/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-lg backdrop-blur-sm uppercase tracking-tighter border border-white/20">
          {name}
        </div>
      </div>

      {/* Footer Status Overlay - High Visibility */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-1 pb-1">
        <div className={`w-full py-0.5 rounded-lg text-center backdrop-blur-md border border-white/30 shadow-sm ${
          status === 'available' ? 'bg-emerald-500/95 text-white' :
          status === 'occupied' ? 'bg-indigo-600/95 text-white' :
          status === 'vacating' ? 'bg-amber-500/95 text-white' :
          status === 'booked' ? 'bg-purple-600/95 text-white' : 'bg-slate-500/95 text-white'
        }`}>
           <span className="text-[7.5px] font-black uppercase tracking-widest truncate block px-1 drop-shadow-sm">
            {deleted ? 'Deleted' :
             status === 'occupied' || status === 'vacating' ? (tenantName || 'Occupied') :
             status === 'booked' ? 'Booked' : 'Available'}
          </span>
        </div>
      </div>

      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-20">
        {!deleted && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTransfer()
            }}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 text-indigo-500"
            title="Transfer Bed Asset"
          >
            <ArrowRightLeft size={12} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(id)
          }}
          className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-md flex items-center justify-center hover:scale-110 active:scale-95"
        >
          {deleted ? (
            <RefreshCw size={12} className="text-amber-500" />
          ) : (
            <Trash2 size={12} className="text-rose-500" />
          )}
        </button>
      </div>

      {/* Top Right Status Dot */}
      <div className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full z-10 border border-white shadow-sm ${
        status === 'available' ? 'bg-emerald-400' :
        status === 'occupied' ? 'bg-indigo-400' :
        status === 'vacating' ? 'bg-amber-400' :
        status === 'booked' ? 'bg-purple-400' : 'bg-slate-300'
      }`} />
    </motion.div>
  )
}))

function FilterPill({ active, onClick, label, icon: Icon, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
        active
          ? `${activeClass} shadow-md`
          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
      }`}
    >
      <Icon size={12} />
      {label}
    </button>
  )
}


function Toolbar({ filters, setFilters }) {
  const pills = [
    { key: 'ac', label: 'AC', icon: Sparkles, activeClass: 'bg-indigo-600 border-indigo-500 text-white' },
    { key: 'nonac', label: 'Non-AC', icon: Home, activeClass: 'bg-slate-900 border-slate-800 text-white' },
    { key: 'available', label: 'Available', icon: CheckCircle2, activeClass: 'bg-emerald-600 border-emerald-500 text-white' },
    { key: 'booked', label: 'Booked', icon: Calendar, activeClass: 'bg-purple-600 border-purple-500 text-white' },
    { key: 'vacatingSoon', label: 'Vacating', icon: TrendingUp, activeClass: 'bg-amber-500 border-amber-400 text-white' }
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-2xl text-slate-400 mr-1">
        <Filter size={12} />
        <span className="text-[9px] font-black uppercase tracking-widest">Filters</span>
      </div>
      {pills.map(p => (
        <FilterPill
          key={p.key}
          active={filters[p.key]}
          onClick={() => setFilters(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
          label={p.label}
          icon={p.icon}
          activeClass={p.activeClass}
        />
      ))}
      {(filters.ac || filters.nonac || filters.available || filters.booked || filters.vacatingSoon) && (
        <button
          onClick={() => setFilters({ ac: false, nonac: false, available: false, booked: false, vacatingSoon: false })}
          className="text-[9px] font-black text-rose-500 bg-rose-50 px-4 py-2.5 rounded-2xl uppercase tracking-widest hover:bg-rose-100 transition-colors ml-2 border border-rose-100"
        >
          Clear
        </button>
      )}
    </div>
  )
}

/* ================= Page ================= */
export default function PgDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pg, setPg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddRoom, setShowAddRoom] = useState(null)
  const [showAddBed, setShowAddBed] = useState(null)
  const [roomForm, setRoomForm] = useState({ number: '', sharing: 2, ac: false, beds: [] })
  const [bedForm, setBedForm] = useState({ id: '' })
  const [formError, setFormError] = useState('')
  const [filters, setFilters] = useState({ ac: false, nonac: false, available: false, booked: false, vacatingSoon: false })
  const [openFloors, setOpenFloors] = useState({})
  const [showAddFloor, setShowAddFloor] = useState(false)
  const [floorForm, setFloorForm] = useState({ name: '', roomCount: 0, rooms: [] })
  const [creatingFloor, setCreatingFloor] = useState(false)
  const [floorSuccess, setFloorSuccess] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [deleteBedTarget, setDeleteBedTarget] = useState(null)
  const [activateBedTarget, setActivateBedTarget] = useState(null)
  const [transferBedTarget, setTransferBedTarget] = useState(null)
  const [transferForm, setTransferForm] = useState({ targetFloorId: '', targetRoomId: '', newBedName: '', reason: '' })
  const [actionLoading, setActionLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState(false)

  const getNextBedName = (beds = []) => {
    const activeBeds = beds.filter(b => !b.deleted)
    if (activeBeds.length === 0) return 'B1'

    let maxNum = 0
    activeBeds.forEach(b => {
      const name = b.name || ''
      const match = name.match(/\d+/)
      if (match) {
        const num = parseInt(match[0], 10)
        if (num > maxNum) maxNum = num
      }
    })

    if (maxNum > 0) {
      return `B${maxNum + 1}`
    }

    return `B${activeBeds.length + 1}`
  }

  const updateRoomCount = (count) => {
    const n = Number(count)
    if (!Number.isFinite(n) || n <= 0) return
    setFloorForm(prev => ({
      ...prev,
      roomCount: n,
      rooms: Array.from({ length: n }, (_, i) => ({
        name: `Room ${i + 1}`,
        sharing: 2,
        ac: false,
        beds: [],
      })),
    }))
  }

  const resetFloorForm = () => {
    setFloorForm({ name: '', roomCount: 0, rooms: [] })
    setFloorSuccess(false)
    setFormError('')
  }

  const normalizeFloorsFromBE = (floors = []) =>
    floors.map(floor => ({
      id: floor.id,
      number: floor.floorName,
      rooms: (floor.roomsResponses || []).map(room => ({
        id: room.id,
        number: room.roomName,
        sharing: room.sharing,
        ac: String(room.roomType).toUpperCase().includes('AC') && !String(room.roomType).toUpperCase().includes('NON'),
        beds: (room.bedResponseList || []).map(bed => ({
          id: bed.id,
          name: bed.bedName,
          occupied: bed.isOccupied,
          booked: bed.isBooked,
          deleted: bed.isDeleted,
          vacatingDate: bed.vacatingDate,
          bookedTillDate: bed.bookedTillDate,
          tenantName: bed.tenantName
        }))
      }))
    }))

  const isFloorFormDirty = () => {
    if (!floorForm) return false
    if (floorForm.name) return true
    if (floorForm.roomCount > 0) return true
    return false
  }

  const handleCloseAddFloor = () => {
    if (isFloorFormDirty()) {
      setShowDiscardConfirm(true)
    } else {
      resetFloorForm()
      setShowAddFloor(false)
    }
  }

  useEffect(() => {
    async function fetchPg() {
      try {
        setLoading(true)
        const [floorsResponse, pgDetails] = await Promise.all([
          getFloorsByPg(id),
          getPgDetailsById(id)
        ])
        const floors = normalizeFloorsFromBE(
          Array.isArray(floorsResponse)
            ? floorsResponse
            : floorsResponse?.data || []
        )
        setPg({ ...pgDetails, id, floors })
      } catch (err) {
        toast.error('Failed to load PG details')
        setPg(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchPg()
  }, [id])

  const today = useMemo(() => dayjs(), [])

  const matchesRoomFilters = (room) => {
    const { ac, nonac } = filters
    if (!ac && !nonac) return true
    if (ac && room.ac) return true
    if (nonac && !room.ac) return true
    return false
  }

  const filteredBedsForRoom = (room) => {
    const { available, vacatingSoon, booked } = filters;

    // Always calculate status for all beds in this room once
    const bedsWithStatus = (room.beds || []).map(bed => ({
      ...bed,
      status: getBedStatus(bed, today)
    }));

    if (!available && !vacatingSoon && !booked) return bedsWithStatus;

    return bedsWithStatus.filter(bed => {
      return (
        (available && bed.status === 'available') ||
        (vacatingSoon && bed.status === 'vacating') ||
        (booked && bed.status === 'booked')
      )
    })
  };

  const filteredFloors = useMemo(() => {
    if (!pg) return []
    return (pg.floors || []).map(floor => {
      const rooms = (floor.rooms || [])
        .filter(matchesRoomFilters)
        .map(r => ({
          ...r,
          beds: filteredBedsForRoom(r),
        }))
      return { ...floor, rooms }
    })
  }, [pg, filters])

  const totalBeds = pg?.floors?.reduce((sum, f) => sum + (f.rooms || []).reduce((rSum, r) => rSum + (r.beds?.filter(b => !b.deleted).length || 0), 0), 0) || 0
  const filledBedsCount = pg?.floors?.reduce((sum, f) => sum + (f.rooms || []).reduce((rSum, r) => rSum + (r.beds || []).filter(b => b.occupied === true && !b.deleted).length, 0), 0) || 0
  const totalRoomsCount = pg?.floors?.reduce((sum, f) => sum + (f.rooms?.length || 0), 0) || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inventorying Portfolio Units...</p>
        </div>
      </div>
    )
  }

  if (!pg) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center shadow-xl shadow-slate-200/50"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mx-auto mb-6">
            <Building2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">PG Not Found</h2>
          <p className="text-slate-500 font-medium mb-8">We couldn't locate the PG details you're looking for.</p>
          <button
            onClick={() => navigate('/mypgs')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Back to Portfolio
          </button>
        </motion.div>
      </div>
    )
  }

  const pgDisplayName = pg?.pgName || 'PG Beds Management'
  const pgAddress = typeof pg?.address === 'string' ? pg.address : pg?.address?.address || 'Beds Management'

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <SEO
        title={pgDisplayName}
        description={`Manage rooms, beds, and occupancy for ${pgDisplayName} at ${pgAddress}. View floor-wise details and tenant status.`}
        canonical={`/pg/${id}`}
      />
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title={pgDisplayName}
            subtitle={typeof pg.address === 'string' ? pg.address : pg.address?.address || 'Beds & Layout Management'}
            backButton={
              <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 mr-2">
                <ArrowLeft size={18} />
              </button>
            }
          >
            <button
              onClick={() => setShowAddFloor(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Plus size={14} /> Add Floor
            </button>
          </PageHeader>

          {/* Top Executive Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
            <TopStat label="Floors Count" value={pg.floors?.length || 0} icon={Layers} colorClass="text-indigo-600" bgClass="bg-indigo-50" />
            <TopStat label="Rooms Count" value={totalRoomsCount} icon={DoorOpen} colorClass="text-purple-600" bgClass="bg-purple-50" />
            <TopStat label="Active Beds" value={totalBeds} icon={BedIcon} colorClass="text-cyan-600" bgClass="bg-cyan-50" />
            <TopStat label="Occupancy Rate" value={`${totalBeds > 0 ? Math.round((filledBedsCount/totalBeds)*100) : 0}%`} icon={TrendingUp} isAccent />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex flex-col gap-6">
          <Toolbar filters={filters} setFilters={setFilters} />

          {filteredFloors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border-2 border-dashed border-slate-200 py-32 text-center"
            >
              <div className="mx-auto w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mb-6">
                <DoorOpen size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Empty Inventory</h2>
              <p className="mt-4 text-slate-500 font-medium max-w-sm mx-auto px-4">
                No rooms or beds match your current filters. Start by adding floors and configuring your layout.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <AnimatePresence mode="popLayout">
                {filteredFloors.map((f) => {
                  const floorKey = f.id
                  const isOpen = openFloors[floorKey] ?? true
                  const floorBedsCount = f.rooms.reduce((a, r) => a + (r.beds?.filter(b => !b.deleted).length || 0), 0)

                  return (
                    <motion.div
                      layout
                      key={f.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
                    >
                      {/* Floor Header */}
                      <div
                        onClick={() => setOpenFloors(prev => ({ ...prev, [floorKey]: !isOpen }))}
                        className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="h-9 px-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-wider shadow-xs">
                            Floor {f.number}
                          </div>
                          <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                              {f.name || `Floor ${f.number}`}
                            </h3>
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
                              {f.rooms.length} Rooms • {floorBedsCount} Active Beds
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg bg-white/10 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown size={16} />
                          </div>
                        </div>
                      </div>

                      {/* Floor Content */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-5 sm:p-6 bg-slate-50/50 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                              <AnimatePresence mode="popLayout">
                                {f.rooms.map((r) => (
                                  <RoomCard
                                    key={r.id}
                                    room={r}
                                    onAddBed={() => {
                                       const autoBedName = getNextBedName(r.beds || [])
                                       setBedForm({ id: autoBedName })
                                       setFormError('')
                                       setShowAddBed({
                                         floorId: f.id,
                                         roomId: r.id,
                                         floorNumber: f.number,
                                         roomNumber: r.number,
                                       })
                                     }}
                                    onDeleteBed={(bed) => {
                                      setActionSuccess(false)
                                      setActionLoading(false)
                                      const payload = {
                                        bedId: bed.id,
                                        bedName: bed.name,
                                        floorId: f.id,
                                        floorNumber: f.number,
                                        roomId: r.id,
                                        roomNumber: r.number,
                                        deleted: bed.deleted
                                      }
                                      if (bed.deleted) {
                                        setActivateBedTarget(payload)
                                      } else {
                                        setDeleteBedTarget(payload)
                                      }
                                    }}
                                    onTransferBed={(bed) => {
                                      setTransferBedTarget({
                                        bedId: bed.id,
                                        bedName: bed.name,
                                        floorId: f.id,
                                        floorNumber: f.number,
                                        roomId: r.id,
                                        roomNumber: r.number
                                      })
                                      setTransferForm({
                                        targetFloorId: f.id,
                                        targetRoomId: '',
                                        newBedName: bed.name,
                                        reason: 'Room maintenance'
                                      })
                                      setFormError('')
                                      setActionLoading(false)
                                    }}
                                  />
                                ))}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Right Slide-Over Drawer - Add New Floor */}
      <AnimatePresence>
        {showAddFloor && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseAddFloor}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-Over Drawer Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 relative z-10"
                onClick={e => e.stopPropagation()}
              >
                {/* Drawer Header */}
                <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Layers size={20} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">
                        Add New Floor
                      </h3>
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-0.5 truncate">
                        Construct and configure new floor unit
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseAddFloor}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
                    title="Close Drawer"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Drawer Body Content */}
                {floorSuccess ? (
                  <div className="flex-1 p-6 flex flex-col items-center justify-center text-center my-auto">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-100 shadow-xs">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Floor Established Successfully</h3>
                    <p className="text-[10px] font-medium text-slate-500 max-w-xs mx-auto mt-1 mb-8 leading-relaxed">
                      The new floor layout and rooms have been added to your property inventory.
                    </p>
                    <button
                      className="w-full py-3 bg-slate-900 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest shadow-xs hover:bg-indigo-600 transition-all cursor-pointer"
                      onClick={() => { resetFloorForm(); setShowAddFloor(false); }}
                    >
                      Return to Property Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                    
                    {/* Floor Basic Config */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-3">
                        Floor Specification
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <FormInput
                          label="Floor Name/ID"
                          value={floorForm.name}
                          onChange={(v) => setFloorForm(prev => ({ ...prev, name: v }))}
                          placeholder="e.g. 1st Floor, 2nd Floor"
                          required
                        />
                        <FormInput
                          label="Room Count"
                          type="number"
                          value={floorForm.roomCount || ''}
                          onChange={updateRoomCount}
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>

                    {/* Room Configuration Section */}
                    {floorForm.rooms.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Room Configuration ({floorForm.rooms.length} Rooms)
                          </span>
                        </div>

                        <div className="space-y-3">
                          {floorForm.rooms.map((room, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Room #{idx + 1}</span>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                                    checked={room.ac}
                                    onChange={(e) => {
                                      const rooms = [...floorForm.rooms]
                                      rooms[idx].ac = e.target.checked
                                      setFloorForm(prev => ({ ...prev, rooms }))
                                    }}
                                  />
                                  <span className="text-[9.5px] font-black text-slate-600 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">AC Installed</span>
                                </label>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Room Name</label>
                                  <input
                                    placeholder="e.g. 101"
                                    value={room.name}
                                    onChange={(e) => {
                                      const rooms = [...floorForm.rooms]
                                      rooms[idx].name = e.target.value
                                      setFloorForm(prev => ({ ...prev, rooms }))
                                    }}
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Beds Capacity</label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      min={1}
                                      value={room.sharing}
                                      onChange={(e) => {
                                        const rooms = [...floorForm.rooms]
                                        rooms[idx].sharing = Number(e.target.value)
                                        setFloorForm(prev => ({ ...prev, rooms }))
                                      }}
                                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-black uppercase pointer-events-none tracking-tighter">Beds</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {formError && (
                      <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-[10px] font-black uppercase text-rose-600 tracking-widest">
                        {formError}
                      </div>
                    )}
                  </div>
                )}

                {/* Drawer Fixed Footer Bar */}
                {!floorSuccess && (
                  <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-3 shadow-lg">
                    <button
                      className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer text-center"
                      onClick={handleCloseAddFloor}
                    >
                      Discard
                    </button>
                    <button
                      disabled={creatingFloor || !floorForm.name || floorForm.roomCount <= 0}
                      className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-40 shadow-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      onClick={async () => {
                        try {
                          setCreatingFloor(true)
                          const payload = {
                            pgId: id,
                            floorName: floorForm.name.trim(),
                            roomsSize: floorForm.rooms.length,
                            roomsRequests: floorForm.rooms.map(r => ({
                              roomName: r.name,
                              roomType: r.ac ? 'AC' : 'NON AC',
                              sharing: r.sharing,
                              beds: r.sharing,
                            })),
                          }
                          const savedFloorResponse = await createFloor(payload)
                          const normalizedFloor = normalizeFloorsFromBE([savedFloorResponse])[0]
                          setPg(prev => ({
                            ...prev,
                            floors: [...(prev.floors || []), normalizedFloor],
                          }))
                          setFloorSuccess(true)
                          toast.success('Floor added successfully')
                        } catch (err) {
                          setFormError(err?.response?.data?.message || 'Failed to save floor. Please try again.')
                        } finally {
                          setCreatingFloor(false)
                        }
                      }}
                    >
                      {creatingFloor ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Establish Floor'}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowDiscardConfirm(false)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-100">
              <Info size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Discard Changes?</h3>
            <p className="text-slate-500 text-sm font-medium mt-2 mb-8 px-4">You have unsaved configuration for this floor. Are you sure you want to stop?</p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors" onClick={() => setShowDiscardConfirm(false)}>Stay</button>
              <button className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100" onClick={() => { resetFloorForm(); setShowDiscardConfirm(false); setShowAddFloor(false); }}>Discard</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal - Add Bed */}
      <AnimatePresence>
        {showAddBed && (
          <Modal onClose={() => setShowAddBed(null)} title="Bed Assignment" icon={<BedIcon />}>
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Location Context</p>
                <div className="flex items-center gap-4">
                   <div className="flex-1 p-3 bg-white rounded-lg border border-slate-100">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Floor</span>
                      <span className="text-sm font-black text-slate-900 uppercase">{showAddBed.floorNumber}</span>
                   </div>
                   <div className="flex-1 p-3 bg-white rounded-lg border border-slate-100">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Unit</span>
                      <span className="text-sm font-black text-slate-900 uppercase">Room {showAddBed.roomNumber}</span>
                   </div>
                </div>
              </div>

              <FormInput label="Identifier / Bed Label" value={bedForm.id} onChange={(v) => setBedForm(prev => ({ ...prev, id: v }))} placeholder="e.g. B1, Window Side" required />

              {formError && <div className="p-3 rounded-xl border border-rose-100 bg-rose-50 text-[10px] font-black uppercase text-rose-600 tracking-widest">{formError}</div>}

              <button
                className="w-full px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                onClick={async () => {
                  try {
                    const bedName = bedForm.id?.trim()
                    if (!bedName) return setFormError('Bed name is required')

                    const payload = { bedName, roomId: showAddBed.roomId, floorId: showAddBed.floorId, pgId: pg.id }
                    const savedBed = await createBed(payload)

                    setPg(prev => ({
                      ...prev,
                      floors: prev.floors.map(f => f.id !== showAddBed.floorId ? f : {
                        ...f,
                        rooms: f.rooms.map(r => r.id !== showAddBed.roomId ? r : {
                          ...r,
                          beds: [...(r.beds || []), {
                            id: savedBed.id,
                            name: savedBed.bedName,
                            occupied: false,
                            booked: false,
                            deleted: false,
                            vacatingDate: null,
                            tenantName: null,
                            status: 'available'
                          }]
                        })
                      })
                    }))
                    setShowAddBed(null)
                    setBedForm({ id: '' })
                    setFormError('')
                    toast.success('Bed added to inventory')
                  } catch (err) {
                    setFormError(err?.response?.data?.message || 'Failed to add bed')
                  }
                }}
              >
                Register Bed
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Confirmation Modal - Bed Action */}
      <AnimatePresence>
        {(deleteBedTarget || activateBedTarget) && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              onClick={() => {
                if (!actionLoading) {
                  setDeleteBedTarget(null);
                  setActivateBedTarget(null);
                  setActionSuccess(false);
                }
              }}
            />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
              {actionSuccess ? (
                <div className="py-4">
                  <div className={`w-16 h-16 ${deleteBedTarget ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'} rounded-full flex items-center justify-center mx-auto mb-6 border-2`}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {deleteBedTarget ? 'Bed Deleted' : 'Bed Activated'}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-2 mb-8">
                    {deleteBedTarget
                      ? `Bed ${deleteBedTarget.bedName} has been successfully deleted from inventory.`
                      : `Bed ${activateBedTarget.bedName} is now active and ready for bookings.`}
                  </p>
                  <button
                    className="w-full px-4 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                    onClick={() => {
                      setDeleteBedTarget(null);
                      setActivateBedTarget(null);
                      setActionSuccess(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : deleteBedTarget ? (
                <>
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-rose-100">
                    <Trash2 size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Delete Bed?</h3>
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 space-y-2">
                    <div className="flex justify-between"><span>Floor</span><span className="text-slate-900">{deleteBedTarget.floorNumber}</span></div>
                    <div className="flex justify-between"><span>Room</span><span className="text-slate-900">{deleteBedTarget.roomNumber}</span></div>
                    <div className="flex justify-between"><span>Bed Name</span><span className="text-slate-900">{deleteBedTarget.bedName}</span></div>
                  </div>
                  <p className="text-slate-400 text-xs font-bold mt-6 mb-8 px-2 uppercase tracking-tighter">This Bed will be deleted,Until you reactivate it.</p>
                  <div className="flex gap-3">
                    <button disabled={actionLoading} className="flex-1 px-4 py-3 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50" onClick={() => setDeleteBedTarget(null)}>Cancel</button>
                    <button disabled={actionLoading} className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50" onClick={async () => {
                        try {
                          setActionLoading(true)
                          await deleteBed(deleteBedTarget.bedId)
                          setPg(prev => ({
                            ...prev,
                            floors: prev.floors.map(f => f.id !== deleteBedTarget.floorId ? f : {
                              ...f,
                              rooms: f.rooms.map(r => r.id !== deleteBedTarget.roomId ? r : {
                                ...r,
                                beds: r.beds.map(b => b.id === deleteBedTarget.bedId ? { ...b, deleted: true, status: 'deleted' } : b)
                              })
                            })
                          }))
                          setActionSuccess(true)
                          toast.success("Bed deleted from inventory")
                        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to delete bed') }
                        finally { setActionLoading(false) }
                    }}>
                      {actionLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Confirm'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-100">
                    <RefreshCw size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Reactivate Bed?</h3>
                   <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 space-y-2">
                    <div className="flex justify-between"><span>Floor</span><span className="text-slate-900">{activateBedTarget.floorNumber}</span></div>
                    <div className="flex justify-between"><span>Room</span><span className="text-slate-900">{activateBedTarget.roomNumber}</span></div>
                    <div className="flex justify-between"><span>Bed Name</span><span className="text-slate-900">{activateBedTarget.bedName}</span></div>
                  </div>
                  <p className="text-slate-400 text-xs font-bold mt-6 mb-8 px-2 uppercase tracking-tighter">This unit will be restored for bookings.</p>
                  <div className="flex gap-3">
                    <button disabled={actionLoading} className="flex-1 px-4 py-3 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50" onClick={() => setActivateBedTarget(null)}>Cancel</button>
                    <button disabled={actionLoading} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50" onClick={async () => {
                        try {
                          setActionLoading(true)
                          await activateBed(activateBedTarget.bedId)
                          setPg(prev => ({
                            ...prev,
                            floors: prev.floors.map(f => f.id !== activateBedTarget.floorId ? f : {
                              ...f,
                              rooms: f.rooms.map(r => r.id !== activateBedTarget.roomId ? r : {
                                ...r,
                                beds: r.beds.map(b => b.id === activateBedTarget.bedId ? { ...b, deleted: false, status: 'available' } : b)
                              })
                            })
                          }))
                          setActionSuccess(true)
                          toast.success("Bed restored to inventory")
                        } catch (err) { toast.error(err?.response?.data?.message || 'Failed to reactivate bed') }
                        finally { setActionLoading(false) }
                    }}>
                      {actionLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Activate Bed'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Right Slide-Over Drawer - Transfer Bed Asset */}
      <AnimatePresence>
        {transferBedTarget && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTransferBedTarget(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-Over Drawer Panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 relative z-10"
                onClick={e => e.stopPropagation()}
              >
                {/* Drawer Header */}
                <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <ArrowRightLeft size={20} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">
                        Transfer Bed Asset
                      </h3>
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-0.5 truncate">
                        Relocate bed space to another room
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTransferBedTarget(null)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
                    title="Close Drawer"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Drawer Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                  
                  {/* Current Location Box */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                      <BedIcon size={14} />
                      <span>Current Asset Location</span>
                    </div>
                    <div className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      Bed {transferBedTarget.bedName} • {transferBedTarget.floorNumber} • Room {transferBedTarget.roomNumber}
                    </div>
                  </div>

                  {/* Form Selectors & Inputs */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-3">
                      Target Relocation Details
                    </h4>

                    <div>
                      <CustomDropdown
                        label="Target Floor"
                        value={transferForm.targetFloorId || ''}
                        options={pg.floors.map(f => ({
                          id: f.id,
                          label: String(f.number).toUpperCase()
                        }))}
                        onChange={(floorId) => {
                          setTransferForm(prev => ({ ...prev, targetFloorId: floorId, targetRoomId: '' }));
                        }}
                        icon={Building2}
                        className="w-full"
                        labelBg="bg-white"
                      />
                    </div>

                    {transferForm.targetFloorId && (
                      <div>
                        <CustomDropdown
                          label="Target Room"
                          value={transferForm.targetRoomId || ''}
                          options={(pg.floors.find(f => f.id === transferForm.targetFloorId)?.rooms || []).map(r => ({
                            id: r.id,
                            label: `ROOM ${String(r.number).toUpperCase()}`
                          }))}
                          onChange={(roomId) => {
                            setTransferForm(prev => ({ ...prev, targetRoomId: roomId }));
                          }}
                          icon={Home}
                          className="w-full"
                          labelBg="bg-white"
                        />
                      </div>
                    )}

                    <FormInput
                      label="New Bed Name"
                      value={transferForm.newBedName}
                      onChange={(v) => setTransferForm(prev => ({ ...prev, newBedName: v }))}
                      placeholder="e.g. B1"
                      required
                    />

                    <FormInput
                      label="Transfer Reason"
                      value={transferForm.reason}
                      onChange={(v) => setTransferForm(prev => ({ ...prev, reason: v }))}
                      placeholder="e.g. Room maintenance, relocation"
                    />
                  </div>

                  {formError && (
                    <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-[10px] font-black uppercase text-rose-600 tracking-widest">
                      {formError}
                    </div>
                  )}
                </div>

                {/* Drawer Fixed Footer Bar */}
                <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-3 shadow-lg">
                  <button
                    onClick={() => setTransferBedTarget(null)}
                    className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={actionLoading || !transferForm.targetRoomId || !transferForm.newBedName}
                    className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-40 shadow-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    onClick={async () => {
                      try {
                        setActionLoading(true);
                        const payload = {
                          targetRoomId: transferForm.targetRoomId,
                          newBedName: transferForm.newBedName,
                          reason: transferForm.reason
                        };
                        await transferBed(transferBedTarget.bedId, payload);

                        setPg(prev => {
                          let bedToMove = null;
                          const floorsAfterRemoval = prev.floors.map(f => {
                            if (f.id === transferBedTarget.floorId) {
                              const roomsAfterRemoval = f.rooms.map(r => {
                                if (r.id === transferBedTarget.roomId) {
                                  bedToMove = r.beds.find(b => b.id === transferBedTarget.bedId);
                                  return { ...r, beds: r.beds.filter(b => b.id !== transferBedTarget.bedId) };
                                }
                                return r;
                              });
                              return { ...f, rooms: roomsAfterRemoval };
                            }
                            return f;
                          });

                          if (!bedToMove) return prev;

                          const updatedBed = { ...bedToMove, name: transferForm.newBedName };

                          const floorsAfterTransfer = floorsAfterRemoval.map(f => {
                            if (f.id === transferForm.targetFloorId) {
                              const roomsAfterTransfer = f.rooms.map(r => {
                                if (r.id === transferForm.targetRoomId) {
                                  return { ...r, beds: [...(r.beds || []), updatedBed] };
                                }
                                return r;
                              });
                              return { ...f, rooms: roomsAfterTransfer };
                            }
                            return f;
                          });

                          return { ...prev, floors: floorsAfterTransfer };
                        });

                        toast.success('Bed asset transferred successfully');
                        setTransferBedTarget(null);
                      } catch (err) {
                        setFormError(err?.response?.data?.message || 'Failed to transfer bed');
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Establish Transfer'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

const Modal = React.forwardRef(({ children, onClose, title, subtitle, icon, className = "max-w-2xl" }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full ${className} bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200`}
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
              {React.isValidElement(icon) ? icon : React.cloneElement(icon, { size: 22 })}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none truncate">{title}</h3>
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 truncate">{subtitle || 'Inventory Protocol'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0 ml-2 border border-slate-100">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
})

function FormInput({ label, value, onChange, placeholder, type = 'text', readOnly = false, required = false }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${readOnly ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:bg-white'} ${type === 'number' ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''}`}
      />
    </div>
  )
}
