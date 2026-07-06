import React, { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'
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
  Tag
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

function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50', trend }) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md hover:scale-[1.02] transition-all cursor-default flex-1 min-w-0">
      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-2xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 h-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</div>
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
  // Fallback: Format the key (e.g., WATER_BILL -> Water Bill)
  return categoryName.replace(/_/g, ' ').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const getCategoryTheme = (categoryName) => {
  if (!categoryName) return { color: 'slate', text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', fill: 'bg-slate-500', icon: 'text-slate-500', lightText: 'text-slate-400', selected: 'bg-slate-600 border-slate-600 text-white shadow-lg shadow-slate-100 scale-105', unselected: 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-white' }
  const upperName = categoryName.toUpperCase()
  let group = 'Other'
  for (const [g, cats] of Object.entries(CATEGORY_GROUPS)) {
    if (cats.some(c => c.name === upperName)) {
      group = g
      break
    }
  }

  switch (group) {
    case 'Food': return { color: 'emerald', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', fill: 'bg-emerald-500', icon: 'text-emerald-500', lightText: 'text-emerald-400', selected: 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100 scale-105', unselected: 'bg-slate-50 border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-white' }
    case 'Utilities': return { color: 'amber', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', fill: 'bg-amber-500', icon: 'text-amber-500', lightText: 'text-amber-400', selected: 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-100 scale-105', unselected: 'bg-slate-50 border-slate-100 text-slate-600 hover:border-amber-200 hover:bg-white' }
    case 'Maintenance': return { color: 'rose', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', fill: 'bg-rose-500', icon: 'text-rose-500', lightText: 'text-rose-400', selected: 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-100 scale-105', unselected: 'bg-slate-50 border-slate-100 text-slate-600 hover:border-rose-200 hover:bg-white' }
    case 'Staff': return { color: 'indigo', text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', fill: 'bg-indigo-500', icon: 'text-indigo-500', lightText: 'text-indigo-400', selected: 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105', unselected: 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-white' }
    default: return { color: 'slate', text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', fill: 'bg-slate-500', icon: 'text-slate-500', lightText: 'text-slate-400', selected: 'bg-slate-600 border-slate-600 text-white shadow-lg shadow-slate-100 scale-105', unselected: 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-white' }
  }
}

export default function Expenses() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const pgId = searchParams.get('pgId')

  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [categories, setCategories] = useState([])

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

      // Ensure pgs is an array
      const finalPgs = Array.isArray(pgsData) ? pgsData : (pgsData?.data || [])
      setPgs(finalPgs)

      // Ensure categories is an array
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
      // Sync description with vendorName for ledger visibility
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
    toast.success('Report downloaded successfully')
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

    // Automatically select the correct category group for the UI
    const group = Object.keys(CATEGORY_GROUPS).find(g =>
      CATEGORY_GROUPS[g].some(c => c.name.toLowerCase() === expense.category?.toLowerCase())
    )
    setFormCategoryGroup(group || 'Other')

    setShowModal(true)
  }


  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Expense Tracker"
            subtitle="Monitor operational costs & financial outflow"
          >
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
              <TopStat
                label="Total Spending"
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
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Filters Bar */}
        <div className="bg-white border border-slate-200 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row items-stretch gap-4">
            <CustomDropdown
              label="Property Scope"
              value={pgId}
              options={pgs.map(pg => ({ id: pg.id, label: pg.pgName }))}
              onChange={(val) => setSearchParams({ pgId: val })}
              icon={Building2}
              className="flex-1 min-w-[240px]"
            />

            <div className="flex flex-col sm:flex-row flex-[2] gap-4">
              <div className="relative flex-1 group">
                <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">From Date</label>
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 z-10">
                  <Calendar size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="relative flex-1 group">
                <label className="absolute -top-2.5 left-5 bg-white px-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest z-20">To Date</label>
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 z-10">
                  <Calendar size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-900 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 h-[52px] px-6 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                <Download size={16} className="text-indigo-500" /> <span className="hidden sm:inline">Export Excel</span>
              </button>

              <button
                onClick={openAddModal}
                className="flex-[2] lg:flex-none flex items-center justify-center gap-2 h-[52px] px-8 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-100 whitespace-nowrap"
              >
                <Plus size={16} /> Record Expense
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Expense Trends</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Last 6-12 Months</p>
                  </div>
                </div>
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#F8FAFC' }}
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        textTransform: 'uppercase',
                        fontSize: '10px',
                        fontWeight: '900'
                      }}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={32}>
                      {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === monthlyData.length - 1 ? '#4F46E5' : '#E2E8F0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-[2.5rem] p-24 text-center border border-slate-200 shadow-sm">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-6 text-indigo-600" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Processing Ledger...</p>
              </div>
            ) : expenses.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-24 text-center border border-slate-200 shadow-sm">
                <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                  <Wallet size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Transactions</h3>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-2">
                  No records found for this period
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800">
                      <Th>Category</Th>
                      <Th>Amount</Th>
                      <Th>Date</Th>
                      <Th>Mode of Payment</Th>
                      <Th className="text-right">Action</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="group hover:bg-slate-50/50 transition-colors">
                        <Td>
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg ${getCategoryTheme(exp.category).bg} border ${getCategoryTheme(exp.category).border} flex items-center justify-center ${getCategoryTheme(exp.category).text} shrink-0 shadow-sm`}>
                              {React.createElement(getCategoryIcon(exp.category), { size: 14, strokeWidth: 2.5 })}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-black text-slate-900 text-[11px] uppercase tracking-tight">{getCategoryLabel(exp.category)}</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[150px]">
                                {exp.vendorName || exp.description || exp.notes || 'No details'}
                              </span>
                            </div>
                          </div>
                        </Td>
                        <Td className="font-black text-rose-600 text-[12px]">₹{exp.amount.toLocaleString()}</Td>
                        <Td className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dayjs(exp.expenseDate).format('DD MMM YYYY')}</Td>
                        <Td>
                           <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest border border-slate-200">
                            {exp.paymentMethod || 'N/A'}
                          </span>
                        </Td>
                        <Td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(exp)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                  <PieChart size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Category Insights</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Cost Distribution</p>
                </div>
              </div>

              <div className="space-y-4">
                {analytics?.categoryBreakdown?.map((cat, idx) => {
                  const theme = getCategoryTheme(cat.category);
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          {React.createElement(getCategoryIcon(cat.category), { size: 12, className: theme.text })}
                          <span className="text-slate-600">{getCategoryLabel(cat.category)}</span>
                        </div>
                        <span className="text-slate-900">₹{cat.amount.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div
                          className={`h-full ${theme.fill} rounded-full`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase">
                        <span>{cat.transactionCount} Txns</span>
                        <span>{cat.percentage}% of Total</span>
                      </div>
                    </div>
                  );
                })}

                {(!analytics?.categoryBreakdown || analytics.categoryBreakdown.length === 0) && (
                   <p className="text-[10px] font-bold text-slate-400 uppercase text-center py-4">No data to display</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-6">Top Outflow</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Highest Category</p>
                    <div className="flex items-center gap-3">
                       {analytics?.insights?.topCategory && (
                         <div className={`h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center ${getCategoryTheme(analytics.insights.topCategory).lightText}`}>
                           {React.createElement(getCategoryIcon(analytics.insights.topCategory), { size: 20 })}
                         </div>
                       )}
                       <p className="text-2xl font-black">{getCategoryLabel(analytics?.insights?.topCategory) || 'N/A'}</p>
                    </div>
                    <p className={`text-[11px] font-bold mt-1 ${getCategoryTheme(analytics?.insights?.topCategory).lightText}`}>₹{analytics?.insights?.topCategoryAmount?.toLocaleString() || 0} Spent</p>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Avg Transaction</p>
                    <p className="text-xl font-black text-emerald-400">₹{analytics?.insights?.averageTransactionSize?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal onClose={() => setShowModal(false)} title={editingExpense ? "Update Expense" : "New Expense"}>
             <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-4">
                 <div className="flex items-center gap-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                   <span className="text-rose-500">*</span>
                 </div>

                 {/* Main Category Groups */}
                 <div className="flex flex-wrap gap-2">
                   {Object.keys(CATEGORY_GROUPS).map(group => (
                     <button
                       key={group}
                       type="button"
                       onClick={() => setFormCategoryGroup(group)}
                       className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                         formCategoryGroup === group
                           ? 'bg-slate-800 border-slate-800 text-white shadow-md'
                           : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                       }`}
                     >
                       {group}
                     </button>
                   ))}
                 </div>

                 {/* Sub-categories with Icons */}
                 <div className="flex flex-wrap gap-2 pt-2">
                   {CATEGORY_GROUPS[formCategoryGroup]?.map(sub => {
                     const theme = getCategoryTheme(sub.name);
                     const isSelected = formData.category?.toUpperCase() === sub.name.toUpperCase();
                     return (
                       <button
                         key={sub.name}
                         type="button"
                         onClick={() => setFormData(prev => ({ ...prev, category: sub.name }))}
                         className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                           isSelected
                             ? theme.selected
                             : theme.unselected
                         }`}
                       >
                         {sub.icon && <sub.icon size={14} className={isSelected ? 'text-white' : theme.icon} />}
                         {sub.label}
                       </button>
                     );
                   })}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount *</label>
                   <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</div>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-xs font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none"
                      />
                   </div>
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date *</label>
                   <input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none"
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Method</label>
                   <CustomDropdown
                     label=""
                     value={formData.paymentMethod}
                     options={[
                       { value: 'UPI', label: 'UPI' },
                       { value: 'CASH', label: 'CASH' },
                       { value: 'BANK_TRANSFER', label: 'BANK TRANSFER' },
                       { value: 'CARD', label: 'CREDIT/DEBIT CARD' }
                     ]}
                     onChange={(val) => setFormData(prev => ({ ...prev, paymentMethod: val }))}
                     className="w-full"
                     labelBg="bg-white"
                   />
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description / Vendor</label>
                   <input
                      type="text"
                      name="vendorName"
                      value={formData.vendorName}
                      onChange={handleInputChange}
                      placeholder="e.g. Reliance Fresh, BESCOM, etc."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none"
                   />
                 </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Notes</label>
                 <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Additional details..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none resize-none"
                 />
               </div>

               <div className="flex items-center gap-2 pb-4">
                 <input
                  type="checkbox"
                  id="isRecurring"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                 />
                 <label htmlFor="isRecurring" className="text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer">Mark as Recurring Monthly Expense</label>
               </div>

               <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-[52px] bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50 shadow-lg shadow-slate-100 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {submitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                    {submitting ? 'Processing...' : (editingExpense ? 'Commit Changes' : 'Confirm & Save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 h-[52px] bg-white border-2 border-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
               </div>
             </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

const Th = ({ children, className = "" }) => (
  <th className={`px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 text-left ${className}`}>{children}</th>
)

const Td = ({ children, className = "" }) => (
  <td className={`px-6 py-5 text-slate-600 ${className}`}>{children}</td>
)

const Modal = ({ children, onClose, title }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 20 }}
      className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 relative border border-white/20 overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">{title}</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Outflow Management</p>
        </div>
        <button
          onClick={onClose}
          className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
)
