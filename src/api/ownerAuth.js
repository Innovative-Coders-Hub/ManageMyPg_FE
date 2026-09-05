
import api from './api'

// ---------- AUTH ----------
export const registerOwner = async (payload) => {
  const res = await api.post(`/mmp/owner/create`, payload)
  return res.data
}
// export const registerOwner = (payload) => {
//   return api.post(`/mmp/owner/create`, payload)
//     .then(res => res.data)
// }
export async function ownerLogin({ email, password }) {
  try {
    const res = await api.post('/api/auth/login', { email, password })
    return res.data
  } catch (err) {
    throw {
      status: err?.response?.status,
      message:
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid email or password",
    }
  }
}

export const ownerLogout = () => {
  return api.post('/api/auth/logout')
}

// ---------- FORGOT PASSWORD ----------

export async function forgotPassword(identifier) {
  const res = await api.post('/api/auth/forgot-password', { identifier })
  return res.data
}

export async function verifyForgotPasswordOtp(identifier, otp) {
  const res = await api.post('/api/auth/verify-forgot-password-otp', { identifier, otp })
  return res.data
}

export async function resetPassword(identifier, token, newPassword, confirmPassword) {
  const res = await api.post('/api/auth/reset-password', {
    identifier,
    token,
    newPassword,
    confirmPassword
  })
  return res.data
}

// ---------- CHANGE PASSWORD ----------

export async function changePassword(currentPassword, newPassword, confirmPassword) {
  const res = await api.post('/api/auth/change-password', {
    currentPassword,
    newPassword,
    confirmPassword
  })
  return res.data
}

export async function verifyChangePassword(otp) {
  const res = await api.post('/api/auth/verify-change-password', { otp })
  return res.data
}

// ---------- PROFILE ----------

export async function getOwnerProfile() {
  const res = await api.get('/mmp/owner/ownerProfile')
  return res.data
}

export async function updateOwnerAddress(address) {
  const res = await api.patch('/mmp/owner/ownerProfile/address', address)
  return res.data
}

export async function uploadOwnerProfileImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/mmp/owner/profile/image', formData)
  return res.data
}

export async function uploadTenantProfileImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/mmp/tenants/profile/image', formData)
  return res.data
}

// ---------- PG ----------

export async function createPg(body) {
  const res = await api.post('/mmp/pg/create', body)
  return res.data
}

export async function getAllPgs() {
  const res = await api.get('/mmp/pg/getAll/pgs')
  return res.data
}

export async function getPgDetailsById(id) {
  if (!id) {
    throw new Error('PG id is required')
  }
  const res = await api.get(`/mmp/pg/${id}`)
  return res.data
}

export async function updatePgPricing(pgId, payload) {
  const res = await api.put(`/mmp/pg/${pgId}/pricing`, payload)
  return res.data
}

export async function uploadPgTerms(pgId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post(`/mmp/pg/${pgId}/terms`, formData)
  return res.data
}

// ---------- FLOORS / BEDS ----------

export async function createFloor(payload) {
  const res = await api.post('/mmp/floor/Rooms/create', payload)
  return res.data
}

export async function getFloorsByPg(pgId) {
  const res = await api.get(`/mmp/floor/Rooms/pg/${pgId}`)
  return res.data
}

export async function createBed(payload) {
  const res = await api.post('/mmp/beds/newBed', payload)
  return res.data
}

export async function getBedDetails(bedId) {
  const res = await api.get(`/mmp/beds/${bedId}`)
  return res.data
}

// ---------- TENANTS ----------

export async function registerTenant(formData) {
  const res = await api.post('/mmp/tenants/register', formData)
  return res.data
}

export async function getAllTenants(pgId) {
  if (!pgId) {
    throw new Error('pgId is required to fetch tenants')
  }
  const res = await api.get(`/mmp/tenants/pg/${pgId}`)
  return res.data
}

export async function assignTenantToBed(bedId, tenantId) {
  let actualBedId = bedId
  let actualTenantId = tenantId
  if (typeof bedId === 'object' && bedId !== null) {
    actualBedId = bedId.bedId
    actualTenantId = bedId.tenantId
  }
  const res = await api.post(`/mmp/beds/${actualBedId}/assign/${actualTenantId}`)
  return res.data
}

export async function getTenantDetails(tenantId) {
  try {
    const res = await api.get(`/mmp/tenants/${tenantId}`)
    return res.data
  } catch (e) {
    console.error('Failed to fetch tenant details', e)
    throw e
  }
}

export async function approveTenant(tenantId) {
  const res = await api.post(`/mmp/tenants/${tenantId}/approve`, {})
  return res.data
}
export async function getTenantHistory(tenantId) {
  try {
    const res = await api.get(`/mmp/tenants/owner/${tenantId}`)
    return res.data
  } catch (e) {
    console.error('Failed to fetch tenant details', e)
    throw e
  }
}

export async function markRentAsPaid(tenantId, payload) {
  const res = await api.post(
    `/mmp/tenants/${tenantId}/rent/pay`,
    payload
  )
  return res.data
}

export async function updateVacatingDate(tenantId, payload) {
  const res = await api.post(
    `/mmp/tenants/${tenantId}/vacating-date`,
    {
      vacatingDate: payload.vacatingDate,
      reason: payload.reason || null
    }
  )
  return res.data
}

export async function getTenantComplaints(page = 0, size = 5) {
  const res = await api.get('/mmp/complaints/my-complaints', {
    params: {
      page,
      size,
      sort: 'createdDate,desc'
    }
  })
  return res.data
}

