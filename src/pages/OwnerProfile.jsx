import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, User, Settings, MapPin, Mail, Loader2, CheckCircle2, ShieldCheck, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import { getOwnerProfile, updateOwnerAddress, uploadOwnerProfileImage } from '../api/ownerAuth'
import ProfileImageCropper from '../components/models/ProfileImageCropper'

const IMAGE_BASE_URL = 'https://api.managemypg.com/managemypg'

export default function OwnerProfile({ mode = 'profile' }) {
  const navigate = useNavigate()
  const isOnboarding = mode === 'onboarding'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)

  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const [areas, setAreas] = useState([])

  const [rawImage, setRawImage] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  /* ---------- Prevent background scroll when modal open ---------- */
  useEffect(() => {
    document.body.style.overflow = (rawImage || showViewModal) ? 'hidden' : 'auto'
    return () => (document.body.style.overflow = 'auto')
  }, [rawImage, showViewModal])

  /* ---------- Load profile ---------- */
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getOwnerProfile()
        setProfile(data)

        if (isOnboarding && data.hasAddress) {
          navigate('/home', { replace: true })
        }
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [navigate, isOnboarding])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    )
  }

  const isMandatory = !profile.hasAddress
  const isReadOnly = !isOnboarding

  /* ---------- Helpers ---------- */
  function updateField(path, value) {
    setProfile(prev => {
      const copy = structuredClone(prev)
      let obj = copy
      const keys = path.split('.')
      keys.slice(0, -1).forEach(k => (obj = obj[k]))
      obj[keys.at(-1)] = value
      return copy
    })
  }

  async function fetchAddressFromPincode(pin) {
    if (pin.length !== 6) return
    try {
      setPinLoading(true)
      setPinError('')
      setAreas([])

      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await res.json()

      if (!data[0] || data[0].Status !== 'Success') {
        throw new Error('Invalid pincode')
      }

      const offices = data[0].PostOffice
      const first = offices[0]

      updateField('address.city', first.Block || first.District || first.Name)
      updateField('address.district', first.District)
      updateField('address.state', first.State)
      updateField('address.country', first.Country)

      if (offices.length > 1) {
        setAreas(offices)
      } else {
        updateField('address.areaLocality', first.Name)
      }
    } catch {
      setPinError('Invalid pincode')
    } finally {
      setPinLoading(false)
    }
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB')
      return
    }
    setRawImage(URL.createObjectURL(file))
    e.target.value = ''
  }

  async function handleCropSave(imgDataUrl) {
    try {
      setSaving(true)
      const res = await fetch(imgDataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
      const result = await uploadOwnerProfileImage(file)
      if (result.success) {
        updateField('profileImageUrl', result.data.profileImageUrl)
        toast.success('Profile picture updated!')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload image.')
    } finally {
      setSaving(false)
      setRawImage(null)
    }
  }

  async function handleSubmit() {
    setSaving(true)
    try {
      await updateOwnerAddress(profile.address)
      toast.success('Profile updated successfully!')
      if (isOnboarding) navigate('/home', { replace: true })
    } catch (err) {
      toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-200 pt-2 pb-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Profile Settings"
            subtitle="Manage your personal information and preferences"
          >
            <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-widest">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Account Active
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-2 pb-8">
        {isMandatory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Settings className="text-amber-600 animate-spin-slow" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Action Required</p>
              <p className="text-sm font-bold">Please complete your address details to finish registration.</p>
            </div>
          </motion.div>
        )}

        {isReadOnly && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800 flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Security Notice</p>
              <p className="text-sm font-bold">Profile details are locked for security reasons. If you need to update your information, please contact our support team.</p>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-4 2xl:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center shadow-sm">
              <div className="relative group">
                <div
                  className="h-40 w-40 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 cursor-pointer flex items-center justify-center shadow-inner transition-transform hover:scale-[1.02]"
                  onClick={() => setShowViewModal(true)}
                >
                  {profile.profileImageUrl ? (
                    <img
                      src={`${IMAGE_BASE_URL}${profile.profileImageUrl}`}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={64} className="text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">View Photo</span>
                  </div>
                </div>

                {!isReadOnly && (
                  <label className="absolute bottom-2 right-2 bg-indigo-600 text-white p-3 rounded-xl cursor-pointer shadow-lg hover:bg-slate-900 transition-all active:scale-95 border-2 border-white">
                    <Camera size={18} />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              <div className="mt-8 text-center w-full">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight truncate px-2">{profile.fullName}</h3>
                <div className="flex items-center justify-center gap-2 mt-2 text-slate-500">
                  <Mail size={12} />
                  <span className="text-xs font-bold">{profile.email}</span>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 w-full space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</span>
                    <span className="text-xs font-black text-slate-900">{profile.username}</span>
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 text-white overflow-hidden relative shadow-lg shadow-slate-200">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-2xl" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Security Tip</h4>
              <p className="text-xs font-bold leading-relaxed opacity-80">
                Keep your profile updated with correct address details to ensure seamless legal document generation for your PGs.
              </p>
            </div>

            <Link
              to="/privacy-policy"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-white transition-colors">
                <ShieldCheck size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-indigo-600">Trust & Transparency</p>
                <p className="text-xs font-black text-slate-900">Privacy Policy</p>
              </div>
            </Link>

            <Link
              to="/terms-and-conditions"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-white transition-colors">
                <FileText size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-indigo-600">Legal Agreement</p>
                <p className="text-xs font-black text-slate-900">Terms & Conditions</p>
              </div>
            </Link>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-8 2xl:col-span-9 space-y-6">
            <Section title="Basic Details" icon={<User size={16} />}>
              <Input label="Full Name" value={profile.fullName} onChange={v => updateField('fullName', v)} placeholder="John Doe" disabled={isReadOnly} />
              <Input label="Phone" value={profile.phone} numeric maxLength={10} onChange={v => updateField('phone', v)} placeholder="9876543210" disabled={isReadOnly} />
              <Input label="Email Address" value={profile.email} disabled placeholder="email@example.com" />
              <Input label="System Username" value={profile.username} disabled />
            </Section>

            <Section title="Location Information" icon={<MapPin size={16} />} highlight={isMandatory}>
              <div className="sm:col-span-2">
                <Input
                  label="Registered Address"
                  value={profile.address.address || ''}
                  onChange={v => updateField('address.address', v)}
                  placeholder="Street, Door No, Building Name"
                  disabled={isReadOnly}
                />
              </div>

              <Input
                label="Landmark"
                value={profile.address.landmark || ''}
                onChange={v => updateField('address.landmark', v)}
                placeholder="Near Apollo Hospital"
                disabled={isReadOnly}
              />

              <div className="relative">
                <Input
                  label="Pincode"
                  value={profile.address.pinCode || ''}
                  numeric
                  maxLength={6}
                  onChange={v => {
                    updateField('address.pinCode', v)
                    if (v.length === 6) fetchAddressFromPincode(v)
                  }}
                  placeholder="600001"
                  disabled={isReadOnly}
                />
                {pinLoading && (
                  <div className="absolute right-3 bottom-2.5">
                    <Loader2 className="animate-spin text-indigo-600" size={16} />
                  </div>
                )}
              </div>

              {pinError && (
                <div className="sm:col-span-2 mt-1 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100">
                  {pinError}
                </div>
              )}

              {areas.length > 1 && (
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Area / Locality</label>
                  <select
                    value={profile.address.areaLocality || ''}
                    disabled={isReadOnly}
                    onChange={e => updateField('address.areaLocality', e.target.value)}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${isReadOnly ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:bg-white hover:border-slate-300'}`}
                  >
                    <option value="">Select area...</option>
                    {areas.map(a => <option key={a.Name} value={a.Name}>{a.Name}</option>)}
                  </select>
                </div>
              )}

              <Input label="City" value={profile.address.city || ''} disabled />
              <Input label="District" value={profile.address.district || ''} disabled />
              <Input label="State" value={profile.address.state || ''} disabled />
              <Input label="Country" value={profile.address.country || ''} disabled />
            </Section>

            {!isReadOnly && (
              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
                >
                  Cancel Changes
                </button>
                <button
                  disabled={
                    saving ||
                    !profile.address?.address ||
                    profile.address.pinCode?.length !== 6 ||
                    !!pinError ||
                    (areas.length > 1 && !profile.address.areaLocality)
                  }
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 active:scale-95 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Processing...
                    </>
                  ) : (
                    'Save Profile Updates'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {rawImage && (
        <ProfileImageCropper
          image={rawImage}
          onCancel={() => setRawImage(null)}
          onSave={handleCropSave}
        />
      )}

      <AnimatePresence>
        {showViewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
              onClick={() => setShowViewModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative max-w-md w-full bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Profile Identity</h3>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all border border-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-8 flex flex-col items-center bg-slate-50/50">
                <div className="h-64 w-64 rounded-full overflow-hidden border-8 border-white shadow-xl mb-8 bg-white">
                  {profile.profileImageUrl ? (
                    <img
                      src={`${IMAGE_BASE_URL}${profile.profileImageUrl}`}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-200">
                      <User size={100} />
                    </div>
                  )}
                </div>

                <div className={`grid ${isReadOnly ? 'grid-cols-1' : 'grid-cols-2'} w-full gap-3`}>
                  {!isReadOnly && (
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-100">
                      <Camera size={14} />
                      Upload New
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          setShowViewModal(false)
                          handleImageChange(e)
                        }}
                      />
                    </label>
                  )}
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Close View
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Section({ title, icon, children, highlight }) {
  return (
    <section
      className={`bg-white rounded-xl border p-6 transition-all ${
        highlight ? 'border-amber-200 shadow-lg shadow-amber-50' : 'border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
          {icon}
        </div>
        <div className="flex items-center gap-3 flex-1">
          <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{title}</h2>
          <div className="h-[1px] flex-1 bg-slate-100" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
        {children}
      </div>
    </section>
  )
}

function Input({ label, value, onChange, disabled, numeric, maxLength, placeholder }) {
  function handleChange(e) {
    let v = e.target.value
    if (numeric) v = v.replace(/\D/g, '')
    if (maxLength) v = v.slice(0, maxLength)
    onChange?.(v)
  }

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:bg-white hover:border-slate-300'}`}
      />
    </div>
  )
}
