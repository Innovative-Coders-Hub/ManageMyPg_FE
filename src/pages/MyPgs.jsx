import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppScope } from '../context/AppScopeContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { createPg, getAllPgs, updatePgPricing, uploadPgTerms } from '../api/ownerAuth'
import { getFullImageUrl } from '../api/api'
import PageHeader from '../components/PageHeader'
import SEO from '../components/SEO'
import {
  Plus,
  MapPin,
  ChevronRight,
  ChevronDown,
  Building2,
  QrCode,
  IndianRupee,
  FileText,
  X,
  Upload,
  Loader2,
  CheckCircle2,
  FileSearch,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  TrendingUp,
  Percent,
  Users,
  Search,
  SlidersHorizontal,
  Bed,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'

import CustomDropdown from '../components/CustomDropdown'

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
   MAIN COMPONENT: MY PGS
===================================================== */
export default function MyPgs() {
  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQrFor, setShowQrFor] = useState(null)

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, APPROVED, PENDING

  // Pricing & Terms State
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [selectedPgForPricing, setSelectedPgForPricing] = useState(null)
  const [pricingForm, setPricingForm] = useState({ charges: 0, pricingList: [] })
  const [updatingPricing, setUpdatingPricing] = useState(false)
  const [uploadingTerms, setUploadingTerms] = useState(false)

  // Create modal state
  const [showCreate, setShowCreate] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [pgName, setPgName] = useState('')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [area, setArea] = useState('')
  const [district, setDistrict] = useState('')
  const [areas, setAreas] = useState([])
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [country, setCountry] = useState('')
  const [pincode, setPincode] = useState('')
  const [creating, setCreating] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const [totalFloors, setTotalFloors] = useState('')
  const [totalBeds, setTotalBeds] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const data = await getAllPgs()
      setPgs(Array.isArray(data) ? data : [])
    } catch (e) {
      toast.error('Failed to load PG properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Portfolio Statistics
  const stats = useMemo(() => {
    const total = pgs.length
    const totalBeds = pgs.reduce((acc, p) => acc + (Number(p.totalBeds) || 0), 0)
    const filledBeds = pgs.reduce((acc, p) => acc + (Number(p.filledBeds) || 0), 0)
    const occupancy = totalBeds > 0 ? Math.round((filledBeds / totalBeds) * 100) : 0
    const approvedCount = pgs.filter(p => p.approved || p.status === 'APPROVED').length
    return { total, totalBeds, filledBeds, occupancy, approvedCount }
  }, [pgs])

  // Filtered PGs
  const filteredPgs = useMemo(() => {
    return pgs.filter(pg => {
      const isApproved = pg.approved || pg.status === 'APPROVED'
      const matchSearch =
        (pg.pgName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pg.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pg.address?.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pg.address?.areaLocality || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pg.address?.district || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pg.address?.landmark || '').toLowerCase().includes(searchTerm.toLowerCase())

      if (statusFilter === 'APPROVED') return matchSearch && isApproved
      if (statusFilter === 'PENDING') return matchSearch && !isApproved
      return matchSearch
    })
  }, [pgs, searchTerm, statusFilter])

  const handleOpenPricing = (pg) => {
    setSelectedPgForPricing(pg)
    setPricingForm({
      charges: pg.charges || 0,
      pricingList: pg.pricingList ? [...pg.pricingList] : []
    })
    setShowPricingModal(true)
  }

  const handleOpenTerms = (pg) => {
    setSelectedPgForPricing(pg)
    setShowTermsModal(true)
  }

  const handleUpdatePricing = async () => {
    try {
      setUpdatingPricing(true)
      await updatePgPricing(selectedPgForPricing.id, pricingForm)
      await load()
      setShowPricingModal(false)
      toast.success('Pricing structure updated successfully')
    } catch {
      toast.error('Failed to update pricing')
    } finally {
      setUpdatingPricing(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') return toast.error('PDF files only')
    if (file.size > 5 * 1024 * 1024) return toast.error('File too large (>5MB)')

    try {
      setUploadingTerms(true)
      await uploadPgTerms(selectedPgForPricing.id, file)
      await load()
      setShowTermsModal(false)
      toast.success('Terms & Conditions updated')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingTerms(false)
    }
  }

  const fetchAddressFromPincode = async (pin) => {
    if (pin.length !== 6) return
    setPinLoading(true)
    setPinError('')
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await res.json()
      if (data[0]?.Status === 'Success') {
        const list = data[0].PostOffice
        setAreas(list)
        setDistrict(list[0].District)
        setStateName(list[0].State)
        setCountry('India')
        if (list.length === 1) {
          setArea(list[0].Name)
          setCity(list[0].Block || list[0].District)
        }
      } else {
        setPinError('Invalid Pincode')
      }
    } catch {
      setPinError('Service unavailable')
    } finally {
      setPinLoading(false)
    }
  }

  const create = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const body = {
        businessName, pgName, totalFloors, totalBeds,
        address: { address, areaLocality: area, city, state: stateName, district, pinCode: pincode, country, landmark }
      }
      await createPg(body)
      toast.success('PG Property Created!')
      setShowCreate(false)
      // Reset form
      setBusinessName('')
      setPgName('')
      setAddress('')
      setLandmark('')
      setArea('')
      setDistrict('')
      setPincode('')
      setTotalFloors('')
      setTotalBeds('')
      load()
    } catch {
      toast.error('Error creating PG Property')
    } finally {
      setCreating(false)
    }
  }

  const groupedPricing = useMemo(() => {
    const groups = {}
    pricingForm.pricingList.forEach((item, index) => {
      const s = item.sharing || 1
      if (!groups[s]) groups[s] = []
      groups[s].push({ ...item, originalIndex: index })
    })
    return groups
  }, [pricingForm.pricingList])

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SEO
        title="My PG Properties - Portfolio Management"
        description="Manage your PG property portfolio, view occupancy rates, and configure room pricing structures."
      />

      {/* HEADER & PORTFOLIO METRICS SECTION */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <Building2 size={14} />
                <span>Property Portfolio</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                My PG Properties
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <TopStat label="Properties" value={stats.total} icon={Building2} />
              <TopStat label="Total Beds" value={stats.totalBeds} icon={Users} />
              <TopStat label="Occupied" value={stats.filledBeds} icon={TrendingUp} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
              <TopStat label="Occupancy" value={`${stats.occupancy}%`} icon={Percent} isAccent />

              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 ml-2"
              >
                <Plus size={16} /> Add New PG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* CONTROLS TOOLBAR: SEARCH & STATUS FILTER */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by PG name, locality or city..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* STATUS TABS */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: `All Properties (${stats.total})` },
              { id: 'APPROVED', label: `Approved (${stats.approvedCount})` },
              { id: 'PENDING', label: `Verifying (${stats.total - stats.approvedCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* PG PROPERTIES GRID */}
        <div>
          {loading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-indigo-600" size={36} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading PG Portfolio...</span>
            </div>
          ) : filteredPgs.length === 0 ? (
            <EmptyState onAdd={() => setShowCreate(true)} isSearch={Boolean(searchTerm || statusFilter !== 'ALL')} />
          ) : (
            <motion.div
              layout
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode='popLayout'>
                {filteredPgs.map((pg) => (
                  <PgCard
                    key={pg.id}
                    pg={pg}
                    onPricing={() => handleOpenPricing(pg)}
                    onTerms={() => handleOpenTerms(pg)}
                    onQr={() => setShowQrFor(pg.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {/* PRICING MODAL */}
        {showPricingModal && (
          <Modal
            onClose={() => setShowPricingModal(false)}
            title="Room Pricing Model"
            subtitle={selectedPgForPricing?.pgName}
            icon={<IndianRupee />}
            className="max-w-xl"
          >
            <div className="space-y-6">
              <section className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">One-Time Admission / Maintenance Fee</label>
                <div className="relative flex items-center bg-white rounded-xl px-4 py-2.5 border border-slate-200">
                  <span className="text-sm font-black text-slate-400 mr-2">₹</span>
                  <input
                    type="number"
                    value={pricingForm.charges}
                    onChange={(e) => setPricingForm({ ...pricingForm, charges: Number(e.target.value) })}
                    className="w-full bg-transparent border-none p-0 text-base font-black text-slate-900 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Admission Charge"
                  />
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <SectionHeader title="Sharing Tier Rates" />
                  <button
                    onClick={() => {
                      const nextS = pricingForm.pricingList.length > 0 ? Math.max(...pricingForm.pricingList.map(p=>p.sharing)) + 1 : 1
                      setPricingForm(prev => ({
                        ...prev,
                        pricingList: [
                          ...prev.pricingList,
                          { sharing: nextS, roomType: 'AC', dailyRate: 0, monthlyRate: 0 },
                          { sharing: nextS, roomType: 'NON_AC', dailyRate: 0, monthlyRate: 0 }
                        ]
                      }))
                    }}
                    className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors uppercase tracking-widest"
                  >
                    + Add Sharing Tier
                  </button>
                </div>

                <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
                  {Object.entries(groupedPricing).map(([s, items]) => (
                    <div key={s} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-5 py-2.5 flex items-center justify-between border-b border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-900 tracking-wider">{s} Sharing Tier</span>
                      </div>
                      <div className="p-4 space-y-3">
                        {items.map((item) => (
                          <div key={item.originalIndex} className="flex items-center gap-3">
                            <CustomDropdown
                              label="Type"
                              value={item.roomType}
                              options={['AC', 'NON_AC']}
                              onChange={(val) => {
                                const newList = [...pricingForm.pricingList]
                                newList[item.originalIndex].roomType = val
                                setPricingForm({ ...pricingForm, pricingList: newList })
                              }}
                              className="w-[110px]"
                            />
                            <div className="flex-1 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">₹</span>
                              <input
                                type="number"
                                value={item.monthlyRate}
                                onChange={(e) => {
                                  const newList = [...pricingForm.pricingList]
                                  newList[item.originalIndex].monthlyRate = Number(e.target.value)
                                  setPricingForm({ ...pricingForm, pricingList: newList })
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-6 pr-3 text-xs font-bold outline-none focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Monthly Rent"
                              />
                            </div>
                            <div className="flex-1 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">₹</span>
                              <input
                                type="number"
                                value={item.dailyRate}
                                onChange={(e) => {
                                  const newList = [...pricingForm.pricingList]
                                  newList[item.originalIndex].dailyRate = Number(e.target.value)
                                  setPricingForm({ ...pricingForm, pricingList: newList })
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-6 pr-3 text-xs font-bold outline-none focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Daily Rate"
                              />
                            </div>
                            <button
                              onClick={() => setPricingForm(prev => ({ ...prev, pricingList: prev.pricingList.filter((_,i)=>i!==item.originalIndex) }))}
                              className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {Object.keys(groupedPricing).length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      No rates configured. Click "+ Add Sharing Tier" above.
                    </div>
                  )}
                </div>
              </section>

              <button
                onClick={handleUpdatePricing}
                disabled={updatingPricing}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {updatingPricing ? <Loader2 className="animate-spin" size={16} /> : 'Save Pricing Structure'}
              </button>
            </div>
          </Modal>
        )}

        {/* TERMS & CONDITIONS MODAL */}
        {showTermsModal && (
          <Modal
            onClose={() => setShowTermsModal(false)}
            title="Legal & House Rules Agreement"
            subtitle={selectedPgForPricing?.pgName}
            icon={<FileText />}
            className="max-w-lg"
          >
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                <FileSearch size={36} />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Terms & Conditions Document</h4>
                <p className="text-slate-500 text-xs font-medium px-4">Upload a PDF document outlining resident rules, rent policies, and legal terms.</p>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group">
                <div className="relative z-10 space-y-5">
                  {selectedPgForPricing?.termsAndConditionsUrl ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-400 text-[9px] font-black uppercase tracking-widest bg-emerald-400/10 py-1.5 px-4 rounded-full w-fit mx-auto border border-emerald-400/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active PDF Agreement Uploaded
                    </div>
                  ) : (
                    <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest">No Legal Document Uploaded Yet</div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    {selectedPgForPricing?.termsAndConditionsUrl && (
                      <a
                        href={getFullImageUrl(selectedPgForPricing.termsAndConditionsUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                      >
                        <ExternalLink size={14} /> View Current Document PDF
                      </a>
                    )}
                    <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-500 transition-all shadow-md">
                      {uploadingTerms ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                      {selectedPgForPricing?.termsAndConditionsUrl ? 'Replace PDF Agreement' : 'Upload Agreement PDF'}
                      <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Accepted Format: PDF • Max Size: 5MB</p>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* QR CODE REGISTRATION MODAL */}
        {showQrFor && (
          <Modal
            onClose={() => setShowQrFor(null)}
            title="Tenant Self-Registration QR"
            subtitle={pgs.find(p => p.id === showQrFor)?.pgName}
            icon={<QrCode />}
            className="max-w-md"
          >
            <div className="text-center space-y-6">
              <div>
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Digital Resident Onboarding</p>
                <p className="text-slate-500 text-xs font-medium mt-1">Tenants can scan this QR code to register directly to this PG.</p>
              </div>

              <div className="inline-block p-5 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/mmp/pg/${showQrFor}/qr`}
                  alt="Registration QR Code"
                  className="w-48 h-48 mix-blend-multiply mx-auto"
                />
              </div>

              <div className="space-y-3">
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Direct Registration Link</p>
                  <div className="text-[11px] font-bold text-indigo-700 break-all select-all leading-relaxed bg-white p-3 rounded-lg border border-indigo-100">
                    {window.location.origin}/mmp/register/{showQrFor}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/mmp/register/${showQrFor}`)
                    toast.success('Registration URL copied to clipboard')
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
                >
                  Copy URL Link
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Right Slide-Over Drawer - Add New PG Property */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
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
                      <Building2 size={20} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black uppercase tracking-tight text-white truncate">
                        Add New PG Property
                      </h3>
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-0.5 truncate">
                        Register new property & location profile
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 ml-2"
                    title="Close Drawer"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Drawer Form Body */}
                <form onSubmit={create} className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/30">
                    
                    {/* BASIC PG PROFILE */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-3">
                        Property Specifications
                      </h4>

                      <FormInput
                        label="Business Entity Name"
                        value={businessName}
                        onChange={setBusinessName}
                        placeholder="e.g. Sunrise Stays"
                        required
                      />

                      <FormInput
                        label="PG Property Name"
                        value={pgName}
                        onChange={setPgName}
                        placeholder="e.g. Sunrise Mens Luxury PG"
                        required
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <FormInput
                          label="Total Floors"
                          type="number"
                          value={totalFloors}
                          onChange={setTotalFloors}
                          placeholder="e.g. 4"
                          required
                        />

                        <FormInput
                          label="Bed Capacity"
                          type="number"
                          value={totalBeds}
                          onChange={setTotalBeds}
                          placeholder="e.g. 40"
                          required
                        />
                      </div>
                    </div>

                    {/* LOCATION & ADDRESS */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-3">
                        Location & Address Details
                      </h4>

                      {/* 1. Street / Door No / Landmark Address FIRST */}
                      <FormInput
                        label="Street / Door No / Landmark Address"
                        value={address}
                        onChange={setAddress}
                        placeholder="Door No, Street Name, Landmark"
                        required
                      />

                      {/* 2. Pincode SECOND */}
                      <div className="relative">
                        <FormInput
                          label="Pincode (6-digits)"
                          value={pincode}
                          onChange={(v) => {
                            const val = v.replace(/\D/g, '').slice(0,6)
                            setPincode(val)
                            if (val.length === 6) fetchAddressFromPincode(val)
                          }}
                          placeholder="e.g. 560001"
                          required
                        />
                        {pinLoading && (
                          <div className="absolute right-3.5 bottom-3 animate-spin text-indigo-600">
                            <Loader2 size={16} />
                          </div>
                        )}
                        {pinError && (
                          <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1 ml-1">
                            {pinError}
                          </p>
                        )}
                      </div>

                      {/* 3. Locality Area THIRD - Upgraded CustomDropdown UI */}
                      {areas.length > 1 ? (
                        <CustomDropdown
                          label="Locality Area"
                          value={area}
                          options={[
                            { id: '', label: 'Select Locality Area...' },
                            ...areas.map(a => ({ id: a.Name, label: a.Name }))
                          ]}
                          onChange={(val) => {
                            const a = areas.find(x => x.Name === val)
                            setArea(val)
                            if (a) setCity(a.Block || a.District)
                          }}
                          icon={MapPin}
                          className="w-full"
                          labelBg="bg-white"
                        />
                      ) : (
                        <FormInput
                          label="Area Locality"
                          value={area}
                          onChange={setArea}
                          placeholder={areas.length === 1 ? area : "Locality area (auto-filled from pincode)"}
                          readOnly={areas.length === 1}
                        />
                      )}

                      {/* 4. City, District, State FOURTH */}
                      <div className="grid grid-cols-3 gap-2">
                        <FormInput label="City" value={city} readOnly />
                        <FormInput label="District" value={district} readOnly />
                        <FormInput label="State" value={stateName} readOnly />
                      </div>
                    </div>
                  </div>

                  {/* Drawer Fixed Footer Bar */}
                  <div className="p-4 bg-white border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-3 shadow-lg">
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !pgName || pincode.length !== 6}
                      className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-40 shadow-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                    >
                      {creating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      {creating ? 'Saving...' : 'Save Property'}
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

/* =====================================================
   SUB-COMPONENTS
===================================================== */
function TopStat({ label, value, icon: Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50', isAccent = false }) {
  if (isAccent) {
    colorClass = 'text-white'
    bgClass = 'bg-indigo-600'
  }
  return (
    <div className="bg-white p-3 px-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3 hover:shadow-md transition-all cursor-default min-w-[110px]">
      <div className={`h-9 w-9 rounded-xl ${bgClass} ${colorClass} flex items-center justify-center shrink-0`}>
        {React.isValidElement(Icon) ? Icon : <Icon className="w-4 h-4" strokeWidth={2.5} />}
      </div>
      <div className="min-w-0">
        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</div>
        <div className="text-base font-black text-slate-900 leading-tight truncate">{value}</div>
      </div>
    </div>
  )
}

const PgCard = React.forwardRef(({ pg, onPricing, onTerms, onQr }, ref) => {
  const { setActivePgDetailId } = useAppScope()
  const occupancyPct = pg.totalBeds > 0 ? Math.round(((pg.filledBeds || 0) / pg.totalBeds) * 100) : 0

  return (
    <motion.div
      ref={ref}
      layout
      variants={itemVariants}
      className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* CARD HEADER */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shrink-0 shadow-sm">
              <Building2 size={22} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-snug truncate">{pg.pgName}</h3>
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest truncate">{pg.businessName || 'Accommodation'}</p>
            </div>
          </div>

          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
            (pg.approved || pg.status === 'APPROVED') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
            {(pg.approved || pg.status === 'APPROVED') ? 'Approved' : 'Verifying'}
          </span>
        </div>

        {/* LOCATION ROW */}
        <div className="flex items-center gap-1.5 text-slate-400 mb-5 px-0.5">
          <MapPin size={13} className="shrink-0 text-slate-400" />
          <p className="text-[9px] font-black uppercase tracking-widest truncate">
            {pg.address?.areaLocality || 'Area'}, {pg.address?.city} {pg.createdAt && ` • Added ${new Date(pg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
          </p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <StatItem label="Floors" value={pg.pgFloors || pg.totalFloors || 0} />
          <StatItem label="Total Beds" value={pg.totalBeds || 0} />
          <StatItem label="Occupied" value={pg.filledBeds || 0} isAccent />
        </div>

        {/* OCCUPANCY BAR */}
        <div className="mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
            <span>Occupancy Rate</span>
            <span className="text-slate-800 font-extrabold">{occupancyPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${occupancyPct}%` }} />
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <ActionButton icon={<QrCode size={13} />} label="QR" onClick={onQr} />
          <ActionButton icon={<IndianRupee size={13} />} label="Rates" onClick={onPricing} />
          <ActionButton icon={<FileText size={13} />} label="T&C" onClick={onTerms} />
        </div>

        <Link
          to="/pg-details"
          onClick={() => setActivePgDetailId(pg.id)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-sm whitespace-nowrap"
        >
          Manage <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  )
})

function StatItem({ label, value, isAccent = false }) {
  return (
    <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 flex flex-col items-start transition-colors hover:bg-white hover:border-indigo-100">
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</span>
      <span className={`text-base font-black leading-none ${isAccent ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</span>
    </div>
  )
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 hover:border-indigo-200 hover:bg-white hover:text-indigo-600 transition-all shrink-0 shadow-2xs"
    >
      <span className="text-slate-400 hover:text-indigo-600">{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
    </button>
  )
}

function EmptyState({ onAdd, isSearch = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-24 text-center px-6 shadow-sm"
    >
      <div className="mx-auto w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
        <Building2 size={36} />
      </div>
      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
        {isSearch ? 'No matching properties found' : 'No PG Properties Found'}
      </h3>
      <p className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-sm mx-auto">
        {isSearch
          ? 'Try adjusting your search terms or filter criteria.'
          : 'Add your first PG property to begin managing floors, beds, tenants, and collections.'}
      </p>
      {!isSearch && (
        <button
          onClick={onAdd}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={16} /> Add Your First PG
        </button>
      )}
    </motion.div>
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
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full ${className} bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200`}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
              {React.isValidElement(icon) ? icon : React.cloneElement(icon, { size: 20 })}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none truncate">{title}</h3>
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1 truncate">{subtitle || 'Property Manager'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
})

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-1 w-5 bg-indigo-600 rounded-full" />
      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
    </div>
  )
}

function FormInput({ label, value, onChange, placeholder, type = 'text', readOnly = false, required = false }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label} {required && '*'}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${
          readOnly ? 'opacity-60 cursor-not-allowed bg-slate-100' : 'hover:bg-white'
        } ${type === 'number' ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''}`}
      />
    </div>
  )
}
