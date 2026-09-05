import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppScope } from '../context/AppScopeContext'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO'
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
  Users,
  RefreshCw,
  Calendar,
  Building,
  Search,
  Filter,
  X,
  LayoutGrid,
  List,
  ChevronRight,
  Sparkles,
  PieChart,
  CreditCard,
  Check
} from 'lucide-react'
import { getAllPgs, getPgRentStatus, getAllTenants, getTenantDetails } from '../api/ownerAuth'
import toast from 'react-hot-toast'
import CustomDropdown from '../components/CustomDropdown'

/* =====================================================
   HELPER FUNCTIONS
===================================================== */
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.71 1.454h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
  </svg>
)

const TenantAvatar = ({ name, profileImageUrl, size = "w-11 h-11", fontSize = "text-sm" }) => {
  const [imageError, setImageError] = useState(false)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.managemypg.com/managemypg'

  useEffect(() => {
    setImageError(false)
  }, [profileImageUrl])

  const fullImageUrl = profileImageUrl
    ? (profileImageUrl.startsWith('http') ? profileImageUrl : `${API_BASE_URL.replace(/\/$/, '')}/${profileImageUrl.replace(/^\//, '')}`)
    : null

  const initials = name
    ? name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?'

  return (
    <div className={`${size} rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black ${fontSize} shadow-inner shrink-0 overflow-hidden relative border border-indigo-500`}>
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

function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50', percentage, progress }) {
  return (
    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all cursor-default w-full min-w-0">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0`}>
          {React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4 stroke-[2.2]" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">{label}</span>
            {percentage && (
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${bgClass} ${colorClass}`}>
                {percentage}
              </span>
            )}
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">{value}</div>
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-2.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass.includes('emerald') ? 'bg-emerald-500' : colorClass.includes('amber') ? 'bg-amber-500' : 'bg-indigo-600'} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  )
}

function FilterTab({ label, count, active, onClick, color = 'indigo' }) {
  const colorStyles = {
    indigo: active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100',
    emerald: active ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-emerald-50',
    amber: active ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:bg-amber-50',
    rose: active ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:bg-rose-50',
    slate: active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100',
  }

  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 border ${active ? 'border-transparent shadow-sm' : 'border-slate-200/80 bg-white'} ${colorStyles[color]}`}
    >
      {label}
      <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
        {count}
      </span>
    </button>
  )
}

/* =====================================================
   MAIN MANAGE RENTS COMPONENT
===================================================== */
export default function ManageRents() {
  const navigate = useNavigate()
  const { activePgId, setActivePgId, setActiveTenantId } = useAppScope()
  const [pgs, setPgs] = useState([])
  const [selectedPg, setSelectedPg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [rentData, setRentData] = useState([])
  const [filter, setFilter] = useState('ALL') // ALL, PAID, PARTIALLY_PAID, PENDING, OVERDUE
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'

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
        const found = data.find(p => p.id === activePgId)
        const target = found || data[0]
        setSelectedPg(target)
        if (!activePgId || activePgId !== target.id) {
          setActivePgId(target.id)
        }
      }
    } catch (err) {
      toast.error('Failed to load properties')
    }
  }

  const [tenantPhoneMap, setTenantPhoneMap] = useState({})

  useEffect(() => {
    if (selectedPg) {
      fetchRentStatus()
      fetchTenantPhoneMap()
    }
  }, [selectedPg, month, year])

  const fetchTenantPhoneMap = async () => {
    if (!selectedPg?.id) return
    try {
      const tenants = await getAllTenants(selectedPg.id)
      const map = {}
      if (Array.isArray(tenants)) {
        tenants.forEach(t => {
          if (t.id && t.mobileNumber) map[t.id] = t.mobileNumber
          if (t.name && t.mobileNumber) map[t.name.toLowerCase().trim()] = t.mobileNumber
        })
      }
      setTenantPhoneMap(map)
    } catch (err) {
      console.error('Failed to fetch tenants for phone lookup', err)
    }
  }

  const fetchRentStatus = async () => {
    setLoading(true)
    try {
      const res = await getPgRentStatus(selectedPg.id, month, year)
      const data = Array.isArray(res) ? res : (res?.data || [])
      setRentData(data)
    } catch (err) {
      toast.error('Failed to fetch rent details')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    return rentData.filter(item => {
      const matchesStatus = filter === 'ALL' || item.paymentStatus === filter
      if (!matchesStatus) return false

      if (!searchQuery.trim()) return true

      const q = searchQuery.toLowerCase()
      return (
        (item.tenantName || '').toLowerCase().includes(q) ||
        (item.bedDetails || '').toLowerCase().includes(q) ||
        (item.paymentStatus || '').toLowerCase().includes(q)
      )
    })
  }, [rentData, filter, searchQuery])

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

  const handleSendWhatsAppReminder = async (e, item) => {
    e.stopPropagation()

    let rawPhone = item.mobileNumber || item.phone || item.mobile || item.contactNumber || item.tenantMobile || item.tenantPhone || ''

    const tenantId = item.id || item.tenantId
    if (!rawPhone && tenantId) {
      rawPhone = tenantPhoneMap[tenantId] || (item.tenantName ? tenantPhoneMap[item.tenantName.toLowerCase().trim()] : '')
    }

    if (!rawPhone && tenantId) {
      try {
        const tenantDetails = await getTenantDetails(tenantId)
        if (tenantDetails && (tenantDetails.mobileNumber || tenantDetails.phone)) {
          rawPhone = tenantDetails.mobileNumber || tenantDetails.phone
        }
      } catch (err) {
        console.error('Could not fetch tenant phone details', err)
      }
    }

    let cleanedPhone = rawPhone ? String(rawPhone).replace(/\D/g, '') : ''
    if (cleanedPhone.length === 10) {
      cleanedPhone = '91' + cleanedPhone
    }

    const tenantName = item.tenantName || 'Tenant'
    const propertyName = selectedPg?.pgName || 'our PG'
    const monthName = months.find(m => m.value === month)?.label || ''
    const monthlyRent = item.monthlyRent ? `₹${item.monthlyRent.toLocaleString()}` : '₹0'
    const paidAmount = item.paidAmount ? `₹${item.paidAmount.toLocaleString()}` : '₹0'
    const pendingAmount = item.pendingAmount ? `₹${item.pendingAmount.toLocaleString()}` : '₹0'

    const message = `Hi ${tenantName},\n\nThis is a gentle reminder regarding your rent payment for *${propertyName}* for *${monthName} ${year}*.\n\n` +
      `• *Bed Details*: ${item.bedDetails || 'N/A'}\n` +
      `• *Monthly Rent*: ${monthlyRent}\n` +
      `• *Paid Amount*: ${paidAmount}\n` +
      `• *Outstanding Balance*: ${pendingAmount}\n\n` +
      `Kindly clear the pending balance at your earliest convenience. If you have already made the payment, please ignore this message or share the receipt.\n\nThank you!`

    if (!cleanedPhone) {
      toast.error(`Phone number not found for ${tenantName}`)
      const fallbackUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(fallbackUrl, '_blank')
      return
    }

    const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SEO
        title="Rent Management - Revenue & Rent Collections"
        description="Monitor PG revenue, track rent collections, manage pending balances, and export financial reports."
      />

      {/* STICKY HEADER & EXECUTIVE REVENUE METRICS */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="shrink-0">
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <CreditCard size={14} />
                <span>Financial Collections</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 whitespace-nowrap">
                Rent Management Hub
              </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
              <TopStat
                label="Expected Rent"
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
                progress={stats.collectionPercent}
              />
              <TopStat
                label="Outstandings"
                value={`₹${stats.totalPending.toLocaleString()}`}
                icon={Clock}
                colorClass="text-rose-600"
                bgClass="bg-rose-50"
              />
              <TopStat
                label="Collection Rate"
                value={`${stats.collectionPercent}%`}
                icon={TrendingUp}
                colorClass="text-amber-600"
                bgClass="bg-amber-50"
                progress={stats.collectionPercent}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* CONTROLS TOOLBAR: SELECTORS, SEARCH, FILTERS & VIEW MODE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* PG Selector */}
            <CustomDropdown
              label="Property Scope"
              value={selectedPg?.id || ''}
              options={pgs.map(pg => ({ id: pg.id, label: pg.pgName }))}
              onChange={(val) => {
                const found = pgs.find(p => p.id === val)
                setSelectedPg(found)
                if (val) setActivePgId(val)
              }}
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

            {/* Year Selector */}
            <CustomDropdown
              label="Year"
              value={year}
              options={years.map(y => ({ id: y, label: y.toString() }))}
              onChange={setYear}
              icon={Clock}
              className="w-full"
            />

            {/* Search Input */}
            <div className="relative w-full">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tenant or bed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
            {/* STATUS FILTER PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
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

            {/* ACTION BUTTONS & VIEW MODE TOGGLE */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm active:scale-95"
              >
                <Download size={14} /> Export CSV
              </button>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Table View"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Cards View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS SECTION */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-20 flex flex-col items-center justify-center shadow-sm">
            <Loader2 className="animate-spin text-indigo-600 mb-3" size={36} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Revenue Records...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-20 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Rent Records Found</h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 max-w-sm">
              No matching records found for {months.find(m => m.value === month)?.label} {year}. Try adjusting your filters.
            </p>
          </div>
        ) : viewMode === 'table' ? (

          /* TABLE VIEW MODE */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    <th className="px-6 py-4">Tenant Resident</th>
                    <th className="px-6 py-4 text-center">Monthly Rent</th>
                    <th className="px-6 py-4 text-center">Paid Amount</th>
                    <th className="px-6 py-4 text-center">Outstanding Balance</th>
                    <th className="px-6 py-4 text-center">Payment Status</th>
                    <th className="px-6 py-4">Payment Info</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-900">
                  <AnimatePresence mode="popLayout">
                    {filteredData.map((item) => (
                      <RentTableRow key={item.id} item={item} navigate={navigate} onSendReminder={handleSendWhatsAppReminder} />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        ) : (

          /* GRID CARDS VIEW MODE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredData.map((item) => (
                <RentCard key={item.id} item={item} navigate={navigate} onSendReminder={handleSendWhatsAppReminder} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

/* =====================================================
   RENT TABLE ROW COMPONENT
===================================================== */
const RentTableRow = React.forwardRef(({ item, navigate, onSendReminder, onOpenTenant }, ref) => {
  const statusConfig = {
    PAID: { label: 'Paid', color: 'emerald', icon: <CheckCircle2 size={12} /> },
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
      className="hover:bg-slate-50/70 transition-all cursor-pointer group"
      onClick={() => onOpenTenant ? onOpenTenant(item.tenantId) : navigate('/tenant-details')}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3 text-left">
          <TenantAvatar
            name={item.tenantName}
            profileImageUrl={item.profileImageUrl}
          />
          <div>
            <h4 className="font-black text-slate-900 text-sm tracking-tight leading-none uppercase group-hover:text-indigo-600 transition-colors">
              {item.tenantName}
            </h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
              <Building2 size={11} className="text-indigo-500 shrink-0" /> {item.bedDetails}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center whitespace-nowrap">
        <span className="text-sm font-black text-slate-900">₹{item.monthlyRent?.toLocaleString()}</span>
      </td>
      <td className="px-6 py-4 text-center whitespace-nowrap">
        <span className="text-sm font-black text-emerald-600">₹{item.paidAmount?.toLocaleString()}</span>
      </td>
      <td className="px-6 py-4 text-center whitespace-nowrap">
        <span className={`text-sm font-black ${item.pendingAmount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
          ₹{item.pendingAmount?.toLocaleString()}
        </span>
      </td>
      <td className="px-6 py-4 text-center whitespace-nowrap">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${bgColors[color]}`}>
          {icon} {label}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-black text-slate-900 uppercase">{formatDate(item.paymentDate)}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.paymentMode || 'N/A'}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={(e) => onSendReminder && onSendReminder(e, item)}
            title="Send WhatsApp Rent Reminder"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs active:scale-95"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
            <span>Reminder</span>
          </button>
          <div className="inline-flex p-2 bg-slate-100 text-slate-400 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-all">
            <ChevronRight size={16} />
          </div>
        </div>
      </td>
    </motion.tr>
  )
})

/* =====================================================
   RENT CARD COMPONENT
===================================================== */
const RentCard = React.forwardRef(({ item, navigate, onSendReminder, onOpenTenant }, ref) => {
  const statusConfig = {
    PAID: { label: 'Paid', color: 'emerald', icon: <CheckCircle2 size={12} /> },
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
      onClick={() => onOpenTenant ? onOpenTenant(item.tenantId) : navigate('/tenant-details')}
      className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <TenantAvatar
              name={item.tenantName}
              profileImageUrl={item.profileImageUrl}
              size="w-12 h-12"
            />
            <div className="min-w-0">
              <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                {item.tenantName}
              </h4>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1 truncate">
                <Building2 size={11} className="text-indigo-500 shrink-0" /> {item.bedDetails}
              </p>
            </div>
          </div>

          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border shrink-0 ${bgColors[color]}`}>
            {icon} {label}
          </div>
        </div>

        {/* FINANCIAL SUMMARY PANE */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/70 rounded-xl border border-slate-100 mb-4">
          <div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Rent</span>
            <span className="text-xs font-black text-slate-900">₹{item.monthlyRent?.toLocaleString()}</span>
          </div>
          <div className="text-center">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Paid</span>
            <span className="text-xs font-black text-emerald-600">₹{item.paidAmount?.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Balance</span>
            <span className={`text-xs font-black ${item.pendingAmount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              ₹{item.pendingAmount?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <span>Date: {formatDate(item.paymentDate)}</span> • <span>{item.paymentMode || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => onSendReminder && onSendReminder(e, item)}
            title="Send WhatsApp Rent Reminder"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs active:scale-95"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
            <span>Reminder</span>
          </button>
          <div className="p-1.5 bg-slate-900 text-white rounded-xl group-hover:bg-indigo-600 transition-all">
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </motion.div>
  )
})
