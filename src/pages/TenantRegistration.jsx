import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import SEO from '../components/SEO'
import { getFullImageUrl } from '../api/api'
import {
  User,
  Mail,
  Phone,
  Fingerprint,
  CreditCard,
  Building2,
  Calendar,
  IndianRupee,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  Activity,
  ShieldCheck,
  Briefcase,
  Droplets,
  Clock,
  FileSearch,
  Sparkles,
  Lock,
  Upload,
  Camera,
  Trash2,
  ImageIcon
} from 'lucide-react'
import { registerTenant, getPgDetailsById } from '../api/ownerAuth'
import ProfileImageCropper from '../components/models/ProfileImageCropper'

const QUALIFICATIONS = [
  '10th', '12th', 'Diploma', 'Graduate', 'Post Graduate', 'PhD', 'Other'
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const JOINING_TYPES = ['DAILY', 'WEEKLY', 'MONTHLY']

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'yopmail.com', 'throwawaymail.com'
];
const COMMON_DISPOSABLE_PATTERNS = ['mailinator', 'tempmail', '10minute', 'guerrilla', 'yopmail', 'throwaway'];

function isSuspiciousEmailDomain(email) {
  const domain = email.split('@')[1]
  if (!domain || !domain.includes('.')) return true
  const parts = domain.split('.')
  const tld = parts[parts.length - 1]
  return tld.length < 2 || tld.length > 15
}

