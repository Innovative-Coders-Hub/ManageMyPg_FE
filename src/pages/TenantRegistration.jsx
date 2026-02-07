import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { registerTenant } from '../api/ownerAuth'
import DocumentUpload from "../components/DocumentUpload"
const QUALIFICATIONS = [
  '10th', '12th', 'Diploma', 'Graduate', 'Post Graduate', 'PhD', 'Other'
]

export default function TenantRegistration() {
  const { pgId } = useParams();
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
const navigate = useNavigate()
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const [areas, setAreas] = useState([])
 const [documents, setDocuments] = useState({
  PHOTO: null,
  AADHAAR: null,
  PAN: null,
  ID: null
})
  const today = dayjs().format('YYYY-MM-DD')

  const emptyForm = {
    username: '',
    password: '',
    name: '',
    email: '',
    mobileNumber: '',
    aadhaarNumber: '',
    panNumber: '',
    sonOf: '',
    age: '',
    qualification: '',
    vehicleNumber: '',
    parentNumber: '',
    workCompany: '',
    dob: '',
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
  }

  const [form, setForm] = useState(emptyForm)

  function updateField(path, value) {
    setForm(prev => {
      const copy = structuredClone(prev)
      let obj = copy
      const keys = path.split('.')
      keys.slice(0, -1).forEach(k => (obj = obj[k]))
      obj[keys.at(-1)] = value
      return copy
    })
  }
useEffect(() => {
  if (showSuccess) {
    const timer = setTimeout(() => {
      navigate('/signin')
    }, 5000)
    return () => clearTimeout(timer)
  }
}, [showSuccess])

  function resetForm() {
    setForm(emptyForm)
    setDocuments({
      PHOTO: null,
      AADHAAR: null,
      PAN: null,
      ID: null
    })
    setStep(1)
    setAreas([])
    setPinError('')
  }

  /* ---------- DOB → AGE ---------- */
  function onDobChange(v) {
    updateField('dob', v)
    if (v) {
      const age = dayjs().diff(dayjs(v), 'year')
      updateField('age', age)
    }
  }

  /* ---------- PINCODE AUTO ---------- */
  async function fetchAddressFromPincode(pin) {
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

      if (postOffices.length > 1) {
        setAreas(postOffices)
      } else {
        updateField('addressDto.areaLocality', first.Name)
      }
    } catch {
      setPinError('Invalid pincode')
    } finally {
      setPinLoading(false)
    }
  }

  // async function handleSubmit() {
  //   setSaving(true)
  //   try {
  //     const payload = { ...form,
  //        pgId,
  //        dateOfJoining: new Date(form.dateOfJoining).toISOString()
  //      }
  //     delete payload.dob

  //     await registerTenant(payload)
  //     setShowSuccess(true)
  //   } finally {
  //     setSaving(false)
  //   }
  // }
      async function handleSubmit() {
  // basic validation
  if (
    !documents.PHOTO ||
    !documents.AADHAAR ||
    !documents.PAN ||
    !documents.ID
  ) {
    alert("Please upload all documents")
    return
  }

  setSaving(true)
  try {
    const payload = {
      ...form,
      pgId,
      dateOfJoining: new Date(form.dateOfJoining).toISOString()
    }
    delete payload.dob

    const formData = new FormData()

    // JSON part (MUST be named "request")
    formData.append(
      "request",
      new Blob([JSON.stringify(payload)], {
        type: "application/json"
      })
    )

    // FILE parts (must match backend)
    formData.append("photo", documents.PHOTO)
    formData.append("aadhaar", documents.AADHAAR)
    formData.append("pan", documents.PAN)
    formData.append("idCard", documents.ID)

    await registerTenant(formData)
    setShowSuccess(true)
  } finally {
    setSaving(false)
  }
}


  /* ---------- UI ---------- */
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="rounded-2xl border bg-white p-6 shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-6">
          <h2 className="text-xl font-bold">
                Tenant Registration
                </h2>
                {/* <div className="text-sm text-gray-500">
                Registering for PG ID: {pgId}
                </div> */}
         <div className="text-sm text-gray-500">
            {step === 1 ? "Basic Details" : "Documents & Address"}
          </div>
        </div>

        {step === 1 && (
          <Section title="Basic Details">
            <Input label="Username" value={form.username} onChange={v => updateField('username', v)} />
            <div className="relative">
                            <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={v => updateField('password', v)}
                />

            </div>
            <Input label="Full Name" value={form.name} onChange={v => updateField('name', v)} />
            <Input label="Email" value={form.email} onChange={v => updateField('email', v)} />
            <Input label="Mobile" numeric maxLength={10} value={form.mobileNumber} onChange={v => updateField('mobileNumber', v)} />
            <Input label="Aadhaar" numeric maxLength={12} value={form.aadhaarNumber} onChange={v => updateField('aadhaarNumber', v)} />
            <Input label="PAN" value={form.panNumber} onChange={v => updateField('panNumber', v)} />
            <Input label="Son Of" value={form.sonOf} onChange={v => updateField('sonOf', v)} />

            <Input label="Date of Birth" type="date" value={form.dob} onChange={onDobChange} />
            <Input label="Age" value={form.age} disabled />

            <label className="block">
              <span className="text-sm font-medium">Qualification</span>
              <select
                value={form.qualification}
                onChange={e => updateField('qualification', e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              >
                <option value="">Select</option>
                {QUALIFICATIONS.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </label>

            <Input label="Vehicle Number" value={form.vehicleNumber} onChange={v => updateField('vehicleNumber', v)} />
            <Input label="Parent Mobile" numeric maxLength={10} value={form.parentNumber} onChange={v => updateField('parentNumber', v)} />
            <Input label="Work Company" value={form.workCompany} onChange={v => updateField('workCompany', v)} />

            <Input
              label="Date Of Joining"
              type="date"
              min={today}
              value={form.dateOfJoining}
              onChange={v => updateField('dateOfJoining', v)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 rounded-xl bg-indigo-600 text-white"
              >Next →</button>
            </div>
          </Section>
        )}

        {step === 2 && (
           <div className="space-y-8">
              {/* DOCUMENTS SECTION */}
              <Section title="Upload Documents">
                <div className="sm:col-span-2">
                  <DocumentUpload
                    documents={documents}
                    setDocuments={setDocuments}
                  />
                </div>
              </Section>
                <Section title="Address Details">
                  <Input label="Address" value={form.addressDto.address} onChange={v => updateField('addressDto.address', v)} />
                  <Input label="Landmark" value={form.addressDto.landmark} onChange={v => updateField('addressDto.landmark', v)} />

                  <Input
                    label="Pincode"
                    numeric
                    maxLength={6}
                    value={form.addressDto.pinCode}
                    onChange={v => {
                      updateField('addressDto.pinCode', v)
                      if (v.length === 6) fetchAddressFromPincode(v)
                    }}
                  />

                  {pinLoading && <div className="text-xs">Fetching address…</div>}
                  {pinError && <div className="text-xs text-red-600">{pinError}</div>}

                  {areas.length > 1 && (
                    <label className="block">
                      <span className="text-sm font-medium">Area / Locality</span>
                      <select
                        value={form.addressDto.areaLocality}
                        onChange={e => updateField('addressDto.areaLocality', e.target.value)}
                        className="mt-1 w-full rounded-xl border px-3 py-2"
                      >
                        <option value="">Select</option>
                        {areas.map(a => (
                          <option key={a.Name} value={a.Name}>{a.Name}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  <Input label="City" value={form.addressDto.city} disabled />
                  <Input label="District" value={form.addressDto.district} disabled />
                  <Input label="State" value={form.addressDto.state} disabled />
                  <Input label="Country" value={form.addressDto.country} disabled />

                  <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-2 rounded-xl border"
                    >← Back</button>

                    <button
                      disabled={saving}
                      onClick={handleSubmit}
                      className="px-6 py-2 rounded-xl bg-green-600 text-white"
                    >
                      {saving ? 'Submitting…' : 'Submit'}
                    </button>
                  </div>
                </Section>
         </div>
        )}
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl p-6 text-center shadow-xl w-[90%] max-w-sm">
            <h3 className="text-xl font-bold text-green-600">🎉 Congratulations</h3>
            <p className="mt-2">You have been registered successfully!</p>
           <button disabled className="mt-4 px-6 py-2 rounded-xl bg-gray-400 text-white">
            Redirecting... to Sign-in.
          </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- UI PARTS ---------- */
function Section({ title, children }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <h3 className="sm:col-span-2 text-lg font-semibold">{title}</h3>
      {children}
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  disabled,
  numeric,
  maxLength,
  type = 'text',
  min
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  function handleChange(e) {
    let v = e.target.value
    if (numeric) v = v.replace(/\D/g, '')
    if (maxLength) v = v.slice(0, maxLength)
    onChange?.(v)
  }

  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>

      <div className="relative mt-1">
        <input
          type={isPassword && show ? 'text' : type}
          min={min}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          onBlur={() => setShow(false)}
          className="w-full rounded-xl border px-3 py-2 pr-10 disabled:bg-gray-100"
        />

        {isPassword && (
          <button
            type="button"
            aria-label={show ? 'Hide password' : 'Show password'}
            title={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-indigo-600"
          >
            {show ? '🙈' : '👁️'}
          </button>
        )}
      </div>
    </label>
  )
}

