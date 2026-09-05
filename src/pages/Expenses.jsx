import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO'
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Calendar,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Trash2,
  Edit2,
  MoreVertical,
  ChevronDown,
  Building2,
  Loader2,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
  Utensils,
  Fish,
  Milk,
  ShoppingBag,
  Apple,
  Droplets,
  Zap,
  Flame,
  Wifi,
  Wrench,
  Package,
  Monitor,
  Brush,
  WashingMachine,
  Shield,
  Users,
  PenTool,
  Activity,
  Play,
  Car,
  Box,
  FileText,
  ShieldCheck,
  Gavel,
  Megaphone,
  Tag,
  RefreshCcw
} from 'lucide-react'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts'

import PageHeader from '../components/PageHeader'
import CustomDropdown from '../components/CustomDropdown'
import {
  getAllPgs,
  getExpensesRange,
  getExpenseAnalytics,
  getExpenseCategories,
  getMonthlyGraphData,
  createExpense,
  updateExpense,
  deleteExpense
} from '../api/ownerAuth'

import { toast } from 'react-hot-toast'

/* =====================================================
   CATEGORY CONFIG & ICONS
===================================================== */
const CATEGORY_GROUPS = {
  Food: [
    { name: 'VEGETABLES', label: 'Vegetables', icon: Leaf },
    { name: 'CHICKEN', label: 'Chicken', icon: Utensils },
    { name: 'MEAT', label: 'Meat', icon: Utensils },
    { name: 'FISH', label: 'Fish', icon: Fish },
    { name: 'EGGS', label: 'Eggs', icon: Utensils },
    { name: 'MILK', label: 'Milk', icon: Milk },
    { name: 'GROCERIES', label: 'Groceries', icon: ShoppingBag },
    { name: 'FRUITS', label: 'Fruits', icon: Apple },
    { name: 'FOOD', label: 'Food', icon: Utensils },
  ],
  Utilities: [
    { name: 'ELECTRICITY', label: 'Electricity', icon: Zap },
    { name: 'WATER_BILL', label: 'Water Bill', icon: Droplets },
    { name: 'WATER_TANK', label: 'Water Tank', icon: Droplets },
    { name: 'WATER', label: 'Water', icon: Droplets },
    { name: 'GAS', label: 'Gas', icon: Flame },
    { name: 'INTERNET', label: 'Internet', icon: Wifi },
    { name: 'WIFI', label: 'Wifi', icon: Wifi },
  ],
  Maintenance: [
    { name: 'PLUMBING', label: 'Plumbing', icon: Wrench },
    { name: 'ELECTRICAL_REPAIRS', label: 'Electrical Repairs', icon: Wrench },
    { name: 'FURNITURE', label: 'Furniture', icon: Package },
    { name: 'APPLIANCES', label: 'Appliances', icon: Monitor },
    { name: 'GENERAL_MAINTENANCE', label: 'General Maintenance', icon: Wrench },
    { name: 'CLEANING_SUPPLIES', label: 'Cleaning Supplies', icon: Brush },
    { name: 'CLEANING', label: 'Cleaning', icon: Brush },
    { name: 'LAUNDRY', label: 'Laundry', icon: WashingMachine },
    { name: 'WASTE_MANAGEMENT', label: 'Waste Management', icon: Trash2 },
  ],
  Staff: [
    { name: 'SECURITY', label: 'Security', icon: Shield },
    { name: 'CLEANING_STAFF', label: 'Cleaning Staff', icon: Users },
    { name: 'COOKING_STAFF', label: 'Cooking Staff', icon: Users },
    { name: 'MAINTENANCE_STAFF', label: 'Maintenance Staff', icon: Users },
    { name: 'STAFF', label: 'Staff', icon: Users },
  ],
  Other: [
    { name: 'RENT', label: 'Rent', icon: Building2 },
    { name: 'STATIONERY', label: 'Stationery', icon: PenTool },
    { name: 'MEDICAL', label: 'Medical', icon: Activity },
    { name: 'ENTERTAINMENT', label: 'Entertainment', icon: Play },
    { name: 'TRANSPORTATION', label: 'Transportation', icon: Car },
    { name: 'PROPERTY_TAX', label: 'Property Tax', icon: FileText },
    { name: 'INSURANCE', label: 'Insurance', icon: ShieldCheck },
    { name: 'LEGAL', label: 'Legal', icon: Gavel },
    { name: 'ADVERTISING', label: 'Advertising', icon: Megaphone },
    { name: 'PROMOTIONS', label: 'Promotions', icon: Tag },
    { name: 'OTHER', label: 'Other', icon: Box },
  ]
}