/**
 * Create complaint (JSON only)
 */
export async function createComplaint(payload) {
  const res = await api.post('/mmp/complaints', {
    pgId: payload.pgId,
    title: payload.title,
    description: payload.description || null,
    category: payload.category,
    complaintImageUrl: payload.complaintImageUrl || null
  })
  return res.data
}

export async function getOwnerComplaints(pgId, page = 0, size = 10) {
  const res = await api.get(`/mmp/complaints/pg/${pgId}`, {
    params: { page, size }
  })
  return res.data
}

export async function updateComplaintStatus(complaintId, payload) {
  return api.put(
    `/mmp/complaints/${complaintId}/status`,
    payload
  ).then(res => res.data)
}

export async function getOwnerCompleteDetails(ownerId) {
  return api.get(`/api/admin/owner/${ownerId}`)
}

export const deleteBed = (bedId) => {
  return api.delete(`/mmp/beds/${bedId}/delete`)
}

export const activateBed = (bedId) => {
  return api.post(`/mmp/beds/${bedId}/activate`)
}

export async function getFloorsRoomsWithBeds() {
  return api.get('/mmp/tenants/floors/rooms/with-beds')
}

export async function transferTenantFromBed(bedId, payload) {
  return api.put(`/mmp/beds/${bedId}/transfer-tenant`, payload)
}

export async function transferBed(bedId, payload) {
  return api.put(`/mmp/beds/${bedId}/transfer`, payload)
}

// ---------- DASHBOARD & ANALYTICS ----------

export async function getOwnerDashboard() {
  const res = await api.get('/mmp/owner/dashboard')
  return res.data
}

export async function getRevenueTrends(pgId) {
  const res = await api.get(`/mmp/owner/revenue-trends`, { params: { pgId } })
  return res.data
}

export async function getRealTimeAlerts(pgId) {
  const res = await api.get(`/mmp/owner/alerts`, { params: { pgId } })
  return res.data
}

// ---------- BOOKINGS ----------

export async function getBedAvailability(pgId) {
  const res = await api.get(`/api/bookings/pg/${pgId}/bed-availability`)
  return res.data
}

export async function createBooking(payload) {
  const res = await api.post('/api/bookings', payload)
  return res.data
}

export async function getBookingDetails(bookingId) {
  const res = await api.get(`/api/bookings/${bookingId}`)
  return res.data
}

export async function getPgBookingSummary(pgId) {
  const res = await api.get(`/api/bookings/pg/${pgId}/summary`)
  return res.data
}

export async function cancelBooking(bookingId, params) {
  const res = await api.post(`/api/bookings/${bookingId}/cancel`, null, { params })
  return res.data
}

export async function getAllBookings(pgId) {
  const res = await api.get(`/api/bookings/pg/${pgId}`)
  return res.data
}

export async function completeBooking(bookingId, payload) {
  const res = await api.post(`/api/bookings/${bookingId}/complete`, payload)
  return res.data
}

// ---------- WORKERS ----------

export async function createWorker(workerDetails, imageFile) {
  const formData = new FormData()
  // The backend expects the 'request' part as a JSON string
  formData.append('request', JSON.stringify(workerDetails))
  if (imageFile) {
    formData.append('file', imageFile)
  }
  const res = await api.post('/mmp/workers', formData)
  return res.data
}

export async function getWorkers(pgId, params = {}) {
  const res = await api.get('/mmp/workers', {
    params: { pgId, ...params }
  })
  return res.data
}

export async function updateWorker(workerId, payload) {
  const res = await api.put(`/mmp/workers/${workerId}`, payload)
  return res.data
}

export async function updateWorkerStatus(workerId, status) {
  const res = await api.patch(`/mmp/workers/${workerId}/status`, null, {
    params: { status }
  })
  return res.data
}

export async function updateWorkerImage(workerId, file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post(`/mmp/workers/${workerId}/image`, formData)
  return res.data
}

export async function deleteWorker(workerId) {
  const res = await api.delete(`/mmp/workers/${workerId}`)
  return res.data
}

// ---------- ACCOUNT DELETION ----------

export async function deleteOwnerAccount() {
  const res = await api.delete('/mmp/owner/delete-account')
  return res.data
}

// ---------- RENTS ----------

export async function getPgRentStatus(pgId, month, year) {
  const res = await api.get(`/mmp/owner/pg-rent-status/${pgId}`, {
    params: { month, year }
  })
  return res.data
}

// ---------- EXPENSES ----------

export async function createExpense(payload) {
  const res = await api.post('/mmp/expenses', payload)
  return res.data
}

export async function updateExpense(expenseId, payload) {
  const res = await api.put(`/mmp/expenses/${expenseId}`, payload)
  return res.data
}

export async function deleteExpense(expenseId) {
  const res = await api.delete(`/mmp/expenses/${expenseId}`)
  return res.data
}

export async function getExpensesRange(pgId, startDate, endDate) {
  const res = await api.get(`/mmp/expenses/pg/${pgId}/range`, {
    params: { startDate, endDate }
  })
  return res.data
}

export async function getExpenseAnalytics(pgId, startDate, endDate) {
  const res = await api.get(`/mmp/expenses/pg/${pgId}/analytics`, {
    params: { startDate, endDate }
  })
  return res.data
}

export async function getExpenseCategories() {
  const res = await api.get('/mmp/expenses/categories')
  return res.data
}

export async function getMonthlyGraphData(pgId, months = 12) {
  const res = await api.get(`/mmp/expenses/pg/${pgId}/monthly-graph`, {
    params: { months }
  })
  return res.data
}
