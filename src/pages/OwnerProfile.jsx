import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Camera, User, Settings, MapPin, Mail, Loader2, CheckCircle2, ShieldCheck, FileText, Trash2, AlertTriangle, ShieldAlert, Lock, ChevronDown } from 'lucide-react'
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="text-rose-500" size={48} />
        <p className="text-slate-600 font-bold">Failed to load profile. Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest"
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

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-[1.5rem] border border-indigo-100 bg-indigo-50/30 p-5 text-indigo-900 flex items-start gap-4 shadow-sm"
        >
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-indigo-50">
            <ShieldCheck className="text-indigo-600" size={24} />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-1">Security & Profile Notice</p>
              <p className="text-sm font-bold leading-relaxed">
                Keep your profile updated with correct address details to ensure seamless legal document generation for your PGs.
              </p>
            </div>
            {isReadOnly && (
              <div className="pt-3 border-t border-indigo-100/50 flex items-start gap-2">
                <div className="mt-0.5">
                  <ShieldAlert size={12} className="text-blue-600" />
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  <span className="font-black text-blue-600 uppercase text-[9px] tracking-widest mr-2">Locked:</span>
                  Profile details are locked for security reasons. If you need to update your information, please contact our support team.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-4 2xl:col-span-3 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 flex flex-col items-center shadow-sm">
              <div className="relative group">
                <div
                  className="h-40 w-40 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 cursor-pointer flex items-center justify-center shadow-inner transition-transform hover:scale-[1.02]"
                  onClick={() => setShowViewModal(true)}
                >
                  {profile.profileImageUrl ? (
                    <img
                      src={getFullImageUrl(profile.profileImageUrl)}
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


            <button
              onClick={() => {
                setIsPolicyViewOnly(true)
                setShowDeleteModal(true)
              }}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/30 transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-white shadow-sm transition-colors">
                <ShieldCheck size={20} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-0.5">Trust & Transparency</p>
                <p className="text-xs font-black text-slate-900">Privacy Policy</p>
              </div>
            </button>

            <Link
              to="/terms-and-conditions"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-600 hover:bg-amber-50/30 transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-white shadow-sm transition-colors">
                <FileText size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-0.5">Legal Agreement</p>
                <p className="text-xs font-black text-slate-900">Terms & Conditions</p>
              </div>
            </Link>

            {!isOnboarding && (
              <>
                <Link
                  to="/change-password"
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all group"
                >
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-white shadow-sm transition-colors">
                    <Lock size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest mb-0.5">Security Access</p>
                    <p className="text-xs font-black text-slate-900">Change Password</p>
                  </div>
                </Link>

                <button
                  onClick={() => {
                    setIsPolicyViewOnly(false)
                    setAgreedToDelete(false)
                    setShowDeleteModal(true)
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100 hover:bg-rose-100 transition-all group shadow-sm"
                >
                  <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-rose-500 shadow-sm transition-colors">
                    <Trash2 size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest mb-0.5">Account Removal</p>
                    <p className="text-xs font-black text-rose-600">Delete My Account</p>
                  </div>
                </button>
              </>
            )}

          </div>

          {/* Form Content */}
          <div className="lg:col-span-8 2xl:col-span-9 space-y-6">
            <Section
              title="Basic Details"
              icon={<User size={18} />}
              colorClass="text-indigo-600"
              bgClass="bg-indigo-50"
            >
              <Input label="Full Name" value={profile.fullName} onChange={v => updateField('fullName', v)} placeholder="John Doe" disabled={isReadOnly} />
              <Input label="Phone" value={profile.phone} numeric maxLength={10} onChange={v => updateField('phone', v)} placeholder="9876543210" disabled={isReadOnly} />
              <Input label="Email Address" value={profile.email} disabled placeholder="email@example.com" />
              <Input label="System Username" value={profile.username} disabled />
            </Section>

            <Section
              title="Location Information"
              icon={<MapPin size={18} />}
              highlight={isMandatory}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
            >
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
                <div className="sm:col-span-2 pt-2">
                  <CustomDropdown
                    label="Area / Locality"
                    value={profile.address.areaLocality || ''}
                    disabled={isReadOnly}
                    options={areas.map(a => ({ id: a.Name, label: a.Name.toUpperCase() }))}
                    onChange={val => updateField('address.areaLocality', val)}
                    icon={MapPin}
                    className="w-full"
                  />
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
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative max-w-2xl w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center ${isPolicyViewOnly ? 'bg-indigo-100 text-indigo-600' : 'bg-rose-100 text-rose-600'}`}>
                    {isPolicyViewOnly ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">
                      {isPolicyViewOnly ? 'Privacy Policy' : 'Account Deletion'}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">ManageMyPG Account Policy</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-3 bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-slate-100 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto bg-white custom-scrollbar">
                <div className="prose prose-slate max-w-none">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">ManageMyPG Account Deletion Policy</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Last Updated: June 28, 2026</p>

                  <div className="space-y-6 text-sm text-slate-600 font-medium leading-relaxed">
                    <section>
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full" /> 1. Purpose
                      </h5>
                      <p>This policy explains how users of the ManageMyPG mobile application can request deletion of their account and associated personal information.</p>
                    </section>

                    <section>
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full" /> 2. Who Can Request Deletion
                      </h5>
                      <p>Any registered ManageMyPG account holder may request deletion of their account.</p>
                    </section>

                    <section>
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full" /> 3. How to Delete Your Account
                      </h5>
                      <p>You can request account deletion by either using the 'Delete Account' option available in the ManageMyPG application, or contacting our support team at <span className="text-indigo-600 font-bold">support@managemypg.com</span>.</p>
                    </section>

                    <section>
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full" /> 4. Verification
                      </h5>
                      <p>For your security, we may verify your identity before processing an account deletion request.</p>
                    </section>

                    <section>
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full" /> 5. What Happens After Deletion
                      </h5>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Your account will be deactivated.</li>
                        <li>Access to the application will be removed.</li>
                        <li>Personal profile information will be deleted or anonymized where applicable.</li>
                        <li>Uploaded documents and profile images will be removed from active storage.</li>
                        <li>Push notification tokens will be deleted.</li>
                      </ul>
                    </section>

                    <section>
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full" /> 6. Information That May Be Retained
                      </h5>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>To comply with applicable laws and regulations.</li>
                        <li>To resolve disputes or investigate fraud.</li>
                        <li>To enforce legal obligations.</li>
                        <li>Backup copies until they are automatically overwritten according to our backup retention process.</li>
                      </ul>
                    </section>

                    <section>
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full" /> 7. Processing Time
                      </h5>
                      <p>We aim to process verified account deletion requests within 7 days.</p>
                    </section>

                    {!isPolicyViewOnly && (
                      <div className="p-6 bg-rose-50 rounded-[1.5rem] border border-rose-100 flex items-start gap-4 mt-8">
                        <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="text-xs font-black text-rose-900 uppercase tracking-tight">Warning: Irreversible Action</p>
                          <p className="text-[11px] text-rose-700 mt-1 font-bold">Deleting your account is permanent. All your data across all PGs, including tenant records, billing history, and profile details will be permanently removed.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
                {!isPolicyViewOnly && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={agreedToDelete}
                        onChange={(e) => setAgreedToDelete(e.target.checked)}
                        className="peer h-6 w-6 rounded-lg border-2 border-slate-300 text-rose-600 focus:ring-rose-500/20 transition-all appearance-none checked:bg-rose-600 checked:border-rose-600"
                      />
                      <X className="absolute inset-0 m-auto h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight group-hover:text-slate-900 transition-colors">
                      I have read the policy and understand the consequences
                    </span>
                  </label>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                  >
                    {isPolicyViewOnly ? 'Close Policy' : 'No, Keep My Account'}
                  </button>
                  {!isPolicyViewOnly && (
                    <button
                      disabled={!agreedToDelete || deleting}
                      onClick={handleDeleteAccount}
                      className="flex-[1.5] px-6 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50 disabled:grayscale active:scale-95 flex items-center justify-center gap-2"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          Deleting Account...
                        </>
                      ) : (
                        <>
                          <Trash2 size={14} />
                          Confirm Permanent Deletion
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

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
                      src={getFullImageUrl(profile.profileImageUrl)}
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

function Section({ title, icon, children, highlight, colorClass = "text-indigo-600", bgClass = "bg-indigo-50" }) {
  return (
    <section
      className={`bg-white rounded-[2rem] border p-8 transition-all ${
        highlight ? 'border-amber-200 shadow-xl shadow-amber-50/50' : 'border-slate-100 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${highlight ? 'bg-amber-100 text-amber-600 shadow-inner' : `${bgClass} ${colorClass} border border-slate-100 shadow-sm`}`}>
          {icon}
        </div>
        <div className="flex items-center gap-4 flex-1">
          <h2 className={`text-xs font-black uppercase tracking-widest ${highlight ? 'text-amber-600' : colorClass}`}>{title}</h2>
          <div className="h-[1px] flex-1 bg-slate-100" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
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
