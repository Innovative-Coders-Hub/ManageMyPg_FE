import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  ArrowRight,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  IndianRupee,
  Loader2,
  Building2,
  Info,
  CalendarDays,
  User,
  Phone,
  Trash2,
  MapPin,
  TrendingUp,
  ExternalLink,
  Download,
  Bell,
  ChevronDown,
  Building
} from 'lucide-react'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import PageHeader from '../components/PageHeader'
import ConfirmModal from '../components/ConfirmModal'
import AvailableBedImg from '../assets/bed_availabe.png'
import OccupiedBedImg from '../assets/bed_occupied.png'
import ReservedBedImg from '../assets/bed_reserved.png'
import {
  getBedAvailability,
  createBooking,
  getBookingDetails,
  getPgBookingSummary,
  cancelBooking,
  getAllPgs,
  getAllBookings,
  completeBooking
} from '../api/ownerAuth'

/* -------------------------------------------------- */
/* Sub-components                                     */
/* -------------------------------------------------- */

function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50' }) {
  return (
    <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md hover:scale-[1.02] transition-all cursor-default flex-1 min-w-0">
      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0">
        <div className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</div>
        <div className="text-base sm:text-xl font-black text-slate-900 leading-tight truncate">{value}</div>
      </div>
    </div>
  )
}

function CustomDropdown({ label, value, options, onChange, icon: Icon, showAll = false, className = "min-w-[240px]", labelBg = "bg-white" }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = React.useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.id === value || opt.value === value)
  const displayValue = selectedOption ? selectedOption.label : (value || `SELECT ${label}`)

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className={`absolute -top-2.5 left-5 px-2 ${labelBg} z-20 transition-all duration-300`}>
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none">{label}</span>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-5 py-2.5 bg-slate-50 border-2 rounded-2xl transition-all duration-300 ${
          isOpen ? 'border-indigo-500 shadow-xl shadow-indigo-100/50' : 'border-slate-100 hover:border-indigo-300 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={18} className="text-indigo-500" strokeWidth={2.5} />}
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest truncate max-w-[150px]">
            {displayValue}
          </span>
        </div>
        <ChevronDown
          size={16}
          strokeWidth={3}
          className={`text-indigo-400 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute z-[110] left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden py-2"
          >
            {showAll && (
              <button
                type="button"
                onClick={() => { onChange('ALL'); setIsOpen(false); }}
                className={`w-full px-7 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all ${
                  value === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                ALL {label}S
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.id || opt.value}
                type="button"
                onClick={() => { onChange(opt.id || opt.value); setIsOpen(false); }}
                className={`w-full px-7 py-3 text-left text-[11px] font-black uppercase tracking-widest transition-all ${
                  (value === opt.id || value === opt.value) ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatusPill({ status }) {
  const styles = {
    CONFIRMED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    CANCELLED: 'bg-rose-50 text-rose-600 border-rose-100',
    EXPIRED: 'bg-amber-50 text-amber-600 border-amber-100',
    COMPLETED: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  }
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${styles[status] || 'bg-slate-50 text-slate-400'}`}>
      {status}
    </span>
  )
}

