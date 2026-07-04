import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IndianRupee,
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Download,
  Loader2,
  ChevronDown,
  Users,
  RefreshCw,
  Calendar,
  Building
} from 'lucide-react'
import { getAllPgs, getPgRentStatus } from '../api/ownerAuth'
import toast from 'react-hot-toast'

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

const TenantAvatar = ({ name, profileImageUrl, size = "w-11 h-11", fontSize = "text-sm" }) => {
  const [imageError, setImageError] = useState(false)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.managemypg.com/managemypg'

  const fullImageUrl = profileImageUrl
    ? (profileImageUrl.startsWith('http') ? profileImageUrl : `${API_BASE_URL.replace(/\/$/, '')}/${profileImageUrl.replace(/^\//, '')}`)
    : null

  const initials = name
    ? name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?'

  const avatarColors = [
    'bg-orange-500', 'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-cyan-500'
  ]
  const avatarBg = avatarColors[Math.abs(name?.length || 0) % avatarColors.length]

  return (
    <div className={`${size} rounded-2xl flex items-center justify-center text-white font-black ${fontSize} shadow-inner shrink-0 overflow-hidden relative ${avatarBg}`}>
      {fullImageUrl && !imageError ? (
        <img
          src={fullImageUrl}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

export default function ManageRents() {
  const navigate = useNavigate()
  const [pgs, setPgs] = useState([])
  const [selectedPg, setSelectedPg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rentData, setRentData] = useState([])
  const [filter, setFilter] = useState('ALL') // ALL, PAID, PARTIALLY_PAID, PENDING, OVERDUE

  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ]

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i)

  useEffect(() => {
    loadPgs()
  }, [])

  const loadPgs = async () => {
    try {
      const data = await getAllPgs()
      setPgs(data || [])
      if (data && data.length > 0) {
        setSelectedPg(data[0])
      }
    } catch (err) {
      toast.error('Failed to load properties')
    }
  }

  useEffect(() => {
    if (selectedPg) {
      fetchRentStatus()
    }
  }, [selectedPg, month, year])

  const fetchRentStatus = async () => {
    setLoading(true)
    try {
      const res = await getPgRentStatus(selectedPg.id, month, year)
      setRentData(res.data || [])
    } catch (err) {
      toast.error('Failed to fetch rent details')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    if (filter === 'ALL') return rentData
    return rentData.filter(item => item.paymentStatus === filter)
  }, [rentData, filter])

  const stats = useMemo(() => {
    const totalRent = rentData.reduce((acc, curr) => acc + (curr.monthlyRent || 0), 0)
    const totalPaid = rentData.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0)
    const totalPending = rentData.reduce((acc, curr) => acc + (curr.pendingAmount || 0), 0)
    const collectionPercent = totalRent > 0 ? Math.round((totalPaid / totalRent) * 100) : 0

    return { totalRent, totalPaid, totalPending, collectionPercent }
  }, [rentData])

  const statusCounts = useMemo(() => ({
    ALL: rentData.length,
    PAID: rentData.filter(i => i.paymentStatus === 'PAID').length,
    PARTIALLY_PAID: rentData.filter(i => i.paymentStatus === 'PARTIALLY_PAID').length,
    PENDING: rentData.filter(i => i.paymentStatus === 'PENDING').length,
    OVERDUE: rentData.filter(i => i.paymentStatus === 'OVERDUE').length,
  }), [rentData])

  const handleExport = () => {
    if (filteredData.length === 0) {
      toast.error('No data to export')
      return
    }

    const headers = ['Tenant Name', 'Bed Details', 'Monthly Rent', 'Paid Amount', 'Pending Amount', 'Status', 'Payment Date', 'Payment Mode']
    const csvData = filteredData.map(item => [
      item.tenantName,
      item.bedDetails,
      item.monthlyRent,
      item.paidAmount,
      item.pendingAmount,
      item.paymentStatus,
      item.paymentDate || 'N/A',
      item.paymentMode || 'N/A'
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rent_report_${selectedPg?.pgName || 'property'}_${month}_${year}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Report exported as CSV')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header & Controls */}
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-6">
            <div className="space-y-1 text-center lg:text-left">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Rent Management</h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-60">Revenue & Collections Overview</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
              <TopStat
                label="Expected"
                value={`₹${stats.totalRent.toLocaleString()}`}
                icon={IndianRupee}
              />
              <TopStat
                label="Collected"
                value={`₹${stats.totalPaid.toLocaleString()}`}
                icon={CheckCircle2}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
                percentage={`${stats.collectionPercent}%`}
              />
              <TopStat
                label="Outstandings"
                value={`₹${stats.totalPending.toLocaleString()}`}
                icon={Clock}
                colorClass="text-rose-600"
                bgClass="bg-rose-50"
              />
              <TopStat
                label="Collection %"
                value={`${stats.collectionPercent}%`}
                icon={TrendingUp}
                colorClass="text-amber-600"
                bgClass="bg-amber-50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex flex-col gap-8">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* PG Selector */}
              <CustomDropdown
                label="Property"
                value={selectedPg?.id || ''}
                options={pgs.map(pg => ({ id: pg.id, label: pg.pgName }))}
                onChange={(val) => setSelectedPg(pgs.find(p => p.id === val))}
                icon={Building2}
                className="w-full"
              />

              {/* Month Selector */}
              <CustomDropdown
                label="Month"
                value={month}
                options={months}
                onChange={setMonth}
                icon={Calendar}
                className="w-full"
              />

              <CustomDropdown
                label="Year"
                value={year}
                options={years.map(y => ({ id: y, label: y.toString() }))}
                onChange={setYear}
                icon={Clock}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-8 sm:mx-0 sm:px-2 flex-1 py-1.5">
              <FilterTab
                label="All"
                count={statusCounts.ALL}
                active={filter === 'ALL'}
                onClick={() => setFilter('ALL')}
              />
              <FilterTab
                label="Paid"
                count={statusCounts.PAID}
                active={filter === 'PAID'}
                onClick={() => setFilter('PAID')}
                color="emerald"
              />
              <FilterTab
                label="Partial"
                count={statusCounts.PARTIALLY_PAID}
                active={filter === 'PARTIALLY_PAID'}
                onClick={() => setFilter('PARTIALLY_PAID')}
                color="amber"
              />
              <FilterTab
                label="Pending"
                count={statusCounts.PENDING}
                active={filter === 'PENDING'}
                onClick={() => setFilter('PENDING')}
                color="slate"
              />
              <FilterTab
                label="Overdue"
                count={statusCounts.OVERDUE}
                active={filter === 'OVERDUE'}
                onClick={() => setFilter('OVERDUE')}
                color="rose"
              />
            </div>

            <div className="flex items-center h-full">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-100 shrink-0"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          {/* Results Section */}
          {loading ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-20 flex flex-col items-center justify-center shadow-sm">
              <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Syncing Data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-20 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No records found</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">There are no rent records matching the current filters for {months.find(m => m.value === month).label} {year}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest">Tenant</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Rent</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Paid</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Balance</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest">Payment Info</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-300 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      <AnimatePresence mode='popLayout'>
                        {filteredData.map((item) => (
                          <RentTableRow key={item.id} item={item} navigate={navigate} />
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                <AnimatePresence mode='popLayout'>
                  {filteredData.map((item) => (
                    <RentMobileCard key={item.id} item={item} navigate={navigate} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50', percentage }) {
  return (
    <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md hover:scale-[1.02] transition-all cursor-default flex-1 min-w-0">
      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
          {percentage && (
            <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${bgClass} ${colorClass}`}>
              {percentage}
            </span>
          )}
        </div>
        <p className="text-base sm:text-xl font-black text-slate-900 leading-tight truncate">{value}</p>
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

const RentMobileCard = React.forwardRef(({ item, navigate }, ref) => {
  const statusConfig = {
    PAID: { label: 'Settled', color: 'emerald', icon: <CheckCircle2 size={12} /> },
    PARTIALLY_PAID: { label: 'Partial', color: 'amber', icon: <AlertCircle size={12} /> },
    PENDING: { label: 'Pending', color: 'slate', icon: <Clock size={12} /> },
    OVERDUE: { label: 'Overdue', color: 'rose', icon: <AlertCircle size={12} /> }
  }

  const { label, color, icon } = statusConfig[item.paymentStatus] || statusConfig.PENDING

  const bgColors = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  }

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => navigate(`/tenant/${item.tenantId}`)}
      className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm active:scale-[0.98] transition-all hover:shadow-lg duration-300"
    >
      <div className="flex items-start gap-4 mb-6">
        <TenantAvatar
          name={item.tenantName}
          profileImageUrl={item.profileImageUrl}
          size="w-14 h-14"
          fontSize="text-lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight truncate">{item.tenantName}</h4>
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shrink-0 ${bgColors[color]}`}>
              {icon} {label}
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
            <Building2 size={12} className="text-indigo-500" /> {item.bedDetails}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-5 border-y border-slate-50">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rent</p>
          <p className="text-base font-black text-slate-900 tracking-tight">₹{item.monthlyRent?.toLocaleString()}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Paid</p>
          <p className="text-base font-black text-emerald-600 tracking-tight">₹{item.paidAmount?.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Balance</p>
          <p className={`text-base font-black tracking-tight ${item.pendingAmount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            ₹{item.pendingAmount?.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Transaction</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-900 uppercase">{formatDate(item.paymentDate)}</span>
            <span className="text-[10px] text-slate-200">•</span>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{item.paymentMode || 'N/A'}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
          <ArrowRight size={16} />
        </div>
      </div>
    </motion.div>
  )
})

function FilterTab({ label, count, active, onClick, color = 'indigo' }) {
  const colorStyles = {
    indigo: active ? 'bg-indigo-600 text-white shadow-indigo-100' : 'text-slate-500 hover:bg-slate-100',
    emerald: active ? 'bg-emerald-500 text-white shadow-emerald-100' : 'text-slate-500 hover:bg-emerald-50',
    amber: active ? 'bg-amber-500 text-white shadow-amber-100' : 'text-slate-500 hover:bg-amber-50',
    rose: active ? 'bg-rose-500 text-white shadow-rose-100' : 'text-slate-500 hover:bg-rose-50',
    slate: active ? 'bg-slate-700 text-white shadow-slate-100' : 'text-slate-500 hover:bg-slate-100',
  }

  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 border ${active ? 'border-transparent shadow-lg scale-105' : 'border-slate-100 bg-white'} ${colorStyles[color]}`}
    >
      {label}
      <span className={`px-1.5 py-0.5 rounded-lg text-[9px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
        {count}
      </span>
    </button>
  )
}

const RentTableRow = React.forwardRef(({ item, navigate }, ref) => {
  const statusConfig = {
    PAID: { label: 'Settled', color: 'emerald', icon: <CheckCircle2 size={12} /> },
    PARTIALLY_PAID: { label: 'Partial', color: 'amber', icon: <AlertCircle size={12} /> },
    PENDING: { label: 'Pending', color: 'slate', icon: <Clock size={12} /> },
    OVERDUE: { label: 'Overdue', color: 'rose', icon: <AlertCircle size={12} /> }
  }

  const { label, color, icon } = statusConfig[item.paymentStatus] || statusConfig.PENDING

  const bgColors = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  }

  return (
    <motion.tr
      ref={ref}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
      onClick={() => navigate(`/tenant/${item.tenantId}`)}
    >
      <td className="px-8 py-5 whitespace-nowrap">
        <div className="flex items-center gap-4 text-left">
          <TenantAvatar
            name={item.tenantName}
            profileImageUrl={item.profileImageUrl}
          />
          <div>
            <h4 className="font-black text-slate-900 text-sm tracking-tight leading-none uppercase">{item.tenantName}</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <Building2 size={11} className="text-indigo-500" /> {item.bedDetails}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-5 text-center whitespace-nowrap">
        <span className="text-sm font-black text-slate-900 uppercase">₹{item.monthlyRent?.toLocaleString()}</span>
      </td>
      <td className="px-6 py-5 text-center whitespace-nowrap">
        <span className="text-sm font-black text-emerald-600 uppercase">₹{item.paidAmount?.toLocaleString()}</span>
      </td>
      <td className="px-6 py-5 text-center whitespace-nowrap">
        <span className={`text-sm font-black uppercase ${item.pendingAmount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
          ₹{item.pendingAmount?.toLocaleString()}
        </span>
      </td>
      <td className="px-6 py-5 text-center whitespace-nowrap">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${bgColors[color]}`}>
          {icon} {label}
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-black text-slate-900 uppercase">{formatDate(item.paymentDate)}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.paymentMode || 'N/A'}</span>
        </div>
      </td>
      <td className="px-8 py-5 text-right whitespace-nowrap">
        <div
          className="inline-flex p-2.5 bg-white text-slate-400 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all border border-slate-200 group-hover:border-slate-900 shadow-sm"
        >
          <ArrowRight size={14} />
        </div>
      </td>
    </motion.tr>
  )
})
