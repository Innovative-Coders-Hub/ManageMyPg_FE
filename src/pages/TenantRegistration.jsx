import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import SEO from '../components/SEO'
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
  CheckCircle2,
  Activity,
  ShieldCheck,
  Briefcase,
  Droplets,
  Clock,
  FileSearch
} from 'lucide-react'
import { registerTenant, getPgDetailsById } from '../api/ownerAuth'

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
    if (!form.username) e.username = 'Required'
    if (!form.password) e.password = 'Required'
    if (!form.name) e.name = 'Required'
    if (!form.email) e.email = 'Required'
    if (!form.mobileNumber) e.mobileNumber = 'Required'
    if (!form.aadhaarNumber) e.aadhaarNumber = 'Required'
    if (!form.sonOf) e.sonOf = 'Required'
    if (!form.dateOfBirth) e.dateOfBirth = 'Required'
    if (!form.qualification) e.qualification = 'Required'
    if (!form.parentNumber) e.parentNumber = 'Required'
    if (!form.workCompany) e.workCompany = 'Required'
    if (!form.dateOfJoining) e.dateOfJoining = 'Required'
    if (!form.joiningType) e.joiningType = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!form.addressDto.address || !form.addressDto.pinCode || !form.addressDto.city) {
      alert('Please complete the address details')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
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
    } catch (err) {
      console.error(err)
      alert('Registration failed. Please check your details.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
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
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-200 mb-6">
            <Building2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {pgDetails ? `${pgDetails.pgName} - Registration` : 'Resident Registration'}
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            {pgDetails?.address ? `${pgDetails.address.city}, ${pgDetails.address.state}` : 'Create your account to join our PG community'}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          {/* Progress Bar */}
          <div className="h-2 bg-slate-100 flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: step === 1 ? '50%' : '100%' }}
              className="bg-indigo-600"
            />
          </div>

          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  <SectionHeader icon={User} title="Identity & Security" subtitle="Your basic credentials and profile info" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Username" icon={User} value={form.username} onChange={v => updateField('username', v)} error={errors.username} placeholder="chosen_handle" />
                    <InputField label="Password" icon={ShieldCheck} type="password" value={form.password} onChange={v => updateField('password', v)} error={errors.password} placeholder="••••••••" />
                    <InputField label="Full Name" icon={User} value={form.name} onChange={v => updateField('name', v)} error={errors.name} placeholder="John Doe" />
                    <InputField label="Email Address" icon={Mail} value={form.email} onChange={v => updateField('email', v)} error={errors.email} placeholder="john@example.com" />
                    <InputField label="Mobile Number" icon={Phone} numeric maxLength={10} value={form.mobileNumber} onChange={v => updateField('mobileNumber', v)} error={errors.mobileNumber} placeholder="9876543210" />
                    <InputField label="Parent Mobile" icon={Phone} numeric maxLength={10} value={form.parentNumber} onChange={v => updateField('parentNumber', v)} error={errors.parentNumber} placeholder="Guardian's contact" />
                    <InputField label="Aadhaar ID" icon={Fingerprint} numeric maxLength={12} value={form.aadhaarNumber} onChange={v => updateField('aadhaarNumber', v)} error={errors.aadhaarNumber} placeholder="12-digit number" />
                    <InputField label="Son/Daughter Of" icon={User} value={form.sonOf} onChange={v => updateField('sonOf', v)} error={errors.sonOf} placeholder="Parent/Guardian Name" />
                    <InputField label="Work/Company" icon={Briefcase} value={form.workCompany} onChange={v => updateField('workCompany', v)} error={errors.workCompany} placeholder="Employer name" />
                  </div>

                  <SectionHeader icon={Calendar} title="Personal & Stay Details" subtitle="Dates and residency preferences" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Date of Birth" icon={Calendar} type="date" value={form.dateOfBirth} onChange={onDobChange} error={errors.dateOfBirth} />
                    <InputField label="Age" icon={Activity} value={form.age} disabled placeholder="Auto-calculated" />
                    <SelectField label="Qualification" icon={Briefcase} value={form.qualification} options={QUALIFICATIONS} onChange={v => updateField('qualification', v)} error={errors.qualification} />
                    <SelectField label="Blood Group" icon={Droplets} value={form.bloodGroup} options={BLOOD_GROUPS} onChange={v => updateField('bloodGroup', v)} />
                    <InputField label="Vehicle No." icon={Activity} value={form.vehicleNumber} onChange={v => updateField('vehicleNumber', v)} placeholder="Optional" />
                    <SelectField label="Joining Type" icon={Clock} value={form.joiningType} options={JOINING_TYPES} onChange={v => updateField('joiningType', v)} error={errors.joiningType} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Monthly Rent" icon={IndianRupee} type="number" value={form.monthlyRent} onChange={v => updateField('monthlyRent', v)} placeholder="0" />
                    <InputField label="Advance Paid" icon={IndianRupee} type="number" value={form.advance} onChange={v => updateField('advance', v)} placeholder="0" />
                    <InputField label="Joining Date" icon={Calendar} type="date" min={today} value={form.dateOfJoining} onChange={v => updateField('dateOfJoining', v)} error={errors.dateOfJoining} />
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={() => validateStep1() && setStep(2)}
                      className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                      Next Step
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <SectionHeader icon={MapPin} title="Permanent Address" subtitle="Your official residence for records" />
                  <div className="grid grid-cols-1 gap-6">
                    <InputField label="Street Address / House No." icon={MapPin} value={form.addressDto.address} onChange={v => updateField('addressDto.address', v)} placeholder="Full street details" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Landmark" icon={MapPin} value={form.addressDto.landmark} onChange={v => updateField('addressDto.landmark', v)} placeholder="Nearby well-known place" />
                    <div className="relative">
                      <InputField
                        label="Pincode"
                        icon={MapPin}
                        numeric
                        maxLength={6}
                        value={form.addressDto.pinCode}
                        onChange={v => {
                          updateField('addressDto.pinCode', v)
                          if (v.length === 6) fetchAddressFromPincode(v)
                        }}
                        placeholder="6-digit code"
                      />
                      {pinLoading && <Activity size={16} className="absolute right-4 bottom-4 text-indigo-500 animate-spin" />}
                      {pinError && <p className="mt-1 text-[10px] font-bold text-rose-500 uppercase tracking-tighter">{pinError}</p>}
                    </div>
                  </div>

                  {areas.length > 1 && (
                    <div className="grid grid-cols-1 gap-6">
                      <SelectField label="Select Area / Locality" icon={MapPin} value={form.addressDto.areaLocality} options={areas.map(a => a.Name)} onChange={v => updateField('addressDto.areaLocality', v)} />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InputField label="City" value={form.addressDto.city} disabled />
                    <InputField label="District" value={form.addressDto.district} disabled />
                    <InputField label="State" value={form.addressDto.state} disabled />
                    <InputField label="Country" value={form.addressDto.country} disabled />
                  </div>

                  {/* Terms & Conditions Agreement */}
                  {pgDetails?.termsAndConditionsUrl && (
                    <div className="pt-6 border-t border-slate-100">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center pt-1">
                          <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-600 leading-relaxed">
                          I have read and agree to the{' '}
                          <a
                            href={pgDetails.termsAndConditionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700 underline decoration-2 underline-offset-4 decoration-indigo-200 group-hover:decoration-indigo-500 transition-all inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Terms & Conditions
                            <FileSearch size={14} />
                          </a>{' '}
                          for this PG.
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      <ChevronLeft size={16} />
                      Back
                    </button>
                    <button
                      disabled={saving || (pgDetails?.termsAndConditionsUrl && !agreedToTerms)}
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                    >
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

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative bg-white rounded-[3rem] p-10 text-center shadow-2xl max-w-sm w-full"
            >
              <div className="h-24 w-24 rounded-[2rem] bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Registration Successful</h3>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                Welcome to the community! You're being redirected to the sign-in portal.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Activity size={16} className="text-indigo-600 animate-spin" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Portal...</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-4 pb-2">
      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 border border-slate-100">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-tight">{title}</h3>
        <p className="text-xs text-slate-400 font-bold mt-1">{subtitle}</p>
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
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative group">
        {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />}
        <input
          type={isPassword && show ? 'text' : type}
          min={min}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-white border rounded-2xl ${Icon ? 'pl-11' : 'px-4'} pr-10 py-3.5 text-sm font-bold text-slate-700 focus:ring-4 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 ${
            error ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10'
          }`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? '🙈' : '👁️'}
          </button>
        )}
      </div>
      {error && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter ml-1">{error}</p>}
    </div>
  )
}

function SelectField({ label, icon: Icon, value, options, onChange, error }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
      <div className="relative group">
        {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />}
        <select
          value={value}
          onChange={e => onChange?.(e.target.value)}
          className={`w-full bg-white border rounded-2xl ${Icon ? 'pl-11' : 'px-4'} pr-10 py-3.5 text-sm font-bold text-slate-700 appearance-none cursor-pointer focus:ring-4 outline-none transition-all ${
            error ? 'border-rose-500 focus:ring-rose-500/10' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10'
          }`}
        >
          <option value="">Select Option</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
      </div>
      {error && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter ml-1">{error}</p>}
    </div>
  )
}