const getCategoryIcon = (categoryName) => {
  if (!categoryName) return Box
  const upperName = categoryName.toUpperCase()
  for (const group of Object.values(CATEGORY_GROUPS)) {
    const found = group.find(cat => cat.name === upperName)
    if (found) return found.icon
  }
  return Box
}

const getCategoryLabel = (categoryName) => {
  if (!categoryName) return 'Other'
  const upperName = categoryName.toUpperCase()
  for (const group of Object.values(CATEGORY_GROUPS)) {
    const found = group.find(cat => cat.name === upperName)
    if (found) return found.label
  }
  return categoryName.replace(/_/g, ' ').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const getCategoryTheme = (categoryName) => {
  if (!categoryName) return { color: 'slate', text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', fill: 'bg-slate-500', icon: 'text-slate-500', lightText: 'text-slate-400', selected: 'bg-slate-900 border-slate-900 text-white shadow-sm', unselected: 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white' }
  const upperName = categoryName.toUpperCase()
  let group = 'Other'
  for (const [g, cats] of Object.entries(CATEGORY_GROUPS)) {
    if (cats.some(c => c.name === upperName)) {
      group = g
      break
    }
  }

  switch (group) {
    case 'Food': return { color: 'emerald', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', fill: 'bg-emerald-500', icon: 'text-emerald-500', lightText: 'text-emerald-400', selected: 'bg-emerald-600 border-emerald-600 text-white shadow-sm', unselected: 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-white' }
    case 'Utilities': return { color: 'amber', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', fill: 'bg-amber-500', icon: 'text-amber-500', lightText: 'text-amber-400', selected: 'bg-amber-600 border-amber-600 text-white shadow-sm', unselected: 'bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-200 hover:bg-white' }
    case 'Maintenance': return { color: 'rose', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', fill: 'bg-rose-500', icon: 'text-rose-500', lightText: 'text-rose-400', selected: 'bg-rose-600 border-rose-600 text-white shadow-sm', unselected: 'bg-slate-50 border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-white' }
    case 'Staff': return { color: 'indigo', text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', fill: 'bg-indigo-500', icon: 'text-indigo-500', lightText: 'text-indigo-400', selected: 'bg-indigo-600 border-indigo-600 text-white shadow-sm', unselected: 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-white' }
    default: return { color: 'slate', text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', fill: 'bg-slate-500', icon: 'text-slate-500', lightText: 'text-slate-400', selected: 'bg-slate-900 border-slate-900 text-white shadow-sm', unselected: 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white' }
  }
}

function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50', trend }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all cursor-default flex-1 min-w-[140px]">
      <div className={`h-11 w-11 rounded-xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0`}>
        {React.isValidElement(Icon) ? Icon : <Icon className="w-5 h-5 stroke-[2.2]" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate mb-0.5">{label}</div>
        <div className="flex items-center gap-2">
          <div className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">{value}</div>
          {trend && (
            <div className={`flex items-center text-[10px] font-bold ${trend > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* =====================================================
   MAIN EXPENSES COMPONENT
===================================================== */
export default function Expenses() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const pgId = searchParams.get('pgId')

  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'))

  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [monthlyData, setMonthlyData] = useState([])
  const [formCategoryGroup, setFormCategoryGroup] = useState('Food')

  // Form State
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    expenseDate: dayjs().format('YYYY-MM-DD'),
    paymentMethod: 'UPI',
    vendorName: '',
    isRecurring: false,
    notes: ''
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (pgId && startDate && endDate) {
      fetchExpenses()
      fetchMonthlyGraph()
    }
  }, [pgId, startDate, endDate])

  const fetchInitialData = async () => {
    try {
      const [pgsData, catsData] = await Promise.all([
        getAllPgs(),
        getExpenseCategories()
      ])

      const finalPgs = Array.isArray(pgsData) ? pgsData : (pgsData?.data || [])
      setPgs(finalPgs)

      const defaultCats = ['Food', 'Utilities', 'Maintenance', 'Staff', 'Electricity', 'Water', 'Cleaning', 'Wifi', 'Rent', 'Other']
      const finalCats = Array.isArray(catsData) ? catsData : (catsData?.data || catsData?.categories || defaultCats)
      setCategories(Array.isArray(finalCats) ? finalCats : defaultCats)

      if (!pgId && finalPgs.length > 0) {
        setSearchParams({ pgId: finalPgs[0].id })
      }
    } catch (e) {
      console.error('Failed to fetch initial data', e)
      setCategories(['Food', 'Utilities', 'Maintenance', 'Staff', 'Electricity', 'Water', 'Cleaning', 'Wifi', 'Rent', 'Other'])
    }
  }

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const [expensesData, analyticsData] = await Promise.all([
        getExpensesRange(pgId, startDate, endDate),
        getExpenseAnalytics(pgId, startDate, endDate)
      ])

      const finalExpenses = Array.isArray(expensesData) ? expensesData : (expensesData?.data || [])
      setExpenses(finalExpenses)

      setAnalytics(analyticsData?.data || analyticsData || null)
    } catch (e) {
      console.error('Failed to fetch expenses', e)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyGraph = async () => {
    try {
      const data = await getMonthlyGraphData(pgId)
      setMonthlyData(Array.isArray(data) ? data : (data?.data || []))
    } catch (e) {
      console.error('Failed to fetch monthly graph', e)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'vendorName' ? { description: value } : {})
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.category || !formData.amount || !formData.expenseDate) {
      toast.error('Please fill required fields')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        pgId,
        amount: parseFloat(formData.amount)
      }

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload)
        toast.success('Expense updated successfully')
      } else {
        await createExpense(payload)
        toast.success('Expense recorded successfully')
      }
      setShowModal(false)
      setEditingExpense(null)
      resetForm()
      fetchExpenses()
    } catch (e) {
      toast.error('Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return
    try {
      await deleteExpense(id)
      toast.success('Expense deleted')
      fetchExpenses()
    } catch (e) {
      toast.error('Delete failed')
    }
  }

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      description: '',
      expenseDate: dayjs().format('YYYY-MM-DD'),
      paymentMethod: 'UPI',
      vendorName: '',
      isRecurring: false,
      notes: ''
    })
  }

  const handleExportExcel = () => {
    if (expenses.length === 0) {
      toast.error('No data to export')
      return
    }

    const headers = ['Date', 'Category', 'Amount', 'Payment Method', 'Vendor/Description', 'Notes']
    const csvData = expenses.map(exp => [
      dayjs(exp.expenseDate).format('YYYY-MM-DD'),
      getCategoryLabel(exp.category),
      exp.amount,
      exp.paymentMethod || 'N/A',
      exp.vendorName || exp.description || 'N/A',
      exp.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    const fileName = `Expenses_${pgs.find(p => p.id === pgId)?.pgName || 'Report'}_${dayjs().format('YYYY-MM-DD')}.csv`
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Report downloaded as CSV')
  }

  const openAddModal = () => {
    setEditingExpense(null)
    resetForm()
    setFormCategoryGroup('Food')
    setShowModal(true)
  }

  const openEditModal = (expense) => {
    setEditingExpense(expense)
    setFormData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description || '',
      expenseDate: dayjs(expense.expenseDate).format('YYYY-MM-DD'),
      paymentMethod: expense.paymentMethod || 'UPI',
      vendorName: expense.vendorName || expense.description || '',
      isRecurring: expense.isRecurring || false,
      notes: expense.notes || ''
    })

    const group = Object.keys(CATEGORY_GROUPS).find(g =>
      CATEGORY_GROUPS[g].some(c => c.name.toLowerCase() === expense.category?.toLowerCase())
    )
    setFormCategoryGroup(group || 'Other')

    setShowModal(true)
  }

  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses
    const q = searchQuery.toLowerCase()
    return expenses.filter(exp =>
      (exp.category || '').toLowerCase().includes(q) ||
      (exp.vendorName || '').toLowerCase().includes(q) ||
      (exp.description || '').toLowerCase().includes(q) ||
      (exp.paymentMethod || '').toLowerCase().includes(q)
    )
  }, [expenses, searchQuery])

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SEO
        title="Expense Tracker - Outflow Analytics"
        description="Track and manage PG operational expenses. Monitor spending trends, daily averages, and transaction history."
      />

      {/* STICKY HEADER & EXECUTIVE METRICS */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="shrink-0">
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <Wallet size={14} />
                <span>Financial Management</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5 whitespace-nowrap">
                Expenses Ledger
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              <TopStat
                label="Total Outflow"
                value={`₹${analytics?.totalExpenses?.toLocaleString() || 0}`}
                icon={IndianRupee}
                colorClass="text-rose-600"
                bgClass="bg-rose-50"
              />
              <TopStat
                label="Daily Average"
                value={`₹${analytics?.averageDailyExpense?.toLocaleString() || 0}`}
                icon={TrendingDown}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
              />
              <TopStat
                label="Transactions"
                value={analytics?.totalTransactions || 0}
                icon={Clock}
                colorClass="text-amber-600"
                bgClass="bg-amber-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* CONTROLS TOOLBAR */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col lg:flex-row items-stretch gap-4">
          <CustomDropdown
            label="Property Scope"
            value={pgId}
            options={pgs.map(pg => ({ id: pg.id, label: pg.pgName }))}
            onChange={(val) => setSearchParams({ pgId: val })}
            icon={Building2}
            className="w-full lg:w-64"
          />

          <div className="flex flex-col sm:flex-row flex-1 gap-3">
            <div className="relative flex-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">From Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="relative flex-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">To Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-end gap-2.5">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-2xs whitespace-nowrap"
            >
              <Download size={14} className="text-indigo-600" /> Export CSV
            </button>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Plus size={15} /> Add Expense
            </button>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* MAIN LIST & TRENDS (2 COLUMNS) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* MONTHLY TREND CHART */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Outflow Monthly Trends</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Comparative Financial Analysis</p>
                  </div>
                </div>
              </div>

              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        fontWeight: '900'
                      }}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={28}>
                      {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === monthlyData.length - 1 ? '#4F46E5' : '#CBD5E1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TRANSACTIONS TABLE WITH SEARCH */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Recorded Transactions</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Audited operational expense items</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search category or vendor..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="p-16 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Processing Ledger...</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-slate-100">
                    <Wallet size={32} className="text-slate-300" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase">No Transactions Found</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                    No expense records match the specified period or query
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        <th className="py-4 px-6">Category & Description</th>
                        <th className="py-4 px-6">Amount</th>
                        <th className="py-4 px-6">Expense Date</th>
                        <th className="py-4 px-6">Payment Mode</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-900">
                      {filteredExpenses.map((exp) => {
                        const theme = getCategoryTheme(exp.category)
                        return (
                          <tr key={exp.id} className="hover:bg-slate-50/70 transition-all group">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className={`h-9 w-9 rounded-xl ${theme.bg} border ${theme.border} flex items-center justify-center ${theme.text} shrink-0 shadow-2xs`}>
                                  {React.createElement(getCategoryIcon(exp.category), { size: 16, strokeWidth: 2.2 })}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-black text-slate-900 text-xs uppercase tracking-tight">{getCategoryLabel(exp.category)}</span>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[180px]">
                                    {exp.vendorName || exp.description || exp.notes || 'No details recorded'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-black text-rose-600 text-xs whitespace-nowrap">₹{exp.amount?.toLocaleString()}</td>
                            <td className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{dayjs(exp.expenseDate).format('DD MMM YYYY')}</td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-widest border border-slate-200/80">
                                {exp.paymentMethod || 'N/A'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditModal(exp)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                  title="Edit Expense"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(exp.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Delete Expense"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR ANALYTICS (1 COLUMN) */}
          <div className="space-y-6">
            
            {/* CATEGORY BREAKDOWN CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <PieChart size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Category Insights</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Outflow Distribution</p>
                </div>
              </div>

              <div className="space-y-4">
                {analytics?.categoryBreakdown?.map((cat, idx) => {
                  const theme = getCategoryTheme(cat.category)
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          {React.createElement(getCategoryIcon(cat.category), { size: 12, className: theme.text })}
                          <span className="text-slate-600">{getCategoryLabel(cat.category)}</span>
                        </div>
                        <span className="text-slate-900">₹{cat.amount?.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${theme.fill} rounded-full transition-all duration-500`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{cat.transactionCount} Txns</span>
                        <span>{cat.percentage}% of Total</span>
                      </div>
                    </div>
                  )
                })}

                {(!analytics?.categoryBreakdown || analytics.categoryBreakdown.length === 0) && (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-6">No insights available</p>
                )}
              </div>
            </div>

            {/* HIGHEST OUTFLOW CARD */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Top Spending Focus</span>
                  <TrendingUp size={16} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Highest Category</p>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">{getCategoryLabel(analytics?.insights?.topCategory) || 'N/A'}</h3>
                  <p className="text-sm font-black text-rose-400 mt-1">₹{analytics?.insights?.topCategoryAmount?.toLocaleString() || 0} Total Spent</p>
                </div>
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Average Transaction Size</span>
                  <span className="text-xs font-black text-emerald-400">₹{analytics?.insights?.averageTransactionSize?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Slide-Over Drawer - Add / Edit Expense */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
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
                      <Wallet size={20} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">
                        {editingExpense ? 'Update Expense' : 'Add Expense'}
                      </h3>
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-0.5 truncate">
                        {editingExpense ? 'Modify operational outflow details' : 'Register new operational outflow'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
                    title="Close Drawer"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Drawer Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/30">
                    
                    {/* CATEGORY GROUPS & SELECTION */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block border-b border-slate-100 pb-2">
                        Category Classification *
                      </label>

                      {/* MAIN CATEGORY GROUPS */}
                      <div className="flex flex-wrap gap-1.5">
                        {Object.keys(CATEGORY_GROUPS).map(group => (
                          <button
                            key={group}
                            type="button"
                            onClick={() => setFormCategoryGroup(group)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                              formCategoryGroup === group
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            {group}
                          </button>
                        ))}
                      </div>

                      {/* SUB-CATEGORIES WITH ICONS */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {CATEGORY_GROUPS[formCategoryGroup]?.map(sub => {
                          const theme = getCategoryTheme(sub.name)
                          const isSelected = formData.category?.toUpperCase() === sub.name.toUpperCase()
                          return (
                            <button
                              key={sub.name}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, category: sub.name }))}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                                isSelected
                                  ? theme.selected
                                  : theme.unselected
                              }`}
                            >
                              {sub.icon && <sub.icon size={13} className={isSelected ? 'text-white' : theme.icon} />}
                              {sub.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* AMOUNTS & DATE */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-3">
                        Transaction Details
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative group">
                          <label className="absolute -top-2.5 left-4 bg-white px-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-10">
                            Amount (₹) *
                          </label>
                          <div className="relative flex items-center">
                            <IndianRupee className="absolute left-3.5 text-slate-400 pointer-events-none" size={14} />
                            <input
                              required
                              type="number"
                              name="amount"
                              value={formData.amount}
                              onChange={handleInputChange}
                              placeholder="0.00"
                              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-black uppercase tracking-tight text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>

                        <div className="relative group">
                          <label className="absolute -top-2.5 left-4 bg-white px-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-10">
                            Expense Date *
                          </label>
                          <input
                            required
                            type="date"
                            name="expenseDate"
                            value={formData.expenseDate}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <CustomDropdown
                            label="Payment Method"
                            value={formData.paymentMethod}
                            options={[
                              { id: 'UPI', label: 'UPI' },
                              { id: 'CASH', label: 'CASH' },
                              { id: 'BANK_TRANSFER', label: 'BANK TRANSFER' },
                              { id: 'CARD', label: 'CREDIT/DEBIT CARD' }
                            ]}
                            onChange={(val) => setFormData(prev => ({ ...prev, paymentMethod: val }))}
                            className="w-full"
                            labelBg="bg-white"
                          />
                        </div>

                        <div className="relative group">
                          <label className="absolute -top-2.5 left-4 bg-white px-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-10">
                            Vendor / Receiver
                          </label>
                          <input
                            type="text"
                            name="vendorName"
                            value={formData.vendorName}
                            onChange={handleInputChange}
                            placeholder="e.g. BESCOM, Local Supermarket"
                            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                          />
                        </div>
                      </div>

                      <div className="relative group">
                        <label className="absolute -top-2.5 left-4 bg-white px-1.5 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-10">
                          Internal Notes & Remarks
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={2}
                          placeholder="Transaction reference, bill number or remarks..."
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 pt-3.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="isRecurring"
                          name="isRecurring"
                          checked={formData.isRecurring}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                        />
                        <label htmlFor="isRecurring" className="text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer">
                          Mark as Recurring Monthly Expense
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Fixed Footer Bar */}
                  <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-3 shadow-lg">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-40 shadow-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      {submitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      {submitting ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Add Expense')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
