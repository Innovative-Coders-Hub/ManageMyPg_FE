import React, { useEffect, useMemo, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import SEO from '../components/SEO'
import PageHeader from '../components/PageHeader'
import { getAllPgs } from '../api/ownerAuth'
import * as promoApi from '../api/promotions'
import { getFullImageUrl } from '../api/api'
import {
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Tag,
  Info,
  Clock,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  X,
  Zap,
  Gift,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  Building2,
  Eye,
  EyeOff,
  Search,
  Filter,
  Layers,
  SlidersHorizontal,
  ExternalLink,
  Check,
  CalendarX,
  RotateCcw,
  Copy
} from 'lucide-react'

/* =====================================================
   PROMOTION TYPES CONFIG
===================================================== */
const PROMOTION_TYPES = [
  {
    key: 'DISCOUNT',
    label: 'Rent Discount',
    subtitle: 'Percentage or flat monetary discount on room rent',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeBg: 'bg-emerald-500 text-white',
    icon: Percent
  },
  {
    key: 'IMAGE',
    label: 'Banner / Poster',
    subtitle: 'Visual graphic banner promotion for PG announcements',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    badgeBg: 'bg-sky-500 text-white',
    icon: ImageIcon
  },
  {
    key: 'FESTIVAL',
    label: 'Festival Offer',
    subtitle: 'Diwali, New Year, Pongal & seasonal celebration deals',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeBg: 'bg-amber-500 text-white',
    icon: Sparkles
  },
  {
    key: 'TEXT',
    label: 'Announcement Text',
    subtitle: 'Important notice, free Wi-Fi or facility upgrade announcement',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeBg: 'bg-indigo-600 text-white',
    icon: FileText
  },
  {
    key: 'CASHBACK',
    label: 'Rent Cashback',
    subtitle: 'Direct cash reward credited on timely rent payment',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeBg: 'bg-purple-600 text-white',
    icon: Zap
  },
  {
    key: 'REFERRAL',
    label: 'Referral Bonus',
    subtitle: 'Reward tenants for referring friends or roommates',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeBg: 'bg-rose-500 text-white',
    icon: Gift
  }
]

/* Preset Banner Gallery for Quick Image Selection */
const PRESET_BANNERS = [
  { label: 'Diwali Celebration', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80' },
  { label: 'New Year Special', url: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Super Rent Sale', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Luxury PG Living', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Referral Rewards', url: 'https://images.unsplash.com/photo-1556742049-0a670fc8a5d7?auto=format&fit=crop&w=1000&q=80' }
]

/* =====================================================
   MAIN PROMOTIONS & OFFERS PAGE
===================================================== */
export default function Offers() {
  const [promotions, setPromotions] = useState([])
  const [pgs, setPgs] = useState([])
  const [loadingPgs, setLoadingPgs] = useState(false)
  const [loadingPromos, setLoadingPromos] = useState(true)
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [drawerInitialData, setDrawerInitialData] = useState(null)

  // Filters & Tabs
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL')
  const [selectedPgFilter, setSelectedPgFilter] = useState('ALL')
  const [selectedDiscountTypeFilter, setSelectedDiscountTypeFilter] = useState('ALL')
  const [activeTab, setActiveTab] = useState('ALL') // ALL, ACTIVE, DRAFT, EXPIRED

  useEffect(() => {
    // Clear legacy mock data from local storage
    try {
      localStorage.removeItem('mmp_active_promotions')
      localStorage.removeItem('offers_v2')
    } catch (e) {}

    const loadData = async () => {
      setLoadingPgs(true)
      setLoadingPromos(true)
      try {
        const [pgData, promoData] = await Promise.all([
          getAllPgs().catch(() => []),
          promoApi.getMyPromotions().catch(err => {
            toast.error(err?.response?.data?.message || 'Failed to load promotions from backend')
            return []
          })
        ])
        setPgs(Array.isArray(pgData) ? pgData : [])
        setPromotions(Array.isArray(promoData) ? promoData : [])
      } catch (err) {
        console.error('Failed to load backend data:', err)
      } finally {
        setLoadingPgs(false)
        setLoadingPromos(false)
      }
    }
    loadData()
  }, [])

  /* Enrich promotions with calculated status & countdowns */
  const enrichedPromotions = useMemo(() => {
    const now = dayjs()
    return promotions.map(p => {
      const exp = p.expireAt ? dayjs(p.expireAt) : null
      const isExpired = exp ? exp.isBefore(now, 'minute') : false
      const daysRemaining = exp ? exp.diff(now, 'day') : null
      const hoursRemaining = exp && daysRemaining === 0 ? exp.diff(now, 'hour') : null

      let computedStatus = p.status || 'ACTIVE'
      if (isExpired && computedStatus !== 'DRAFT') {
        computedStatus = 'EXPIRED'
      }

      return {
        ...p,
        isExpired,
        daysRemaining,
        hoursRemaining,
        computedStatus
      }
    })
  }, [promotions])

  /* Stat Counter */
  const stats = useMemo(() => {
    const total = enrichedPromotions.length
    const active = enrichedPromotions.filter(p => p.computedStatus === 'ACTIVE').length
    const draft = enrichedPromotions.filter(p => p.computedStatus === 'DRAFT').length
    const expired = enrichedPromotions.filter(p => p.computedStatus === 'EXPIRED').length
    return { total, active, draft, expired }
  }, [enrichedPromotions])

  /* Filtered list based on search, type filter, PG filter, discount filter & status tab */
  const filteredPromotions = useMemo(() => {
    return enrichedPromotions.filter(p => {
      // Status tab
      if (activeTab === 'ACTIVE' && p.computedStatus !== 'ACTIVE') return false
      if (activeTab === 'DRAFT' && p.computedStatus !== 'DRAFT') return false
      if (activeTab === 'EXPIRED' && p.computedStatus !== 'EXPIRED') return false

      // Type filter
      if (selectedTypeFilter !== 'ALL' && p.type !== selectedTypeFilter) return false

      // Target PG Filter
      if (selectedPgFilter !== 'ALL') {
        const targetId = p.targetPgId || (p.targetPg ? p.targetPg.id : null)
        if (selectedPgFilter === 'GLOBAL') {
          if (targetId) return false
        } else if (targetId !== selectedPgFilter) {
          return false
        }
      }

      // Discount Type Filter
      if (selectedDiscountTypeFilter !== 'ALL' && p.discountType !== selectedDiscountTypeFilter) return false

      // Multi-Field Search Query (Title, Coupon Code, Amount, Property Name, Description, Terms)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const titleMatch = p.title?.toLowerCase().includes(q)
        const subMatch = p.subtitle?.toLowerCase().includes(q)
        const promoCodeMatch = p.promoCode?.toLowerCase().includes(q)
        const discountValMatch = p.discountValue !== null && p.discountValue !== undefined && String(p.discountValue).toLowerCase().includes(q)
        const pgNameMatch = (p.targetPgName || 'All Properties').toLowerCase().includes(q)
        const descMatch = p.description?.toLowerCase().includes(q)
        const termsMatch = p.terms?.toLowerCase().includes(q)
        const typeMatch = p.type?.toLowerCase().includes(q)

        if (!titleMatch && !subMatch && !promoCodeMatch && !discountValMatch && !pgNameMatch && !descMatch && !termsMatch && !typeMatch) {
          return false
        }
      }

      return true
    })
  }, [enrichedPromotions, activeTab, selectedTypeFilter, selectedPgFilter, selectedDiscountTypeFilter, searchQuery])

  const isAnyFilterActive = useMemo(() => {
    return searchQuery.trim() !== '' || selectedTypeFilter !== 'ALL' || selectedPgFilter !== 'ALL' || selectedDiscountTypeFilter !== 'ALL'
  }, [searchQuery, selectedTypeFilter, selectedPgFilter, selectedDiscountTypeFilter])

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedTypeFilter('ALL')
    setSelectedPgFilter('ALL')
    setSelectedDiscountTypeFilter('ALL')
  }

  /* Actions - Fully integrated with Backend API */
  const handleSavePromotion = async (payload) => {
    try {
      if (editingPromo) {
        await promoApi.updatePromotionApi(editingPromo.id, payload)
        toast.success('Promotion campaign updated in database!')
      } else {
        await promoApi.createPromotion(payload)
        toast.success('New promotion campaign created & published live to database!')
      }
      setDrawerOpen(false)
      setEditingPromo(null)
      setDrawerInitialData(null)
      
      // Refresh list from backend database
      const freshList = await promoApi.getMyPromotions()
      setPromotions(freshList)
    } catch (err) {
      console.error('Failed to save promotion to DB:', err)
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to save promotion to backend database'
      toast.error(errorMsg)
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      await promoApi.togglePromotionStatusApi(id)
      const freshList = await promoApi.getMyPromotions()
      setPromotions(freshList)
      toast.success('Promotion status updated in database!')
    } catch (err) {
      console.error('Failed to toggle promotion status:', err)
      toast.error(err?.response?.data?.message || 'Failed to update promotion status')
    }
  }

  const handleEndToday = async (id) => {
    if (window.confirm('Are you sure you want to end this promotion today? It will immediately be marked as Expired in the database.')) {
      try {
        await promoApi.expirePromotionTodayApi(id)
        const freshList = await promoApi.getMyPromotions()
        setPromotions(freshList)
        toast.success('Promotion marked as Expired in database!')
      } catch (err) {
        console.error('Failed to expire promotion:', err)
        toast.error(err?.response?.data?.message || 'Failed to expire promotion in database')
      }
    }
  }

  const handleRepublish = (promo) => {
    // Clone expired promotion data for new offer request
    const duration = promo.durationDays || 14
    const newExpireDate = dayjs().add(duration, 'day').endOf('day').toISOString()

    const cloneData = {
      ...promo,
      id: undefined, // Unset old ID so it gets submitted as a NEW offer request to BE
      title: promo.title.includes('Re-published') ? promo.title : `${promo.title} (Re-published)`,
      status: 'ACTIVE',
      expirationMode: promo.expirationMode || 'DAYS',
      durationDays: duration,
      expireAt: newExpireDate
    }

    setEditingPromo(null) // Keep null so save treats it as NEW offer request
    setDrawerInitialData(cloneData)
    setDrawerOpen(true)
    toast.success('Pre-filled promotion template! Click Publish to save to database.')
  }

  const handleDuplicate = (promo) => {
    const cloneData = {
      ...promo,
      id: undefined,
      title: `${promo.title} (Copy)`,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    }
    setEditingPromo(null)
    setDrawerInitialData(cloneData)
    setDrawerOpen(true)
    toast.success('Duplicated promotion template! Review and publish.')
  }

  const handleDeletePromotion = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotion campaign from the database?')) {
      try {
        await promoApi.deletePromotionApi(id)
        const freshList = await promoApi.getMyPromotions()
        setPromotions(freshList)
        toast.success('Promotion campaign deleted from database!')
      } catch (err) {
        console.error('Failed to delete promotion:', err)
        toast.error(err?.response?.data?.message || 'Failed to delete promotion from database')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <SEO
        title="Promotions & Offers Engine"
        description="Create, publish & auto-expire PG rental offers, banner posters, and festival discounts for tenants."
        canonical="/offers"
      />

      {/* STICKY TOP HEADER */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <Tag size={14} />
                <span>Yield & Occupancy Marketing</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Promotions & Offers
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Campaigns:</span>
                <span className="text-sm font-black text-slate-900">{stats.total}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Active Live:</span>
                <span className="text-sm font-black text-emerald-700">{stats.active}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Drafts:</span>
                <span className="text-sm font-black text-amber-700">{stats.draft}</span>
              </div>

              <button
                onClick={() => { setEditingPromo(null); setDrawerOpen(true) }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer ml-auto sm:ml-2"
              >
                <Plus size={16} /> Create Promotion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* TOOLBAR: SEARCH & MULTI-FILTER CONTROL BAR */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* SEARCH INPUT BOX */}
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by title, coupon code (e.g. REFER500), amount (₹500), property or terms..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* STATUS TABS */}
            <div className="flex items-center p-1 bg-slate-100/80 rounded-xl shrink-0 overflow-x-auto">
              {[
                { key: 'ALL', label: `All (${stats.total})` },
                { key: 'ACTIVE', label: `Active (${stats.active})` },
                { key: 'DRAFT', label: `Drafts (${stats.draft})` },
                { key: 'EXPIRED', label: `Expired (${stats.expired})` }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECONDARY FILTER SELECTORS ROW */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">
                Filter By:
              </span>

              {/* 1. TYPE FILTER */}
              <select
                value={selectedTypeFilter}
                onChange={e => setSelectedTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {PROMOTION_TYPES.map(t => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>

              {/* 2. TARGET PG FILTER */}
              <select
                value={selectedPgFilter}
                onChange={e => setSelectedPgFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="ALL">All Target Properties</option>
                <option value="GLOBAL">All PG Properties (Global)</option>
                {pgs.map(pg => (
                  <option key={pg.id} value={pg.id}>{pg.pgName}</option>
                ))}
              </select>

              {/* 3. DISCOUNT TYPE FILTER */}
              <select
                value={selectedDiscountTypeFilter}
                onChange={e => setSelectedDiscountTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="ALL">All Concessions</option>
                <option value="FIXED">Fixed Discount (₹)</option>
                <option value="PERCENT">Percentage OFF (%)</option>
                <option value="NONE">No Direct Discount</option>
              </select>
            </div>

            {/* RESET FILTERS & RESULTS COUNT */}
            {isAnyFilterActive && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">
                  Showing <strong className="text-indigo-600">{filteredPromotions.length}</strong> matches
                </span>
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-rose-200/80 transition-all cursor-pointer"
                >
                  <X size={12} /> Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PROMOTIONS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPromotions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-white"
              >
                <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                  <Tag size={32} />
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">No Promotions Found</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchQuery || selectedTypeFilter !== 'ALL' || activeTab !== 'ALL'
                    ? 'No promotion campaign matches your search filters. Try clearing your search.'
                    : 'Create your first marketing promotion to boost tenant retention & occupancy rates.'}
                </p>
                <button
                  onClick={() => { setEditingPromo(null); setDrawerOpen(true) }}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  <Plus size={16} /> Launch First Campaign
                </button>
              </motion.div>
            ) : (
              filteredPromotions.map(promo => {
                const typeConfig = PROMOTION_TYPES.find(t => t.key === promo.type) || PROMOTION_TYPES[0]
                const IconComponent = typeConfig.icon

                return (
                  <motion.div
                    key={promo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group relative ${
                      promo.computedStatus === 'EXPIRED' ? 'opacity-75 grayscale-20' : ''
                    }`}
                  >
                    {/* Top Accent Bar based on type */}
                    <div className={`h-1.5 w-full ${typeConfig.badgeBg}`} />

                    {/* Banner Image Preview (If Provided) */}
                    {promo.bannerUrl && (
                      <div className="relative h-44 w-full bg-slate-900 overflow-hidden shrink-0">
                        <img
                          src={getFullImageUrl(promo.bannerUrl)}
                          alt={promo.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                        
                        {/* Type Badge Overlay */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-[9.5px] font-black uppercase tracking-wider">
                          <IconComponent size={12} className="text-indigo-400" />
                          <span>{typeConfig.label}</span>
                        </div>

                        {/* Status Badge Overlay */}
                        <div className="absolute top-3 right-3">
                          <StatusBadge status={promo.computedStatus} />
                        </div>

                        {/* Title Overlay on Image */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="text-base font-black tracking-tight leading-snug drop-shadow-md line-clamp-1">
                            {promo.title}
                          </h3>
                        </div>
                      </div>
                    )}

                    {/* Card Content Section */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      {!promo.bannerUrl && (
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${typeConfig.color}`}>
                            <IconComponent size={14} />
                            <span className="text-[10px] font-black uppercase tracking-wider">{typeConfig.label}</span>
                          </div>
                          <StatusBadge status={promo.computedStatus} />
                        </div>
                      )}

                      <div className="space-y-2">
                        {!promo.bannerUrl && (
                          <h3 className="text-base font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors leading-snug">
                            {promo.title}
                          </h3>
                        )}

                        {promo.subtitle && (
                          <p className="text-xs font-bold text-slate-600 leading-relaxed">
                            {promo.subtitle}
                          </p>
                        )}

                        {promo.description && (
                          <p className="text-[11px] font-medium text-slate-500 line-clamp-2 italic bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                            "{promo.description}"
                          </p>
                        )}
                      </div>

                      {/* Details & Metadata Pills */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-500">
                        {/* Promo Code Coupon Badge */}
                        {promo.promoCode && (
                          <div className="flex items-center justify-between bg-amber-50/80 p-2 rounded-xl border border-amber-200/80">
                            <span className="font-black text-amber-800 uppercase tracking-wider text-[9.5px]">Coupon Code:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-lg text-xs tracking-wider border border-amber-300">
                                {promo.promoCode}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(promo.promoCode)
                                  toast.success(`Copied promo code: ${promo.promoCode}`)
                                }}
                                className="text-[9px] font-black text-amber-700 hover:text-amber-900 uppercase tracking-wider underline cursor-pointer"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Discount Concession Tag */}
                        {promo.discountValue && (
                          <div className="flex items-center justify-between bg-indigo-50/60 p-2 rounded-xl border border-indigo-100/60">
                            <span className="font-black text-indigo-700 uppercase tracking-wider text-[9.5px]">Discount Offer:</span>
                            <span className="font-black text-indigo-900 text-xs">
                              {promo.discountType === 'PERCENT' ? `${promo.discountValue}% OFF` : `₹${Number(promo.discountValue).toLocaleString()} OFF`}
                            </span>
                          </div>
                        )}

                        {/* Target PG Unit */}
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Building2 size={13} className="text-slate-400" />
                            Target Property:
                          </span>
                          <span className="font-black text-slate-800 truncate max-w-[150px]">
                            {promo.targetPgName || 'All Properties'}
                          </span>
                        </div>

                        {/* Expiration Timeline Pill */}
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5 font-bold">
                            <Clock size={13} className="text-slate-400" />
                            Validity Status:
                          </span>
                          <span className={`font-black uppercase tracking-wider text-[9.5px] ${
                            promo.computedStatus === 'EXPIRED'
                              ? 'text-rose-600'
                              : promo.daysRemaining !== null && promo.daysRemaining <= 3
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}>
                            {promo.computedStatus === 'EXPIRED'
                              ? 'Expired'
                              : promo.daysRemaining !== null
                              ? promo.daysRemaining === 0
                                ? `Expires Today (${promo.hoursRemaining || 0}h)`
                                : `${promo.daysRemaining} days remaining`
                              : 'No Expiration'}
                          </span>
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Status Toggle Switch */}
                        <button
                          onClick={() => handleToggleStatus(promo.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            promo.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700 border border-emerald-200 hover:border-rose-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                          }`}
                          title={promo.status === 'ACTIVE' ? 'Click to Unpublish / Draft' : 'Click to Publish Live'}
                        >
                          {promo.status === 'ACTIVE' ? <Eye size={13} /> : <EyeOff size={13} />}
                          <span>{promo.status === 'ACTIVE' ? 'Live' : 'Draft'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {promo.computedStatus === 'EXPIRED' ? (
                            <button
                              onClick={() => handleRepublish(promo)}
                              className="px-2.5 py-1.5 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Re-publish this promotion as a new active campaign"
                            >
                              <RotateCcw size={13} />
                              <span>Re-publish</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEndToday(promo.id)}
                              className="px-2.5 py-1.5 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                              title="Immediately End Promotion Today"
                            >
                              <CalendarX size={13} />
                              <span>End Today</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDuplicate(promo)}
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer"
                            title="Duplicate Campaign Template"
                          >
                            <Copy size={14} />
                          </button>

                          <button
                            onClick={() => { setEditingPromo(promo); setDrawerInitialData(promo); setDrawerOpen(true) }}
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer"
                            title="Edit Campaign"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => handleDeletePromotion(promo.id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                            title="Delete Campaign"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SLIDE-OVER RIGHT DRAWER FOR PROMOTION CREATION & EDITING */}
      <AnimatePresence>
        {drawerOpen && (
          <OfferDrawer
            open={drawerOpen}
            initialData={editingPromo || drawerInitialData}
            pgs={pgs}
            onClose={() => { setDrawerOpen(false); setEditingPromo(null); setDrawerInitialData(null) }}
            onSave={handleSavePromotion}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* =====================================================
   STATUS BADGE COMPONENT
===================================================== */
function StatusBadge({ status }) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live
      </span>
    )
  }
  if (status === 'EXPIRED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest shadow-2xs">
        Expired
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-500 text-white text-[9px] font-black uppercase tracking-widest shadow-2xs">
      Draft
    </span>
  )
}

/* =====================================================
   CUSTOM FLOATING SELECT DROPDOWN COMPONENT (NO OS SELECT)
===================================================== */
function CustomDrawerSelect({ value, onChange, options, placeholder = "Select option" }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOpt = options.find(o => o.value === value)
  const displayLabel = selectedOpt ? selectedOpt.label : placeholder

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-xl text-xs font-bold text-slate-800 transition-all cursor-pointer ${
          isOpen ? 'border-indigo-600 ring-3 ring-indigo-600/10 shadow-sm' : 'border-slate-200 hover:border-indigo-300'
        }`}
      >
        <span className="truncate font-bold text-slate-900">{displayLabel}</span>
        <ChevronDown size={15} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[150] left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden py-1 max-h-56 overflow-y-auto"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 font-black text-indigo-700'
                      : 'font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} className="text-indigo-600 shrink-0 ml-2" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* =====================================================
   SLIDE-OVER RIGHT DRAWER COMPONENT
===================================================== */
function OfferDrawer({ open, initialData, pgs, onClose, onSave }) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '')
  const [promoCode, setPromoCode] = useState(initialData?.promoCode || '')
  const [type, setType] = useState(initialData?.type || 'DISCOUNT')
  const [discountType, setDiscountType] = useState(initialData?.discountType || 'FIXED')
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue || '')
  const [bannerUrl, setBannerUrl] = useState(initialData?.bannerUrl || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [terms, setTerms] = useState(initialData?.terms || '')
  const [targetPgId, setTargetPgId] = useState(initialData?.targetPgId || 'ALL')
  const [expirationMode, setExpirationMode] = useState(initialData?.expirationMode || 'DAYS')
  const [durationDays, setDurationDays] = useState(initialData?.durationDays || 14)
  const [expireAtDate, setExpireAtDate] = useState(
    initialData?.expireAt ? dayjs(initialData.expireAt).format('YYYY-MM-DD') : dayjs().add(14, 'day').format('YYYY-MM-DD')
  )
  const [status, setStatus] = useState(initialData?.status || 'ACTIVE')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a promotion title')
      return
    }

    let calculatedExpireAt = null
    if (expirationMode === 'DAYS') {
      calculatedExpireAt = dayjs().add(Number(durationDays) || 7, 'day').endOf('day').toISOString()
    } else if (expirationMode === 'DATE' && expireAtDate) {
      calculatedExpireAt = dayjs(expireAtDate).endOf('day').toISOString()
    }

    const selectedPg = pgs.find(p => p.id === targetPgId)
    const targetPgName = (targetPgId === 'ALL' || !targetPgId) ? 'All PG Properties' : (selectedPg?.pgName || 'Selected PG')

    onSave({
      title: title.trim(),
      subtitle: subtitle.trim(),
      promoCode: promoCode.trim().toUpperCase(),
      type,
      discountType,
      discountValue: discountValue ? String(discountValue) : '',
      bannerUrl: bannerUrl.trim(),
      description: description.trim(),
      terms: terms.trim(),
      targetPgId: targetPgId === 'ALL' ? 'ALL' : targetPgId,
      targetPgName,
      expirationMode,
      durationDays: Number(durationDays) || 14,
      expireAt: calculatedExpireAt,
      status
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="w-screen max-w-xl bg-white shadow-2xl flex flex-col"
        >
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={14} />
                <span>Marketing & Promotions Engine</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                {initialData ? 'Edit Promotion Campaign' : 'Create New Promotion'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* 1. Campaign Title & Subtitle */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} className="text-indigo-600" />
                1. Campaign Headlines & Promo Code
              </h3>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Promotion Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Diwali Festival Rent Discount 2026"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Subtitle / Catchphrase
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    placeholder="e.g. Flat ₹1,500 OFF on your room rent"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Custom Promo / Coupon Code
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DIWALI2026"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-black text-slate-900 uppercase tracking-wider focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 2. Category & Target PG */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers size={14} className="text-indigo-600" />
                2. Promotion Type & Target Property
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Promotion Type Custom Floating Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Promotion Type
                  </label>
                  <CustomDrawerSelect
                    value={type}
                    onChange={setType}
                    options={PROMOTION_TYPES.map(t => ({ value: t.key, label: t.label }))}
                  />
                </div>

                {/* Target Property Custom Floating Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Target Property
                  </label>
                  <CustomDrawerSelect
                    value={targetPgId}
                    onChange={setTargetPgId}
                    options={[
                      { value: 'ALL', label: 'All PG Properties' },
                      ...pgs.map(pg => ({ value: pg.id, label: pg.pgName }))
                    ]}
                  />
                </div>
              </div>

              {/* Quick Type Selection Pills */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider">
                  Quick Select Category:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PROMOTION_TYPES.map(t => {
                    const TypeIcon = t.icon
                    const isSelected = type === t.key
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setType(t.key)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-black'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <TypeIcon size={12} />
                        <span>{t.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 3. Discount Amount / Concession */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Percent size={14} className="text-indigo-600" />
                3. Discount Concession (Optional)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Discount Type
                  </label>
                  <CustomDrawerSelect
                    value={discountType}
                    onChange={setDiscountType}
                    options={[
                      { value: 'FIXED', label: 'Fixed Amount (₹)' },
                      { value: 'PERCENT', label: 'Percentage (%)' },
                      { value: 'NONE', label: 'No Direct Concession' }
                    ]}
                  />
                </div>

                {discountType !== 'NONE' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={e => setDiscountValue(e.target.value)}
                      placeholder={discountType === 'PERCENT' ? 'e.g. 15' : 'e.g. 1000'}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 4. Banner Graphic Poster Image (Optional) */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ImageIcon size={14} className="text-indigo-600" />
                  4. Custom Banner Graphic Poster
                </span>
                <span className="text-[9.5px] font-black text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Optional
                </span>
              </h3>

              <div className="space-y-3">
                {/* File Upload Dropzone Box */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    Upload Custom Banner Image
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl bg-white hover:bg-indigo-50/40 transition-all cursor-pointer group text-center">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <ImageIcon size={20} />
                    </div>
                    <p className="text-xs font-black text-slate-800">
                      Click to upload custom image <span className="text-indigo-600 font-bold">or drag & drop</span>
                    </p>
                    <p className="text-[9.5px] font-bold text-slate-400 mt-0.5">
                      PNG, JPG, WebP, GIF (Max size 5MB)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const loadingToast = toast.loading('Compressing & uploading banner image...')
                        try {
                          const serverUrl = await promoApi.uploadPromotionBannerApi(file)
                          if (serverUrl) {
                            setBannerUrl(serverUrl)
                            toast.dismiss(loadingToast)
                            toast.success('Custom banner uploaded to server!')
                          } else {
                            const reader = new FileReader()
                            reader.onload = (evt) => {
                              setBannerUrl(evt.target.result)
                              toast.dismiss(loadingToast)
                              toast.success('Custom banner attached!')
                            }
                            reader.readAsDataURL(file)
                          }
                        } catch (err) {
                          toast.dismiss(loadingToast)
                          toast.error('Failed to upload image')
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Direct Image URL Input */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider">
                    Or paste direct image URL:
                  </label>
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={e => setBannerUrl(e.target.value)}
                    placeholder="https://example.com/banner-poster.jpg"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Quick Presets Gallery */}
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider">
                    Or select a preset banner template:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_BANNERS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBannerUrl(preset.url)}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-400 rounded-lg text-[9.5px] font-bold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner Live Preview & Remove Option */}
                {bannerUrl && (
                  <div className="mt-3 relative h-40 w-full bg-slate-900 rounded-2xl overflow-hidden border border-indigo-200 shadow-md group">
                    <img src={bannerUrl} alt="Banner Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider rounded-lg border border-white/20">
                      Live Banner Preview
                    </div>

                    <button
                      type="button"
                      onClick={() => setBannerUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md hover:bg-rose-700 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Auto Expiration Controls */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} className="text-indigo-600" />
                5. Auto Expiration Lifecycle
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Expiration Method
                  </label>
                  <CustomDrawerSelect
                    value={expirationMode}
                    onChange={setExpirationMode}
                    options={[
                      { value: 'DAYS', label: 'Expires in Days' },
                      { value: 'DATE', label: 'Specific Expiration Date' }
                    ]}
                  />
                </div>

                {expirationMode === 'DAYS' ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Active Duration (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={durationDays}
                      onChange={e => setDurationDays(e.target.value)}
                      placeholder="e.g. 14"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={expireAtDate}
                      onChange={e => setExpireAtDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setExpirationMode('DATE')
                    setExpireAtDate(dayjs().format('YYYY-MM-DD'))
                    setStatus('EXPIRED')
                    toast.success('Expiration date set to Today!')
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CalendarX size={13} />
                  <span>Set Expiration to Today</span>
                </button>
              </div>
            </div>

            {/* 6. Description & Terms */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} className="text-indigo-600" />
                6. Details & Terms
              </h3>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Promotion Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the offer details for your tenants..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Terms & Conditions
                </label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={e => setTerms(e.target.value)}
                  placeholder="e.g. Valid for minimum 3-month stay agreement."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* 7. Initial Status */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Publishing Status
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="radio"
                    name="status"
                    value="ACTIVE"
                    checked={status === 'ACTIVE'}
                    onChange={() => setStatus('ACTIVE')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Publish Live to Tenants</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="radio"
                    name="status"
                    value="DRAFT"
                    checked={status === 'DRAFT'}
                    onChange={() => setStatus('DRAFT')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Save as Draft</span>
                </label>
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all cursor-pointer"
              >
                {initialData ? 'Save Changes' : 'Publish Promotion'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