export default function Bookings() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pgId = searchParams.get('pgId')

  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [availability, setAvailability] = useState([])
  const [bookingsList, setBookingsList] = useState([])
  const [selectedView, setSelectedView] = useState('summary') // 'summary' or 'map'
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedBed, setSelectedBed] = useState(null)

  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    mobileNumber: '',
    gender: 'MALE',
    plannedJoiningDate: dayjs().format('YYYY-MM-DD'),
    bookingAmount: '',
    expectedTotalAdvance: '',
    notes: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [viewDetails, setViewDetails] = useState(null)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [completeForm, setCompleteForm] = useState({
    username: '',
    password: ''
  })

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const pgsData = await getAllPgs()
        setPgs(pgsData)
        if (!pgId && pgsData.length > 0) {
          navigate(`?pgId=${pgsData[0].id}`, { replace: true })
        }
      } catch (err) {
        toast.error('Failed to load PGs')
      }
    }
    fetchInitialData()
  }, [pgId, navigate])

  useEffect(() => {
    if (!pgId) return
    loadPgData()
  }, [pgId])

  async function loadPgData() {
    setLoading(true)
    try {
      const [sum, avail, list] = await Promise.all([
        getPgBookingSummary(pgId).catch(() => null),
        getBedAvailability(pgId).catch(() => []),
        getAllBookings(pgId).catch(() => [])
      ])
      setSummary(sum)
      setAvailability(avail)
      setBookingsList(Array.isArray(list) ? list : [])
    } catch (err) {
      toast.error('Failed to load booking data')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateBooking(e) {
    e.preventDefault()
    if (!selectedBed) return

    if (bookingForm.mobileNumber.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...bookingForm,
        pgId,
        roomId: selectedBed.roomId,
        bedId: selectedBed.bedId,
        roomType: selectedBed.roomType,
        sharing: selectedBed.sharing,
        bookingAmount: parseFloat(bookingForm.bookingAmount),
        expectedTotalAdvance: parseFloat(bookingForm.expectedTotalAdvance)
      }
      await createBooking(payload)
      setShowBookingModal(false)
      setShowSuccessModal(true)
      setBookingForm({
        customerName: '',
        mobileNumber: '',
        gender: 'MALE',
        plannedJoiningDate: dayjs().format('YYYY-MM-DD'),
        bookingAmount: '',
        expectedTotalAdvance: '',
        notes: ''
      })
      loadPgData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancelBooking() {
    if (!bookingToCancel) return
    try {
      await cancelBooking(bookingToCancel.id, { reason: cancelReason })
      toast.success('Booking cancelled')
      setShowCancelModal(false)
      setBookingToCancel(null)
      setCancelReason('')
      loadPgData()
    } catch (err) {
      toast.error('Failed to cancel booking')
    }
  }

  async function handleCompleteBooking(e) {
    e.preventDefault()
    if (!viewDetails) return
    setCompleting(true)
    try {
      await completeBooking(viewDetails.id, completeForm)
      toast.success('Booking completed! Resident registered successfully.')
      setShowCompleteModal(false)
      setViewDetails(null)
      setCompleteForm({ username: '', password: '' })
      loadPgData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to complete booking')
    } finally {
      setCompleting(false)
    }
  }

  const handleViewBookingDetails = async (bookingId) => {
    try {
      const details = await getBookingDetails(bookingId)
      setViewDetails(details)
    } catch (err) {
      toast.error('Failed to load booking details')
    }
  }

  const filteredBookings = useMemo(() => {
    return bookingsList.filter(b => {
      const matchesSearch = b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.mobileNumber?.includes(searchTerm) ||
                          b.roomName?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [bookingsList, searchTerm, statusFilter])

  const exportBookingsPDF = () => {
    const doc = new jsPDF()
    const pgName = pgs.find(p => p.id === pgId)?.pgName || 'All'

    // Header
    doc.setFillColor(15, 23, 42) // slate-900
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text('MANAGE MY PG', 20, 20)
    doc.setFontSize(10)
    doc.text(`BOOKING SUMMARY REPORT - ${pgName.toUpperCase()}`, 20, 30)

    doc.setTextColor(15, 23, 42)
    doc.setFontSize(12)
    doc.text('ACTIVE BOOKINGS', 20, 55)
    doc.setDrawColor(226, 232, 240)
    doc.line(20, 60, 190, 60)

    let y = 70
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Customer Name', 20, y)
    doc.text('Mobile', 70, y)
    doc.text('Room/Bed', 110, y)
    doc.text('Joining Date', 150, y)
    doc.text('Status', 180, y)
    y += 10

    doc.setFont('helvetica', 'normal')
    filteredBookings.forEach((b) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(b.customerName || '-', 20, y)
      doc.text(b.mobileNumber || '-', 70, y)
      doc.text(`${b.roomName || ''} - ${b.bedName || ''}`, 110, y)
      doc.text(dayjs(b.plannedJoiningDate).format('DD MMM YYYY'), 150, y)
      doc.text(b.status || '-', 180, y)
      y += 8
    })

    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.text(`Generated on: ${dayjs().format('DD MMM YYYY HH:mm')}`, 20, 285)
    doc.save(`Bookings_${pgName}_${dayjs().format('YYYYMMDD')}.pdf`)
    toast.success('Report exported successfully')
  }

  if (loading && !pgs.length) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <div className="bg-white border-b border-slate-200 pt-2 pb-1 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Bookings"
            subtitle="Manage upcoming residents and availability"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={exportBookingsPDF}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
              >
                <Download size={14} /> Export Report
              </button>
              <CustomDropdown
                label="Property"
                value={pgId}
                options={pgs.map(pg => ({ id: pg.id, label: pg.pgName }))}
                onChange={(val) => navigate(`?pgId=${val}`)}
                icon={Building}
                className="w-64"
              />
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <TopStat label="Active Bookings" value={summary.totalActiveBookings} icon={CalendarDays} />
            <TopStat label="Joining Today" value={summary.joiningToday} icon={Clock} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
            <div className="relative group flex-1 min-w-0">
              <TopStat label="Expiring Soon" value={summary.expiringSoon} icon={AlertCircle} colorClass="text-amber-600" bgClass="bg-amber-50" />
              {summary.expiringSoon > 0 && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white animate-bounce shadow-lg border-2 border-white">
                  {summary.expiringSoon}
                </div>
              )}
            </div>
            <TopStat label="This Month" value={`₹${summary.totalBookingAmountThisMonth}`} icon={IndianRupee} colorClass="text-indigo-600" bgClass="bg-indigo-50" />
          </div>
        )}

        {/* Expiry Notification Banner */}
        {summary?.expiringSoon > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <Bell size={20} className="animate-ring" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Booking Expiry Alert</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  {summary.expiringSoon} booking(s) will expire within the next 48 hours. Please follow up with residents.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setStatusFilter('CONFIRMED')
                setSearchTerm('')
                setSelectedView('summary')
              }}
              className="px-4 py-2 bg-white border border-amber-200 rounded-xl text-[10px] font-black text-amber-600 uppercase tracking-widest hover:bg-amber-100 transition-all shadow-sm"
            >
              Review Now
            </button>
          </motion.div>
        )}

        {/* View Toggle */}
        <div className="flex items-center gap-3 mb-10">
          <button
            onClick={() => setSelectedView('summary')}
            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedView === 'summary' ? 'bg-white border-slate-900 text-indigo-600 shadow-md' : 'bg-slate-100/50 border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setSelectedView('map')}
            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedView === 'map' ? 'bg-white border-slate-900 text-indigo-600 shadow-md' : 'bg-slate-100/50 border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Availability Map
          </button>
        </div>

        {selectedView === 'summary' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Status Breakdown */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm h-fit">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6">Status Breakdown</h3>
                <div className="space-y-3">
                  {summary?.bookingsByStatus && Object.entries(summary.bookingsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <StatusPill status={status} />
                      <span className="text-lg font-black text-slate-900">{count}</span>
                    </div>
                  ))}
                  {!summary?.bookingsByStatus && (
                     <div className="text-center py-6 text-slate-400 text-[10px] font-black uppercase tracking-widest">No data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Bookings</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Recently confirmed residents</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        placeholder="SEARCH..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-40 md:w-56"
                      />
                    </div>
                    <CustomDropdown
                      label="Status"
                      value={statusFilter}
                      options={[
                        { id: 'ALL', label: 'ALL STATUS' },
                        { id: 'CONFIRMED', label: 'CONFIRMED' },
                        { id: 'COMPLETED', label: 'COMPLETED' },
                        { id: 'CANCELLED', label: 'CANCELLED' },
                        { id: 'EXPIRED', label: 'EXPIRED' }
                      ]}
                      onChange={setStatusFilter}
                      icon={Filter}
                      className="w-44"
                    />
                  </div>
                </div>

                <div className="divide-y divide-slate-50">
                  {filteredBookings.length === 0 ? (
                    <div className="p-20 text-center">
                      <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                        <Users size={32} />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 uppercase">No bookings found</h4>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search term</p>
                    </div>
                  ) : (
                    filteredBookings.map((booking) => (
                      <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-lg">
                            {booking.customerName?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-900 uppercase tracking-tight">{booking.customerName}</div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{booking.mobileNumber}</span>
                              <span className="h-1 w-1 bg-slate-200 rounded-full" />
                              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{booking.roomName} • {booking.bedName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8">
                          <div className="hidden md:block text-right">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Joining Date</div>
                            <div className="text-xs font-black text-slate-700">{dayjs(booking.plannedJoiningDate).format('DD MMM YYYY')}</div>
                          </div>

                          <div className="flex items-center gap-4">
                            <StatusPill status={booking.status} />
                            <button
                              onClick={() => handleViewBookingDetails(booking.id)}
                              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Availability Map */
          <div className="space-y-4">
            {availability.map((floor) => (
              <div key={floor.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-0.5 w-4 bg-indigo-600 rounded-full" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    {floor.name?.toString().toUpperCase().startsWith('FLOOR') ? floor.name : `FLOOR ${floor.name}`}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                  {floor.rooms.map((room) => (
                    <div key={room.id} className="bg-slate-50/40 rounded-2xl p-4 border border-slate-100 transition-all hover:bg-slate-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm font-black text-slate-900 uppercase leading-none">{room.name}</div>
                          <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {room.roomType} • {room.sharing} SH
                          </div>
                        </div>
                        <div className={`h-1.5 w-1.5 rounded-full ${room.beds.some(b => !b.isOccupied && !b.isBooked) ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {room.beds.map((bed) => {
                          const isAvailable = !bed.isOccupied && !bed.isBooked
                          return (
                            <button
                              key={bed.id}
                              disabled={bed.isOccupied}
                              onClick={() => {
                                if (isAvailable) {
                                  setSelectedBed({ ...bed, roomId: room.id, roomType: room.roomType, sharing: room.sharing, roomName: room.name, bedId: bed.id })
                                  setShowBookingModal(true)
                                } else if (bed.isBooked) {
                                  toast.info('Bed is already booked until ' + dayjs(bed.bookedTillDate).format('DD MMM'))
                                }
                              }}
                              className={`group relative aspect-[0.9/1] rounded-xl border transition-all flex flex-col items-center justify-center p-1 ${
                                isAvailable
                                  ? 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-sm active:scale-95 cursor-pointer'
                                  : bed.isBooked
                                  ? 'bg-indigo-50 border-indigo-100 cursor-pointer hover:bg-indigo-100'
                                  : 'bg-slate-100/50 border-slate-100 cursor-not-allowed grayscale'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <img
                                  src={isAvailable ? AvailableBedImg : bed.isBooked ? ReservedBedImg : OccupiedBedImg}
                                  alt={bed.name}
                                  className={`h-5 w-auto object-contain transition-transform duration-300 group-hover:scale-110 ${!isAvailable && !bed.isBooked ? 'opacity-30' : 'opacity-100'}`}
                                />
                                <div className="text-[7px] font-black text-slate-900 uppercase tracking-tight leading-none">{bed.name}</div>
                                {isAvailable ? (
                                  <div className="text-[6px] font-black text-emerald-600 uppercase group-hover:text-indigo-600">Select</div>
                                ) : bed.isBooked ? (
                                  <div className="text-[6px] font-black text-indigo-500 uppercase">Booked</div>
                                ) : (
                                  <div className="text-[6px] font-black text-slate-400 uppercase">Full</div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowBookingModal(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">New Booking</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg">
                    {selectedBed?.roomName} • {selectedBed?.name}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <XCircle className="text-slate-300" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      required
                      type="text"
                      value={bookingForm.customerName}
                      onChange={e => setBookingForm({...bookingForm, customerName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      value={bookingForm.mobileNumber}
                      onChange={e => setBookingForm({...bookingForm, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="10 digit number"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <CustomDropdown
                    label="Gender"
                    value={bookingForm.gender}
                    options={[
                      { id: 'MALE', label: 'MALE' },
                      { id: 'FEMALE', label: 'FEMALE' },
                      { id: 'OTHER', label: 'OTHER' }
                    ]}
                    onChange={val => setBookingForm({...bookingForm, gender: val})}
                    className="w-full"
                    icon={User}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Joining Date</label>
                  <input
                    required
                    type="date"
                    min={dayjs().format('YYYY-MM-DD')}
                    value={bookingForm.plannedJoiningDate}
                    onChange={e => setBookingForm({...bookingForm, plannedJoiningDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Booking Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      required
                      type="number"
                      value={bookingForm.bookingAmount}
                      onChange={e => setBookingForm({...bookingForm, bookingAmount: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Advance (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      required
                      type="number"
                      value={bookingForm.expectedTotalAdvance}
                      onChange={e => setBookingForm({...bookingForm, expectedTotalAdvance: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Notes</label>
                <textarea
                  value={bookingForm.notes}
                  onChange={e => setBookingForm({...bookingForm, notes: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[100px] resize-none"
                  placeholder="Any specific requests or arrival details..."
                />
              </div>

              <button
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> CONFIRMING...
                  </div>
                ) : 'CONFIRM BOOKING'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {viewDetails && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setViewDetails(null)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
             <div className="flex flex-col items-center text-center mb-8">
                <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-black mb-4 shadow-inner">
                  {viewDetails.customerName?.charAt(0)}
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{viewDetails.customerName}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <StatusPill status={viewDetails.status} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{viewDetails.id?.slice(-8)}</span>
                </div>
             </div>

             <div className="space-y-4 bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile</span>
                  <span className="text-sm font-bold text-slate-900">{viewDetails.mobileNumber}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation</span>
                  <span className="text-sm font-bold text-slate-900">{viewDetails.roomName} • {viewDetails.bedName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joining Date</span>
                  <span className="text-sm font-bold text-slate-900">{dayjs(viewDetails.plannedJoiningDate).format('DD MMM YYYY')}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Fee</span>
                  <span className="text-sm font-black text-emerald-600">₹{viewDetails.bookingAmount}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires On</span>
                  <span className="text-sm font-bold text-rose-500">{dayjs(viewDetails.bookingExpiryDate).format('DD MMM')}</span>
                </div>
             </div>

             <div className="mt-8 grid grid-cols-2 gap-3">
               <button
                onClick={() => setViewDetails(null)}
                className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
               >
                 Close
               </button>
               {viewDetails.status === 'CONFIRMED' && (
                 <>
                   <button
                    onClick={() => {
                      setBookingToCancel(viewDetails);
                      setShowCancelModal(true);
                      setViewDetails(null);
                    }}
                    className="w-full bg-rose-50 text-rose-600 border border-rose-100 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                   >
                     Cancel Booking
                   </button>
                   <button
                    onClick={() => {
                      setShowCompleteModal(true);
                    }}
                    className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 col-span-2 mt-2"
                   >
                     Complete Booking
                   </button>
                 </>
               )}
             </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showCancelModal}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action will release the bed back to availability."
        confirmText="Confirm Cancellation"
        onConfirm={handleCancelBooking}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* Complete Booking Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowCompleteModal(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Finalize Registration</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Set credentials for the new resident</p>
            </div>

            <form onSubmit={handleCompleteBooking} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    required
                    type="text"
                    value={completeForm.username}
                    onChange={e => setCompleteForm({...completeForm, username: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="resident_username"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    required
                    type="password"
                    value={completeForm.password}
                    onChange={e => setCompleteForm({...completeForm, password: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button
                  disabled={completing}
                  className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {completing ? 'PROCESSING...' : 'COMPLETE & SIGN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowSuccessModal(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-[3rem] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-24 w-24 rounded-[2rem] bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">Booking Success</h3>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">
              The booking has been confirmed successfully. You can now view it in the active bookings list.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
