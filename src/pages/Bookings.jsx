import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO'
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
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  IndianRupee,
  Loader2,
  Building2,
  CalendarDays,
  User,
  Phone,
  Trash2,
  MapPin,
  TrendingUp,
  Download,
  Bell,
  Building,
  Bed as BedIcon,
  X,
  PieChart,
  Sparkles,
  ArrowUpRight,
  UserCheck,
  CreditCard,
  FileText,
  SlidersHorizontal,
  Check
} from 'lucide-react'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import PageHeader from '../components/PageHeader'
import ConfirmModal from '../components/ConfirmModal'
import CustomDropdown from '../components/CustomDropdown'
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

/* =====================================================
   ANIMATION VARIANTS
===================================================== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

/* =====================================================
   SUB-COMPONENTS
===================================================== */
function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50', isAccent = false, subtitle }) {
  if (isAccent) {
    colorClass = 'text-white'
    bgClass = 'bg-indigo-600'
  }
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-all cursor-default flex-1 min-w-0 group">
      <div className="min-w-0">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate mb-1">{label}</div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight truncate">{value}</div>
        {subtitle && (
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 truncate">
            {subtitle}
          </div>
        )}
      </div>
      <div className={`h-12 w-12 rounded-2xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
        {React.isValidElement(Icon) ? Icon : <Icon className="w-5 h-5 stroke-[2.5]" />}
      </div>
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
    <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${styles[status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
      {status}
    </span>
  )
}

/* =====================================================
   MAIN BOOKINGS COMPONENT
===================================================== */
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
        setPgs(pgsData || [])
        if (!pgId && pgsData && pgsData.length > 0) {
          navigate(`?pgId=${pgsData[0].id}`, { replace: true })
        }
      } catch (err) {
        toast.error('Failed to load PG properties')
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
      setAvailability(avail || [])
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
        bookingAmount: parseFloat(bookingForm.bookingAmount) || 0,
        expectedTotalAdvance: parseFloat(bookingForm.expectedTotalAdvance) || 0
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
      toast.success('Booking cancelled successfully')
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
      const matchesSearch =
        (b.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.mobileNumber || '').includes(searchTerm) ||
        (b.roomName || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [bookingsList, searchTerm, statusFilter])

  const totalBookingsCount = bookingsList.length || 1

  const exportBookingsPDF = () => {
    const doc = new jsPDF()
    const pgName = pgs.find(p => p.id === pgId)?.pgName || 'All PGs'

    // Header
    doc.setFillColor(15, 23, 42) // slate-900
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.text('MANAGE MY PG', 20, 20)
    doc.setFontSize(9)
    doc.text(`BOOKINGS REPORT - ${pgName.toUpperCase()}`, 20, 30)

    doc.setTextColor(15, 23, 42)
    doc.setFontSize(11)
    doc.text('ACTIVE BOOKINGS SUMMARY', 20, 55)
    doc.setDrawColor(226, 232, 240)
    doc.line(20, 60, 190, 60)

    let y = 70
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('Customer Name', 20, y)
    doc.text('Mobile', 70, y)
    doc.text('Room/Bed', 110, y)
    doc.text('Joining Date', 150, y)
    doc.text('Status', 180, y)
    y += 8

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
    toast.success('Bookings report PDF generated')
  }

  if (loading && !pgs.length) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Bookings Hub...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SEO
        title="Bookings Management - Resident Reservations"
        description="Track and manage PG bookings, bed availability maps, and upcoming resident joining dates."
      />

      {/* HEADER BAR WITH PROPERTY SELECTOR & PDF ACTION */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <CalendarDays size={14} />
                <span>Reservations Hub</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Bookings Management
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportBookingsPDF}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm active:scale-95"
              >
                <Download size={15} /> Export PDF
              </button>

              <CustomDropdown
                label="Property Unit"
                value={pgId}
                options={pgs.map(pg => ({ id: pg.id, label: pg.pgName }))}
                onChange={(val) => navigate(`?pgId=${val}`)}
                icon={Building}
                className="w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* TOP EXECUTIVE METRICS GRID */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <TopStat
              label="Active Reservations"
              value={summary.totalActiveBookings || 0}
              icon={CalendarDays}
              subtitle="Confirmed Bookings"
            />
            <TopStat
              label="Check-ins Today"
              value={summary.joiningToday || 0}
              icon={Clock}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
              subtitle="Joining Resident(s)"
            />
            <div className="relative group flex-1 min-w-0">
              <TopStat
                label="Expiring Soon"
                value={summary.expiringSoon || 0}
                icon={AlertCircle}
                colorClass="text-amber-600"
                bgClass="bg-amber-50"
                subtitle="Within 48 Hours"
              />
              {summary.expiringSoon > 0 && (
                <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white animate-bounce shadow-md border-2 border-white">
                  {summary.expiringSoon}
                </div>
              )}
            </div>
            <TopStat
              label="Monthly Booking Revenue"
              value={`₹${(summary.totalBookingAmountThisMonth || 0).toLocaleString()}`}
              icon={IndianRupee}
              colorClass="text-indigo-600"
              bgClass="bg-indigo-50"
              subtitle="Token Fees Collected"
            />
          </div>
        )}

        {/* 48-HOUR EXPIRING RESERVATION WARNING BANNER */}
        {summary?.expiringSoon > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                <Bell size={20} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Expiring Reservations Alert</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  {summary.expiringSoon} reservation(s) will expire in less than 48 hours. Follow up to finalize admission.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setStatusFilter('CONFIRMED')
                setSearchTerm('')
                setSelectedView('summary')
              }}
              className="px-4 py-2 bg-white border border-amber-200 rounded-xl text-[10px] font-black text-amber-700 uppercase tracking-widest hover:bg-amber-100 transition-all shadow-2xs whitespace-nowrap self-start sm:self-auto"
            >
              Review Pending
            </button>
          </motion.div>
        )}

        {/* VIEW SELECTOR & SEARCH TOOLBAR */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setSelectedView('summary')}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedView === 'summary'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Bookings Dashboard
            </button>
            <button
              onClick={() => setSelectedView('map')}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedView === 'map'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Bed Availability Map
            </button>
          </div>

          {selectedView === 'summary' && (
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer, mobile or room..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              <CustomDropdown
                label="Status Filter"
                value={statusFilter}
                options={[
                  { id: 'ALL', label: 'ALL' },
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
          )}
        </div>

        {/* VIEW 1: DASHBOARD SUMMARY VIEW */}
        {selectedView === 'summary' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT PANEL: STATUS BREAKDOWN & RATIO BARS */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <PieChart size={16} className="text-indigo-600" /> Reservation Breakdown
                </h3>

                <div className="space-y-3.5">
                  {summary?.bookingsByStatus && Object.entries(summary.bookingsByStatus).map(([status, count]) => {
                    const pct = Math.round(((count || 0) / totalBookingsCount) * 100)
                    return (
                      <div key={status} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <StatusPill status={status} />
                          <span className="text-sm font-black text-slate-900">{count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              status === 'CONFIRMED' ? 'bg-emerald-500' :
                              status === 'COMPLETED' ? 'bg-indigo-600' :
                              status === 'EXPIRED' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(8, pct))}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}

                  {!summary?.bookingsByStatus && (
                    <div className="text-center py-6 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      No status breakdown data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: RESERVATIONS LIST */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Reservations</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Verified resident bookings list</p>
                  </div>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase tracking-widest">
                    {filteredBookings.length} Result(s)
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                    <div className="p-16 text-center">
                      <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-3 border border-slate-100">
                        <Users size={32} />
                      </div>
                      <h4 className="text-xs font-black text-slate-900 uppercase">No reservations found</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Try adjusting search or status filters</p>
                    </div>
                  ) : (
                    filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        onClick={() => handleViewBookingDetails(booking.id)}
                        className="p-5 flex items-center justify-between hover:bg-indigo-50/40 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-11 w-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-base border border-indigo-100 shrink-0 group-hover:scale-105 transition-transform">
                            {booking.customerName?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors">{booking.customerName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{booking.mobileNumber}</span>
                              <span className="h-1 w-1 bg-slate-300 rounded-full" />
                              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest truncate">{booking.roomName} • {booking.bedName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0">
                          <div className="hidden md:block text-right">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Joining Date</span>
                            <span className="text-xs font-black text-slate-800">{dayjs(booking.plannedJoiningDate).format('DD MMM YYYY')}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <StatusPill status={booking.status} />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewBookingDetails(booking.id)
                              }}
                              className="p-2 text-slate-400 group-hover:text-indigo-600 transition-colors rounded-lg group-hover:bg-indigo-50"
                            >
                              <ChevronRight size={18} />
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

          /* VIEW 2: INTERACTIVE BED AVAILABILITY MAP */
          <div className="space-y-6">
            {availability.map((floor) => (
              <div key={floor.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-1 w-5 bg-indigo-600 rounded-full" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    {floor.name?.toString().toUpperCase().startsWith('FLOOR') ? floor.name : `FLOOR ${floor.name}`}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {floor.rooms.map((room) => (
                    <div key={room.id} className="bg-slate-50/60 rounded-xl p-4 border border-slate-100 transition-all hover:bg-white hover:border-slate-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-xs font-black text-slate-900 uppercase leading-none">{room.name}</div>
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {room.roomType} • {room.sharing} Sharing
                          </div>
                        </div>
                        <div className={`h-2 w-2 rounded-full ${room.beds.some(b => !b.isOccupied && !b.isBooked) ? 'bg-emerald-500' : 'bg-rose-500'}`} />
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
                                  toast.info('Bed is booked until ' + dayjs(bed.bookedTillDate).format('DD MMM'))
                                }
                              }}
                              className={`group relative rounded-xl border transition-all flex flex-col items-center justify-center p-2 text-center ${
                                isAvailable
                                  ? 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-sm active:scale-95 cursor-pointer'
                                  : bed.isBooked
                                  ? 'bg-indigo-50 border-indigo-100 cursor-pointer hover:bg-indigo-100'
                                  : 'bg-slate-100/50 border-slate-100 cursor-not-allowed grayscale'
                              }`}
                            >
                              <img
                                src={isAvailable ? AvailableBedImg : bed.isBooked ? ReservedBedImg : OccupiedBedImg}
                                alt={bed.name}
                                className={`h-6 w-auto object-contain transition-transform duration-300 group-hover:scale-110 mb-1 ${!isAvailable && !bed.isBooked ? 'opacity-30' : 'opacity-100'}`}
                              />
                              <span className="text-[8px] font-black text-slate-900 uppercase tracking-tight leading-none block">{bed.name}</span>
                              <span className={`text-[7px] font-black uppercase mt-1 block ${
                                isAvailable ? 'text-emerald-600 group-hover:text-indigo-600' : bed.isBooked ? 'text-indigo-600' : 'text-slate-400'
                              }`}>
                                {isAvailable ? 'Reserve' : bed.isBooked ? 'Booked' : 'Occupied'}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {availability.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center">
                <Building2 size={36} className="text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-black text-slate-900 uppercase">No floor layout found</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure floors and beds in property details</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: NEW BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setShowBookingModal(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] border border-slate-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Create Resident Booking</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    {selectedBed?.roomName} • {selectedBed?.name}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      required
                      type="text"
                      value={bookingForm.customerName}
                      onChange={e => setBookingForm({...bookingForm, customerName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      placeholder="Full Name"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      value={bookingForm.mobileNumber}
                      onChange={e => setBookingForm({...bookingForm, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      placeholder="10-digit phone"
                    />
                  </div>
                </div>
                <div>
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
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Planned Joining Date *</label>
                  <input
                    required
                    type="date"
                    min={dayjs().format('YYYY-MM-DD')}
                    value={bookingForm.plannedJoiningDate}
                    onChange={e => setBookingForm({...bookingForm, plannedJoiningDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Token Booking Amount (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      required
                      type="number"
                      value={bookingForm.bookingAmount}
                      onChange={e => setBookingForm({...bookingForm, bookingAmount: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Advance (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      required
                      type="number"
                      value={bookingForm.expectedTotalAdvance}
                      onChange={e => setBookingForm({...bookingForm, expectedTotalAdvance: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Instructions / Notes</label>
                <textarea
                  value={bookingForm.notes}
                  onChange={e => setBookingForm({...bookingForm, notes: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[80px] resize-none"
                  placeholder="Notes regarding arrival time or special requests..."
                />
              </div>

              <button
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: BOOKING DETAILS SLIDE-OVER */}
      <AnimatePresence>
        {viewDetails && (
          <div className="fixed inset-0 z-[110] overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewDetails(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
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
                    <div className="h-11 w-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-xs border border-indigo-500/30">
                      {viewDetails.customerName?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">
                          {viewDetails.customerName}
                        </h3>
                        <StatusPill status={viewDetails.status} />
                      </div>
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-0.5 truncate">
                        Booking ID #{viewDetails.id?.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewDetails(null)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
                    title="Close Drawer"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Drawer Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/40">
                  
                  {/* RESIDENT & CONTACT INFORMATION */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-2.5 flex items-center gap-2">
                      <User size={15} className="text-indigo-600" /> Resident Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-900">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Full Name</span>
                        <span className="text-slate-800">{viewDetails.customerName}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Mobile Number</span>
                        <span className="text-slate-800">{viewDetails.mobileNumber}</span>
                      </div>
                      {viewDetails.gender && (
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Gender</span>
                          <span className="text-slate-800">{viewDetails.gender}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ROOM ALLOCATION & DATES */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-2.5 flex items-center gap-2">
                      <Building2 size={15} className="text-indigo-600" /> Allocation & Stay
                    </h4>
                    <div className="space-y-2.5 text-xs font-bold text-slate-900">
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assigned Room & Bed</span>
                        <span className="text-indigo-600 font-black">{viewDetails.roomName} • {viewDetails.bedName}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Planned Joining Date</span>
                        <span className="text-slate-800">{dayjs(viewDetails.plannedJoiningDate).format('DD MMM YYYY')}</span>
                      </div>
                      {viewDetails.bookingExpiryDate && (
                        <div className="flex items-center justify-between py-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reservation Expiry Date</span>
                          <span className="text-rose-500 font-black">{dayjs(viewDetails.bookingExpiryDate).format('DD MMM YYYY')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FINANCIAL SUMMARY */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-2.5 flex items-center gap-2">
                      <IndianRupee size={15} className="text-indigo-600" /> Payment & Advance
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                      <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">Token Paid</span>
                        <span className="text-base font-black text-emerald-700">₹{viewDetails.bookingAmount || 0}</span>
                      </div>
                      <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                        <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest block mb-0.5">Expected Advance</span>
                        <span className="text-base font-black text-indigo-700">₹{viewDetails.expectedTotalAdvance || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* SPECIAL INSTRUCTIONS / NOTES */}
                  {viewDetails.notes && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-2 flex items-center gap-2">
                        <FileText size={15} className="text-indigo-600" /> Special Instructions / Notes
                      </h4>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{viewDetails.notes}"
                      </p>
                    </div>
                  )}

                </div>

                {/* Drawer Fixed Footer Bar */}
                <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 flex flex-col gap-2 shadow-lg">
                  {viewDetails.status === 'CONFIRMED' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setBookingToCancel(viewDetails)
                          setShowCancelModal(true)
                          setViewDetails(null)
                        }}
                        className="w-full bg-rose-50 text-rose-600 border border-rose-100 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95 cursor-pointer text-center"
                      >
                        Cancel Booking
                      </button>
                      <button
                        onClick={() => setShowCompleteModal(true)}
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95 cursor-pointer text-center"
                      >
                        Finalize Resident
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setViewDetails(null)}
                    className="w-full bg-slate-100 text-slate-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 cursor-pointer text-center"
                  >
                    Close Drawer
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM CANCELLATION MODAL */}
      <ConfirmModal
        open={showCancelModal}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this booking? This will release the bed back to availability map."
        confirmText="Confirm Cancellation"
        onConfirm={handleCancelBooking}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* MODAL 3: COMPLETE BOOKING / RESIDENT LOGIN */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setShowCompleteModal(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="text-center mb-5">
              <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Finalize Registration</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Create login credentials for new resident</p>
            </div>

            <form onSubmit={handleCompleteBooking} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Username *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    required
                    type="text"
                    value={completeForm.username}
                    onChange={e => setCompleteForm({...completeForm, username: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    placeholder="resident_username"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password *</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    required
                    type="password"
                    value={completeForm.password}
                    onChange={e => setCompleteForm({...completeForm, password: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
                <button
                  disabled={completing}
                  className="flex-[2] bg-emerald-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {completing ? <Loader2 size={15} className="animate-spin" /> : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-md" onClick={() => setShowSuccessModal(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl p-8 text-center shadow-2xl border border-slate-200">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1 uppercase">Booking Confirmed</h3>
            <p className="text-slate-500 font-medium mb-6 text-xs leading-relaxed">
              The booking has been successfully recorded. You can view and manage it in the active reservations list.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