export default function TenantRegistration() {
  const { pgId } = useParams()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const [areas, setAreas] = useState([])
  const [errors, setErrors] = useState({})
  const [pgDetails, setPgDetails] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Document file states
  const [photoFile, setPhotoFile] = useState(null)         // File blob for payload
  const [photoPreview, setPhotoPreview] = useState(null)    // dataURL for cropper input
  const [photoCropped, setPhotoCropped] = useState(null)    // dataURL after crop
  const [showCropper, setShowCropper] = useState(false)
  const [aadhaarFile, setAadhaarFile] = useState(null)
  const [panFile, setPanFile] = useState(null)
  const [idCardFile, setIdCardFile] = useState(null)

  const today = dayjs().format('YYYY-MM-DD')

  useEffect(() => {
    const fetchPgInfo = async () => {
      try {
        const data = await getPgDetailsById(pgId)
        setPgDetails(data)
      } catch (err) {
        console.error('Failed to fetch PG details', err)
      }
    }
    if (pgId) fetchPgInfo()
  }, [pgId])

  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    mobileNumber: '',
    aadhaarNumber: '',
    sonOf: '',
    age: '',
    qualification: '',
    vehicleNumber: '',
    parentNumber: '',
    workCompany: '',
    dateOfBirth: '',
    bloodGroup: '',
    monthlyRent: '',
    advance: '',
    pending: '',
    joiningType: '',
    dateOfJoining: today,
    addressDto: {
      address: '',
      areaLocality: '',
      city: '',
      district: '',
      state: '',
      pinCode: '',
      country: '',
      landmark: ''
    }
  })

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        navigate('/manage/mypg/signin')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess, navigate])

  const updateField = (path, value) => {
    setForm(prev => {
      const copy = JSON.parse(JSON.stringify(prev))
      let obj = copy
      const keys = path.split('.')
      keys.slice(0, -1).forEach(k => (obj = obj[k]))
      obj[keys.at(-1)] = value
      return copy
    })
    if (path === 'email') {
      let error = ''
      if (!value) error = 'Email is required'
      else if (!EMAIL_REGEX.test(value)) error = 'Invalid email format'
      else {
        const domain = value.split('@')[1]?.toLowerCase()
        if (DISPOSABLE_EMAIL_DOMAINS.includes(domain) || COMMON_DISPOSABLE_PATTERNS.some(p => domain.includes(p)) || isSuspiciousEmailDomain(value)) {
          error = 'Disposable/Invalid email domain'
        }
      }
      setErrors(prev => ({ ...prev, email: error }))
    } else {
      setErrors(prev => ({ ...prev, [path]: undefined }))
    }
  }

  const onDobChange = (v) => {
    updateField('dateOfBirth', v)
    if (v) {
      const age = dayjs().diff(dayjs(v), 'year')
      updateField('age', age)
    }
  }

  const fetchAddressFromPincode = async (pin) => {
    try {
      setPinLoading(true)
      setPinError('')
      setAreas([])
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await res.json()
      if (!data[0] || data[0].Status !== 'Success') throw new Error()
      const postOffices = data[0].PostOffice || []
      const first = postOffices[0]
      updateField('addressDto.city', first.Block || first.Name || first.District)
      updateField('addressDto.district', first.District)
      updateField('addressDto.state', first.State)
      updateField('addressDto.country', first.Country)
      if (postOffices.length > 1) setAreas(postOffices)
      else updateField('addressDto.areaLocality', first.Name)
    } catch {
      setPinError('Invalid pincode')
    } finally {
      setPinLoading(false)
    }
  }

  const validateStep1 = () => {
    const e = {}
    if (!form.name) e.name = 'Required'
    if (!form.email) e.email = 'Required'
    if (!form.mobileNumber) e.mobileNumber = 'Required'
    if (!form.password) e.password = 'Required'
    if (!form.aadhaarNumber) e.aadhaarNumber = 'Required'
    if (!form.sonOf) e.sonOf = 'Required'
    if (!form.dateOfBirth) e.dateOfBirth = 'Required'
    if (!form.qualification) e.qualification = 'Required'
    if (!form.parentNumber) e.parentNumber = 'Required'
    if (!form.workCompany) e.workCompany = 'Required'
    if (!form.dateOfJoining) e.dateOfJoining = 'Required'
    if (!form.joiningType) e.joiningType = 'Required'
    if (Object.keys(e).length > 0) {
      setErrors(e)
      toast.error('Please complete all required fields')
      return false
    }
    setErrors({})
    return true
  }

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) u8arr[n] = bstr.charCodeAt(n)
    return new Blob([u8arr], { type: mime })
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoPreview(reader.result)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropSave = (croppedDataURL) => {
    setPhotoCropped(croppedDataURL)
    const blob = dataURLtoBlob(croppedDataURL)
    setPhotoFile(new File([blob], 'photo.jpg', { type: 'image/jpeg' }))
    setShowCropper(false)
    setPhotoPreview(null)
  }

  const handleSubmit = async () => {
    if (!form.addressDto.address || !form.addressDto.pinCode || !form.addressDto.city) {
      toast.error('Please complete all required address fields')
      return
    }
    if (!photoFile) {
      toast.error('Please upload and crop your profile photo')
      return
    }
    if (!aadhaarFile) {
      toast.error('Aadhaar document is required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        username: form.email,   // email is used as username
        pgId,
        dateOfJoining: new Date(form.dateOfJoining).toISOString(),
        monthlyRent: parseFloat(form.monthlyRent) || 0,
        advance: parseFloat(form.advance) || 0,
        pending: parseFloat(form.pending) || 0
      }
      delete payload.dateOfBirth
      const formData = new FormData()
      formData.append("request", new Blob([JSON.stringify(payload)], { type: "application/json" }))
      await registerTenant(formData)
      setShowSuccess(true)
      toast.success('Registration submitted successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Registration failed. Username or email may already be registered.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title={pgDetails ? `${pgDetails.pgName} - Resident Registration` : 'Resident Registration'}
        description={pgDetails ? `Join ${pgDetails.pgName} community. Register as a resident to manage your stay, rent payments, and more.` : 'Register as a resident in your PG community. Easy onboarding for tenants.'}
        canonical={pgId ? `/register/tenant/${pgId}` : '/register/tenant'}
      />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        <div className="mb-5 sm:mb-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5">
            <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0 shadow-inner">
              <Building2 size={32} />
            </div>
            <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                  Verified Property
                </span>
                {pgDetails?.businessName && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-black uppercase tracking-wider truncate max-w-[180px]">
                    {pgDetails.businessName}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white uppercase leading-tight">
                {pgDetails ? pgDetails.pgName : 'Resident Registration'}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-300 flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                <MapPin size={13} className="text-indigo-400 shrink-0" />
                <span>
                  {pgDetails?.address
                    ? `${pgDetails.address.areaLocality ? pgDetails.address.areaLocality + ', ' : ''}${pgDetails.address.city || ''}, ${pgDetails.address.state || ''}`
                    : 'Complete your registration to join our PG community'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div
            onClick={() => step === 2 && setStep(1)}
            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 sm:gap-3 ${
              step === 1
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${step === 1 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>1</div>
            <div className="min-w-0">
              <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${step === 1 ? 'text-indigo-100' : 'text-slate-400'}`}>Step 1</p>
              <p className="text-xs font-black truncate">Personal &amp; Stay</p>
            </div>
          </div>
          <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center gap-2.5 sm:gap-3 ${step === 2 ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white text-slate-700 border-slate-200'}`}>
            <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${step === 2 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>2</div>
            <div className="min-w-0">
              <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${step === 2 ? 'text-indigo-100' : 'text-slate-400'}`}>Step 2</p>
              <p className="text-xs font-black truncate">Address &amp; Rules</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="p-4 sm:p-8 md:p-12">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 sm:space-y-10">
                  <SectionHeader icon={Camera} title="Profile Photo" subtitle="Required — your face must be clearly visible" />
                  {/* Photo Upload */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      {photoCropped ? (
                        <img src={photoCropped} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-indigo-100 shadow-md" />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                          <Camera size={28} />
                        </div>
                      )}
                      {photoCropped && (
                        <button type="button" onClick={() => { setPhotoCropped(null); setPhotoFile(null) }} className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow cursor-pointer hover:bg-rose-600 transition-colors">
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors">
                      <Upload size={14} />
                      {photoCropped ? 'Change Photo' : 'Upload Photo *'}
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                    </label>
                    {errors.photo && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter">{errors.photo}</p>}
                  </div>

                  <SectionHeader icon={User} title="Identity &amp; Security" subtitle="Your basic credentials and profile info" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                    <InputField label="Full Name" icon={User} value={form.name} onChange={v => updateField('name', v)} error={errors.name} placeholder="John Doe" />
                    <InputField label="Email Address" icon={Mail} value={form.email} onChange={v => updateField('email', v)} error={errors.email} placeholder="john@example.com" />
                    <InputField label="Mobile Number" icon={Phone} numeric maxLength={10} value={form.mobileNumber} onChange={v => updateField('mobileNumber', v)} error={errors.mobileNumber} placeholder="9876543210" />
                    <InputField label="Password" icon={ShieldCheck} type="password" value={form.password} onChange={v => updateField('password', v)} error={errors.password} placeholder="Create a password" />
                    <InputField label="Emergency Contact" icon={Phone} numeric maxLength={10} value={form.parentNumber} onChange={v => updateField('parentNumber', v)} error={errors.parentNumber} placeholder="Emergency contact no." />
                    <InputField label="Aadhaar ID" icon={Fingerprint} numeric maxLength={12} value={form.aadhaarNumber} onChange={v => updateField('aadhaarNumber', v)} error={errors.aadhaarNumber} placeholder="12-digit number" />
                    <InputField label="Son/Daughter Of" icon={User} value={form.sonOf} onChange={v => updateField('sonOf', v)} error={errors.sonOf} placeholder="Parent/Guardian Name" />
                    <InputField label="Work/Company" icon={Briefcase} value={form.workCompany} onChange={v => updateField('workCompany', v)} error={errors.workCompany} placeholder="Employer name" />
                  </div>
                  <SectionHeader icon={Calendar} title="Personal &amp; Stay Details" subtitle="Dates and residency preferences" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
                    <InputField label="Date of Birth" icon={Calendar} type="date" value={form.dateOfBirth} onChange={onDobChange} error={errors.dateOfBirth} />
                    {/* Age is auto-calculated from DOB and sent in payload but not shown in UI */}
                    <SelectField label="Qualification" icon={Briefcase} value={form.qualification} options={QUALIFICATIONS} onChange={v => updateField('qualification', v)} error={errors.qualification} />
                    <SelectField label="Blood Group" icon={Droplets} value={form.bloodGroup} options={BLOOD_GROUPS} onChange={v => updateField('bloodGroup', v)} />
                    <InputField label="Vehicle No." icon={Activity} value={form.vehicleNumber} onChange={v => updateField('vehicleNumber', v)} placeholder="Optional" />
                    <SelectField label="Joining Type" icon={Clock} value={form.joiningType} options={JOINING_TYPES} onChange={v => updateField('joiningType', v)} error={errors.joiningType} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
                    <InputField label="Monthly Rent" icon={IndianRupee} type="number" value={form.monthlyRent} onChange={v => updateField('monthlyRent', v)} placeholder="0" />
                    <InputField label="Advance Paid" icon={IndianRupee} type="number" value={form.advance} onChange={v => updateField('advance', v)} placeholder="0" />
                    <InputField label="Joining Date" icon={Calendar} type="date" min={today} value={form.dateOfJoining} onChange={v => updateField('dateOfJoining', v)} error={errors.dateOfJoining} />
                  </div>
                  <div className="flex justify-end pt-4 sm:pt-6">
                    <button onClick={() => validateStep1() && setStep(2)} className="group flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 cursor-pointer">
                      Next Step
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 sm:space-y-10">
                  <SectionHeader icon={MapPin} title="Permanent Address" subtitle="Your official residence for records" />
                  <div className="grid grid-cols-1 gap-3 sm:gap-6">
                    <InputField label="Street Address / House No." icon={MapPin} value={form.addressDto.address} onChange={v => updateField('addressDto.address', v)} placeholder="Full street details" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                    <InputField label="Landmark" icon={MapPin} value={form.addressDto.landmark} onChange={v => updateField('addressDto.landmark', v)} placeholder="Nearby well-known place" />
                    <div className="relative">
                      <InputField label="Pincode" icon={MapPin} numeric maxLength={6} value={form.addressDto.pinCode} onChange={v => { updateField('addressDto.pinCode', v); if (v.length === 6) fetchAddressFromPincode(v) }} placeholder="6-digit code" />
                      {pinLoading && <Activity size={16} className="absolute right-4 bottom-4 text-indigo-500 animate-spin" />}
                      {pinError && <p className="mt-1 text-[10px] font-bold text-rose-500 uppercase tracking-tighter">{pinError}</p>}
                    </div>
                  </div>
                  {areas.length > 1 && (
                    <div className="grid grid-cols-1 gap-3 sm:gap-6">
                      <SelectField label="Select Area / Locality" icon={MapPin} value={form.addressDto.areaLocality} options={areas.map(a => a.Name)} onChange={v => updateField('addressDto.areaLocality', v)} />
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                    <InputField label="City" value={form.addressDto.city} disabled />
                    <InputField label="District" value={form.addressDto.district} disabled />
                    <InputField label="State" value={form.addressDto.state} disabled />
                    <InputField label="Country" value={form.addressDto.country} disabled />
                  </div>

                  {/* Document Uploads */}
                  <SectionHeader icon={Upload} title="Documents" subtitle="Aadhaar is required — PAN & ID Card are optional" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                    {/* Aadhaar - Required */}
                    <DocUpload
                      label="Aadhaar Card *"
                      accept="image/*,.pdf"
                      file={aadhaarFile}
                      onSelect={setAadhaarFile}
                      onRemove={() => setAadhaarFile(null)}
                      required
                    />
                    {/* PAN - Optional */}
                    <DocUpload
                      label="PAN Card"
                      accept="image/*,.pdf"
                      file={panFile}
                      onSelect={setPanFile}
                      onRemove={() => setPanFile(null)}
                    />
                    {/* ID Card - Optional */}
                    <DocUpload
                      label="ID Card"
                      accept="image/*,.pdf"
                      file={idCardFile}
                      onSelect={setIdCardFile}
                      onRemove={() => setIdCardFile(null)}
                    />
                  </div>

                  {pgDetails?.termsAndConditionsUrl && (
                    <div className="pt-4 sm:pt-6 border-t border-slate-100">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center pt-1">
                          <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" />
                        </div>
                        <span className="text-sm font-bold text-slate-600 leading-relaxed">
                          I have read and agree to the{' '}
                          <a href={getFullImageUrl(pgDetails.termsAndConditionsUrl)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 underline decoration-2 underline-offset-4 decoration-indigo-200 group-hover:decoration-indigo-500 transition-all inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            Terms &amp; Conditions
                            <FileSearch size={14} />
                          </a>{' '}
                          for this PG.
                        </span>
                      </label>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-100 gap-3">
                    <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer">
                      <ChevronLeft size={16} />
                      Back
                    </button>
                    <button disabled={saving || (pgDetails?.termsAndConditionsUrl && !agreedToTerms)} onClick={handleSubmit} className="flex items-center gap-2 px-5 sm:px-10 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-50 cursor-pointer active:scale-95">
                      {saving ? <Activity size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      {saving ? 'Processing...' : 'Complete Registration'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white rounded-[3rem] p-10 text-center shadow-2xl max-w-sm w-full">
              <div className="h-24 w-24 rounded-[2rem] bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Registration Successful</h3>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">Welcome to the community! You are being redirected to the sign-in portal.</p>
              <div className="flex items-center justify-center gap-3">
                <Activity size={16} className="text-indigo-600 animate-spin" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Portal...</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Crop Modal */}
      <AnimatePresence>
        {showCropper && photoPreview && (
          <ProfileImageCropper
            image={photoPreview}
            onCancel={() => { setShowCropper(false); setPhotoPreview(null) }}
            onSave={handleCropSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function DocUpload({ label, accept, file, onSelect, onRemove, required }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-0.5">{label}</label>
      {file ? (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ImageIcon size={14} />
          </div>
          <span className="text-xs font-bold text-emerald-700 truncate flex-1">{file.name}</span>
          <button type="button" onClick={onRemove} className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer shrink-0">
            <Trash2 size={13} />
          </button>
        </div>
      ) : (
        <label className="cursor-pointer flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/40 transition-all group">
          <div className="h-7 w-7 rounded-lg bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-500 flex items-center justify-center shrink-0 transition-colors">
            <Upload size={13} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-500 group-hover:text-indigo-600 transition-colors">Click to upload</p>
            <p className="text-[9px] text-slate-400 font-bold">Image or PDF{required ? '' : ' (optional)'}</p>
          </div>
          <input type="file" accept={accept} className="hidden" onChange={e => e.target.files[0] && onSelect(e.target.files[0])} />
        </label>
      )}
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 pb-1 border-b border-slate-100/80 mb-1">
      <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
        <Icon size={15} />
      </div>
      <div>
        <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider leading-tight">{title}</h3>
        <p className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

function InputField({ label, icon: Icon, value, onChange, disabled, numeric, maxLength, type = 'text', min, error, placeholder }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  const handleChange = (e) => {
    let v = e.target.value
    if (numeric) v = v.replace(/\D/g, '')
    if (maxLength) v = v.slice(0, maxLength)
    onChange?.(v)
  }

  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-0.5">{label}</label>
      <div className="relative group">
        {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />}
        <input
          type={isPassword && show ? 'text' : type}
          min={min}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-white border rounded-xl sm:rounded-2xl ${Icon ? 'pl-9 sm:pl-10' : 'px-3.5'} pr-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-700 focus:ring-2 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 ${error ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10'}`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter ml-0.5">{error}</p>}
    </div>
  )
}

function SelectField({ label, icon: Icon, value, options, onChange, error, placeholder = "Select Option" }) {
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

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider ml-0.5">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-white border rounded-xl sm:rounded-2xl ${Icon ? 'pl-9 sm:pl-10' : 'px-3.5'} pr-3 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-left transition-all ${error ? 'border-rose-500 ring-2 ring-rose-500/10' : isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-md' : 'border-slate-200 hover:border-indigo-300'}`}
        >
          {Icon && <Icon size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-400'}`} />}
          <span className={`truncate ${value ? 'text-slate-800 font-extrabold' : 'text-slate-400'}`}>{value || placeholder}</span>
          <ChevronDown size={15} className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute z-[100] left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto"
            >
              {options.map((opt) => {
                const optValue = typeof opt === 'object' ? opt.value : opt
                const optLabel = typeof opt === 'object' ? opt.label : opt
                const isSelected = value === optValue
                return (
                  <button key={optValue} type="button" onClick={() => { onChange?.(optValue); setIsOpen(false) }} className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${isSelected ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'}`}>
                    <span>{optLabel}</span>
                    {isSelected && <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter ml-0.5">{error}</p>}
    </div>
  )
}

