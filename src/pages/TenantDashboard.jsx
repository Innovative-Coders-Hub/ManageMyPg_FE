import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { getTenantDetails, ownerLogout } from '../api/ownerAuth'

export default function TenantDashboard() {
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchTenant() {
      try {
        const tenantId = localStorage.getItem('tenantId')
        if (!tenantId) {
          throw new Error('Tenant ID not found in localStorage')
        }
        const data = await getTenantDetails(tenantId)
        setTenant(data.tenantDetails || data)
      } catch (e) {
        console.error(e)
        setError('Failed to load tenant details')
      } finally {
        setLoading(false)
      }
    }
    fetchTenant()
  }, [])

  const handleLogout = async () => {
    try {
      await ownerLogout() // backend logout (optional but good)
    } finally {
      localStorage.clear()
      navigate('/signin', { replace: true })
    }
  }

  if (loading) {
    return <div className="p-6">Loading tenant dashboard...</div>
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  if (!tenant) {
    return <div className="p-6">No tenant data found</div>
  }

  const rents = tenant.rentResponse || []
const address = tenant.address || {}
  const totalPaid = rents.reduce((sum, r) => sum + (r.paidAmount || 0), 0)
 const firstRent = rents[0] || {}

const totalAdvance = firstRent.advance || 0
const totalRefund = firstRent.refundAmount || 0


  const mask = (val) =>
    val ? val.replace(/\d(?=\d{4})/g, '*') : 'N/A'
const maskPan = (val) =>
  val ? val.replace(/(?<=.{2}).(?=.{2})/g, '*') : 'N/A'
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Top Bar */}
       <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Tenant Dashboard</h1>

            <button
                onClick={handleLogout}
                className="
                px-4 py-2
                rounded-lg
                bg-red-500 text-white
                text-sm font-semibold
                hover:bg-red-600
                shadow
                whitespace-nowrap
                self-start
                "
            >
                Logout
            </button>
            </div>



      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">👤 Tenant Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <Info label="Name" value={tenant.name} />
          <Info label="Email" value={tenant.email} />
          <Info label="Mobile" value={tenant.mobileNumber} />
          <Info label="Aadhaar" value={mask(tenant.aadhaarNumber)} />
          <Info label="PAN" value={maskPan(tenant.panNumber)} />
          <Info label="Son Of" value={tenant.sonOf} />
          <Info label="Age" value={tenant.age} />
          <Info label="Qualification" value={tenant.qualification} />
          <Info label="Company" value={tenant.workCompany} />
          <Info label="Vehicle" value={tenant.vehicleNumber} />
        </div>
      </div>

      {/* Stay Details */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🏠 Stay Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <Info label="Joining Date" value={dayjs(tenant.dateOfJoining).format('DD MMM YYYY')} />
          <Info label="Vacate Date" value={tenant.dateOfVacate || '—'} />
          <Info label="Bed ID" value={tenant.bedDetail} />
          <Info label="Status" value={tenant.vacated ? 'Vacated' : 'Active'} />
          <Info label="Monthly Rent" value={`₹ ${tenant.monthlyRent}`} />
        </div>
      </div>
{/* Address Details */}
<div className="bg-white rounded-xl shadow p-6">
  <h2 className="text-xl font-semibold mb-4">📍 Address</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
    <Info label="Address Line" value={address.address} />
    <Info label="Area / Locality" value={address.areaLocality} />
    <Info label="Landmark" value={address.landmark} />
    <Info label="City" value={address.city} />
    <Info label="District" value={address.district} />
    <Info label="State" value={address.state} />
    <Info label="Pincode" value={address.pinCode} />
    <Info label="Country" value={address.country} />
  </div>
</div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Summary title="Total Paid" value={totalPaid} />
        <Summary title="Advance" value={totalAdvance} />
        <Summary title="Refund" value={totalRefund} />
        <Summary
          title="Months"
          value={`${rents.length} months`}
          type="count"
        />
      </div>

      {/* Payment History */}
            <div className="bg-white rounded-xl shadow p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">💰 Payment History</h2>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                    <tr>
                    <Th>Month</Th>
                    <Th>Rent</Th>
                    <Th>Paid</Th>
                    <Th>Status</Th>
                    <Th>Mode</Th>
                    <Th>Due Date</Th>
                    <Th>Paid Date</Th>
                    <Th>Late Fee</Th>
                    </tr>
                </thead>
                <tbody>
                    {rents.map(r => (
                    <tr key={r.id} className="border-t text-center">
                        <Td>{r.rentMonth}</Td>
                        <Td>₹{r.rentAmount}</Td>
                        <Td>₹{r.paidAmount}</Td>
                        <Td>
                        <span className={`px-2 py-1 rounded text-xs 
                            ${r.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'}`}>
                            {r.status}
                        </span>
                        </Td>
                        <Td>{r.modeOfPayment}</Td>
                        <Td>{r.dueDate}</Td>
                        <Td>{r.paidDate || '—'}</Td>
                        <Td>₹{r.lateFee}</Td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 md:hidden">
                {rents.map(r => (
                <div key={r.id} className="border rounded-lg p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                    <span className="font-semibold">{r.rentMonth}</span>
                    <span className={`text-xs px-2 py-1 rounded 
                        ${r.status === 'PAID'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'}`}>
                        {r.status}
                    </span>
                    </div>
                    <div>Rent: ₹{r.rentAmount}</div>
                    <div>Paid: ₹{r.paidAmount}</div>
                    <div>Pending: ₹{Number(r.pending || 0).toFixed(2)}</div>
                    <div>Mode: {r.modeOfPayment}</div>
                    <div>Due: {r.dueDate}</div>
                    <div>Paid On: {r.paidDate || '—'}</div>
                    <div>Late Fee: ₹{r.lateFee}</div>
                </div>
                ))}
            </div>
            </div>


    </div>
  )
}

/* UI helpers */

const Info = ({ label, value }) => (
  <div>
    <div className="text-gray-500">{label}</div>
    <div className="font-medium">{value || '—'}</div>
  </div>
)

const Summary = ({ title, value, type = "money" }) => {
  const displayValue =
    type === "money"
      ? `₹ ${Number(value || 0).toLocaleString("en-IN")}`
      : value

  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-xl font-semibold">{displayValue}</div>
    </div>
  )
}


const Th = ({ children }) => (
  <th className="px-3 py-2 border">{children}</th>
)

const Td = ({ children }) => (
  <td className="px-3 py-2 border">{children}</td>
)
