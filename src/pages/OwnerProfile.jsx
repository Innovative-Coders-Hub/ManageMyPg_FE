import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO'
import {
  X,
  Camera,
  User,
  Settings,
  MapPin,
  Mail,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Lock,
  ChevronDown,
  Building2,
  Phone
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../components/PageHeader'
import CustomDropdown from '../components/CustomDropdown'
import { getOwnerProfile, updateOwnerAddress, uploadOwnerProfileImage, deleteOwnerAccount } from '../api/ownerAuth'
import ProfileImageCropper from '../components/models/ProfileImageCropper'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.managemypg.com/managemypg'

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

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isPolicyViewOnly, setIsPolicyViewOnly] = useState(false)
  const [agreedToDelete, setAgreedToDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const getFullImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const base = API_BASE_URL.replace(/\/$/, '')
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${base}${normalizedPath}`
  }

  /* ---------- Prevent background scroll when modal open ---------- */
  useEffect(() => {
    document.body.style.overflow = (rawImage || showViewModal || showDeleteModal) ? 'hidden' : 'auto'
    return () => (document.body.style.overflow = 'auto')
  }, [rawImage, showViewModal, showDeleteModal])

  /* ---------- Load profile ---------- */
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getOwnerProfile()
        setProfile(data)

        if (isOnboarding && data.isAddress) {
          navigate('/home', { replace: true })
        }
      } catch (e) {
        console.error('Failed to load profile', e)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [navigate, isOnboarding])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Account Profile...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="text-rose-500" size={48} />
        <p className="text-slate-600 font-bold text-xs">Failed to load profile. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
        >
          Retry
        </button>
      </div>
    )
  }

  const isMandatory = !profile.isAddress
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

  async function handleDeleteAccount() {
    if (!agreedToDelete) return
    setDeleting(true)
    try {
      await deleteOwnerAccount()
      toast.success('Account deleted successfully')
      localStorage.clear()
      window.location.href = '/manage/mypg/signin'
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <SEO
        title={isOnboarding ? "Complete Your Profile" : "Owner Profile Settings"}
        description="Manage your personal information, security settings, and account preferences."
      />

      {/* STICKY HEADER */}
      <div className="bg-white border-b border-slate-200/80 pt-4 pb-4 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <User size={14} />
                <span>Account Administration</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Profile Settings
              </h1>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 shadow-2xs">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Account Active & Verified
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* MANDATORY ACTION BANNER */}
        {isMandatory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 flex items-center gap-3 shadow-sm"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Settings className="text-amber-600 animate-spin-slow" size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Action Required</p>
              <p className="text-xs font-bold text-amber-900">Please complete your address details to finalize account setup.</p>
            </div>
          </motion.div>
        )}

        {/* SECURITY & PROFILE NOTICE BANNER */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 text-indigo-950 flex items-start gap-4 shadow-2xs">
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-2xs border border-indigo-100 text-indigo-600">
            <ShieldCheck size={22} />
          </div>
          <div className="space-y-1.5 flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600">Security & Profile Integrity</p>
            <p className="text-xs font-bold leading-relaxed text-slate-800">
              Keep your profile updated with correct address details to ensure seamless legal document generation and verified property ownership across all PGs.
            </p>
            {isReadOnly && (
              <div className="pt-2 border-t border-indigo-100/60 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <ShieldAlert size={13} className="text-indigo-600 shrink-0" />
                <span>Primary account credentials are verified. Contact support if you need to alter registered email or phone numbers.</span>
              </div>
            )}
          </div>
        </div>

        {/* MAIN LAYOUT: SIDEBAR & FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT SIDEBAR (4 COLS) */}
          <div className="lg:col-span-4 2xl:col-span-3 space-y-6">
            
            {/* AVATAR CARD */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col items-center shadow-sm">
              <div className="relative group">
                <div
                  className="h-36 w-36 rounded-full overflow-hidden border-4 border-slate-50 bg-indigo-600 text-white cursor-pointer flex items-center justify-center shadow-inner transition-transform hover:scale-[1.02] relative"
                  onClick={() => setShowViewModal(true)}
                >
                  {profile.profileImageUrl ? (
                    <img
                      src={getFullImageUrl(profile.profileImageUrl)}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black uppercase tracking-tight">{profile.fullName?.slice(0, 2).toUpperCase()}</span>
                  )}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[9px] font-black uppercase tracking-widest">View Photo</span>
                  </div>
                </div>

                {!isReadOnly && (
                  <label className="absolute bottom-1 right-1 bg-slate-900 text-white p-2.5 rounded-xl cursor-pointer shadow-md hover:bg-indigo-600 transition-all border-2 border-white">
                    <Camera size={16} />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              <div className="mt-6 text-center w-full">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate px-2">{profile.fullName}</h3>
                <div className="flex items-center justify-center gap-1.5 mt-1 text-slate-400">
                  <Mail size={12} />
                  <span className="text-xs font-bold text-slate-500">{profile.email}</span>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 w-full space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Username</span>
                    <span className="font-black text-slate-900">{profile.username}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone</span>
                    <span className="font-black text-slate-900">{profile.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-emerald-100">Verified Owner</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS & LEGAL LINKS */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsPolicyViewOnly(true)
                  setShowDeleteModal(true)
                }}
                className="w-full flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all text-left group shadow-2xs"
              >
                <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-white shadow-2xs transition-colors shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Trust & Transparency</p>
                  <p className="text-xs font-black text-slate-900">Privacy Policy</p>
                </div>
              </button>

              <Link
                to="/terms-and-conditions"
                className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-amber-200 hover:bg-amber-50/20 transition-all text-left group shadow-2xs"
              >
                <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-white shadow-2xs transition-colors shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Legal Agreement</p>
                  <p className="text-xs font-black text-slate-900">Terms & Conditions</p>
                </div>
              </Link>

              {!isOnboarding && (
                <>
                  <Link
                    to="/change-password"
                    className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all text-left group shadow-2xs"
                  >
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-white shadow-2xs transition-colors shrink-0">
                      <Lock size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Security Access</p>
                      <p className="text-xs font-black text-slate-900">Change Password</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => {
                      setIsPolicyViewOnly(false)
                      setAgreedToDelete(false)
                      setShowDeleteModal(true)
                    }}
                    className="w-full flex items-center gap-3 p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100 hover:bg-rose-100/60 transition-all text-left group shadow-2xs"
                  >
                    <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-rose-600 shadow-2xs shrink-0">
                      <Trash2 size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest">Account Removal</p>
                      <p className="text-xs font-black text-rose-600">Delete Account</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* RIGHT FORM CONTENT (8 COLS) */}
          <div className="lg:col-span-8 2xl:col-span-9 space-y-6">
            
            {/* BASIC DETAILS SECTION */}
            <Section
              title="Basic Account Details"
              icon={<User size={18} />}
              colorClass="text-indigo-600"
              bgClass="bg-indigo-50"
            >
              <Input label="Full Name" value={profile.fullName} onChange={v => updateField('fullName', v)} placeholder="John Doe" disabled={isReadOnly} />
              <Input label="Phone Number" value={profile.phone || ''} numeric maxLength={10} onChange={v => updateField('phone', v)} placeholder="10-digit phone" disabled={isReadOnly} />
              <Input label="Email Address" value={profile.email || ''} disabled placeholder="email@example.com" />
              <Input label="System Username" value={profile.username || ''} disabled />
            </Section>

            {/* LOCATION INFORMATION SECTION */}
            <Section
              title="Registered Location Information"
              icon={<MapPin size={18} />}
              highlight={isMandatory}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
            >
              <div className="sm:col-span-2">
                <Input
                  label="Registered Address"
                  value={profile.address?.address || ''}
                  onChange={v => updateField('address.address', v)}
                  placeholder="Street, Door No, Building Name"
                  disabled={isReadOnly}
                />
              </div>

              <Input
                label="Landmark"
                value={profile.address?.landmark || ''}
                onChange={v => updateField('address.landmark', v)}
                placeholder="Near Landmark / Hospital"
                disabled={isReadOnly}
              />

              <div className="relative">
                <Input
                  label="Pincode"
                  value={profile.address?.pinCode || ''}
                  numeric
                  maxLength={6}
                  onChange={v => {
                    updateField('address.pinCode', v)
                    if (v.length === 6) fetchAddressFromPincode(v)
                  }}
                  placeholder="6-digit pincode"
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
                <div className="sm:col-span-2 pt-2">
                  <CustomDropdown
                    label="Area / Locality"
                    value={profile.address?.areaLocality || ''}
                    disabled={isReadOnly}
                    options={areas.map(a => ({ id: a.Name, label: a.Name.toUpperCase() }))}
                    onChange={val => updateField('address.areaLocality', val)}
                    icon={MapPin}
                    className="w-full"
                  />
                </div>
              )}

              <Input label="City" value={profile.address?.city || ''} disabled />
              <Input label="District" value={profile.address?.district || ''} disabled />
              <Input label="State" value={profile.address?.state || ''} disabled />
              <Input label="Country" value={profile.address?.country || ''} disabled />
            </Section>

            {/* SAVE BUTTON FOR ONBOARDING / EDITING */}
            {!isReadOnly && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={
                    saving ||
                    !profile.address?.address ||
                    profile.address?.pinCode?.length !== 6 ||
                    !!pinError ||
                    (areas.length > 1 && !profile.address?.areaLocality)
                  }
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 active:scale-95 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Saving...
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

      {/* CROPPER COMPONENT */}
      {rawImage && (
        <ProfileImageCropper
          image={rawImage}
          onCancel={() => setRawImage(null)}
          onSave={handleCropSave}
        />
      )}

      {/* DELETE ACCOUNT & PRIVACY POLICY MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setShowDeleteModal(false)} />
            <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPolicyViewOnly ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                    {isPolicyViewOnly ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                      {isPolicyViewOnly ? 'Privacy Policy' : 'Account Deletion Request'}
                    </h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ManageMyPG Account Terms</p>
                  </div>
                </div>
                <button onClick={() => setShowDeleteModal(false)} className="p-2 bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-colors border border-slate-200">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto bg-white custom-scrollbar text-xs font-bold text-slate-600 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated: June 2026</p>
                <div className="space-y-4 text-xs font-medium text-slate-600 leading-relaxed">
                  <section>
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">1. Purpose</h5>
                    <p>This policy outlines the procedure for requesting account deletion and data removal under ManageMyPG privacy standards.</p>
                  </section>
                  <section>
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">2. Data Deletion Scope</h5>
                    <p>Upon account deletion, profile photos, personal identification information, and access credentials will be permanently erased.</p>
                  </section>
                  {!isPolicyViewOnly && (
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-3 mt-4 text-rose-900">
                      <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight">Warning: Irreversible Action</p>
                        <p className="text-[10px] font-bold text-rose-700 mt-0.5">Deleting your account is permanent. All your data across all PGs will be permanently removed.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3">
                {!isPolicyViewOnly && (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToDelete}
                      onChange={(e) => setAgreedToDelete(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">
                      I have read the policy and understand the consequences
                    </span>
                  </label>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    {isPolicyViewOnly ? 'Close Policy' : 'Cancel'}
                  </button>
                  {!isPolicyViewOnly && (
                    <button
                      disabled={!agreedToDelete || deleting}
                      onClick={handleDeleteAccount}
                      className="flex-[1.5] bg-rose-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                      {deleting ? 'Deleting Account...' : 'Confirm Permanent Deletion'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW PHOTO MODAL */}
        {showViewModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setShowViewModal(false)} />
            <div className="relative z-10 max-w-sm w-full bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 text-center">
              <div className="h-48 w-48 rounded-full overflow-hidden border-4 border-slate-100 shadow-md mx-auto mb-6 bg-indigo-600 flex items-center justify-center text-white">
                {profile.profileImageUrl ? (
                  <img
                    src={getFullImageUrl(profile.profileImageUrl)}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black uppercase">{profile.fullName?.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Section({ title, icon, children, highlight, colorClass = "text-indigo-600", bgClass = "bg-indigo-50" }) {
  return (
    <section
      className={`bg-white rounded-2xl border p-6 sm:p-8 transition-all ${
        highlight ? 'border-amber-200 shadow-md' : 'border-slate-200/80 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${highlight ? 'bg-amber-100 text-amber-600' : `${bgClass} ${colorClass} border border-slate-100`}`}>
          {icon}
        </div>
        <div className="flex items-center gap-3 flex-1">
          <h2 className={`text-xs font-black uppercase tracking-widest ${highlight ? 'text-amber-600' : colorClass}`}>{title}</h2>
          <div className="h-[1px] flex-1 bg-slate-100" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    <div className="space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:bg-white'
        }`}
      />
    </div>
  )
}
