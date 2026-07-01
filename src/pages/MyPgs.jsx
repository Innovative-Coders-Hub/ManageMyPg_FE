import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { createPg, getAllPgs, updatePgPricing, uploadPgTerms } from '../api/ownerAuth'
import PageHeader from '../components/PageHeader'
import {
  Plus,
  MapPin,
  ChevronRight,
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
  Users
} from 'lucide-react'

export default function MyPgs() {
  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQrFor, setShowQrFor] = useState(null)

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
      toast.error('Failed to load PGs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => {
    const total = pgs.length
    const totalBeds = pgs.reduce((acc, p) => acc + (Number(p.totalBeds) || 0), 0)
    const filledBeds = pgs.reduce((acc, p) => acc + (Number(p.filledBeds) || 0), 0)
    const occupancy = totalBeds > 0 ? Math.round((filledBeds / totalBeds) * 100) : 0
    return { total, totalBeds, filledBeds, occupancy }
  }, [pgs])



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
      toast.success('Pricing model updated')
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
      toast.success('Terms uploaded successfully')
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
      toast.success('PG Added!')
      setShowCreate(false)
      load()
    } catch {
      toast.error('Error creating PG')
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dynamic Header & Stats Section */}
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Portfolio Units"
            subtitle="Asset inventory & operational oversight"
          >
            <div className="flex flex-wrap items-center justify-end gap-1">
              <TopStat label="PGs" value={stats.total} icon={<Building2 />} />
              <TopStat label="Total Beds" value={stats.totalBeds} icon={<Users />} />
              <TopStat label="Filled" value={stats.filledBeds} icon={<TrendingUp />} />
              <TopStat label="Occupancy" value={`${stats.occupancy}%`} icon={<Percent />} isAccent />

              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-200 ml-2"
              >
                <Plus size={14} /> Add PG
              </button>
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        {/* PG Grid */}
        <div className="mt-1">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-80 rounded-xl bg-white border border-slate-100 animate-pulse" />)}
            </div>
          ) : pgs.length === 0 ? (
            <EmptyState onAdd={() => setShowCreate(true)} />
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode='popLayout'>
                {pgs.map((pg) => (
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

      {/* Modals */}
      <AnimatePresence>
        {showPricingModal && (
          <Modal
            onClose={() => setShowPricingModal(false)}
            title="Price Settings"
            subtitle={selectedPgForPricing?.pgName}
            icon={<IndianRupee />}
            className="max-w-lg"
          >
            <div className="space-y-6">
              <section>
                <div className="bg-slate-50 px-5 py-3 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 block ml-1">Admission Fee</label>
                  <div className="relative flex items-center">
                    <span className="text-sm font-black text-slate-400 mr-1.5">₹</span>
                    <input
                      type="number"
                      value={pricingForm.charges}
                      onChange={(e) => setPricingForm({ ...pricingForm, charges: Number(e.target.value) })}
                      className="w-full bg-transparent border-none p-0 text-base font-black text-slate-900 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <SectionHeader title="Sharing Prices" />
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
                    className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl hover:bg-indigo-100"
                  >
                    + PRICING
                  </button>
                </div>

                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(groupedPricing).map(([s, items]) => (
                    <div key={s} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-b border-slate-200">
                        <span className="text-[10px] font-black uppercase text-slate-900">{s} Sharing</span>
                      </div>
                      <div className="p-4 space-y-3">
                        {items.map((item) => (
                          <div key={item.originalIndex} className="flex items-center gap-3">
                            <select
                              value={item.roomType}
                              onChange={(e) => {
                                const newList = [...pricingForm.pricingList]
                                newList[item.originalIndex].roomType = e.target.value
                                setPricingForm({ ...pricingForm, pricingList: newList })
                              }}
                              className={`text-[10px] font-black p-2 rounded-xl border-none ring-1 ring-slate-100 ${item.roomType==='AC'?'bg-indigo-50 text-indigo-600 ring-indigo-100':'bg-slate-50 text-slate-600'}`}
                            >
                              <option value="AC">AC</option>
                              <option value="NON_AC">NON-AC</option>
                            </select>
                            <div className="flex-1 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">₹</span>
                              <input
                                type="number"
                                value={item.monthlyRate}
                                onChange={(e) => {
                                  const newList = [...pricingForm.pricingList]
                                  newList[item.originalIndex].monthlyRate = Number(e.target.value)
                                  setPricingForm({ ...pricingForm, pricingList: newList })
                                }}
                                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-6 pr-3 text-xs font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Monthly"
                              />
                            </div>
                            <div className="flex-1 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">₹</span>
                              <input
                                type="number"
                                value={item.dailyRate}
                                onChange={(e) => {
                                  const newList = [...pricingForm.pricingList]
                                  newList[item.originalIndex].dailyRate = Number(e.target.value)
                                  setPricingForm({ ...pricingForm, pricingList: newList })
                                }}
                                className="w-full bg-slate-50 border-none rounded-xl py-2 pl-6 pr-3 text-xs font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Daily"
                              />
                            </div>
                            <button
                              onClick={() => setPricingForm(prev => ({ ...prev, pricingList: prev.pricingList.filter((_,i)=>i!==item.originalIndex) }))}
                              className="p-2 text-slate-300 hover:text-rose-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <button
                onClick={handleUpdatePricing}
                disabled={updatingPricing}
                className="w-full px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {updatingPricing ? <Loader2 className="animate-spin" size={14} /> : 'Confirm Pricing Structure'}
              </button>
            </div>
          </Modal>
        )}

        {showTermsModal && (
          <Modal
            onClose={() => setShowTermsModal(false)}
            title="Legal Hub"
            subtitle={selectedPgForPricing?.pgName}
            icon={<FileText />}
            className="max-w-lg"
          >
            <div className="text-center space-y-8">
              <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                <FileSearch size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Terms & Conditions</h4>
                <p className="text-slate-500 text-sm font-medium px-8">Upload a PDF document outlining your house rules, refund policies, and legal agreements.</p>
              </div>

              <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-6">
                  {selectedPgForPricing?.termsAndConditionsUrl ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-400/10 py-2 px-4 rounded-full w-fit mx-auto border border-emerald-400/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Document Active
                    </div>
                  ) : (
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No Document Found</div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    {selectedPgForPricing?.termsAndConditionsUrl && (
                      <a
                        href={selectedPgForPricing.termsAndConditionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-3 w-full px-4 py-1.5 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                      >
                        <LayoutGrid size={16} /> View Current PDF
                      </a>
                    )}
                    <label className="flex items-center justify-center gap-3 w-full px-4 py-1.5 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40">
                      {uploadingTerms ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {selectedPgForPricing?.termsAndConditionsUrl ? 'Replace Agreement' : 'Upload Agreement'}
                      <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Format: PDF • Limit: 5MB</p>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {showQrFor && (
          <Modal
            onClose={() => setShowQrFor(null)}
            title="Registration Hub"
            subtitle={pgs.find(p => p.id === showQrFor)?.pgName}
            icon={<QrCode />}
            className="max-w-md"
          >
            <div className="text-center">
              <div className="mb-8">
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="h-[2px] w-4 bg-indigo-600 rounded-full" />
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Scan to Tenant Register</p>
                  <div className="h-[2px] w-4 bg-indigo-600 rounded-full" />
                </div>
              </div>

              <div className="inline-block p-6 bg-slate-50 rounded-xl border border-slate-200 mb-6 relative group">
                <div className="absolute inset-0 bg-indigo-600/5 scale-90 rounded-xl group-hover:scale-105 transition-transform" />
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}/mmp/pg/${showQrFor}/qr`}
                  alt="QR"
                  className="relative w-48 h-48 mix-blend-multiply"
                />
              </div>
              <div className="space-y-4">
                <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">Direct Onboarding URL</p>
                  <div className="text-[11px] font-bold text-indigo-600 break-all select-all leading-relaxed bg-white p-4 rounded-xl border border-indigo-100/50">
                    {window.location.origin}/mmp/register/{showQrFor}
                  </div>
                </div>
                <button
                  onClick={() => setShowQrFor(null)}
                  className="w-full px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                >
                  Dismiss QR
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showCreate && (
          <Modal onClose={() => setShowCreate(false)} title="New PG" icon={<Plus />} className="max-w-xl">
            <form onSubmit={create} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormInput label="Business Entity" value={businessName} onChange={setBusinessName} placeholder="Sunrise Enterprises" required />
                <FormInput label="PG Name" value={pgName} onChange={setPgName} placeholder="Sunrise Mens Luxury PG" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Floors" type="number" value={totalFloors} onChange={setTotalFloors} placeholder="0" required />
                <FormInput label="Capacity (Beds)" type="number" value={totalBeds} onChange={setTotalBeds} placeholder="0" required />
              </div>

              <div className="pt-6 border-t border-slate-100">
                <SectionHeader title="Geographic Details" />
                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div className="relative">
                    <FormInput
                      label="Pincode"
                      value={pincode}
                      onChange={(v) => {
                        const val = v.replace(/\D/g, '').slice(0,6)
                        setPincode(val)
                        if (val.length===6) fetchAddressFromPincode(val)
                      }}
                      placeholder="600001"
                      required
                    />
                    {pinLoading && <div className="absolute right-4 bottom-4 animate-spin text-indigo-600"><Loader2 size={16} /></div>}
                    {pinError && <p className="absolute left-1 -bottom-5 text-[9px] font-black text-rose-500 uppercase tracking-widest">{pinError}</p>}
                  </div>

                  {areas.length > 1 ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Locality</label>
                      <select
                        value={area}
                        onChange={(e) => {
                          const a = areas.find(x => x.Name === e.target.value)
                          setArea(e.target.value)
                          if(a) setCity(a.Block || a.District)
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                      >
                        <option value="">Select Area...</option>
                        {areas.map(a => <option key={a.Name} value={a.Name}>{a.Name}</option>)}
                      </select>
                    </div>
                  ) : (
                    <FormInput label="Locality" value={area} onChange={setArea} readOnly />
                  )}

                  <FormInput label="Complete Address" value={address} onChange={setAddress} placeholder="Street, Door No, Building Name" required />

                  <div className="grid grid-cols-3 gap-3">
                    <FormInput label="City" value={city} readOnly />
                    <FormInput label="District" value={district} readOnly />
                    <FormInput label="State" value={stateName} readOnly />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-1.5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600">Discard</button>
                <button
                  type="submit"
                  disabled={creating || !pgName || pincode.length !== 6}
                  className="flex-[2] px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {creating ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Save PG'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function TopStat({ label, value, icon, isAccent = false }) {
  return (
    <div className={`px-4 py-2 rounded-xl border flex flex-col items-center justify-center transition-all min-w-[84px] ${isAccent ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`}>
      <div className={`flex items-center gap-2 mb-0.5 ${isAccent ? 'text-indigo-100' : 'text-slate-400'}`}>
        {React.cloneElement(icon, { size: 10 })}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-black leading-none">{value}</div>
    </div>
  )
}

const PgCard = React.forwardRef(({ pg, onPricing, onTerms, onQr }, ref) => {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full flex flex-col"
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shrink-0">
            <Building2 size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none truncate">{pg.pgName}</h3>
            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 truncate">{pg.businessName || 'Accommodation'}</p>
          </div>
        </div>
        <div className={`shrink-0 px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${pg.approved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
          {pg.approved ? 'Approved' : 'Verifying'}
        </div>
      </div>

      {/* Location Bar */}
      <div className="flex items-center gap-1.5 text-slate-400 mb-5 px-0.5">
        <MapPin size={12} className="shrink-0" />
        <p className="text-[9px] font-black uppercase tracking-widest truncate">
          {pg.address?.areaLocality || 'Area'}, {pg.address?.city} {pg.createdAt && ` • ${new Date(pg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <StatItem label="Floors" value={pg.totalFloors || 0} />
        <StatItem label="Beds" value={pg.totalBeds || 0} />
        <StatItem label="Occupied" value={pg.filledBeds || 0} isAccent />
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar pt-1">
        <div className="flex items-center gap-1.5">
          <ActionButton icon={<QrCode size={13} />} label="QR Code" onClick={onQr} />
          <ActionButton icon={<IndianRupee size={13} />} label="Pricing" onClick={onPricing} />
          <ActionButton icon={<FileText size={13} />} label="View T&C" onClick={onTerms} />
        </div>

        <Link
          to={`/pg/${pg.id}`}
          className="ml-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-slate-100 min-w-[70px] whitespace-nowrap"
        >
          Enter <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  )
})

function StatItem({ label, value, isAccent = false }) {
  return (
    <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100/50 flex flex-col items-start">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-lg font-black leading-none ${isAccent ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</p>
    </div>
  )
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 hover:border-indigo-100 hover:bg-white transition-all group shrink-0"
    >
      <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-tight whitespace-nowrap">{label}</span>
    </button>
  )
}


function EmptyState({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border-2 border-dashed border-slate-200 py-24 text-center px-8"
    >
      <div className="mx-auto w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mb-8 border border-slate-100">
        <Building2 size={40} />
      </div>
      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
        Start your journey
      </h2>
      <p className="mt-4 text-slate-500 font-medium max-w-sm mx-auto">
        Add your first PG to start managing tenants, collections and maintenance.
      </p>
      <button
        onClick={onAdd}
        className="mt-10 inline-flex items-center gap-3 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
      >
        Create First PG <ArrowRight size={16} />
      </button>
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
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full ${className} bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200`}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
              {React.cloneElement(icon, { size: 18 })}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-none truncate">{title}</h3>
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1.5 truncate">{subtitle || 'Professional Suite'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all shrink-0 ml-2 border border-slate-100">
            <X size={16} />
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
    <div className="flex items-center gap-3 mb-5">
      <div className="h-1 w-6 bg-indigo-600 rounded-full" />
      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
    </div>
  )
}

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
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${readOnly ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:bg-white'} ${type === 'number' ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''}`}
      />
    </div>
  )
}
