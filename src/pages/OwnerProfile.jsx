import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOwnerProfile } from '../api/ownerAuth'
import { updateOwnerAddress } from '../api/ownerAuth'
import ProfileImageCropper from '../components/models/ProfileImageCropper'

export default function OwnerProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const [areas, setAreas] = useState([])
  const [rawImage, setRawImage] = useState(null)
  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
  document.body.style.overflow = rawImage ? 'hidden' : 'auto'
  return () => (document.body.style.overflow = 'auto')
}, [rawImage])

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getOwnerProfile()
        setProfile({
          ...data,
          imageUrl: '', // frontend-only for now
        })

        // 🔁 Redirect if address already completed
       if (data.hasAddress) {
          navigate('/home', { replace: true })
        }

      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [navigate])

  if (loading) {
    return <div className="text-center py-20">Loading profile…</div>
  }
  async function fetchAddressFromPincode(pin) {
  try {
    setPinLoading(true)
    setPinError('')
    setAreas([])

    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
    const data = await res.json()

    if (!data[0] || data[0].Status !== 'Success') {
      throw new Error('Invalid pincode')
    }

    const postOffices = data[0].PostOffice || []
    const first = postOffices[0]

    updateField('address.city', first.Block || first.Name || first.District)
    updateField('address.district', first.District)
    updateField('address.state', first.State)
    updateField('address.country', first.Country)

    if (postOffices.length > 1) {
      setAreas(postOffices)
    } else {
      updateField('address.areaLocality', first.Name)
    }
  } catch (e) {
    setPinError('Invalid pincode')
  } finally {
    setPinLoading(false)
  }
}

function onAreaSelect(val) {
  updateField('address.areaLocality', val)
}

  const isMandatory = !profile.hasAddress


  /* ---------------- HELPERS ---------------- */
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

    function handleImageChange(e) {
      const file = e.target.files[0]
      if (!file) return
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be under 2MB')
        return
      } 
      setRawImage(URL.createObjectURL(file))
      e.target.value = '' // 👈 reset
    }

      function handleCropSave(croppedImage) {
        updateField('imageUrl', croppedImage)
        setRawImage(null)
      }
      async function handleSubmit() {
        setSaving(true)
        try {
          await updateOwnerAddress(profile.address)
          navigate('/home', { replace: true })
        } finally {
          setSaving(false)
        }
      }


  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {isMandatory && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
          ⚠️ Please complete your address details to finish registration.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* IMAGE CARD */}
        <div className="bg-white rounded-2xl border p-6 flex flex-col items-center">
        <div className="relative">
          <div className="h-36 w-36 rounded-full overflow-hidden border bg-gray-100">
            <img
              src={profile.imageUrl || '/avatar.png'}
              className="h-full w-full object-cover"
              alt="Profile"
            />
          </div>

          <label className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full cursor-pointer shadow">
            ✏️
            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
          </label>
        </div>

        <div className="mt-4 text-center">
          <div className="font-semibold">{profile.fullName}</div>
          <div className="text-sm text-gray-500">{profile.email}</div>
        </div>
      </div>
        {/* DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          {/* BASIC */}
          <Section title="Basic Details">
            <Input label="Username" value={profile.username} disabled />
            <Input label="Full Name" value={profile.fullName} onChange={v => updateField('fullName', v)} />
            <Input label="Email" value={profile.email} disabled />
            <Input label="Phone" value={profile.phone} numeric maxLength={10} onChange={v => updateField('phone', v)} />
          </Section>

          {/* ADDRESS */}
          <Section title="Address Details" highlight={isMandatory}>
          <Input
            label="Address"
            value={profile.address.address || ''}
            onChange={v => updateField('address.address', v)}
          />

          <Input
            label="Landmark"
            value={profile.address.landmark || ''}
            onChange={v => updateField('address.landmark', v)}
          />

          <Input
            label="Pincode"
            value={profile.address.pinCode || ''}
            numeric
            maxLength={6}
            onChange={v => {
              updateField('address.pinCode', v)
              if (v.length === 6) fetchAddressFromPincode(v)
            }}
          />

          {pinLoading && (
            <div className="text-xs text-gray-500">Fetching address…</div>
          )}
          {pinError && (
            <div className="text-xs text-red-600">{pinError}</div>
          )}

          {areas.length > 1 && (
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Area / Locality</span>
              <select
                value={profile.address.areaLocality || ''}
                onChange={e => onAreaSelect(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select area</option>
                {areas.map(a => (
                  <option key={a.Name} value={a.Name}>
                    {a.Name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Input label="City" value={profile.address.city || ''} disabled />
          <Input label="District" value={profile.address.district || ''} disabled />
          <Input label="State" value={profile.address.state || ''} disabled />
          <Input label="Country" value={profile.address.country || ''} disabled />
         </Section>


          <button
            disabled={
              saving ||
              !profile.address?.address ||
              profile.address.pinCode?.length !== 6 ||
              !!pinError ||
              (areas.length > 1 && !profile.address.areaLocality)
            }
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save & Continue'}
          </button>

        </div>
             {/* ✅ MODAL / OVERLAY MUST LIVE HERE */}
          {rawImage && (
            <ProfileImageCropper
              image={rawImage}
              onCancel={() => setRawImage(null)}
              onSave={handleCropSave}
            />
          )}
      </div>
    </div>
  )
}

/* ---------------- UI PARTS ---------------- */
function Section({ title, children, highlight }) {
  return (
    <section className={`rounded-2xl border p-6 ${highlight ? 'border-red-300 bg-red-50' : 'bg-white'}`}>
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </section>
  )
}

function Input({ label, value, onChange, disabled, numeric, maxLength }) {
  function handleChange(e) {
    let v = e.target.value
    if (numeric) v = v.replace(/\D/g, '')
    if (maxLength) v = v.slice(0, maxLength)
    onChange?.(v)
  }

  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={handleChange}
        className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
      />
    </label>
  )
}
